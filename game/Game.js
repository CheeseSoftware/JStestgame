Game = function() {
	this.preload();
	
	// Initialize window
	this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0xF00000}, true, false);
	this.renderer.clearBeforeRender = false;
	document.body.appendChild(this.renderer.view);
	this.stage = new PIXI.Container();
	this.camera = new Camera(this.stage);	
	this.camera.zoom = 1.0;
	
	this.entityWorld = new CES.World();
	
	// Add more systems here!
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	
	this.mousex = null;
	this.mousey = null;
	document.addEventListener('mousemove', this.onMouseUpdate, false);
	document.addEventListener('mouseenter', this.onMouseUpdate, false);
	
	window.addEventListener('resize', this.resize.bind(this), false);
	
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-4000, -4000);
	worldAABB.maxVertex.Set(4000, 4000);
	var gravity = new b2Vec2(0, 0);
	var doSleep = false;
	this.physicsWorld = new b2World(worldAABB, gravity, doSleep); 
	
	this.players = {};
	this.lastUpdate = Date.now();
	
	this._intervalId = setInterval(function(){game.run()}, 0);
	
	this.connection = new Connection(vars.ip, 3000);
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
	this.textures.gubbe = PIXI.Texture.fromImage('textures/gubbe.png');
	this.textures.cheese = PIXI.Texture.fromImage('textures/cheese.png');
	this.textures.worker = PIXI.Texture.fromImage('textures/worker.png');
	this.textures.ground = PIXI.Texture.fromImage('textures/ground.png');
	this.textures.block = PIXI.Texture.fromImage('textures/block.png');
	this.textures.rock = PIXI.Texture.fromImage('textures/rock.png');
}

Game.prototype.run = function() {
    var now = Date.now();
    var dt = now - this.lastUpdate;
	this.lastUpdate = Date.now();

	
    this.entityWorld.update(dt);
	
	var timeStep = 1.0/60.0;
	var iteration = 1;
	this.physicsWorld.Step(timeStep, iteration);
	
	this.camera.update(dt);
	
	
	var gl = this.renderer.gl;
	this.renderer.setRenderTarget(this.renderer.renderTarget);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// TODO: Render terrain.
	
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
	var sprite = new PIXI.Sprite(this.textures.gubbe);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.position.x = 0.5;//Math.random() * this.tileMap.width * this.tileSize;
	sprite.position.y = 0.5;//Math.random() * this.tileMap.height * this.tileSize;	
	var text = new PIXI.Text(name, { fill: '#ffffff' });
	
	var circleSd = new b2CircleDef();
	circleSd.density = 0.5;
	circleSd.radius = 50;
	circleSd.restitution = 0.1;
	circleSd.friction = 0;
	var circleBd = new b2BodyDef();
	circleBd.AddShape(circleSd);
	circleBd.position.Set(100,100);
	var circleBody = this.physicsWorld.CreateBody(circleBd);
	
	var player = new CES.Entity();
	player.addComponent(new ECS.Components.Player(name, sprite, text));
	player.addComponent(new ECS.Components.Physics(circleBody));
	this.entityWorld.addEntity(player);
	this.stage.addChild(sprite);
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
    var player = player.getComponent('player');
	this.stage.removeChild(player.sprite);
	this.stage.removeChild(player.text);
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
		
		// Draw map ground
		for(var x = 0; x < context.tileMap.width; ++x) {	
			for(var y = 0; y < context.tileMap.height; ++y) {
				if(x * context.tileSize % 1024 == 0 && y * context.tileSize % 1024 == 0) {
					var sprite = new PIXI.Sprite(context.textures.ground);
					sprite.position.x = x * context.tileSize;
					sprite.position.y = y * context.tileSize;
					context.stage.addChild(sprite);
				}
			}
		}
		
		// Draw map border
		for(var x = -1024; x <= context.tileMap.width * context.tileSize; ++x) {	
			for(var y = -1024; y <= context.tileMap.height * context.tileSize; ++y) {
				if(x == -1024 || x == context.tileMap.width * context.tileSize || y == -1024 || y ==  context.tileMap.height * context.tileSize) {
					if(x % 1024 == 0 && y % 1024 == 0) {
						var sprite = new PIXI.Sprite(context.textures.block);
						sprite.position.x = x;
						sprite.position.y = y;
						context.stage.addChild(sprite);
					}
				}
			}
		}
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
}