Game = function() {
	this.preload();
}

Game.prototype.load = function() {
	keyboard.keys.esc.press = function() {
		var menu = document.getElementById('playMenu');
		
		
		if(menu.style.display == "none")
			$("#playMenu").fadeIn(400);
		else
			$("#playMenu").fadeOut(100);
	};
	
	// Initialize window
	this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0xF00000}, true, false);
	this.renderer.clearBeforeRender = false;
	document.body.appendChild(this.renderer.view);
	this.stage = new PIXI.Container();
	this.camera = new Camera(this.stage);	
	this.camera.zoom = 1.0;
	
	this.entityWorld = new CES.World();
	
	var gl = this.renderer.gl;
	this._chunkManager = new ChunkManager();
	this._chunkRenderer = new ChunkRenderer(gl, this._chunkManager, 32, 32, 32, 32);
	
	var floatTextures = gl.getExtension('OES_texture_float');
	if (!floatTextures) {
		alert('no floating point texture support');
	}
	
	// Add more systems here!
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.TerrainPhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	this.entityWorld.addSystem(new ECS.Systems.AnimationSystem());
	
	this.animationManager = new AnimationManager();
	this.animationManager.load(this.textures);
	
	this.mousex = null;
	this.mousey = null;
	document.addEventListener('mousemove', this.onMouseUpdate, false);
	document.addEventListener('mouseenter', this.onMouseUpdate, false);
	
	window.addEventListener('resize', this.resize.bind(this), false);
	
	var gravity = new b2Vec2(0, 0);
	var doSleep = false;
	this.physicsWorld = new b2World(gravity, doSleep); 
	
	// Contact listener begin: Temporarily disable player-to-player collisions
	var playerContactListener = new Box2D.Dynamics.b2ContactListener;
	playerContactListener.BeginContact = function (contact) {
	  //console.log("begincontact");
	}
	playerContactListener.EndContact = function (contact) {
	  //console.log("endcontact");
	}
	playerContactListener.PostSolve = function (contact, impulse) {
		//console.log("PostSolve");
	}
	playerContactListener.PreSolve = function (contact, oldManifold) {
		//console.log("PreSolve");
		contact.SetEnabled(false);
	}
	this.physicsWorld.SetContactListener(playerContactListener);
	// Contact listener end
	
	this.players = {};
	this.lastUpdate = Date.now();
	
	this._intervalId = setInterval(function(){game.run()}, 0);
	
	this.connection = new Connection(vars.ip, 3000);
	this._chunkClient = new ChunkClient(this._chunkManager, this.connection);
	this.initializeListeners();
}

Game.prototype.onMouseUpdate = function (e) {
	mousex = e.pageX;
	mousey = e.pageY;
}

Game.prototype.resize = function() {
	this.renderer.resize(window.innerWidth, window.innerHeight);
	this.camera.width = window.innerWidth;
	this.camera.height = window.innerHeight;

}

Game.prototype.preload = function() {
	this.textures = {};
	this.textures.gubbe = PIXI.Texture.fromImage('game/textures/gubbe.png');
	this.textures.cheese = PIXI.Texture.fromImage('game/textures/cheese.png');
	this.textures.worker = PIXI.Texture.fromImage('game/textures/worker.png');
	this.textures.ground = PIXI.Texture.fromImage('game/textures/ground.png');
	this.textures.block = PIXI.Texture.fromImage('game/textures/block.png');
	this.textures.rock = PIXI.Texture.fromImage('game/textures/rock.png');
	this.textures.largerock = PIXI.Texture.fromImage('game/textures/rock_large.png');
	
	var context = this;
	var loader = new PIXI.loaders.Loader();
	//loader.add('walk', "game/textures/walkSheet.png");
	loader.add('feet', "game/textures/feetSheet.png");
	loader.add('body', "game/textures/body.png");
	loader.add('dig', "game/textures/digSheet.png");
	loader.once('complete', function(e) {
		//context.textures.walk = e.resources.walk.texture;
		context.textures.feet = e.resources.feet.texture;
		context.textures.body = e.resources.body.texture;
		context.textures.dig = e.resources.dig.texture;
		context.load();		
	});
	
	loader.load();
}

Game.prototype.run = function() {
    var now = Date.now();
    var dt = now - this.lastUpdate;
	this.lastUpdate = Date.now()
	
    this.entityWorld.update(dt);
	
	this.physicsWorld.Step(1 / 60.0, 10, 10);
	            this.physicsWorld.DrawDebugData();
            this.physicsWorld.ClearForces();
	
	this.camera.update(dt);
	this._chunkClient.update(this.camera);
	
	
	var gl = this.renderer.gl;
	this.renderer.setRenderTarget(this.renderer.renderTarget);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	var projectionMatrix = this.renderer.renderTarget.projectionMatrix.clone();
	var viewMatrix = new PIXI.Matrix();
	viewMatrix = viewMatrix.translate(-this.camera.frustrum.x, -this.camera.frustrum.y);
	this._chunkRenderer.render(gl, this._chunkManager, projectionMatrix.clone().append(viewMatrix), this.camera);

	
	this.renderer.render(this.camera);
	
};

Game.prototype.sendUpdatePacket = function() {
	var physics = this.player.getComponent('physics');
	var player = this.player.getComponent('player');
	this.connection.send('playerupdate', { 
		name: player.username,
		x: physics.x,
		y: physics.y,
		vx: physics.vx,
		vy: physics.vy,
		rotation: physics.rotation
	});
}

Game.prototype.spawnPlayer = function(name) {
	var sprite = new PIXI.Sprite(this.textures.feet);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.position.x = 0.5;//Math.random() * this.tileMap.width * this.tileSize;
	sprite.position.y = 0.5;//Math.random() * this.tileMap.height * this.tileSize;	
	var bodySprite = new PIXI.Sprite(this.textures.dig);
	bodySprite.anchor.x = 0.5;
	bodySprite.anchor.y = 0.5;
	bodySprite.position.x = 0.5;//Math.random() * this.tileMap.width * this.tileSize;
	bodySprite.position.y = 0.5;//Math.random() * this.tileMap.height * this.tileSize;	
	var text = new PIXI.Text(name, { fill: '#ffffff' });
	
	/*var circleDef = new b2CircleDef();
	circleDef.density = 0.9;
	circleDef.radius = sprite.width / 6;
	circleDef.restitution = 0;
	circleDef.friction = 0;
	var bodyDef = new b2BodyDef();
	bodyDef.AddShape(circleDef);
	bodyDef.type=b2Body.b2_staticBody;
	bodyDef.isSensor = true;
	bodyDef.position.Set(100,100);
	bodyDef.userData = { type: "player" };
	var circleBody = this.physicsWorld.CreateBody(bodyDef);*/
	
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	
	fixDef.shape = new b2CircleShape(sprite.width/6);
	
	bodyDef.position.Set(10, 400 / 30 + 1.8);
	var physicsBody = this.physicsWorld.CreateBody(bodyDef);
	physicsBody.CreateFixture(fixDef);
	
	var player = new CES.Entity();
	player.addComponent(new ECS.Components.Player(name, sprite, text));
	player.addComponent(new ECS.Components.Physics(physicsBody));
	var bodyparts = {
		"feet": {
			"sprite": sprite
		},
		"body": {
			"sprite": bodySprite
		}
	};
	var drawable = new ECS.Components.Drawable(bodyparts, this.animationManager, 0, 0);
	player.addComponent(drawable);
	
	this.entityWorld.addEntity(player);
	this.stage.addChild(sprite);
	this.stage.addChild(bodySprite);
	this.stage.addChild(text);
	this.players[name] = player;
	return player;
}

Game.prototype.spawnMainPlayer = function() {
	this.connection.send('playerinit', { 
		name: "player username that will be selected when accounts exist"
	});
}

Game.prototype.despawnPlayer = function(name) {
	var player = this.players[name];
    var playerComp = player.getComponent('player');
	var drawable = player.getComponent('drawable');
	drawable.remove(this.stage);
	this.stage.removeChild(playerComp.text);
	delete(this.players[name]);
}

Game.prototype.initializeListeners = function() {
	this.connection.on('init', function(data, context) {	
		context.tileMap = { 
			width: data.mapWidth,
			height: data.mapHeight,
			tiles: []
		};
		
		context.tileSize = data.tileSize;
		
		context.camera.target.x = context.tileMap.width * context.tileSize - context.camera.viewport.width / 2;
		context.camera.target.y = context.tileMap.height * context.tileSize - context.camera.viewport.height / 2;
	}, this);
	
	this.connection.on('error', console.error.bind(console));
	
	this.connection.on('message', function(data) {
		console.log(data);
	});
	
	this.connection.on('playerjoin', function(data, context) {
		console.log(data.name + " has connected.");
		var player = context.spawnPlayer(data.name);
		var physics = player.getComponent("physics");
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;
		physics.body.userData = { type: "mainPlayer" };
		context.players[data.name] = player;
	}, this);
	
	this.connection.on('playerinit', function(data, context) {
		context.player = context.spawnPlayer(data.name);
		//context.player.username = data.name;
		context.player.addComponent(new ECS.Components.ControlledPlayer());
	
		var player = context.player.getComponent('player');
		var physics = context.player.getComponent('physics');
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;
		

	}, this);
	
	this.connection.on('playerupdate', function(data, context) {
		var player = context.players[data.name];
		if(player != undefined) {
			var physics = player.getComponent("physics");
			physics.x = data.x;
			physics.y = data.y;
			physics.vx = data.vx;
			physics.vy = data.vy;
			physics.rotation = data.rotation;
		}
		else
			console.log("undefined");
	}, this);
	
	this.connection.on('playerleave', function(data, context) {
		console.log(data.name + ' has disconnected.');
		context.despawnPlayer(data.name);
	}, this);
	
	this.connection.on('chatmessage', function(data) {
		addChat(data.message);
	});
	
	this.connection.on('dig', function(data, context) {
		var x = data.x;
		var y = data.y;
		var digRadius = data.digRadius;
		context._chunkManager.fillCircle(parseFloat(x)/32.0, parseFloat(y)/32.0, 1.5);
	}, this);
}