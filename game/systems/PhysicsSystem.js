
ECS.Systems.PhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var isControlled = entity.hasComponent('controlled');
			var state = physics.playState;

			if(physics.dx != 0 || physics.dy != 0) {
				var desiredAngle = Math.atan2(physics.dy, physics.dx);
				physics.rotateTo(physics, desiredAngle, physics.rotateSpeed);

				var normal = v2.create(physics.dx, physics.dy);
				v2.normalize(normal, normal);
				v2.multiply(physics.moveSpeed, normal, normal);
				
				//console.log("Speed: " + v2.length(normal));
				
				physics.gvx += normal[0];
				physics.gvy += normal[1];
				//console.log("Speed: " + v2.length(normal));
				//physics.body.ApplyImpulse(new b2Vec2(normal[0], normal[1]), physics.body.GetWorldCenter());
			}
					
			// Now do some linear interpolation!		
			var duration = 50;
			var ic = Math.min((new Date()-physics.lastUpdate)/duration, 1.0);
			physics.x = ic*physics.gx + (1.0-ic)*physics.x;
			physics.y = ic*physics.gy + (1.0-ic)*physics.y;
			physics.vx = ic*physics.gvx + (1.0-ic)*physics.vx;
			physics.vy = ic*physics.gvy + (1.0-ic)*physics.vy;
			
			// Apply speed limit, decrease speed, etc.
			physics.doUpdate(physics);
			
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
			}

			physics.oldX = physics.x;
			physics.oldY = physics.y;
			
        });
    }
});