
ECS.Systems.TerrainPhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
		
		entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
			var ghost = entity.getComponent('ghostphysics');
            var player = entity.getComponent('player');
			var isControlled = entity.getComponent('controlled');
			
			// Simulate terrain for PLAYERS
			var density = game.chunkManager.calcDensity(physics.x/32.0-0.5, physics.y/32.0-0.5);
			var normal = game.chunkManager.calcNormal(physics.x/32.0-0.5, physics.y/32.0-0.5);
			
			if (density >= 1.0) {
				physics.x += 0.05*normal[0]*(density-1);
				physics.y += 0.05*normal[1]*(density-1);
			}
			
			if(!isControlled) {
				// Simulate terrain for GHOSTS
				var density = game.chunkManager.calcDensity(ghost.x/32.0-0.5, ghost.y/32.0-0.5);
				var normal = game.chunkManager.calcNormal(ghost.x/32.0-0.5, ghost.y/32.0-0.5);
				
				if (density >= 1.0) {
					ghost.x += 0.05*normal[0]*(density-1);
					ghost.y += 0.05*normal[1]*(density-1);
				}
			}
        });
    }
});

/*checkCollision = function(x1, y1, r1, x2, y2, r2) {
	if(Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2)) < r1 + r2)
		return true;
	return false;
}*/