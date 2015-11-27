
ECS.Systems.ControlSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('control', 'physics', 'player', 'drawable', 'controlled');
 
        entities.forEach(function (entity) {
        	var control = entity.getComponent('control')
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var isControlled = entity.getComponent('controlled');

			if(keyboard.keys.space.isDown != control.isUsingTool) {
				control.isUsingTool = keyboard.keys.space.isDown;
				control.isChanged = true;
			}
			
			if(keyboard.isDifferent(player.oldKeyboardState)) {
				var direction = keyboard.calculateDirection();
				physics.dx = direction.x;
				physics.dy = direction.y;
				control.moveDir = [direction.x, direction.y];
				control.isChanged = true;
				physics.playState = keyboard.getPlayState();
			}		
			player.oldKeyboardState = keyboard.getState();

			if (control.isChanged) {
				control.isChanged = false;
				game.sendUpdatePacket();
			}
			
        });
    }
});