BattleServer = function(battleManager, entityWorld, entityServer, playerServer, io) {

	this._battleManager = battleManager;
	this._entityWorld = entityWorld;
	this._entityServer = entityServer;
	this._playerServer = playerServer;
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
	this._entityServer.sendUpdatePacket(victim.uuid);
	var physics = victim.getComponent("physics");
	/*console.log(victim.uuid + " updated. gx:" + physics.gx + " gy:" + physics.gy);
	console.log("And some more... x:" + physics.x + " y:" + physics.y);
	console.log(" ");*/
}

BattleServer.prototype.onMessageHit = function(socket) {
	var attackerUUID = this._playerServer.getPlayer(socket.id).uuid;
 	var attacker = this._entityServer.getEntity(attackerUUID);

 	var distance = 0.05*32.0;
	var radius = 0.5*32.0;
	var damage = 20.0;

	//this._battleManager.hitEntity(attacker, victim, damage);
	this._battleManager.doHit(attacker, distance, radius, damage);
}