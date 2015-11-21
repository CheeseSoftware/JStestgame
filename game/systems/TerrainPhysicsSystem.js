ECS.Systems.TerrainPhysicsSystem = CES.System.extend({
	init: function(chunkManager) {
		ECS.Systems.TerrainPhysicsSystem.chunkManager = chunkManager;
	},
    update: function (dt) {
        var entities = this.world.getEntities('physics');
		
		//return;
		// DO NOT REMOVE THIS RETURN UNTIL YOU HAVE FIXED "vec2" ON SERVER
		
		entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
			var isControlled = entity.getComponent('controlled');
			
			var pos = v2.create(physics.x, physics.y);
			var normal = v2.create(0.0, 0.0);
			var distance = 4.0;


			for (angle = 0; angle < 360; angle+=18) {
				var dir = v2.create(Math.cos(angle*3.14/180), Math.sin(angle*3.14/180));
				var rayDis = Math.max(raymarch(pos, dir, 8), -1.0);
				
				if (rayDis >= distance)
					continue;

				distance = rayDis;

				var pushStrengthTemp = Math.max(1.0 - rayDis, 0.0);
				v2.multiply(pushStrengthTemp, dir, normal);
			}

			if (v2.length(normal) <= 0.0)
				return;

			if (distance <= -1.0)
				return;

			v2.normalize(normal, normal);

			var pushStrength = Math.max(1.0 - distance, -1.0);

			if (pushStrength <= 0.0)
				return;

			physics.x += -normal[0]*pushStrength*pushStrength*32.0/4.0;
			physics.y += -normal[1]*pushStrength*pushStrength*32.0/4.0;

			var normalForce = v2.clone(normal);
			var velocity = v2.create(physics.vx, physics.vy);
			var dot = Math.max(v2.dot(normal, velocity), 0.0)
			v2.multiply(-dot, normalForce, normalForce);
			physics.vx += normalForce[0];
			physics.vy += normalForce[1];
			var velocityDir = v2.create(physics.vx, physics.vy);
			if (v2.length(velocityDir) > 0.0) {
				v2.normalize(velocityDir, velocityDir);
				var frictionConstant = 0.03125;
				var frictionStrength =(1.0-Math.pow(1.0-frictionConstant, dt))*v2.length(normalForce);
				physics.vx -= v2.clampF(velocityDir[0]*frictionStrength, 0.0, physics.vx);
				physics.vy -= v2.clampF(velocityDir[1]*frictionStrength, 0.0, physics.vy);
			}
        });
    }


});


/* return: float rayDis;
 *
 * pos: float[2]
 * dir: float[2]
 * numIterations: int
 */
raymarch = function(pos, dir, numIterations) {

	var rayDis = 0.0;
	var rayPos = v2.clone(pos);
	var rayDeltaPos = v2.create(0.0, 0.0);

	for(i = 0; i < numIterations; ++i) {
		var dis = map(rayPos);
		rayDis += 0.5*dis

		v2.multiply(rayDis, dir, rayDeltaPos);
		v2.add(pos, rayDeltaPos, rayPos)
	}

	return rayDis;
}

/* return float distance (in range -0.5 to 0.5) 
 *
 * pos: float[2]
 */
map = function(pos) {
	var floatDensity = ECS.Systems.TerrainPhysicsSystem.chunkManager.calcDensity(pos[0]/32.0-0.5, pos[1]/32.0-0.5)/255.0;

	var distance = 0.5-floatDensity;
	return distance;
}
