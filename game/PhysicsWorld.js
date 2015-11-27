
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
		this.simulateBody(body, dt);
	}
}

PhysicsWorld.prototype.simulateBody = function(body, dt) {
	this.simulateData(body.data, "normal", body, dt);
	
	if(isServer) {
		body.idata.x = body.data.x;
		body.idata.y = body.data.y;
		body.idata.vx = body.data.vx;
		body.idata.vy = body.data.vy;
	}
	else
		this.simulateData(body.idata, "interpolated", body, dt);
}

PhysicsWorld.prototype.simulateData = function(data, dataType, body, dt) {
	data.x += data.vx * dt;
	data.y += data.vy * dt;
	data.vx *= Math.pow(1.0-body.friction, dt);
	data.vy *= Math.pow(1.0-body.friction, dt);

	if(Math.abs(data.vx) < 0.001)
		data.vx = 0;
	if(Math.abs(data.vy) < 0.001)
		data.vy = 0;

	if (data.vx*data.vx + data.vy*data.vy > body.maxSpeed * body.maxSpeed) {
		var speed = Math.sqrt(data.vx*data.vx + data.vy*data.vy);
		data.vx *= body.maxSpeed/speed;
		data.vy *= body.maxSpeed/speed;
	}
	
	
	// Collision
	for(var j = 0; j < this.bodies.length; ++j) {
		var body2 = this.bodies[j];
		var data2 = (dataType == "normal" ? body2.data : body2.idata);
		var bodypos = [data.x, data.y];
		var body2pos = [data2.x, data2.y];
		var delta = [0.0, 0.0];
		v2.subtract(bodypos, body2pos, delta);
		var distanceSquared = v2.lengthSquared(delta);

		if (distanceSquared > 0.0 && distanceSquared <= (body.radius+body2.radius)*(body.radius+body2.radius)) {
			var distance = Math.sqrt(distanceSquared);
			var wantedDistance = body.radius+body2.radius;

			data.x += 0.5*delta[0] * (wantedDistance/distance - 1.0);
			data.y += 0.5*delta[1] * (wantedDistance/distance - 1.0);
			data2.x -= 0.5*delta[0] * (wantedDistance/distance - 1.0);
			data2.y -= 0.5*delta[1] * (wantedDistance/distance - 1.0);

			data.vx += 4.0*0.5*delta[0] * (wantedDistance/distance - 1.0);
			data.vy += 4.0*0.5*delta[1] * (wantedDistance/distance - 1.0);
			data2.vx -= 4.0*0.5*delta[0] * (wantedDistance/distance - 1.0);
			data2.vy -= 4.0*0.5*delta[1] * (wantedDistance/distance - 1.0);
		}
	}
}
