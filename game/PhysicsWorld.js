
PhysicsWorld = function() {
	this.bodies = [];
}

PhysicsWorld.prototype.addBody = function(body) {
	this.bodies.push(body);
}

PhysicsWorld.prototype.removeBody = function(body) {
	this.bodies.remove(body);
}

PhysicsWorld.prototype.update = function(dt) {
	for(var i = 0; i < this.bodies.length; ++i) {
		var body = this.bodies[i];
		// TODO: Check collision
		
		body.x += body.vx * dt;
		body.y += body.vy * dt;
		body.gx = body.x;
		body.gy = body.y;
		body.vx *= Math.pow(1.0-body.friction, dt);
		body.vy *= Math.pow(1.0-body.friction, dt);

		if (body.vx*body.vx + body.vy*body.vy > body.maxSpeed * body.maxSpeed) {
			var speed = Math.sqrt(body.vx*body.vx + body.vy*body.vy);
			body.vx *= body.maxSpeed/speed;
			body.vy *= body.maxSpeed/speed;
		}
		
		// Collision
		for(var j = 0; j < this.bodies.length; ++j) {
			var body2 = this.bodies[j];

			var bodypos = [body.x, body.y];
			var body2pos = [body2.x, body2.y];
			var delta = [0.0, 0.0];
			v2.subtract(bodypos, body2pos, delta);
			var distanceSquared = v2.lengthSquared(delta);

			if (distanceSquared > 0.0 && distanceSquared <= (body.radius+body2.radius)*(body.radius+body2.radius)) {
				var distance = Math.sqrt(distanceSquared);
				var wantedDistance = body.radius+body2.radius;

				body.x += 0.5*delta[0] * (wantedDistance/distance - 1.0);
				body.y += 0.5*delta[1] * (wantedDistance/distance - 1.0);
				body2.x -= 0.5*delta[0] * (wantedDistance/distance - 1.0);
				body2.y -= 0.5*delta[1] * (wantedDistance/distance - 1.0);

				body.vx += 4.0*0.5*delta[0] * (wantedDistance/distance - 1.0);
				body.vy += 4.0*0.5*delta[1] * (wantedDistance/distance - 1.0);
				body2.vx -= 4.0*0.5*delta[0] * (wantedDistance/distance - 1.0);
				body2.vy -= 4.0*0.5*delta[1] * (wantedDistance/distance - 1.0);

				body.gx = body.x;
				body.gy = body.y;
				body2.gx = body2.x;
				body2.gy = body2.y;
			}
		}
	}
}
