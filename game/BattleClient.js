BattleClient = function(battleManager, entityWorld, entityClient, connection) {

	this._battleManager = battleManager;
	this._entityWorld = entityWorld;
	this._entityClient = entityClient;
	this._connection = connection;

	this._battleManager.subscribe(this);

	this._connection.on("hit", this.onMessageHit.bind(this));

	return this;
}

BattleClient.prototype.onHitCall = function(attacker) {
	this._connection.send("hit");
}

BattleClient.prototype.onMessageHit = function(data) {
	var attackerUUID = data.attackerUUID;
	var attackerID = context.entityClient.entityMap.getEntityId(attackerUUID);
 	var attacker = context.entityWorld.getEntity(attackerID);
 	var victimUUID = data.victimUUID;
	var victimID = context.entityClient.entityMap.getEntityId(victimUUID);
 	var victim = context.entityWorld.getEntity(victimUUID);
	var damage = data.damage;

	this._battleManager.hitEntity(attacker, victim, damage);
}