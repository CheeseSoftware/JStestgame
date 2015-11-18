
ECS.Systems.TerrainPhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
		
		entities.forEach(function (entity) {
			physics = entity.getComponent('physics');
            player = entity.getComponent('player');
			// Prevent random rotation
			physics.angularVelocity = 0;
			
			var oldX = physics.oldX;
			var oldY = physics.oldY;

					
			var density = game.chunkManager.calcDensity(physics.x/32.0-0.5, physics.y/32.0-0.5);
			var normal = game.chunkManager.calcNormal(physics.x/32.0-0.5, physics.y/32.0-0.5);
			
			if (density >= 1.0) {
				physics.x += 0.05*normal[0]*(density-1);
				physics.y += 0.05*normal[1]*(density-1);
			}
        });
    }
});

/*checkCollision = function(x1, y1, r1, x2, y2, r2) {
	if(Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2)) < r1 + r2)
		return true;
	return false;
}*/