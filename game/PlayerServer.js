
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
