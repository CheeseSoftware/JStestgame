
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
		console.log(data.name + " has connected.");
		var player = GP.spawnPlayer(data.name);
		var physics = player.getComponent("physics");
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;
		GP.players[data.name] = player;
	});
	
	socket.on('playerinit', function(data) {
		GP.player = GP.spawnPlayer("player" + Math.round(Math.random() * 65536));
		GP.player.addComponent(new ECS.Components.ControlledPlayer());
	
		var player = GP.player.getComponent('player');
		var physics = GP.player.getComponent('physics');
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;
	});
	
	socket.on('playerupdate', function(data) {
		var player = GP.players[data.name];
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
	});
	
	socket.on('playerleave', function(data) {
		console.log(data.name + ' has disconnected.');
		GP.despawnPlayer(data.name);
	});
	
    return this;
};

GP.connection.prototype.send = function send(type, msg) {
	this.socket.emit(type, msg);
};