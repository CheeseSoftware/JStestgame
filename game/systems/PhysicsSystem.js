
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
			
			var diffbefore = (physics.gx - physics.x);

			if(physics.dx != 0 || physics.dy != 0) {
				var desiredAngle = Math.atan2(physics.dy, physics.dx);
				physics.rotateTo(physics, desiredAngle, physics.rotateSpeed, dt);

				var normal = v2.create(physics.dx, physics.dy);
				v2.normalize(normal, normal);
				v2.multiply(physics.acceleration, normal, normal);
				
				var toApply = new b2Vec2(normal[0], normal[1]);
				toApply.Multiply(dt);
				physics.body.ApplyImpulse(toApply, physics.body.GetWorldCenter());			
			}
			
			if(physics.updatePosition == true) {
				//physics.gx = physics.ax;
				//physics.gy = physics.ay;
				physics.updatePosition = false;
			}
			
			if(physics.updateVelocity == true) {
				console.log("set velocity");
				//physics.gvx = physics.avx;
				//hysics.gvy = physics.avy;
				physics.updateVelocity = false;
			}
			
			if(physics.updateDdirection == true) {
				console.log("set direction");
				physics.dx = physics.adx;
				physics.dy = physics.ady;
				physics.updateDdirection = false;
			}
			
					
			// Now do some linear interpolation!
			var dif = v2.create(physics.gx - physics.x, physics.gy - physics.y);
			// Only interpolate if there is a major difference
			if(entity.uuid >= 1 && entity.uuid <= 10)
				console.log(v2.length(dif));
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