
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
			
			//physics.vx = 0;
			//physics.vy = 0;
			
			var moveSpeed = 1;
			physics.vx = 0;
			physics.vy = 0;
			if (keyboard.isKeyDown("left"))
			{
				physics.vx += -moveSpeed;
			}
			else if (keyboard.isKeyDown("right"))
			{
				physics.vx += moveSpeed;
			}
			if (keyboard.isKeyDown("up"))
			{
				physics.vy += -moveSpeed;
			}
			else if (keyboard.isKeyDown("down"))
			{
				physics.vy += moveSpeed;
			}
		
			var angle = Math.atan2(physics.y - (game.camera.pos.y + mousey), physics.x - (game.camera.pos.x + mousex));
			//console.log("xpos " + physics.x + " ypos " + physics.y + " camx " + GP.camera.frustrum.x + " camy " + GP.camera.frustrum.y);
			//console.log(GP.camera);
			physics.rotation = angle + 1.5 * Math.PI;
			player.sprite.rotation = physics.rotation;
			
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