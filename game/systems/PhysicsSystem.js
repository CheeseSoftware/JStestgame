
ECS.Systems.PhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var state = physics.playState;
			
			var moveSpeed = 3;
			
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
				
				var vec = new b2Vec2(vx, vy);
				vec.Normalize();
			  
				vx = moveSpeed * vec.x;
				vy = moveSpeed * vec.y;
				
				physics.vx += vx;
				physics.vy += vy;
			}
			
			// Prevent random rotation
			physics.angularVelocity = 0;
			
			var oldX = physics.oldX;
			var oldY = physics.oldY;

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
							
			//console.log("x " + physics.x + " y " + physics.y + " vx " + physics.vx + " vy " + physics.vy);
		
				
			physics.oldX = physics.x;
			physics.oldY = physics.y;
				
				
			/*if (game.physicsWorld.GetContactList()) {
				var contactList = game.physicsWorld.GetContactList();			
				if ( contactList.GetShape1().GetBody().GetUserData().type == "player" ) {
					var body1 = contactList.GetShape1().GetBody();
					contactList.SetEnabled(false);
				}
			}*/
				
			/*entities.forEach(function (entity2) {
				physics2 = entity2.getComponent('physics');
            	player2 = entity2.getComponent('player');
				
				if(player.username != player2.username) {
					
					var r1 = player.sprite.width / 2;
					var r2 = player2.sprite.width / 2;
					if(checkCollision(physics.x, physics.y, r1, physics2.x, physics2.y, r2)) {
						physics.x = oldX;
						physics.y = oldY;
						console.log("collision");
					}
					console.log("no collision");
				}
			});*/
			
			if(player != undefined) {
				player.text.x = physics.x - player.text.width/2;
				player.text.y = physics.y - 80;
				
				drawable.positionAll(physics.x, physics.y, physics.rotation);
				
				var konstant = 100;
				var disWalked = konstant * Math.sqrt(Math.pow(physics.x - oldX, 2) + Math.pow(physics.y - oldY, 2));
				//console.log(Math.round(disWalked));
				//if(disWalked > 0)
					drawable.animate("feet", "feet", disWalked, false);
				
			}
			
        });
    }
});

/*checkCollision = function(x1, y1, r1, x2, y2, r2) {
	if(Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2)) < r1 + r2)
		return true;
	return false;
}*/