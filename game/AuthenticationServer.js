
AuthenticationServer = function(db, playerServer, io) {
	this._io = io;
	this._playerServer = playerServer;
	this._db = db;
	this._authenticated = {};
	
	this._io.on('connection', function(socket) {
		// Load listeners for "register" and "login"
		require("./RegisterHandler.js")(socket, this);
		require("./LoginHandler.js")(socket, this);
	}.bind(this));
}

AuthenticationServer.prototype.isSocketAuthenticated = function(socket) {
	return this._authenticated[socket.id].authenticated;
}

AuthenticationServer.prototype.getUsername = function(socket) {
	return this._authenticated[socket.id].username;
}

AuthenticationServer.prototype.getEmail = function(socket) {
	return this._authenticated[socket.id].email;
}

AuthenticationServer.prototype.getUUID = function(socket) {
	return this._authenticated[socket.id].uuid;
}

AuthenticationServer.prototype.setSocketAuthenticated = function(socket, bool, user) {
	if(!this._authenticated[socket.id])
		this._authenticated[socket.id] = {};
	var authenticated = this._authenticated[socket.id];
	authenticated.authenticated = bool;
	if(user) {
		authenticated.username = user["username"];
		authenticated.email = user["email"];
		authenticated.uuid = user["_id"]; // "_id" is generated automatically by MongoDB
	}
}

AuthenticationServer.prototype.remove = function(socket) {
	delete this._authenticated[socket.id];
}
