
ECS.Systems.ControlSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player', 'controlledplayer');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var controlledplayer = entity.getComponent('controlledplayer');
			
			//var distanceTravelled = Math.sqrt(Math.pow(controlledplayer.oldx - physics.x, 2) + Math.pow(controlledplayer.oldy - physics.y, 2));
			
			controlledplayer.oldx = physics.x;
			controlledplayer.oldy = physics.y;
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
				
				var magnitude = vx*vx + vy*vy;
			  
				vx = moveSpeed * vx;///magnitude;
				vy = moveSpeed * vy;///magnitude;
				
				physics.vx += vx;
				physics.vy += vy;
			}
			
			if(keyboard.keys.space.isDown && !drawable.bodyparts.body.animating) {// && (new Date() - player.lastDig > 400)) {
				//Dig
				player.lastDig = new Date();
				var digRadius = 5;
				var x = physics.x + 32.0*Math.sin(physics.rotation);
				var y = physics.y - 32.0*Math.cos(physics.rotation);
				game.connection.send("playerdig", { x: x, y: y, digRadius: digRadius });
				drawable.animate("body", "dig", 240, true);
				
			};
			
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