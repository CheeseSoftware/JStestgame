BattleManager = function(entityWorld) {

	this._entityWorld = entityWorld;

	return this;
}
// Subscribable events:
BattleManager.prototype = new Observable(["onMeeleHit"]);
BattleManager.prototype.constructor = BattleManager;   

/* Hit entities within radius and do damage.
 * onHitCallback is optional.
 * onHitCallback - function(attacker, victim)
 */
BattleManager.prototype.hit = function(attacker, position, radius, damage, onHitCallback) {
	var entities = this._entityWorld.getEntities("physics");

	for (var i = 0; i < entities.length; ++i) {
		var entity = entities[i];
		var physics = entity.getComponent("physics");

		var vPos = v2.create(physics.x, physics.y);
		var deltaPos = [0.0, 0.0];
		v2.subtract(vPos, position, deltaPos);

		if (v2.lengthSquared(deltaPos)/32.0 > radius*radius)
			continue;

		this.hitEntity(attacker, entity, damage);

		if (onHitCallback != undefined)
			onHitCallback(attacker, entity);
	}
}

BattleManager.prototype.hitEntity = function(attacker, victim, damage) {

	var physics = victim.getComponent("physics");
	var attackerPhysics = attacker.getComponent("physics");

	var dir = [attackerPhysics.x - physics.x, attackerPhysics.y - physics.y];
	if (v2.lengthSquared(dir) > 0.0) {

		v2.normalize(dir, dir);

		physics.vx += -dir[0]*100.0*32.0;
		physics.vy += -dir[1]*100.0*32.0;
	}

	this.on("onMeeleHit", [attacker, victim, damage]);
}