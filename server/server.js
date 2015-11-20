var isServer = true;

fs = require('fs');

var simple_include = function( lib ) {
	data = fs.readFileSync("../" + lib, 'utf8');
	eval(data);
}

// Include common.js with the include system.
simple_include("game/common.js");

//include("lib/Box2D.js");	<- evil library

// Libraries
var CES = require('ces');
var crypto = require('crypto');
var Box2D = require('box2dweb-commonjs').Box2D;
include("lib/perlin.js");
include("lib/gl-matrix.js");

// Core
include("game/core/Observable.js");
include("game/EntityMap.js");

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
var ECS = {
	Components: {},
	Systems: {}
};	
include("game/systems/PhysicsSystem.js");
include("game/systems/TerrainPhysicsSystem.js");
include("game/components/Physics.js");

include("game/EntityServer.js");

// Initialize physics
var   b2Vec2 = Box2D.Common.Math.b2Vec2
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


physicsWorld = new b2World(new b2Vec2(0, 0), false)

// Initialize chunkManager
_chunkManager = new ChunkManager();

// Initialize entityWorld
entityWorld = new CES.World();
entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
var terrainPhysicsSystem = new ECS.Systems.TerrainPhysicsSystem(_chunkManager);
entityWorld.addSystem(terrainPhysicsSystem);

// Initialize entityServer
entityServer = new EntityServer();

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

// Load dem constants
var constants = {
	playerFatness: 30
}

var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('digminer', server);

db.open(function(err, db) {
	if(!err) {
		console.log("We are connected");
	}
	else
		console.log("There was an error connecting to MongoDB");
});

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
			
			entityWorld.removeEntity(players[socket.id].entity);
			entityServer.entityMap.remove(players[socket.id].entity.uuid);
			delete players[socket.id];
		}
    });
	
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
	
	socket.on('playerinit', function(data) {
			
		// Initialize physics stuff
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		fixDef.shape = new b2CircleShape(constants.playerFatness);
		bodyDef.position.Set(10, 400 / 30 + 1.8);
		var physicsBody = physicsWorld.CreateBody(bodyDef);
		var ghostBody = physicsWorld.CreateBody(bodyDef);
		physicsBody.CreateFixture(fixDef);
		ghostBody.CreateFixture(fixDef);
		
		var entity = entityServer.createEntity();
		
		data.username = entity.uuid;
		console.log(data.username + " has connected.");
		players[socket.id] = { username: data.username };
		
		var physics = new ECS.Components.Physics(physicsBody, ghostBody);
		physics.x = 128;
		physics.y = 128;
		entity.addComponent(physics);
		entityWorld.addEntity(entity);
		players[socket.id].entity = entity;
		
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
	});
	
	socket.on('playerdig', function(data) {
		_chunkManager.fillCircle(parseFloat(data.x)/32.0, parseFloat(data.y)/32.0, data.digRadius);
		io.sockets.emit('dig', data);
	});
	
	/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Register and login below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
	
	socket.on('register', function(data) {
		//TODO: verify data
		
		if(!data.username) {
			socket.emit('registerresponse', { success: false, response:"Username is empty."});
			return;
		}
		
		if(!data.email) {
			socket.emit('registerresponse', { success: false, response:"Email is empty."});
			return;
		}
		
		if(!data.password) {
			socket.emit('registerresponse', { success: false, response:"Password is empty."});
			return;
		}
		
		db.collection('users', function(err, collectionref) { 
			if(err)
				console.log(err);
			
			collectionref.findOne({"username":data.username}, function(err, doc) {
				if(err)
					console.log(err);
				if(doc) {
					socket.emit('registerresponse', { success: false, response:"A user already exists with username \"" + data.username + "\""});
				}
				else {
					collectionref.findOne({"email":data.email}, function(err, doc) {
					if(err)
						console.log(err);
					if(doc) {
						socket.emit('registerresponse', { success: false, response:"A user already exists with email \"" + data.email + "\""});
						return;
					}
					else {
						var doc = {"username":data.username, "email":data.email, "password":data.password};
						collectionref.insert(doc, function (err, result) {
							if(err)
								console.log(err);
							else
								socket.emit('registerresponse', { success: true, response:"User has been created."});
						});
					}
				});
				}
			});
		});
	});
});

app.listen(3000);
console.log("Listening on port 3000");



run = function() {
    var now = Date.now();
    var dt = now - this.lastUpdate;
	//console.log(dt);
	this.lastUpdate = Date.now()

	entityWorld.update(dt);
	
	physicsWorld.Step(1 / 60.0, 10, 10);
	physicsWorld.DrawDebugData();
	
	_regeneratorServer.update(dt);
}
// Run game loop:
var intervalId = setInterval(run, 0);