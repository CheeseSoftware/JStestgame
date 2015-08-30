var http = require('http'),
    fs = require('fs');
    //index = fs.readFileSync(__dirname + '/index.html');
var app = http.createServer(function(req, res) {
    res.end();
});
var io = require('socket.io').listen(app);

var players = {};

io.on('connection', function(socket) {
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });
	io.sockets.emit('message', "A client has joined with IP " + socket.request.connection.remoteAddress);
	
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
		console.log(data.name + " has connected.");
		players[socket.id] = { name: data.name, x: data.x, y: data.y, rotation: data.rotation };
		socket.broadcast.emit('playerjoin', {
			name: data.name,
			x: data.x,
			y: data.y,
			rotation: data.rotation
		});
		
		// Send existing players to the new player
		Object.keys(players).forEach(function (key) { 
    		var player = players[key]
			if(player.name != data.name) { //Don't send his own info
				socket.emit('playerjoin', {
					name: player.name,
					x: player.x,
					y: player.y,
					vx: player.vx,
					vy: player.vy,
					rotation: player.rotation
				});
			}
		});
	});
});

app.listen(3000);
console.log("Listening on port 3000");