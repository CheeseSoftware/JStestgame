
ECS.Components.Physics = CES.Component.extend({
    name: 'physics',
	init: function (body) {
		this.body = body;

		// oldX and oldY used for feet animation
		this.oldX = 0;
		this.oldY = 0;
		
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.rotation = 0;
		
		// lastUpdate used for interpolation
		this.lastUpdate = new Date();
		
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
	gx: {
        get: function () { return this.body.GetPosition().x; },
		set: function (value) {
			var pos = this.body.GetPosition();
			pos.x = value;
			this.body.SetPosition(new b2Vec2(pos.x,pos.y));
		}
    },
	gy: {
        get: function () { return this.body.GetPosition().y; },
		set: function (value) {
			var pos = this.body.GetPosition();
			pos.y = value;
			this.body.SetPosition(new b2Vec2(pos.x,pos.y));
		}
    },
    gvx: {
        get: function () { return this.body.GetLinearVelocity().x; },
		set: function (value) { 
			var vel = this.body.GetLinearVelocity();
			vel.x = value;
			this.body.SetLinearVelocity(vel);
		}
    },
	gvy: {
        get: function () { return this.body.GetLinearVelocity().y; },
		set: function (value) { 
			var vel = this.body.GetLinearVelocity();
			vel.y = value;
			this.body.SetLinearVelocity(vel);
		}
    },
	rotation: {
        get: function () { return this.body.m_rotation; },
		set: function (value) { this.body.m_rotation = value; this.body.m_rotation = value; }
    },
	angularVelocity: {
        get: function () { return this.body.m_angularVelocity; },
		set: function (value) { this.body.m_angularVelocity = value; this.body.m_angularVelocity = value; }
	}
});


