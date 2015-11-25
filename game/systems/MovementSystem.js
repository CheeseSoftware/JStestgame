ECS.Systems.MovementSystem = CES.System.extend({
    update: function (dt) {
    	var entities = this.world.getEntities('control', 'physics');

		entities.forEach(function (entity) {
			var control = entity.getComponent('control');
			var physics = entity.getComponent('physics');

    		if(physics.dx != 0 || physics.dy != 0) {
				var desiredAngle = Math.atan2(control.moveDir[1], control.moveDir[0]);
				physics.rotateTo(physics, desiredAngle, physics.rotateSpeed, dt);

				var normal = v2.clone(control.moveDir);
				v2.normalize(normal, normal);
				v2.multiply(physics.acceleration, normal, normal);
				
				var toApply = new b2Vec2(normal[0], normal[1]);
				physics.body.ApplyImpulse(toApply, physics.body.GetWorldCenter());
			}
		});
    }
});