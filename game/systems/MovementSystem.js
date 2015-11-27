ECS.Systems.MovementSystem = CES.System.extend({
    update: function (dt) {
    	var entities = this.world.getEntities('control', 'physics');

		entities.forEach(function (entity) {
			var control = entity.getComponent('control');
			var physics = entity.getComponent('physics');
			var isControlled = entity.hasComponent('controlled');

    		if(control.moveDir[0] != 0 || control.moveDir[1] != 0) {
				var desiredAngle = Math.atan2(control.moveDir[1], control.moveDir[0]);
				physics.rotateTo(physics, desiredAngle, physics.rotateSpeed, dt);

				var normal = v2.clone(control.moveDir);
				v2.normalize(normal, normal);
				
				
				var toApply = v2.clone(normal);
				v2.multiply(physics.acceleration, toApply, toApply);
				v2.multiply(dt/1000.0, toApply, toApply);
				physics.body.addImpulse(toApply);
			}

			if (isServer) {
				if (control.isUsingTool & Date.now() - control.lastToolUse >= 250.0) {
					control.lastToolUse = Date.now();

					var digRadius = 1.5;
					var x = physics.x + 32.0*Math.cos(physics.rotation);
					var y = physics.y + 32.0*Math.sin(physics.rotation);
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
			
			/*if(entity.uuid != 1) {
				console.log("-----physics-----");
				console.log("x " + physics.x);
				console.log("y " + physics.y);
				console.log("vx " + physics.vx);
				console.log("vy " + physics.vy);
				console.log("ix " + physics.ix);
				console.log("iy " + physics.iy);
				console.log("ivx " + physics.ivx);
				console.log("ivy " + physics.ivy);
				console.log("-----end-----");
			}*/
			
		});
	}
});