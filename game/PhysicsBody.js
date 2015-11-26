
PhysicsBody = function() {
	this.shape = "circle";
	this.radius = constants.playerWidth / 2;
	
	this.gx = 0;
	this.gy = 0;
	this.gvx = 0;
	this.gvy = 0;
	
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = 0;
	
	this.interpolationDate = new Date();
}

PhysicsBody.prototype.addImpulse = function(impulse) {
	this.gvx += impulse[0];
	this.gvy += impulse[1];
	this.vx += impulse[0];
	this.vy += impulse[1];
}