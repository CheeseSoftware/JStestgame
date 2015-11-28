
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
        get: function () { return this.body.data.x; },
		set: function (value) { this.body.data.x = value; }
    },
	y: {
        get: function () { return this.body.data.y; },
		set: function (value) { this.body.data.y = value; }
    },
    vx: {
        get: function () { return this.body.data.vx; },
		set: function (value) { this.body.data.vx = value; }
    },
	vy: {
        get: function () { return this.body.data.vy },
		set: function (value) { this.body.data.vy = value;}
    },
	ix: {
        get: function () { return this.body.idata.x; },
		set: function (value) { this.body.idata.x = value; }
    },
	iy: {
        get: function () { return this.body.idata.y; },
		set: function (value) { this.body.idata.y = value; }
    },
    ivx: {
        get: function () { return this.body.idata.vx },
		set: function (value) { this.body.idata.vx = value; }
    },
	ivy: {
        get: function () { return this.body.idata.vx },
		set: function (value) { this.body.idata.vx = value;}
    },
	isChanged: {
        get: function () { return this.body.isChanged },
		set: function (value) { this.body.isChanged = value;}
    }
});


