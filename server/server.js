
fs = require('fs');

var include = function( lib ) {
	data = fs.readFileSync("../" + lib, 'utf8');

	eval(data);
}

// Libraries
//include("lib/Box2D.js");
var CES = require('ces');
include("lib/perlin.js");

// Core
include("game/Observable.js");

// Tiles
include("game/TileType.js");
include("game/TileRegister.js");

// Chunks, World
include("game/Chunk.js");
include("game/Generator.js");
include("game/ChunkManager.js");
include("game/ChunkServer.js");
include("game/RegeneratorServer.js");

// Initialize entityWorld
entityWorld = new CES.World();

// Initialize chunkManager
_chunkManager = new ChunkManager();

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
		socket.emit('playerjoin', {
			name: player.name,
			x: player.x,
			y: player.y,
			vx: player.vx,
			vy: player.vy,
			rotation: player.rotation,
			playState: player.playState
		});
	});
	
	socket.on('error', console.error.bind(console));
	
	socket.on('disconnect', function(){
		if(players[socket.id] != undefined) {
			console.log(players[socket.id].name + ' has disconnected.');
			socket.broadcast.emit('playerleave', { name: players[socket.id].name });
			delete players[socket.id];
		}
    });
	
	socket.on('playerupdate', function(data) {
		//console.log("Received playerupdate " + data.name);
		if(players[socket.id] != undefined) {
			players[socket.id] = { 
				name: data.name, 
				x: data.x, 
				y: data.y, 
				vx: data.vx, 
				vy: data.vy, 
				rotation: data.rotation, 
				playState: data.playState 
			};
		}
		socket.broadcast.emit('playerupdate', {
			name: data.name,
			x: data.x,
			y: data.y,
			vx: data.vx,
			vy: data.vy,
			rotation: data.rotation,
			playState: data.playState
		});
	});
	
	socket.on('playerinit', function(data) {
		data.name = "player" + Math.round(Math.random() * 65536);
		console.log(data.name + " has connected.");
		players[socket.id] = { name: data.name, x: 128, y: 128, rotation: 0 };
		socket.emit('playerinit', {
			name: data.name,
			x: players[socket.id].x,
			y: players[socket.id].y,
			rotation: players[socket.id].rotation
		});
		
		
		socket.broadcast.emit('playerjoin', {
			name: data.name,
			x: players[socket.id].x,
			y: players[socket.id].y,
			rotation: players[socket.id].rotation,		
			playState: { up: false, down: false, left: false, right: false, dig: false }
		});
	});
	
	socket.on('chatmessage', function(data) {
		io.sockets.emit('chatmessage', { message: data.message });
		console.log(data.message);
	});
	
	socket.on('playerdig', function(data) {
		_chunkManager.fillCircle(parseFloat(data.x)/32.0, parseFloat(data.y)/32.0, data.digRadius);
		io.sockets.emit('dig', data);
	});
	
	
	//MENU PACKETS
	
	
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
    var dt = 0.1;//now - this.lastUpdate;
	this.lastUpdate = Date.now()

	_regeneratorServer.update(dt);
	console.log("Deltatime:" + dt);
}
// Run game loop:
var intervalId = setInterval(run, 100);