




var http = require('http'),
    fs = require('fs');
    //index = fs.readFileSync(__dirname + '/index.html');
var app = http.createServer(function(req, res) {
    res.end();
});
var io = require('socket.io').listen(app);

var players = {};

var mapData = {
	width: 256,
	height: 256,
	tileSize: 64
};

// Include Chunk system
eval(fs.readFileSync('../game/TileType.js', 'utf8')); 
eval(fs.readFileSync('../game/TileRegister.js', 'utf8')); 
eval(fs.readFileSync('../game/Chunk.js', 'utf8')); 
eval(fs.readFileSync('../game/ChunkManager.js', 'utf8')); 
eval(fs.readFileSync('../game/ChunkRenderer.js', 'utf8')); 

//var chunkManager = new ChunkManager(


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
		var player = players[key]
		socket.emit('playerjoin', {
			name: player.name,
			x: player.x,
			y: player.y,
			vx: player.vx,
			vy: player.vy,
			rotation: player.rotation
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
		if(players[socket.id] != undefined)
			players[socket.id] = { name: data.name, x: data.x, y: data.y, vx: data.vx, vy: data.vy, rotation: data.rotation };
		socket.broadcast.emit('playerupdate', {
			name: data.name,
			x: data.x,
			y: data.y,
			vx: data.vx,
			vy: data.vy,
			rotation: data.rotation
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
			rotation: players[socket.id].rotation
		});
	});
	
	socket.on('chatmessage', function(data) {
		io.sockets.emit('chatmessage', { message: data.message });
		console.log(data.message);
	});
	
	socket.on('playerdig', function(data) {
		//TODO: Change terrain
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