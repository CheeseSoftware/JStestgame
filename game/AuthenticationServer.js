
AuthenticationServer = function(db, playerServer, io) {
	this._io = io;
	this._playerServer = playerServer;
	this._db = db;
	
	this._io.on('connection', function(socket) {
		// Load listeners for "register" and "login"
		require("./RegisterHandler.js")(socket, this);
		require("./LoginHandler.js")(socket, this);
	}.bind(this));
}

AuthenticationServer.prototype.isSocketAuthenticated = function(socket) {
	return this._playerServer.getPlayer(socket.id).authenticated;
}

AuthenticationServer.prototype.setSocketAuthenticated = function(socket, bool) {
	this._playerServer.getPlayer(socket.id).authenticated = true;
}
