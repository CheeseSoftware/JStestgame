
ECS.Systems.InterpolationSystem = CES.System.extend({
    update: function (dt) {
        var entities = this.world.getEntities('interpolation');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var interpolation = entity.getComponent('interpolation');
			
			var duration = 100 * dt;
			var ic = Math.min((new Date()-interpolation.interpolationDate)/duration, 1.0);
	
			physics.ix = ic*physics.x + (1.0-ic)*physics.ix;
			physics.iy = ic*physics.y + (1.0-ic)*physics.iy;
			physics.ivx = ic*physics.vx + (1.0-ic)*physics.ivx;
			physics.ivy = ic*physics.vy + (1.0-ic)*physics.ivy;
			
        });
    }
});