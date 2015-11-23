
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
		this.dx = 0;
		this.dy = 0;
		this.rotation = 0;
		
		// lastUpdate used for interpolation
		this.lastUpdate = new Date();
		
		this.playState = {};
		
		this.speedLimit = constants.speedLimit;
		this.friction = constants.friction;
		this.moveSpeed = constants.moveSpeed;
    }
});

ECS.Components.Physics.prototype.rotateTo = function(physics, newRotation, speed) {
	if(physics.rotation == newRotation)
		return;

	var newDirx = Math.cos(newRotation); 
	var newDiry = Math.sin(newRotation);
	var oldDirx = Math.cos(physics.rotation);
	var oldDiry = Math.sin(physics.rotation);
	oldDirx += (newDirx - oldDirx) * speed;
	oldDiry += (newDiry - oldDiry) * speed;
	physics.rotation = Math.atan2(oldDiry, oldDirx);
}

ECS.Components.Physics.prototype.doUpdate = function(physics) {
	physics.angularVelocity = 0;
	
	// Apply speed limit
	if(physics.vx > physics.speedLimit)
		physics.vx = physics.speedLimit;
	else if(physics.vx < -physics.speedLimit)
		physics.vx = -physics.speedLimit;
	if(physics.vy > physics.speedLimit)
		physics.vy = physics.speedLimit;
	else if(physics.vy < -physics.speedLimit)
		physics.vy = -physics.speedLimit;
		
	if(physics.gvx > physics.speedLimit)
		physics.gvx = physics.speedLimit;
	else if(physics.gvx < -physics.speedLimit)
		physics.gvx = -physics.speedLimit;
	if(physics.gvy > physics.speedLimit)
		physics.gvy = physics.speedLimit;
	else if(physics.gvy < -physics.speedLimit)
		physics.gvy = -physics.speedLimit;
	
	// Decrease speed
	if(physics.vx > 0) {
		physics.vx = physics.vx - physics.friction * physics.vx;
	} else if(physics.vx < 0) {
		physics.vx = physics.vx + physics.friction * -physics.vx;
	}
	if(physics.vy > 0) {
		physics.vy = physics.vy - physics.friction * physics.vy;
	} else if(physics.vy < 0) {
		physics.vy = physics.vy + physics.friction * -physics.vy;
	}
	if(physics.gvx > 0) {
		physics.gvx = physics.gvx - physics.friction * physics.gvx;
	} else if(physics.gvx < 0) {
		physics.gvx = physics.gvx + physics.friction * -physics.gvx;
	}
	if(physics.gvy > 0) {
		physics.gvy = physics.gvy - physics.friction * physics.gvy;
	} else if(physics.gvy < 0) {
		physics.gvy = physics.gvy + physics.friction * -physics.gvy;
	}
	
	// If physics is close to 0, set it to 0
	if(physics.vx > -0.01 && physics.vx < 0.01)
		physics.vx = 0;
	if(physics.vy > -0.01 && physics.vy < 0.01)
		physics.vy = 0;
		
	if(physics.gvx > -0.01 && physics.gvx < 0.01)
		physics.gvx = 0;
	if(physics.gvy > -0.01 && physics.gvy < 0.01)
		physics.gvy = 0;
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


