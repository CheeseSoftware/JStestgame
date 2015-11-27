BattleManager = function(entityWorld) {

	this._entityWorld = entityWorld;

	return this;
}
// Subscribable events:
BattleManager.prototype = new Observable(["onHitCall", "onMeeleHit"]);
BattleManager.prototype.constructor = BattleManager;   


/* Hit entities within radius and do damage.
 * Warning: This function will only run on the client.
 * onHitCallback is optional.
 * onHitCallback - function(attacker, victim)
 */
BattleManager.prototype.hit = function(attacker, distance, radius, damage, onHitCallback) {
	var entities = this._entityWorld.getEntities("physics");

	var attackerPhysics = attacker.getComponent("physics");
	var attackerPos = [attackerPhysics.x, attackerPhysics.y];
	v2.add([distance*Math.cos(attackerPhysics.rotation), distance*Math.sin(attackerPhysics.rotation)], attackerPos, attackerPos);

	for (var i = 0; i < entities.length; ++i) {
		var entity = entities[i];
		if(entity.uuid != attacker.uuid) {
			var physics = entity.getComponent("physics");
	
			var vPos = v2.create(physics.x, physics.y);
			var deltaPos = [0.0, 0.0];
			v2.subtract(vPos, attackerPos, deltaPos);
	
			if (v2.lengthSquared(deltaPos)/32.0 > radius*radius)
				continue;

			var dir = [0.0, 0.0];
			v2.normalize(deltaPos, dir);
			var dir2 = [Math.cos(attackerPhysics.rotation), Math.sin(attackerPhysics.rotation)];

			var dot = v2.dot(dir, dir2);

			if (dot < 0.5)
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
	var health = victim.getComponent("health");


	if (isServer) {
		// Push the victim ghost
		var dir = [attackerPhysics.x - physics.x, attackerPhysics.y - physics.y];
		if (v2.lengthSquared(dir) > 0.0) {

			v2.normalize(dir, dir);

			physics.vx += -dir[0]*100.0*32.0;
			physics.vy += -dir[1]*100.0*32.0;
		}

		server.entityServer.sendUpdatePacket(victim);
	}

	if (health)
		health.doDamage(damage);

	this.on("onMeeleHit", [attacker, victim, damage]);
}