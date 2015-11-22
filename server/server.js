isServer = true;

fs = require('fs');
	
var simple_include = function( lib ) {
	data = fs.readFileSync("../" + lib, 'utf8');
	eval(data);
}

// Include common.js with the include system.
//simple_include("game/Common.js");

//include("lib/Box2D.js");	<- evil library

// Libraries
http = require('http');
CES = require('ces');
crypto = require('crypto');
mongo = require('mongodb'); 
socketio = require('socket.io');

Box2D = require('box2dweb-commonjs').Box2D;
b2Vec2 = Box2D.Common.Math.b2Vec2
,  b2AABB = Box2D.Collision.b2AABB
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
;

simple_include("lib/perlin.js");
simple_include("lib/gl-matrix.js");

// Entity systems and components
ECS = {
	Components: {},
	Systems: {}
};	

// Update the game files used by the http-server.
// And Include all game files.
simple_include("server/UpdateGame.js");
updateGame();


ServerInstance = function() {
	this.load();
}

ServerInstance.prototype.load = function() {
	// Set up error handler
	process.on('uncaughtException', function (error) {
		console.log("shit");
	   console.log(error.stack);
	});
	
	// Initialize socket.io server
	var app = http.createServer(function(req, res) {
		res.end();
	});
	this.io = socketio.listen(app);
	
	// Connect to MongoDB
	this.mongoServer = new mongo.Server('localhost', 27017, {auto_reconnect: true});
	this.db = new mongo.Db('digminer', this.mongoServer);
	this.db.open(function(err, db) {
		if(!err)
			console.log("Connected to MongoDB");
		else
			console.log("There was an error connecting to MongoDB");
	});
	
	// Initialize physicsWorld
	this.physicsWorld = new b2World(new b2Vec2(0, 0), false);
	
	// Initialize chunkManager
	this.chunkManager = new ChunkManager();
	
	// Initialize entityWorld
	this.entityWorld = new CES.World();
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	var terrainPhysicsSystem = new ECS.Systems.TerrainPhysicsSystem(this.chunkManager);
	this.entityWorld.addSystem(terrainPhysicsSystem);

	// Initialize other systems
	this.battleManager = new BattleManager(this.entityWorld);
	
	// Initialize entityServer
	this.playerServer = new PlayerServer(this.io);
	this.entityServer = new EntityServer(this.entityWorld, this.playerServer, this.io);
	this.authenticationServer = new AuthenticationServer(this.db, this.playerServer, this.io);
	this.chunkServer = new ChunkServer(this.chunkManager, this.io);
	this.regeneratorServer = new RegeneratorServer(this.chunkManager, this.io);
	this.BattleServer = new BattleServer(this.battleManager, this.entityWorld, this.entityServer, this.playerServer, this.io)
	
	var mapData = {
		width: 256,
		height: 256,
		tileSize: 16
	};
	
	this.io.on('connection', function(socket) {
		// Send existing players to the new player
		var keys = Object.keys(this.playerServer._players);
		keys.forEach(function (key) { 
			var player = this.playerServer.getPlayer(key);
			var entity = this.entityServer.getEntity(player.uuid);
			if(entity) {
				var physics = entity.getComponent('physics');
				socket.emit('playerjoin', {
					uuid: player.uuid,
					username: player.username,
					x: physics.x,
					y: physics.y,
					vx: physics.vx,
					vy: physics.vy,
					rotation: physics.rotation
				});
			}
		}.bind(this));
		
		// Send init and camera target
		var playerToFollow;
		if(keys.length > 0)
			playerToFollow = this.playerServer.getPlayer(keys[Math.floor(Math.random() * keys.length)]);
		
		var init = { 
			mapWidth: mapData.width, 
			mapHeight: mapData.height, 
			tileSize: mapData.tileSize 
		};
		
		if(playerToFollow)
			init.follow = playerToFollow.uuid;
		else
			init.target = { x:128, y:128 };
		
		socket.emit('init', init);
		this.io.sockets.emit('message', "A client has joined with IP " + socket.request.connection.remoteAddress);
		
		socket.on('error', console.error.bind(console));
		
		socket.on('disconnect', function(){
			var player = this.playerServer.getPlayer(socket.id);
			if(player != undefined) {
				console.log(player.username + ' has disconnected.');
				socket.broadcast.emit('playerleave', { 
					uuid: player.uuid,
					username: player.username,		
				});
				
				this.entityServer.removeEntity(player.uuid);
				delete this.playerServer.removePlayer(socket.id);
			}
		}.bind(this));
		
		socket.on('update', function(data) {
			var uuid = this.playerServer.getPlayer(socket.id).uuid;
			var entity = this.entityServer.getEntity(uuid);

			this.io.sockets.emit('playerupdate', {
				uuid: data.uuid,
				isDigging: data.isDigging
			});
		}.bind(this));
		
		socket.on('playerinit', function(data) {
			if(this.playerServer.getPlayer(socket.id)) {
				// This player is already playing...
				socket.disconnect();
				return;
			}
			
			var uuid = generateUUID(); // TODO: load uuid from database
			var username = uuid; //TODO: load username from database
			var entity = entityTemplates.player(username, uuid);
			this.playerServer.setPlayer(socket.id, { username: username, uuid: uuid, spawned: true});
			
			var physics = entity.getComponent('physics');
			physics.x = 128;
			physics.y = 128;
			
			// Dig spawn
			for(var i = 0; i < 10; i++) {
				this.chunkManager.fillCircle(physics.x/32.0, physics.y/32.0, 6);
				this.io.sockets.emit('dig', { x: physics.x, y: physics.y, digRadius: 6});
			}
	
			socket.emit('playerinit', {
				uuid: uuid,
				username: username,
				x: physics.x,
				y: physics.y,
				rotation: physics.rotation
			});
			
			socket.broadcast.emit('playerjoin', {
				uuid: uuid,
				username: username,
				x: physics.x,
				y: physics.y,
				rotation: physics.rotation
			});
			
			console.log(username + " has connected.");
		}.bind(this));
		
		socket.on('dig', function(data) {
			this.chunkManager.fillCircle(parseFloat(data.x)/32.0, parseFloat(data.y)/32.0, data.digRadius);
			this.io.sockets.emit('dig', data);
		}.bind(this));
		
	}.bind(this));

	// Start socket.io server
	app.listen(3000);
	console.log("Listening on port 3000");
	
	// Start the server loop
	this.lastUpdate = Date.now();
	this.run = function() {
		var now = Date.now();
		var dt = now - this.lastUpdate;
		this.lastUpdate = Date.now()
	
		this.entityWorld.update(dt);
		
		this.physicsWorld.Step(1 / 60.0, 10, 10);
		this.physicsWorld.DrawDebugData();
		
		this.regeneratorServer.update(dt);
	}.bind(this);
	var intervalId = setInterval(this.run, 100);
}
GLOBAL.server = new ServerInstance();