isServer = true;

fs = require('fs');
	
var simple_include = function( lib ) {
	data = fs.readFileSync("../" + lib, 'utf8');
	eval(data);
}

// Include common.js with the include system.
simple_include("game/common.js");

// Update the game files used by the http-server.
simple_include("server/UpdateGame.js");
updateGame();

//include("lib/Box2D.js");	<- evil library

// Libraries
CES = require('ces');
crypto = require('crypto');

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

include("lib/perlin.js");
include("lib/gl-matrix.js");

// Core
include("game/core/Observable.js");
include("game/core/v2.js");


include("game/Constants.js");
include("game/EntityMap.js");
include("game/EntityTemplates.js");

// Tiles
include("game/TileType.js");
include("game/TileRegister.js");

// Chunks, World
include("game/Chunk.js");
include("game/Generator.js");
include("game/ChunkManager.js");
include("game/ChunkServer.js");
include("game/RegeneratorServer.js");

// Entity systems and components
ECS = {
	Components: {},
	Systems: {}
};	

include("game/systems/PhysicsSystem.js");
include("game/systems/TerrainPhysicsSystem.js");
include("game/components/Physics.js");

include("game/EntityServer.js");


ServerInstance = function() {
	this.load();
}

ServerInstance.prototype.load = function() {
	this.physicsWorld = new b2World(new b2Vec2(0, 0), false);
	
	// Initialize chunkManager
	_chunkManager = new ChunkManager();
	
	// Initialize entityWorld
	this.entityWorld = new CES.World();
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	var terrainPhysicsSystem = new ECS.Systems.TerrainPhysicsSystem(_chunkManager);
	this.entityWorld.addSystem(terrainPhysicsSystem);
	
	// Initialize entityServer
	this.entityServer = new EntityServer();
	
	var http = require('http'),
		fs = require('fs');
		//index = fs.readFileSync(__dirname + '/index.html');
	var app = http.createServer(function(req, res) {
		res.end();
	});

	var io = require('socket.io').listen(app);
	
	// Initialize server systems
	_chunkServer = new ChunkServer(_chunkManager, io);
	_regeneratorServer = new RegeneratorServer(_chunkManager, io)
	
	var players = {};
	
	var mapData = {
		width: 256,
		height: 256,
		tileSize: 64
	};
	
	var mongo = require('mongodb'),
	  Server = mongo.Server,
	  Db = mongo.Db;
	
	var server = new Server('localhost', 27017, {auto_reconnect: true});
	this.db = new Db('digminer', server);
	
	this.db.open(function(err, db) {
		if(!err) {
			console.log("Connected to MongoDB");
		}
		else
			console.log("There was an error connecting to MongoDB");
	});
	
	validateEmail = function(email) {
		var re = new RegExp("^.{1,}@.{1,}\..{1,}$");
		return re.test(email);
	}
	
	validateUsername = function(username) {
		var re = new RegExp("^[A-Z,a-z,0-9]{3,20}$");
		return re.test(username);
	}
	
	
	io.on('connection', function(socket) {
		socket.emit('init', { mapWidth: mapData.width, mapHeight: mapData.height, tileSize: mapData.tileSize });
		io.sockets.emit('message', "A client has joined with IP " + socket.request.connection.remoteAddress);
	
		// Send existing players to the new player
		Object.keys(players).forEach(function (key) { 
			var player = players[key];
			if(player.entity) {
				var physics = player.entity.getComponent('physics');
				socket.emit('playerjoin', {
					uuid: player.entity.uuid,
					username: player.username,
					x: physics.x,
					y: physics.y,
					vx: physics.vx,
					vy: physics.vy,
					rotation: physics.rotation
				});
			}
		});
		
		socket.on('error', console.error.bind(console));
		
		socket.on('disconnect', function(){
			if(players[socket.id] != undefined) {
				console.log(players[socket.id].username + ' has disconnected.');
				socket.broadcast.emit('playerleave', { 
					uuid: players[socket.id].entity.uuid,
					username: players[socket.id].username,		
				});
				
				this.entityWorld.removeEntity(players[socket.id].entity);
				this.entityServer.entityMap.remove(players[socket.id].entity.uuid);
				delete players[socket.id];
			}
		}.bind(this));
		
		socket.on('entityupdate', function(data) {
			var physics = players[socket.id].entity.getComponent('physics');
			physics.x = data.x;
			physics.y = data.y;
			physics.vx = data.vx;
			physics.vy = data.vy;
			physics.dx = data.dx;
			physics.dy = data.dy;
			physics.rotation = data.rotation;
			
			socket.broadcast.emit('entityupdate', {
				uuid: data.uuid,
				x: data.x,
				y: data.y,
				vx: data.vx,
				vy: data.vy,
				dx: data.dx, 
				dy: data.dy,
				rotation: data.rotation
			});
		});
		
		socket.on('playerupdate', function(data) {
			io.sockets.emit('playerupdate', {
				uuid: data.uuid,
				isDigging: data.isDigging
			});
		});
		
		socket.on('playerinit', function(data) {
			var entity = entityTemplates.player(data.username);
			data.username = entity.uuid;
			players[socket.id] = { username: data.username };
			players[socket.id].entity = entity;
			
			var physics = entity.getComponent('physics');
			physics.x = 128;
			physics.y = 128;
			
			// Dig spawn
			for(var i = 0; i < 10; i++) {
				_chunkManager.fillCircle(physics.x/32.0, physics.y/32.0, 6);
				io.sockets.emit('dig', { x: physics.x, y: physics.y, digRadius: 6});
			}
	
			socket.emit('playerinit', {
				uuid: entity.uuid,
				username: data.username,
				x: physics.x,
				y: physics.y,
				rotation: physics.rotation
			});
			
			socket.broadcast.emit('playerjoin', {
				uuid: entity.uuid,
				username: data.username,
				x: physics.x,
				y: physics.y,
				rotation: physics.rotation
			});
			
			console.log(data.username + " has connected.");
		});
		
		socket.on('dig', function(data) {
			_chunkManager.fillCircle(parseFloat(data.x)/32.0, parseFloat(data.y)/32.0, data.digRadius);
			io.sockets.emit('dig', data);
		});
		
		require("./RegisterHandler.js")(socket, this);
		require("./LoginHandler.js")(socket, this);
		
	}.bind(this));
	
	app.listen(3000);
	console.log("Listening on port 3000");
	
	var context = this;
	this.lastUpdate = Date.now();
	this.run = function() {
		var now = Date.now();
		var dt = now - this.lastUpdate;
		//console.log(dt);
		this.lastUpdate = Date.now()
	
		this.entityWorld.update(dt);
		
		this.physicsWorld.Step(1 / 60.0, 10, 10);
		this.physicsWorld.DrawDebugData();
		
		_regeneratorServer.update(dt);
	};
	var intervalId = setInterval((this.run).bind(this), 0.0);
}
GLOBAL.server = new ServerInstance();