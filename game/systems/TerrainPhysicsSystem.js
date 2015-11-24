ECS.Systems.TerrainPhysicsSystem = CES.System.extend({
	init: function(chunkManager) {
		ECS.Systems.TerrainPhysicsSystem.chunkManager = chunkManager;
	},
    update: function (dt) {
        var entities = this.world.getEntities('physics');

		entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
			var isControlled = entity.getComponent('controlled');
			
			input = { x:physics.gx, y:physics.gy, vx:physics.gvx, vy:physics.gvy };
			values = this.simulate(dt, input);
			physics.gx = values.x;
			physics.gy = values.y;
			physics.gvx = values.vx;
			physics.gvy = values.vy;
        }.bind(this));
    }


});


ECS.Systems.TerrainPhysicsSystem.prototype.simulate = function(dt, values) {
	var pos = v2.create(values.x, values.y);
	var normal = v2.create(0.0, 0.0);
	var distance = 4.0;


	for (angle = 0; angle < 360; angle+=18) {
		var dir = v2.create(Math.cos(angle*3.14/180), Math.sin(angle*3.14/180));
		var rayDis = Math.max(this.raymarch(pos, dir, 8), -1.0);
		
		if (rayDis >= distance)
			continue;

		distance = rayDis;

		var pushStrengthTemp = Math.max(1.0 - rayDis, 0.0);
		v2.multiply(pushStrengthTemp, dir, normal);
	}

	if (v2.length(normal) <= 0.0)
		return values;

	if (distance <= -1.0)
		return values;

	v2.normalize(normal, normal);

	var pushStrength = Math.max(1.0 - distance, -1.0);

	if (pushStrength <= 0.0)
		return values;

	values.x += -normal[0]*pushStrength*pushStrength*32.0/4.0;
	values.y += -normal[1]*pushStrength*pushStrength*32.0/4.0;

	var normalForce = v2.clone(normal);
	var velocity = v2.create(values.vx, values.vy);
	var dot = Math.max(v2.dot(normal, velocity), 0.0)
	v2.multiply(-dot, normalForce, normalForce);
	values.vx += normalForce[0];
	values.vy += normalForce[1];
	var velocityDir = v2.create(values.vx, values.vy);
	if (v2.length(velocityDir) > 0.0) {
		v2.normalize(velocityDir, velocityDir);
		var frictionConstant = 0.5;
		var frictionStrength =(1.0-Math.pow(1.0-frictionConstant, dt*1000.0))*v2.length(normalForce);
		var maxForceFactor = Math.pow(0.85, dt*1000.0);
		values.vx -= v2.clampF(velocityDir[0]*frictionStrength, -maxForceFactor*values.vx, maxForceFactor*values.vx);
		values.vy -= v2.clampF(velocityDir[1]*frictionStrength, -maxForceFactor*values.vy, maxForceFactor*values.vy);
	}
	return values;
}


/* return: float rayDis;
 *
 * pos: float[2]
 * dir: float[2]
 * numIterations: int
 */
ECS.Systems.TerrainPhysicsSystem.prototype.raymarch = function(pos, dir, numIterations) {

	var rayDis = 0.0;
	var rayPos = v2.clone(pos);
	var rayDeltaPos = v2.create(0.0, 0.0);

	for(i = 0; i < numIterations; ++i) {
		var dis = this.map(rayPos);
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
ECS.Systems.TerrainPhysicsSystem.prototype.map = function(pos) {
	var floatDensity = ECS.Systems.TerrainPhysicsSystem.chunkManager.calcDensity(pos[0]/32.0-0.5, pos[1]/32.0-0.5)/255.0;

	var distance = 0.5-floatDensity;
	return distance;
}
