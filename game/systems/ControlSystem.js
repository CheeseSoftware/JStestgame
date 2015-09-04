
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
		
			// Noob code for keys begin
			if (keyboard.isKeyDown("up"))
			{
				if (keyboard.isKeyDown("left"))
				{
					moveAngle -= Math.PI * 0.25;
				}
				else if (keyboard.isKeyDown("right"))
				{
					moveAngle += Math.PI * 0.25;
				}
			}
			else if (keyboard.isKeyDown("down"))
			{
				moveAngle += Math.PI;
				if (keyboard.isKeyDown("left"))
				{
					moveAngle += Math.PI * 0.25;
				}
				else if (keyboard.isKeyDown("right"))
				{
					moveAngle -= Math.PI * 0.25;
				}	
			} 
			else if (keyboard.isKeyDown("left")) 
			{
				moveAngle += Math.PI * 1.5;
				if (keyboard.isKeyDown("up"))
				{
					moveAngle += Math.PI * 0.25;
				}
				else if (keyboard.isKeyDown("down"))
				{
					moveAngle -= Math.PI * 0.25;
				}
			}
			else if (keyboard.isKeyDown("right"))
			{
				moveAngle += Math.PI * 0.5;
				if (keyboard.isKeyDown("up"))
				{
					moveAngle -= Math.PI * 0.25;
				}
				else if (keyboard.isKeyDown("down"))
				{
					moveAngle += Math.PI * 0.25;
				}	
			}
			if(keyboard.isKeyDown("left") ||
				keyboard.isKeyDown("right") ||
				keyboard.isKeyDown("up") ||
				keyboard.isKeyDown("down")) {
					
				var vec = new b2Vec2(Math.cos(moveAngle), Math.sin(moveAngle));
				//console.log(moveAngle);
				//console.log(vector.Length());
				//var normalizedX = Math.cos(moveAngle) / vector.Length();
				//var normalizedY = Math.sin(moveAngle) / vector.Length();
				
				if(vec.Length() != 0 && vec != NaN && vec != undefined) {
					//console.log(vec);
					if(true) {
						var normalizedVector = new b2Vec2(vec.x / vec.Length(), vec.y / vec.Length()); 
						
						var length = vec.Length();
		
						var invLength = 1.0 / length;
						vec.x *= invLength;
						vec.y *= invLength;
						   
						//new b2Vec2(normalizedX, normalizedY);
						//console.log(normalizedVector);
							
						if(normalizedVector != NaN && normalizedVector != undefined) {
							physics.vx += moveSpeed * vec.x;
							physics.vy += moveSpeed * vec.y;
						}
					}
				}
				
				//console.log("t1 " + t1 + " t2 " + t2);
					
				//physics.vx += moveSpeed * Math.sin(moveAngle)/Math.abs(Math.sin(moveAngle)) * Math.sqrt(1 - Math.pow(Math.sin(moveAngle), 2));
				//physics.vy += moveSpeed * Math.sin(moveAngle)/Math.abs(Math.sin(moveAngle)) * Math.sqrt(1 - Math.pow(Math.cos(moveAngle), 2));
				
				//console.log("total speed " + ((-moveSpeed * Math.cos(moveAngle))+(-moveSpeed * Math.sin(moveAngle))));
				//console.log("movespeed " + Math.sqrt(Math.pow(moveSpeed * Math.cos(moveAngle), 2) + Math.pow(moveSpeed * Math.sin(moveAngle), 2)));
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