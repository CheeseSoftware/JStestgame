
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
					
			// Now do some linear interpolation!
			var dif = v2.create(physics.gx - physics.x, physics.gy - physics.y);
			// Only interpolate if there is a major difference
			var duration = v2.length(dif) > 2 ? 10 * dt : 0;
			var ic = Math.min(duration > 0 ? (new Date()-physics.lastUpdate)/duration : 1.0, 1.0);
			physics.x = ic*physics.gx + (1.0-ic)*physics.x;
			physics.y = ic*physics.gy + (1.0-ic)*physics.y;
			physics.vx = ic*physics.gvx + (1.0-ic)*physics.vx;
			physics.vy = ic*physics.gvy + (1.0-ic)*physics.vy;

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