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
	var attacker = this._entityClient.getEntity(data.attackerUUID);
 	var victim = this._entityClient.getEntity(data.victimUUID);
	var damage = data.damage;

	this._battleManager.hitEntity(attacker, victim, damage);
}