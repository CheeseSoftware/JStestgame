
ECS.Systems.ControlSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player', 'drawable', 'controlled');
 
        entities.forEach(function (entity) {
        	var control = entity.getComponent('control')
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var isControlled = entity.getComponent('controlled');
			
			if(keyboard.keys.space.isDown && (new Date() - player.lastDig > 1000 / player.digSpeed)) {
				player.lastDig = new Date();
				game.connection.send("dig", { 
					uuid: entity.uuid
				});
				game.sendUpdatePacket();

				game.battleManagger.hit(entity);
			}
			
			if(keyboard.isDifferent(player.oldKeyboardState)) {
				var direction = keyboard.calculateDirection();
				physics.dx = direction.x;
				physics.dy = direction.y;
				control.moveDir = [direction.x, direction.y];
				game.sendUpdatePacket();
				physics.playState = keyboard.getPlayState();
			}		
			player.oldKeyboardState = keyboard.getState();
			
        });
    }
});