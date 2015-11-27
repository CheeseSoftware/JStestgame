
PhysicsBody = function() {
	this.shape = "circle";
	this.radius = constants.playerWidth / 2;
	
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
	
	this.ix = 0;
	this.iy = 0;
	this.ivx = 0;
	this.ivy = 0;

	this.friction = 0.999;
	this.maxSpeed = 300.0;
	
	this.interpolationDate = new Date();
}

PhysicsBody.prototype.addImpulse = function(impulse) {
	this.vx += impulse[0];
	this.vy += impulse[1];
	this.ivx += impulse[0];
	this.ivy += impulse[1];
}