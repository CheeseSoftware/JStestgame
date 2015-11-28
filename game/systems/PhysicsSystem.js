
ECS.Systems.PhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
			var drawable = entity.getComponent('drawable');
			var health = entity.getComponent('health');

			// Position text and textures at this position. Animate feet
			if(drawable != undefined) {
				drawable.positionAll(physics.ix, physics.iy, physics.rotation);
				
				var konstant = 100;
				var disWalked = konstant * Math.sqrt(Math.pow(physics.ix - physics.oldX, 2) + Math.pow(physics.iy - physics.oldY, 2));
				if(disWalked > 0)
					drawable.animate("feet", "feet", disWalked, false);

				if (health)
					health.sprite.width = 96.0*(health.value / health.max);
			}

			physics.oldX = physics.ix;
			physics.oldY = physics.iy;
			
        });
    }
});