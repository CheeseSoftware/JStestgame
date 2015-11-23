
PlayerServer = function(io) {
	this._io = io;
	this._players = {};
}

PlayerServer.prototype.getPlayer = function(socketid) {
	return this._players[socketid];
}

PlayerServer.prototype.setPlayer = function(socketid, player) {
	this._players[socketid] = player;;
}

PlayerServer.prototype.removePlayer = function(socketid) {
	delete this._players[socketid];
}

PlayerServer.prototype.sendPlayerJoinPacket = function(entity, socketid, socket) {
	var physics = entity.getComponent('physics');
	var player = this.getPlayer(socketid);
	var data = {
		uuid: entity.uuid,
		username: player.username,
		x: physics.gx,
		y: physics.gy,
		vx: physics.gvx,
		vy: physics.gvy,
		dx: physics.dx, 
		dy: physics.dy,
		rotation: physics.rotation
	};
	
	if(socket)
		socket.emit('playerjoin', data);
	else
		this._io.sockets.emit('playerjoin', data);
}

PlayerServer.prototype.sendPlayerInitPacket = function(entity, socketid, socket) {
	var physics = entity.getComponent('physics');
	var player = this.getPlayer(socketid);
	var data = {
		uuid: entity.uuid,
		username: player.username,
		x: physics.gx,
		y: physics.gy,
		rotation: physics.rotation
	};
	
	if(socket)
		socket.emit('playerinit', data);
	else
		this._io.sockets.emit('playerinit', data);
}

