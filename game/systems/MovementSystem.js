ECS.Systems.MovementSystem = CES.System.extend({
    update: function (dt) {
    	var entities = this.world.getEntities('control', 'physics');

		entities.forEach(function (entity) {
			var control = entity.getComponent('control');
			var physics = entity.getComponent('physics');

    		if(control.moveDir[0] != 0 || control.moveDir[1] != 0) {
				var desiredAngle = Math.atan2(control.moveDir[1], control.moveDir[0]);
				physics.rotateTo(physics, desiredAngle, physics.rotateSpeed, dt);

				var normal = v2.clone(control.moveDir);
				v2.normalize(normal, normal);
				v2.multiply(physics.acceleration, normal, normal);
				
				var toApply = new b2Vec2(normal[0], normal[1]);
				toApply.Multiply(dt);
				if(entity.uuid >= 1 && entity.uuid <= 10)
					console.log("Applied pulse. x:" + toApply.x + " y:" + toApply.y);
				physics.body.ApplyImpulse(toApply, physics.body.GetWorldCenter());
			}

			if (isServer) {
				if (control.isUsingTool & Date.now() - control.lastToolUse >= 250.0) {
					control.lastToolUse = Date.now();

					var digRadius = 1.5;
					var x = physics.gx + 32.0*Math.cos(physics.rotation);
					var y = physics.gy + 32.0*Math.sin(physics.rotation);
					server.chunkManager.fillCircle(parseFloat(x)/32.0, parseFloat(y)/32.0, digRadius);
					
					var data = {
						uuid: entity.uuid,
						x: x,
						y: y,
						digRadius: digRadius
					}
					
					server.io.sockets.emit('dig', data);
					var distance = 0.05*32.0;
					var radius = 0.3*32.0;
					var damage = 4.0;
					server.battleManager.hit(entity, distance, radius, damage);
				}
			}
		});
	}
});