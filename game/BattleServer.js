BattleServer = function(battleManager, entityWorld, entityServer, io) {

	this._battleManager = battleManager;
	this._entityWorld = entityWorld;
	this._entityServer = entityServer;
	this._io = io;

	this._battleManager.subscribe(this);

	this._io.on('connection', function(socket) {
		socket.on('hit', function(data) { this.onMessageHit(socket);
		}.bind(this));
	}.bind(this));

	return this;
}

BattleServer.prototype.onMeeleHit = function(attacker, victim, damage) {

	this._io.sockets.emit("hit", {attackerUUID : attacker.uuid, victimUUID : victim.uuid, damage : damage});
}

BattleServer.prototype.onMessageHit = function(socket) {
	var attackerUUID = server.players[socket.id].uuid;
 	var attacker = this._entityServer.getEntity(attackerUUID);

 	var distance = 0.5*32.0;
	var radius = 1.0*32.0;
	var damage = 20.0;

	this._battleManager.doHit(attacker, distance, radius, damage);
}