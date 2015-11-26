
ECS.Components.Physics = CES.Component.extend({
    name: 'physics',
	init: function (body) {
		this.body = body;

		this.oldX = 0;
		this.oldY = 0;
		
		this.rotation = 0;
		
		this.playState = {};

		this.acceleration = constants.acceleration;
		this.rotateSpeed = constants.rotateSpeed;
    }
});

ECS.Components.Physics.prototype.rotateTo = function(physics, newRotation, speed, dt) {
	if(physics.rotation == newRotation)
		return;

	var newDirx = Math.cos(newRotation); 
	var newDiry = Math.sin(newRotation);
	var oldDirx = Math.cos(physics.rotation);
	var oldDiry = Math.sin(physics.rotation);
	oldDirx += (newDirx - oldDirx) * speed * dt;
	oldDiry += (newDiry - oldDiry) * speed * dt;
	physics.rotation = Math.atan2(oldDiry, oldDirx);
}
 
Object.defineProperties(ECS.Components.Physics.prototype, {
	x: {
        get: function () { return this.body.x; },
		set: function (value) { this.body.x = value; }
    },
	y: {
        get: function () { return this.body.y; },
		set: function (value) { this.body.y = value; }
    },
    vx: {
        get: function () { return this.body.vx; },
		set: function (value) { this.body.vx = value; }
    },
	vy: {
        get: function () { return this.body.vy },
		set: function (value) { this.body.vy = value;}
    },
	gx: {
        get: function () { return this.body.gx; },
		set: function (value) { this.body.gx = value; }
    },
	gy: {
        get: function () { return this.body.gy; },
		set: function (value) { this.body.gy = value; }
    },
    gvx: {
        get: function () { return this.body.gvx; },
		set: function (value) { this.body.gvx = value; }
    },
	gvy: {
        get: function () { return this.body.gvy },
		set: function (value) { this.body.gvy = value;}
    }
});


