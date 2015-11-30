BattleServer = function(battleManager, entityWorld, entityServer, playerServer, io) {

	this._battleManager = battleManager;
	this._entityWorld = entityWorld;
	this._entityServer = entityServer;
	this._playerServer = playerServer;
	this._io = io;

	this._battleManager.subscribe(this);

	return this;
}

BattleServer.prototype.onMeeleHit = function(attacker, victim, damage) {
	return;
	this._io.sockets.emit("hit", {attackerUUID : attacker.uuid, victimUUID : victim.uuid, damage : damage});
	this._entityServer.sendUpdatePacket(victim.uuid);
	var physics = victim.getComponent("physics");
}