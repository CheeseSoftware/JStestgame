
ECS.Systems.PhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
 
        entities.forEach(function (entity) {
			physics = entity.getComponent('physics');
            player = entity.getComponent('player');
			//console.log(dt);
			var speed = 0.001;
			physics.x += physics.vx * dt * speed;
			physics.y += physics.vy * dt * speed;
			
			if(player != undefined) {
				player.text.x = physics.x - player.text.width/2;
				player.text.y = physics.y - player.sprite.height - 30;
				
				player.sprite.position.x = physics.x;
				player.sprite.position.y = physics.y;
				player.sprite.rotation = physics.rotation;
				
			}
			
        });
    }
});