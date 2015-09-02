
ECS.Components.Physics = CES.Component.extend({
    name: 'physics',
    init: function (body) {
		this.body = body;
    }
});
 
Object.defineProperties(ECS.Components.Physics.prototype, {
    x: {
        get: function () { return this.body.state.pos.x; },
		set: function (value) { this.body.state.pos.x = value; }
    },
	y: {
        get: function () { return this.body.state.pos.y; },
		set: function (value) { this.body.state.pos.y = value; }
    },
    vx: {
        get: function () { return this.body.state.vel.x; },
		set: function (value) { this.body.state.vel.x = value; }
    },
	vy: {
        get: function () { return this.body.state.vel.y; },
		set: function (value) { this.body.state.vel.y = value; }
    },
	rotation: {
        get: function () { return this.body.state.angular.pos; },
		set: function (value) { this.body.state.angular.pos = value; }
    }
});