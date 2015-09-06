
ECS.Systems.ControlSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player', 'controlledplayer');
 
        entities.forEach(function (entity) {
			physics = entity.getComponent('physics');
            player = entity.getComponent('player');
			controlledplayer = entity.getComponent('controlledplayer');
			
			controlledplayer.oldx = player.sprite.x;
			controlledplayer.oldy = player.sprite.y;
			controlledplayer.oldvx = physics.vx;
			controlledplayer.oldvy = physics.vy;
			controlledplayer.oldRot = Math.round(physics.rotation * 100) / 100;
			
			//var dx = physics.x - (game.camera.pos.x + mousex);
			//var dy = physics.y - (game.camera.pos.y + mousey);		
			//var mouseAngle = Math.atan2(dy, dx);
			
			var moveSpeed = 3;
			
			var desiredAngle = physics.desiredAngle || 0;
			if(keyboard.isKeyDown("left") && keyboard.isKeyDown("up"))
				desiredAngle = -0.75*Math.PI;
			else if(keyboard.isKeyDown("left") && keyboard.isKeyDown("down"))
				desiredAngle = -1.25*Math.PI;
			else if(keyboard.isKeyDown("right") && keyboard.isKeyDown("up"))
				desiredAngle = -0.25*Math.PI;
			else if(keyboard.isKeyDown("right") && keyboard.isKeyDown("down"))
				desiredAngle = 0.25*Math.PI;
				
			else if(keyboard.isKeyDown("left"))
				desiredAngle = Math.PI;
			else if(keyboard.isKeyDown("right"))
				desiredAngle = 0;
			else if(keyboard.isKeyDown("up"))
				desiredAngle = -0.5*Math.PI;
			else if(keyboard.isKeyDown("down"))
				desiredAngle = 0.5*Math.PI;
		
			if(keyboard.isKeyDown("left") ||
				keyboard.isKeyDown("right") ||
				keyboard.isKeyDown("up") ||
				keyboard.isKeyDown("down")) {
					
				physics.rotateTo(physics, desiredAngle + Math.PI / 2, 0.05);
				physics.desiredAngle = desiredAngle;
					
				var vx = Math.cos(desiredAngle);
				var vy = Math.sin(desiredAngle);
				
			 	//var magnitude = Math.sqrt(vx*vx + vy*vy);
				// Eftersom komposanterna tillsammans utgör hastigheten i detta fallet kan raden ovan inte användas.
				// Därför divideras vx och vy med magnitude för att får en proportionell variabel som gör att hastigheten blir konstant i alla riktningar.
				var magnitude = vx*vx + vy*vy;
			  
				vx = moveSpeed * vx;///magnitude;
				vy = moveSpeed * vy;///magnitude;
				
				physics.vx += vx;
				physics.vy += vy;
			}
			
			// Check if anything changed, if so, send player update packet
			if(controlledplayer.oldx != physics.x 
			|| controlledplayer.oldy != physics.y
			|| controlledplayer.oldvx != physics.vx
			|| controlledplayer.oldvy != physics.vy
			|| controlledplayer.oldRot != Math.round(physics.rotation * 100) / 100) {
				game.sendUpdatePacket();
			}	
			
			game.camera.target.x = physics.x;
			game.camera.target.y = physics.y;	
			
        });
    }
});