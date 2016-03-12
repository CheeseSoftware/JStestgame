isServer = true;

fs = require('fs');
	
var simple_include = function( lib ) {
	data = fs.readFileSync("../" + lib, 'utf8');
	eval(data);
}

// Include common.js with the include system.
//simple_include("game/Common.js");

// Libraries
http = require('http');
CES = require('ces');
crypto = require('crypto');
mongo = require('mongodb'); 
socketio = require('socket.io');
crypto = require('crypto');
performancenow = require("performance-now");

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
	this.physicsWorld = new PhysicsWorld();
	
	// Initialize chunkManager
	this.chunkManager = new ChunkManager();
	
	// Initialize entityWorld
	this.entityWorld = new CES.World();

	// Initialize other systems
	this.battleManager = new BattleManager(this.entityWorld);
	
	// Initialize entityServer
	this.playerServer = new PlayerServer(this.io);
	this.entityServer = new EntityServer(this.entityWorld, this.playerServer, this.io);
	this.authenticationServer = new AuthenticationServer(this.db, this.playerServer, this.io);
	this.chunkServer = new ChunkServer(this.chunkManager, this.io);
	this.regeneratorServer = new RegeneratorServer(this.chunkManager, this.io);
	this.BattleServer = new BattleServer(this.battleManager, this.entityWorld, this.entityServer, this.playerServer, this.io);
	this.monsterSpawner = new MonsterSpawner(this.chunkManager, this.entityServer, this.io);
	
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	var terrainPhysicsSystem = new ECS.Systems.TerrainPhysicsSystem(this.chunkManager);
	this.entityWorld.addSystem(terrainPhysicsSystem);
	this.entityWorld.addSystem(new ECS.Systems.ControlServerSystem());
	this.entityWorld.addSystem(new ECS.Systems.AISystem(this.entityServer));
	this.entityWorld.addSystem(new ECS.Systems.MovementSystem());
	
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
				var control = entity.getComponent('control');
				socket.emit('playerjoin', {
					uuid: player.uuid,
					username: player.username,
					x: physics.x,
					y: physics.y,
					vx: physics.vx,
					vy: physics.vy,
					dx: control.moveDir[0],
					dy: control.moveDir[1],
					rotation: physics.rotation
				});
			}
		}.bind(this));
		
		// Send existing monsters to the new player
		var monsters = this.entityWorld.getEntities('AI');
		monsters.forEach(function (monster) { 
			var physics = monster.getComponent('physics');
			this.entityServer.sendEntitySpawnPacket(monster, socket);
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
		
		var init2 = {
		};
		
		if(playerToFollow)
			init2.follow = playerToFollow.uuid;
		else
			init2.target = { x:128, y:128 };
		
		socket.emit('init', init);
		this.io.sockets.emit('message', "A client has joined with IP " + socket.request.connection.remoteAddress);
		
		socket.on('init2', function() {
			socket.emit('init2', init2);
		}.bind(this));
		
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
			
			var player = entity.getComponent("player");
			var physics = entity.getComponent("physics");
			var control = entity.getComponent('control');
			player.isDigging = data.isDigging;
			control.isUsingTool = data.isDigging;
			if(data.isDigging) {
				physics.acceleration = constants.digAcceleration;
			}
			else {
				physics.acceleration = constants.acceleration;
			}

			this.io.sockets.emit('playerupdate', {
				uuid: data.uuid,
				isDigging: data.isDigging
			});
		}.bind(this));
		
		socket.on('playerinit', function(data) {
			if(this.playerServer.getPlayer(socket.id)) {
				// Already playing
				return;
			}
			
			if(!this.authenticationServer.isSocketAuthenticated(socket))
				this.authenticationServer.setSocketAuthenticated(socket, true, { username: "Guest", email: "none", _id: generateUUID() });
			
			var uuid = this.authenticationServer.getUUID(socket);
			//console.log("MongoDB UUID: " + uuid);
			var username = this.authenticationServer.getUsername(socket);
			var entity = entityTemplates.player(username, uuid);
			this.playerServer.setPlayer(socket.id, { username: username, uuid: uuid, spawned: true});
			
			var physics = entity.getComponent('physics');
			physics.x = 128;
			physics.y = 128;
			
			var health = entity.getComponent("health");
			health.subscribeFunc("onDeath", function(health) {
				health.value = health.max;
				socket.emit("playerdeath", { uuid: entity.uuid, x: 0, y: 0 });
				physics.setAbsolutePosition(0, 0);
			}.bind(this));
			
			// Dig spawn
			for(var i = 0; i < 10; i++) {
				this.chunkManager.fillCircle(physics.x/32.0, physics.y/32.0, 10);
				this.io.sockets.emit('dig', { x: physics.x, y: physics.y, digRadius: 10});
			}
	
			this.playerServer.sendPlayerInitPacket(entity, socket.id, socket);
			this.playerServer.sendPlayerJoinPacket(entity, socket.id);
			
			/*for(var i = 0; i < 1; ++i) {
				var monster = this.entityServer.spawnCreature("worker");
				var x = Math.random() * 128;
				var y = Math.random() * 128;
				
				var physics = monster.getComponent("physics");
				physics.x = x;
				physics.y = y;
				physics.ix = x;
				physics.iy = y;
				
				var AI = monster.getComponent("AI");
				AI.target = uuid;
				
				this.entityServer.sendEntitySpawnPacket(monster);
			}*/
			
			console.log(username + " has connected.");
		}.bind(this));
		
		socket.on('dig', function(data) {
			var entity = this.entityServer.getEntity(data.uuid);
			if(entity) {
				var physics = entity.getComponent("physics");
				var digRadius = 1.5;
				var x = physics.x + 32.0*Math.cos(physics.rotation);
				var y = physics.y + 32.0*Math.sin(physics.rotation);
				this.chunkManager.fillCircle(parseFloat(x)/32.0, parseFloat(y)/32.0, digRadius);
				
				var data = {
					uuid: data.uuid,
					x: x,
					y: y,
					digRadius: digRadius
				}
				
				this.io.sockets.emit('dig', data);
			}
		}.bind(this));
		
	}.bind(this));

	// Start socket.io server
	app.listen(constants.serverPort);
	console.log("Listening on port " + constants.serverPort);
	
	// Start the server loop
	this.lastUpdate = performancenow().toFixed(3);
	this.run = function() {
		var now = performancenow();
		var dt = (now.toFixed(3) - this.lastUpdate);
		this.lastUpdate = performancenow().toFixed(3);

		this.entityWorld.update(dt);
		
		this.physicsWorld.update(dt/1000.0);
		
		this.regeneratorServer.update(dt/1000.0);
	}.bind(this);
	var intervalId = setInterval(this.run, constants.serverInterval);
}
GLOBAL.server = new ServerInstance();