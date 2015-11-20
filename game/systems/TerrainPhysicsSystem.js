include("game/core/v2.js");


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
			
			// Simulate terrain physics for PLAYERS
			var density = ECS.Systems.TerrainPhysicsSystem.chunkManager.calcDensity(physics.x/32.0-0.5, physics.y/32.0-0.5);
			var normal = ECS.Systems.TerrainPhysicsSystem.chunkManager.calcNormal(physics.x/32.0-0.5, physics.y/32.0-0.5);

			var pos = v2.create(physics.x, physics.y);
			var normal2 = v2.create(normal.x, normal.y);
			var distance = 4.0;


			for (angle = 0; angle < 360; angle+=18) {
				var dir = v2.create(Math.cos(angle*3.14/180), Math.sin(angle*3.14/180));
				var rayDis = Math.max(raymarch(pos, dir, 8), -1.0);
				
				if (rayDis >= distance)
					continue;

				distance = rayDis;

				var pushStrengthTemp = Math.max(1.0 - rayDis, 0.0);
				v2.multiply(pushStrengthTemp, dir, normal2);
			}

			if (v2.length(normal2) <= 0.0)
				return;

			if (distance <= -1.0)
				return;

			v2.normalize(normal2, normal2);
			normal.x = normal2[0];
			normal.y = normal2[1];

			var pushStrength = Math.max(1.0 - distance, -1.0);

			if (pushStrength <= 0.0)
				return;

			physics.x += -normal.x*pushStrength*pushStrength*32.0/4.0;
			physics.y += -normal.y*pushStrength*pushStrength*32.0/4.0;




			// Simulate terrain physics for PLAYERS
			var density = ECS.Systems.TerrainPhysicsSystem.chunkManager.calcDensity(physics.gx/32.0-0.5, physics.gy/32.0-0.5);
			var normal = ECS.Systems.TerrainPhysicsSystem.chunkManager.calcNormal(physics.gx/32.0-0.5, physics.gy/32.0-0.5);
			

			var pos = v2.create(physics.gx, physics.gy);
			var normal2 = v2.create(normal.x, normal.y);
			var distance = 4.0;


			for (angle = 0; angle < 360; angle+=18) {
				var dir = v2.create(Math.cos(angle*3.14/180), Math.sin(angle*3.14/180));
				var rayDis = Math.max(raymarch(pos, dir, 8), -1.0);
				
				if (rayDis >= distance)
					continue;

				distance = rayDis;

				var pushStrengthTemp = Math.max(1.0 - rayDis, 0.0);
				v2.multiply(pushStrengthTemp, dir, normal2);
			}

			if (v2.length(normal2) <= 0.0)
				return;

			if (distance <= -1.0)
				return;

			v2.normalize(normal2, normal2);
			normal.x = normal2[0];
			normal.y = normal2[1];

			var pushStrength = Math.max(1.0 - distance, -1.0);

			if (pushStrength <= 0.0)
				return;

			physics.gx += -normal.x*pushStrength*pushStrength*32.0/4.0;
			physics.gy += -normal.y*pushStrength*pushStrength*32.0/4.0;
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
