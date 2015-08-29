var http = require('http'),
    fs = require('fs'),
    index = fs.readFileSync(__dirname + '/index.html');

var app = http.createServer(function(req, res) {
    res.end();
});

var io = require('socket.io').listen(app);

// Send current time to all connected clients
//function sendTime() {
//    io.emit('time', { time: new Date().toJSON() });
//}

// Send current time every 10 secs
//setInterval(sendTime, 10000);

io.on('connection', function(socket) {
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });
	io.sockets.emit('message', "A client has joined with IP " + socket.request.connection.remoteAddress);
	
	/*socket.broadcast.emit('playerjoin', {
		name: "unfinished" + Math.random() * 255,
		x: 0,
		y: 0,
		rotation: 0
	});*/
	
	socket.on('playerupdate', function(data) {
		console.log("Received playerupdate " + data.name);
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
		console.log("Received playerinit " + data.name);
		socket.broadcast.emit('playerjoin', {
			name: data.name,
			x: data.x,
			y: data.y,
			rotation: data.rotation
		});
	});
});

app.listen(3000);
console.log("Listening on port 3000");