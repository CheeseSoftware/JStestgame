
ECS.Components.Physics = CES.Component.extend({
    name: 'physics',
    init: function (x, y, vx, vy, rotation) {
        this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.rotation = rotation;
    }
});
 