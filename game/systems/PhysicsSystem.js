
ECS.Systems.PhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var isControlled = entity.hasComponent('controlled');
			var health = entity.getComponent('health');
			var state = physics.playState;

			// Position text and textures at this position. Animate feet
			if(drawable != undefined) {
				drawable.positionAll(physics.ix, physics.iy, physics.rotation);
				
				var konstant = 100;
				var disWalked = konstant * Math.sqrt(Math.pow(physics.ix - physics.oldX, 2) + Math.pow(physics.iy - physics.oldY, 2));
				if(disWalked > 0)
					drawable.animate("feet", "feet", disWalked, false);
					
				if(drawable.text) {
					drawable.text.x = physics.ix - drawable.text.width / 2;
					drawable.text.y = physics.iy - 80;
				}

				if (health) {
					health.sprite.x = physics.ix;
					health.sprite.y = physics.iy - 50;
					health.sprite.width = 96.0*(health.value / health.max);
				}
			}

			physics.oldX = physics.ix;
			physics.oldY = physics.iy;
			
        });
    }
});