Connection = function(ip, port){
	this.socket = io('http://' + ip + ':' + port);
	console.log('[Socket.IO]', "Connecting to " + ip + ":" + port);
	
	var socket = this.socket;
	this.socket.on('connect', function() {
		console.log('[Socket.IO]', "Connected: " + socket.connected);
	});
	
	//this.socket.on('message', console.log.bind(console));
    return this;
};

Connection.prototype.send = function send(type, msg) {
	this.socket.emit(type, msg);
};

Connection.prototype.on = function on(type, func, context) {	
	this.socket.on(type, function(data) {
		func(data, context);
	});
};