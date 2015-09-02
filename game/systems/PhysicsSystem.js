
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
			//physics.x += physics.vx * dt * speed;
			//physics.y += physics.vy * dt * speed;
			physics.vx -= speed * dt;
			physics.vy -= speed * dt;
			
		  	var speedSpeed = 0.05;

			physics.vx = physics.vx + speedSpeed * -physics.vx;
			physics.vy = physics.vy + speedSpeed * -physics.vy;
			
			/*if(physics.x < player.sprite.width / 4 || physics.x > game.tileMap.width * game.tileSize - player.sprite.width / 4)
				physics.x = oldX;
			if(physics.y < player.sprite.width / 4 || physics.y > game.tileMap.height * game.tileSize - player.sprite.width / 4)
				physics.y = oldY;*/
				
			/*entities.forEach(function (entity2) {
				physics2 = entity2.getComponent('physics');
            	player2 = entity2.getComponent('player');
				
				if(player.username != player2.username) {
					
					var r1 = player.sprite.width / 2;
					var r2 = player2.sprite.width / 2;
					if(checkCollision(physics.x, physics.y, r1, physics2.x, physics2.y, r2)) {
						physics.x = oldX;
						physics.y = oldY;
						console.log("collision");
					}
					console.log("no collision");
				}
			});*/
			
			if(player != undefined) {
				player.text.x = physics.x - player.text.width/2;
				player.text.y = physics.y - 80;
				
				player.sprite.position.x = physics.x;
				player.sprite.position.y = physics.y;
				player.sprite.rotation = physics.rotation;
				
			}
			
        });
    }
});

/*checkCollision = function(x1, y1, r1, x2, y2, r2) {
	if(Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2)) < r1 + r2)
		return true;
	return false;
}*/