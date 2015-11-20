
ECS.Systems.PhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var isControlled = entity.hasComponent('controlled');
			var state = physics.playState;
			
			var moveSpeed = 5.0;
			
			var desiredAngle = physics.desiredAngle || 0;
			if(state.left && state.up)
				desiredAngle = -0.75*Math.PI;
			else if(state.left && state.down)
				desiredAngle = -1.25*Math.PI;
			else if(state.right && state.up)
				desiredAngle = -0.25*Math.PI;
			else if(state.right && state.down)
				desiredAngle = 0.25*Math.PI;
				
			else if(state.left)
				desiredAngle = Math.PI;
			else if(state.right)
				desiredAngle = 0;
			else if(state.up)
				desiredAngle = -0.5*Math.PI;
			else if(state.down)
				desiredAngle = 0.5*Math.PI;
		
			if(state.left ||
				state.right ||
				state.up ||
				state.down) {
						
				physics.rotateTo(physics, desiredAngle + Math.PI / 2, 0.05);
				physics.desiredAngle = desiredAngle;
					
				var vx = Math.cos(desiredAngle);
				var vy = Math.sin(desiredAngle);
				
				var normal = new b2Vec2(vx, vy);
				normal.Normalize();
				
				var vx = normal.x * moveSpeed;
				var vy = normal.y * moveSpeed;
				
				physics.vx += vx;
				physics.vy += vy;	
				if(!isControlled) {
					physics.vx += vx;
					physics.vy += vy;	
					physics.gvx += vx;		
					physics.gvy += vy;
					
					// Now do some linear interpolation!		
					var duration = 500;
					var ic = Math.min((new Date()-physics.time)/duration, 1.0);
					physics.x = ic*physics.gx + (1.0-ic)*physics.x;
					physics.y = ic*physics.gy + (1.0-ic)*physics.y;
					physics.vx = ic*physics.gvx + (1.0-ic)*physics.vx;
					physics.vy = ic*physics.gvy + (1.0-ic)*physics.vy;

				}
				
			}
			
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
			
			physics.oldX = physics.x;
			physics.oldY = physics.y;
			
        });
    }
});