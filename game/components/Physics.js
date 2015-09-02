
ECS.Components.Physics = CES.Component.extend({
    name: 'physics',
	init: function (body) {
		this.body = body;
    }
});
 
Object.defineProperties(ECS.Components.Physics.prototype, {
	x: {
        get: function () { return this.body.m_position.x; },
		set: function (value) { this.body.m_position.x = value; }
    },
	y: {
        get: function () { return this.body.m_position.y; },
		set: function (value) { this.body.m_position.y = value; }
    },
    vx: {
        get: function () { return this.body.GetLinearVelocity().x; },
		set: function (value) { 
			var vel = this.body.GetLinearVelocity();
			vel.x = value;
			this.body.SetLinearVelocity(vel);
		}
    },
	vy: {
        get: function () { return this.body.GetLinearVelocity().y; },
		set: function (value) { 
			var vel = this.body.GetLinearVelocity();
			vel.y = value;
			this.body.SetLinearVelocity(vel);
		}
    },
	rotation: {
        get: function () { return this.body.m_rotation; },
		set: function (value) { this.body.m_rotation = value; }
    }
});


