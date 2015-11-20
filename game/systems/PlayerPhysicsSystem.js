
ECS.Systems.PlayerPhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
			var ghost = entity.getComponent('ghostphysics');
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
				if(!isControlled)
					ghost.rotateTo(ghost, desiredAngle + Math.PI / 2, 0.05);
				physics.desiredAngle = desiredAngle;
				if(!isControlled)
					ghost.desiredAngle = desiredAngle;
					
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
					ghost.vx += vx;		
					ghost.vy += vy;
					
					// Now do some linear interpolation!		
					var duration = 500;
					var interpolationConstant = Math.min((new Date()-physics.time)/duration, 1.0);
					physics.x = interpolationConstant*ghost.x + (1.0-interpolationConstant)*physics.x;
					physics.y = interpolationConstant*ghost.y + (1.0-interpolationConstant)*physics.y;
					physics.vx = interpolationConstant*ghost.vx + (1.0-interpolationConstant)*physics.vx;
					physics.vy = interpolationConstant*ghost.vy + (1.0-interpolationConstant)*physics.vy;

				}
				
			}
			
			// PLAYER BEGIN
			// Prevent random rotation
			physics.angularVelocity = 0;

			var speedDecreaseSpeed = 0.05;
			var speedLimit = 160;
			
			if(physics.vx > speedLimit)
				physics.vx = speedLimit;
			else if(physics.vx < -speedLimit)
				physics.vx = -speedLimit;
			if(physics.vy > speedLimit)
				physics.vy = speedLimit;
			else if(physics.vy < -speedLimit)
				physics.vy = -speedLimit;
			
			// Functions for soft retardation
			if(physics.vx > 0) {
				physics.vx = physics.vx - speedDecreaseSpeed * physics.vx;
			} else if(physics.vx < 0) {
				physics.vx = physics.vx + speedDecreaseSpeed * -physics.vx;
			}
				
			if(physics.vy > 0) {
				physics.vy = physics.vy - speedDecreaseSpeed * physics.vy;
			} else if(physics.vy < 0) {
				physics.vy = physics.vy + speedDecreaseSpeed * -physics.vy;
			}
			
			// If physics is close to 0, set it to 0
			if(physics.vx > -0.01 && physics.vx < 0.01)
				physics.vx = 0;
			if(physics.vy > -0.01 && physics.vy < 0.01)
				physics.vy = 0;
				
			// GHOST BEGIN
			if(!isControlled) {
				// Prevent random rotation
				physics.angularVelocity = 0;
	
				var speedDecreaseSpeed = 0.05;
				var speedLimit = 160;
				
				if(ghost.vx > speedLimit)
					ghost.vx = speedLimit;
				else if(ghost.vx < -speedLimit)
					ghost.vx = -speedLimit;
				if(ghost.vy > speedLimit)
					ghost.vy = speedLimit;
				else if(ghost.vy < -speedLimit)
					ghost.vy = -speedLimit;
				
				// Functions for soft retardation
				if(ghost.vx > 0) {
					ghost.vx = ghost.vx - speedDecreaseSpeed * ghost.vx;
				} else if(physics.vx < 0) {
					ghost.vx = ghost.vx + speedDecreaseSpeed * -ghost.vx;
				}
					
				if(ghost.vy > 0) {
					ghost.vy = ghost.vy - speedDecreaseSpeed * ghost.vy;
				} else if(ghost.vy < 0) {
					ghost.vy = ghost.vy + speedDecreaseSpeed * -ghost.vy;
				}
				
				// If physics is close to 0, set it to 0
				if(ghost.vx > -0.01 && ghost.vx < 0.01)
					ghost.vx = 0;
				if(ghost.vy > -0.01 && ghost.vy < 0.01)
					ghost.vy = 0;
			}
				
						
			if(player != undefined) {
				player.text.x = physics.x - player.text.width/2;
				player.text.y = physics.y - 80;
				
				drawable.positionAll(physics.x, physics.y, physics.rotation);
				
				/*if(!isControlled) {
					ghost.sprite.x = ghost.x;
					ghost.sprite.y = ghost.y;
				}*/
				
				var konstant = 100;
				var disWalked = konstant * Math.sqrt(Math.pow(physics.x - physics.oldX, 2) + Math.pow(physics.y - physics.oldY, 2));
				//console.log(Math.round(disWalked));
				//if(disWalked > 0)
					drawable.animate("feet", "feet", disWalked, false);
				
			}
			
			physics.oldX = physics.x;
			physics.oldY = physics.y;
			
        });
    }
});

/*checkCollision = function(x1, y1, r1, x2, y2, r2) {
	if(Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2)) < r1 + r2)
		return true;
	return false;
}*/