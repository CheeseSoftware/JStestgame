
ECS.Systems.PhysicsSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'player');
 
        entities.forEach(function (entity) {
			physics = entity.getComponent('physics');
            player = entity.getComponent('player');
			
			var oldX = physics.x;
			var oldY = physics.y;
			//console.log(dt);
			var speed = 0.001;
			physics.x += physics.vx * dt * speed;
			physics.y += physics.vy * dt * speed;
			physics.vx -= speed * dt;
			physics.vy -= speed * dt;
			
		  	var speedSpeed = 0.05;

			physics.vx = physics.vx + speedSpeed * -physics.vx;
			physics.vy = physics.vy + speedSpeed * -physics.vy;
			
			if(physics.x < player.sprite.width / 4 || physics.x > GP.tileMap.width * GP.tileSize - player.sprite.width / 4)
				physics.x = oldX;
			if(physics.y < player.sprite.width / 4 || physics.y > GP.tileMap.height * GP.tileSize - player.sprite.width / 4)
				physics.y = oldY;	
			
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