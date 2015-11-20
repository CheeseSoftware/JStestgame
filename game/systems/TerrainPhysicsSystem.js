
ECS.Systems.TerrainPhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
		
		entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var isControlled = entity.getComponent('controlled');
			
			// Simulate terrain physics for PLAYERS
			var density = game.chunkManager.calcDensity(physics.x/32.0-0.5, physics.y/32.0-0.5);
			var normal = game.chunkManager.calcNormal(physics.x/32.0-0.5, physics.y/32.0-0.5);
			
			if (density >= 1.0) {
				physics.x += 0.05*normal[0]*(density-1);
				physics.y += 0.05*normal[1]*(density-1);
			}
			
			// Simulate terrain physics for GHOSTS
			var density = game.chunkManager.calcDensity(physics.gx/32.0-0.5, physics.gy/32.0-0.5);
			var normal = game.chunkManager.calcNormal(physics.gx/32.0-0.5, physics.gy/32.0-0.5);
			
			if (density >= 1.0) {
				physics.gx += 0.05*normal[0]*(density-1);
				physics.gy += 0.05*normal[1]*(density-1);
			}
        });
    }
});