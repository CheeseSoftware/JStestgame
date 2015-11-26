
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
				drawable.positionAll(physics.x, physics.y, physics.rotation);
				
				var konstant = 100;
				var disWalked = konstant * Math.sqrt(Math.pow(physics.x - physics.oldX, 2) + Math.pow(physics.y - physics.oldY, 2));
				if(disWalked > 0)
					drawable.animate("feet", "feet", disWalked, false);
					
				if(drawable.text) {
					drawable.text.x = physics.x - drawable.text.width / 2;
					drawable.text.y = physics.y - 80;
				}

				if (health) {
					health.sprite.x = physics.x;
					health.sprite.y = physics.y - 50;
					health.sprite.width = 96.0*(health.value / health.max);
				}
			}

			physics.oldX = physics.x;
			physics.oldY = physics.y;
			
        });
    }
});