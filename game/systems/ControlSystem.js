
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
			
			var dx = physics.x - (game.camera.pos.x + mousex);
			var dy = physics.y - (game.camera.pos.y + mousey);
		
			var angle = Math.atan2(dy, dx);
			physics.rotation = angle + 1.5 * Math.PI;
			player.sprite.rotation = physics.rotation;
			
			//console.log(physics.rotation);
			
			var moveSpeed = 3;
			var moveAngle = angle +  Math.PI;
			var numKeys = 0;
		
			if(keyboard.isKeyDown("left") ||
				keyboard.isKeyDown("right") ||
				keyboard.isKeyDown("up") ||
				keyboard.isKeyDown("down")) {
					
				var vx = Math.cos(moveAngle);
				var vy = Math.sin(moveAngle);
				
			 	//var magnitude = Math.sqrt(vx*vx + vy*vy);
				// Eftersom komposanterna tillsammans utgör hastigheten i detta fallet kan raden ovan inte användas.
				// Därför divideras vx och vy med hastigheten för att normalisera och skapar konstant hastighet i alla riktningar.
				var magnitude = Math.abs(vx) + Math.abs(vy);
			  
				vx = moveSpeed * vx/magnitude;
				vy = moveSpeed * vy/magnitude;
				
				physics.vx += vx;
				physics.vy += vy;
			}
			// Noob code for keys end
			
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