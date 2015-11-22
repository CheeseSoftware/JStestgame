
AuthenticationServer = function(db, io) {
	this._io = io;
	this._db = db;
	
	this._io.on('connection', function(socket) {
		// Load listeners for "register" and "login"
		require("./RegisterHandler.js")(socket, this);
		require("./LoginHandler.js")(socket, this);
	}.bind(this));
}

AuthenticationServer.prototype.isSocketAuthenticated = function(socket) {
	return server.players[socket.id].authenticated;
}

AuthenticationServer.prototype.setSocketAuthenticated = function(socket, bool) {
	server.players[socket.id].authenticated = true;
}
