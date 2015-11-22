
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
				physics.rotateTo(physics, desiredAngle + Math.PI / 2, 0.05);
				physics.desiredAngle = desiredAngle;
					
				var vx = Math.cos(desiredAngle);
				var vy = Math.sin(desiredAngle);
				
				var normal = new b2Vec2(vx, vy);
				normal.Normalize();
				
				var vx = normal.x * physics.moveSpeed;
				var vy = normal.y * physics.moveSpeed;
				
				physics.vx += vx;
				physics.vy += vy;
				physics.gvx += vx;
				physics.gvy += vy;	
				
				/*if(!isControlled) {
					physics.vx += vx;
					physics.vy += vy;	
					physics.gvx += vx;		
					physics.gvy += vy;
				}*/
			}
					
			// Now do some linear interpolation!		
			var duration = 50;
			var ic = Math.min((new Date()-physics.time)/duration, 1.0);
			physics.x = ic*physics.gx + (1.0-ic)*physics.x;
			physics.y = ic*physics.gy + (1.0-ic)*physics.y;
			physics.vx = ic*physics.gvx + (1.0-ic)*physics.vx;
			physics.vy = ic*physics.gvy + (1.0-ic)*physics.vy;
			
			// Apply speed limit, decrease speed, etc.
			physics.doUpdate(physics);
		
			// Position text and textures at this position. Animate feet
			if(player != undefined) {
				player.text.x = physics.x - player.text.width/2;
				player.text.y = physics.y - 80;
				
				drawable.positionAll(physics.x, physics.y, physics.rotation);
				
				var konstant = 100;
				var disWalked = konstant * Math.sqrt(Math.pow(physics.x - physics.oldX, 2) + Math.pow(physics.y - physics.oldY, 2));
				if(disWalked > 0)
					drawable.animate("feet", "feet", disWalked, false);
			}
			
			/*if(isServer) {
				console.log("x" + physics.x + " y" + physics.y);
			}*/
			
			physics.oldX = physics.x;
			physics.oldY = physics.y;
			
        });
    }
});