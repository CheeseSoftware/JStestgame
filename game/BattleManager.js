BattleManager = function(entityWorld) {

	this._entityWorld = entityWorld;

	return this;
}
// Subscribable events:
BattleManager.prototype = new Observable(["onHitCall", "onMeeleHit"]);
BattleManager.prototype.constructor = BattleManager;   

/* Hit entities within radius and do damage.
 * // TODO: onHitCallback is not Called! Fix that!
 * onHitCallback is optional.
 * onHitCallback - function(attacker, victim)
 */
BattleManager.prototype.hit = function(attacker, onHitCallback) {
	this.on("onHitCall", [attacker]);
}

/* Hit entities within radius and do damage.
 * Warning: This function will only run on the client.
 * onHitCallback is optional.
 * onHitCallback - function(attacker, victim)
 */
BattleManager.prototype.doHit = function(attacker, distance, radius, damage, onHitCallback) {
	var entities = this._entityWorld.getEntities("physics");

	var attackerPhysics = attacker.getComponent("physics");
	var attackerPos = [attackerPhysics.x, attackerPhysics.y];
	v2.add([distance*Math.cos(attackerPhysics.rotation), distance*Math.sin(attackerPhysics.rotation)], attackerPos, attackerPos);

	var attackerPos = [attackerPhysics.gx, attackerPhysics.gy];
	v2.add([distance*Math.cos(attackerPhysics.rotation), distance*Math.sin(attackerPhysics.rotation)], attackerPos, attackerPos);

	for (var i = 0; i < entities.length; ++i) {
		var entity = entities[i];
		if(entity.uuid != attacker.uuid) {
			var physics = entity.getComponent("physics");
	
			var vPos = v2.create(physics.gx, physics.gy);
			var deltaPos = [0.0, 0.0];
			v2.subtract(vPos, attackerPos, deltaPos);
	
			if (v2.lengthSquared(deltaPos)/32.0 > radius*radius)
				continue;
			
			this.hitEntity(attacker, entity, damage);
	
			if (onHitCallback)
				onHitCallback(attacker, entity);
		}
	}
}

BattleManager.prototype.hitEntity = function(attacker, victim, damage) {

	var physics = victim.getComponent("physics");
	var attackerPhysics = attacker.getComponent("physics");

	// Push the victim
	var dir = [attackerPhysics.x - physics.x, attackerPhysics.y - physics.y];
	if (v2.lengthSquared(dir) > 0.0) {

		v2.normalize(dir, dir);

		physics.vx += -dir[0]*100.0*32.0;
		physics.vy += -dir[1]*100.0*32.0;
	}
	
	// Push the victim ghost
	var dir = [attackerPhysics.gx - physics.gx, attackerPhysics.gy - physics.gy];
	if (v2.lengthSquared(dir) > 0.0) {

		v2.normalize(dir, dir);

		physics.gvx += -dir[0]*100.0*32.0;
		physics.gvy += -dir[1]*100.0*32.0;
	}

	this.on("onMeeleHit", [attacker, victim, damage]);
}