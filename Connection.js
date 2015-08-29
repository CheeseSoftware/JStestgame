
GP.connection = function Connection (ip, port){
	var socket = io('http://' + ip + ':' + port);
	this.socket = socket;
	console.log('[Socket.IO]', "Connecting to " + ip + ":" + port);
	socket.on('connect', function() {
		console.log('[Socket.IO]', "Connected: " + socket.connected);
	});

	socket.on('welcome', function(data) {
		console.log(data.message);
		socket.emit('i am client', {data: 'foo!', id: data.id});
	});
	
	socket.on('error', console.error.bind(console));
	//socket.on('message', console.log.bind(console));
	
	socket.on('message', function(data) {
		console.log(data);
	});
	
	socket.on('playerjoin', function(data) {
		var player = new GP.Player(data.name)
		player.sprite.x = data.x;
		player.sprite.y = data.y;
		player.sprite.rotation = data.rotation;
		GP.players[data.name] = player;
	});
	
	socket.on('playerupdate', function(data) {
		var player = GP.players[data.name];
		if(player != undefined) {
			player.sprite.x = data.x;
			player.sprite.y = data.y;
			player.sprite.body.velocity.x = data.vx;
			player.sprite.body.velocity.y = data.vy;
			console.log("vx " + data.vx + " vy " + data.vy);
			player.sprite.rotation = data.rotation;
		}
		else
			console.log("undefined");
	});
	
    return this;
};

GP.connection.prototype.send = function send(type, msg) {
	this.socket.emit(type, msg);
};