
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
	for(var body in this.bodies) {
		// TODO: Check collision
		
		body.gx += body.gvx * dt;
		body.gy += body.gvy * dt;
		body.x += body.vx * dt;
		body.y += body.vy * dt;
		
		// Interpolation
		if(!isServer) {
			var duration = 100 * dt;
			var ic = Math.min((new Date()-physics.lastUpdate)/duration, 1.0);

			body.x = ic*body.gx + (1.0-ic)*body.x;
			body.y = ic*body.gy + (1.0-ic)*body.y;
			body.vx = ic*body.gvx + (1.0-ic)*body.vx;
			body.vy = ic*body.gvy + (1.0-ic)*body.vy;
		}
		else {
			body.x = body.gx;
			body.y = body.gy;
			body.vx = body.gvx;
			body.vy = body.gvy;
		}
	}
}
