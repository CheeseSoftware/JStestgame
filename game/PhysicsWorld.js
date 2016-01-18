
PhysicsWorld = function() {
	this.bodies = [];
	this.grid = {};
	this.nextBodyId = 0;
}

PhysicsWorld.prototype.addBody = function(body) {
	body.id = this.nextBodyId;
	this.nextBodyId++;
	this.bodies.push(body);
}

PhysicsWorld.prototype.removeBody = function(body) {
	this.bodies.remove(body);
}

PhysicsWorld.prototype.update = function(dt) {
	for(var i = 0; i < this.bodies.length; ++i) {
		var body = this.bodies[i];
		this.updategrid(body);
	}

	for(var i = 0; i < this.bodies.length; ++i) {
		var body = this.bodies[i];
		this.simulateBody(body, dt);
	}
}

PhysicsWorld.prototype.simulateBody = function(body, dt) {
	this.simulateData(body.data, body, dt);
	
	if(isServer) {
		body.idata.x = body.data.x;
		body.idata.y = body.data.y;
		body.idata.vx = body.data.vx;
		body.idata.vy = body.data.vy;
	}
	else
		this.simulateData(body.idata, body, dt);
}

PhysicsWorld.prototype.simulateData = function(data, body, dt) {
	data.oldX = data.x;
	data.oldY = data.y;
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

	var gridX = Math.floor(body.data.x/32.0/8.0);
	var gridY = Math.floor(body.data.y/32.0/8.0);
	var gridNodes = [];
	gridNodes.push((gridX).toString() + ":" + (gridY).toString());
	gridNodes.push((gridX+1).toString() + ":" + (gridY).toString());
	gridNodes.push((gridX).toString() + ":" + (gridY+1).toString());
	gridNodes.push((gridX+1).toString() + ":" + (gridY+1).toString());
	
	// Collision
	for (var index = 0; index < gridNodes.length; ++index) {
		var gridNode = this.grid[gridNodes[index]];
		if (gridNode == undefined)
			continue;

		//console.log(Object.keys(gridNode.bodies).length);

		for(var body2Key in Object.keys(gridNode.bodies)) {
			var body2 = gridNode.bodies[body2Key];
			if (body2 == undefined)
				continue;

			if (body2.id == body.id)
				continue;

			//console.log("Body found!" + body2);
			
			var data2 = (data.type == "normal" ? body2.data : body2.idata);
			var bodypos = [data.x, data.y];
			var body2pos = [data2.x, data2.y];
			var delta = [0.0, 0.0];
			v2.subtract(bodypos, body2pos, delta);
			var distanceSquared = v2.lengthSquared(delta);

			if (distanceSquared > 0.0 && distanceSquared <= (body.radius+body2.radius)*(body.radius+body2.radius)) {

				var distance = Math.sqrt(distanceSquared);
				var wantedDistance = body.radius+body2.radius;

				var impulse = v2.clone(delta);
				v2.normalize(impulse, impulse);
				v2.multiply(wantedDistance - distance, impulse, impulse);
				v2.multiply(0.5, impulse, impulse);

				// Apply impulse to first body
				body.addImpulse(impulse);
				body.isChanged = true;

				// Apply negative impulse to second body. 
				v2.multiply(-1.0, impulse, impulse);
				body2.addImpulse(impulse);
				body2.isChanged = true;
			}
		}
	}
}

PhysicsWorld.prototype.updategrid = function(body) {
	var gridX = Math.round(body.data.x/32.0/8.0);
	var gridY = Math.round(body.data.y/32.0/8.0);

	var gridKey = gridX.toString() + ":" + gridY.toString();

	if (gridKey != body.gridKey) {
		if (body.gridKey != undefined && this.grid[body.gridKey] != undefined && this.grid[body.gridKey].bodies[body.id] != undefined) {
			delete this.grid[body.gridKey].bodies[body.id];
			if (this.grid[body.gridKey].bodies.length == 0)
				delete gridKey[body.gridKey];
		}

		body.gridKey = gridKey;
		if (this.grid[gridKey] == undefined)
			this.grid[gridKey] = { bodies: {}};

		this.grid[gridKey].bodies[body.id] = body;
	}
}