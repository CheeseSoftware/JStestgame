Game = function() {
	this.preload();
}

Game.prototype.load = function() {
	
	//TODO: Move esc code somewhere else
	keyboard.keys.esc.press = function() {
		var menu = document.getElementById('playMenu');
		
		
		if(menu.style.display == "none")
			$("#playMenu").fadeIn(400);
		else
			$("#playMenu").fadeOut(100);
	};
	
	//TODO: Move input code somewhere else
	this.mousex = null;
	this.mousey = null;
	document.addEventListener('mousemove', this.onMouseUpdate, false);
	document.addEventListener('mouseenter', this.onMouseUpdate, false);
	
	window.addEventListener('resize', this.resize.bind(this), false);
	
	// Initialize window
	this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0xF00000}, true, false);
	this.renderer.clearBeforeRender = false;
	document.body.appendChild(this.renderer.view);
	
	// Initialize stage, camera, entityWorld
	this.stage = new PIXI.Container();
	
	this.camera = new Camera(this.stage);	
	this.camera.zoom = 1.0;
	
	// Initialize chunkManager and chunkRenderer
	var gl = this.renderer.gl;
	this.chunkManager = new ChunkManager();
	this.chunkRenderer = new ChunkRenderer(gl, this.chunkManager, 32, 32, 32, 32);	
	var floatTextures = gl.getExtension('OES_texture_float');
	if (!floatTextures) {
		alert('no floating point texture support');
	}
	
	// Initialize entityWorld and add entity component systems
	this.entityWorld = new CES.World();
	this.entityWorld.addSystem(new ECS.Systems.PlayerPhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.TerrainPhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	this.entityWorld.addSystem(new ECS.Systems.AnimationSystem());
	
	// Initialize animationManager
	this.animationManager = new AnimationManager();
	this.animationManager.load(this.textureManager);
	
	// Initialize physicsWorld
	this.physicsWorld = new b2World(new b2Vec2(0, 0), false); // Args: gravity, sleep
	
	//TODO: Fix and move playerContactListener
	var playerContactListener = new Box2D.Dynamics.b2ContactListener;// Contact listener begin: Temporarily disable player-to-player collisions
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
	
	
	
	this.players = {};
	this.lastUpdate = Date.now();
	
	this.intervalId = setInterval(function(){game.run()}, 0);
	
	this.connection = new Connection(vars.ip, 3000);
	this.initializeListeners();
	
	// Initialize client systems
	this.chunkClient = new ChunkClient(this.chunkManager, this.connection);
	this.regeneratorClient = new RegeneratorClient(this.chunkManager, this.connection);
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
	// Load textures and sound and heavy things. Progress shown on progressbar.
	this.textureManager = new TextureManager();
	var context = this;
	
	this.textureManager.onProgress(function(name, file, progress) {
		$("#progressbar").css("width", progress + "%");
		$("#progressbar").attr("aria-valuenow", progress);
		$("#progressbar").html(progress + "%");
	});
	
	this.textureManager.onComplete(function(textures) {
		context.load(); // Continue loading the game
		
		window.setTimeout ( function() {
			$("#progresscontainer").fadeOut();
			$("#playMenu").show();
		}, 800);
	});
	this.textureManager.load();
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
	
	if(this.chunkClient)
		this.chunkClient.update(this.camera);
	
	var gl = this.renderer.gl;
	this.renderer.setRenderTarget(this.renderer.renderTarget);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	var projectionMatrix = this.renderer.renderTarget.projectionMatrix.clone();
	var viewMatrix = new PIXI.Matrix();
	viewMatrix = viewMatrix.translate(-this.camera.frustrum.x, -this.camera.frustrum.y);
	this.chunkRenderer.render(gl, this.chunkManager, projectionMatrix.clone().append(viewMatrix), this.camera);

	
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
		rotation: physics.rotation,
		playState: keyboard.getPlayState()
	});
}

Game.prototype.spawnPlayer = function(name) {
	var sprite = new PIXI.Sprite(this.textureManager.textures.feet);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.position.x = 0.5;
	sprite.position.y = 0.5;
	var bodySprite = new PIXI.Sprite(this.textureManager.textures.dig);
	bodySprite.anchor.x = 0.5;
	bodySprite.anchor.y = 0.5;
	bodySprite.position.x = 0.5;
	bodySprite.position.y = 0.5;
	var text = new PIXI.Text(name, { fill: '#ffffff' });
	
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	
	fixDef.shape = new b2CircleShape(sprite.width/6);
	
	bodyDef.position.Set(10, 400 / 30 + 1.8);
	var physicsBody = this.physicsWorld.CreateBody(bodyDef);
	var ghostBody = this.physicsWorld.CreateBody(bodyDef);
	physicsBody.CreateFixture(fixDef);
	ghostBody.CreateFixture(fixDef);
	
	var player = new CES.Entity();
	player.addComponent(new ECS.Components.Player(name, sprite, text));
	player.addComponent(new ECS.Components.Physics(physicsBody));
	player.addComponent(new ECS.Components.GhostPhysics(ghostBody));
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
	
	// Uncomment to be one with the Cheese
	/*var sprite = new PIXI.Sprite(this.textureManager.textures.cheese);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.position.x = 0.5;
	sprite.position.y = 0.5;
	this.stage.addChild(sprite);
	player.getComponent("ghostphysics").sprite = sprite;*/
	
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
		var ghost = player.getComponent("ghostphysics");
		ghost.x = data.x;
		ghost.y = data.y;
		ghost.rotation = data.rotation;
		ghost.playState = data.playState;
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;
		physics.playState = data.playState;
		physics.body.userData = { type: "mainPlayer" };
		context.players[data.name] = player;
	}, this);
	
	this.connection.on('playerinit', function(data, context) {
		context.player = context.spawnPlayer(data.name);
		//context.player.username = data.name;
		context.player.addComponent(new ECS.Components.Controlled());
	
		var player = context.player.getComponent('player');
		var physics = context.player.getComponent('physics');
		var ghost = context.player.getComponent("ghostphysics");
		context.physicsWorld.DestroyBody(ghost.body);
		context.player.removeComponent("ghostphysics");
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;
		physics.playState = keyboard.getPlayState();
	}, this);
	
	this.connection.on('playerupdate', function(data, context) {
		var player = context.players[data.name];
		if(player != undefined) {
			var physics = player.getComponent("physics");
			var ghost = player.getComponent("ghostphysics");

			// Player is always little behind.
			//physics.x = ghost.x;
			//physics.y = ghost.y;
			//physics.vx = data.vx;
			//physics.vy = data.vy;
				
			// Ghost is always at correct position.
			ghost.x = data.x;
			ghost.y = data.y;
			ghost.vx = data.vx;
			ghost.vy = data.vy;
			
			physics.time = new Date();
			
			physics.rotation = data.rotation;
			ghost.rotation = data.rotation;
			if(!player.hasComponent("controlled")) {
				physics.playState = data.playState;
				ghost.playState = data.playState;
			}
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
		context.chunkManager.fillCircle(parseFloat(x)/32.0, parseFloat(y)/32.0, digRadius);
		if(!context.players[data.username].getComponent("controlled"))
			context.players[data.username].getComponent("drawable").animate("body", "dig", 240, true);
	}, this);
	
	this.connection.on('registerresponse', function(data) {
		$('#registrationResult').html(data.response);
		if(data.success == true) {
			var d = new Date();
			d.setTime(d.getTime() + (14*24*60*60*1000));
			var expires = "expires="+d.toUTCString();
			document.cookie="username=" + $('#registerUsername').val() + "; " + expires;
			document.cookie="password=" + $('#registerPassword').val() + "; " + expires;
		}
	});
	
	this.connection.on('loginresponse', function(data) {
		$('#loginResult').html(data.response);
		if(data.success == true) {
			var d = new Date();
			d.setTime(d.getTime() + (14*24*60*60*1000));
			var expires = "expires="+d.toUTCString();
			document.cookie="username=" + $('#loginUsername').val() + "; " + expires;
			document.cookie="password=" + $('#loginPassword').val() + "; " + expires;
		}
	});
}