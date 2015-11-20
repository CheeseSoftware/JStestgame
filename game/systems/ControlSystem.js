
ECS.Systems.ControlSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player', 'drawable', 'controlled');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var player = entity.getComponent('player');
			var drawable = entity.getComponent('drawable');
			var isControlled = entity.getComponent('controlled');
			
			if(keyboard.keys.space.isDown && !drawable.bodyparts.body.animating) {// && (new Date() - player.lastDig > 400)) {
				//Dig
				player.lastDig = new Date();
				var digRadius = 1.5;
				var x = physics.x + 32.0*Math.sin(physics.rotation);
				var y = physics.y - 32.0*Math.cos(physics.rotation);
				game.connection.send("playerdig", { x: x, y: y, digRadius: digRadius, username:player.username });
				drawable.animate("body", "dig", 400, true);
				
			};
			
			if(keyboard.isDifferent(player.oldKeyboardState)) {
				var direction = keyboard.calculateDirection();
				physics.dx = direction.x;
				physics.dy = direction.y;
				game.sendUpdatePacket();
				physics.playState = keyboard.getPlayState();
			}		
			player.oldKeyboardState = keyboard.getState();
			
			game.camera.target.x = physics.x;
			game.camera.target.y = physics.y;	
			
        });
    }
});