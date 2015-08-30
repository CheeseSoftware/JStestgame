
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
			
			physics.vx = 0;
			physics.vy = 0;
		
			if (GP.keys.left.isDown)
			{
				physics.vx = -150;
			}
			else if (GP.keys.right.isDown)
			{
				physics.vx = 150;
			}
			if (GP.keys.up.isDown)
			{
				physics.vy = -150;
			}
			else if (GP.keys.down.isDown)
			{
				physics.vy = 150;
			}
		
			var angle = Math.atan2(physics.y - mousey, physics.x - mousex);
			physics.rotation = angle + Math.PI;
			player.sprite.rotation = physics.rotation;
			
			// Check if anything changed, if so, send player update packet
			if(controlledplayer.oldx != physics.x 
			|| controlledplayer.oldy != physics.y
			|| controlledplayer.oldvx != physics.vx
			|| controlledplayer.oldvy != physics.vy
			|| controlledplayer.oldRot != Math.round(physics.rotation * 100) / 100) {
				GP.sendUpdatePacket();
			}		
			
        });
    }
});