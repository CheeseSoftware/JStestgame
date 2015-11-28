
PhysicsBody = function() {
	this.shape = "circle";
	this.radius = constants.playerWidth / 2;

	this.data = {
		type: "normal",
		x: 0,
		y: 0,
		vx: 0,
		vy: 0
	}
	
	this.idata = {
		type: "interpolated",
		x: 0,
		y: 0,
		vx: 0,
		vy: 0
	}

	this.friction = constants.friction;
	this.maxSpeed = constants.maxSpeed;
	
	this.interpolationDate = new Date();
	this.isChanged = false;
}

PhysicsBody.prototype.addImpulse = function(impulse) {
	this.data.vx += impulse[0];
	this.data.vy += impulse[1];
	this.idata.vx += impulse[0];
	this.idata.vy += impulse[1];
}