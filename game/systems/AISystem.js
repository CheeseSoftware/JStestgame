
ECS.Systems.AISystem = CES.System.extend({
	init: function(entityServer) {
		this._entityServer = entityServer;
	},
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'AI');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var AI = entity.getComponent('AI');
			
			var targets = this.world.getEntities('serverplayer');
			targets.forEach(function (target) {
				var targetPhysics = target.getComponent("physics");
				
				if(new Date() - AI.lastPacket > 100) {
					var dx = targetPhysics.gx - physics.gx;
					var dy = targetPhysics.gy - physics.gy;
					
					physics.dx = dx;
					physics.dy = dy;
					/*physics.gx = targetPhysics.gx;
					physics.gy = targetPhysics.gy;
					physics.gvx = targetPhysics.gvx;
					physics.gvy = targetPhysics.gvy;
					physics.dx = targetPhysics.dx;
					physics.dy = targetPhysics.dy;
					physics.rotation = targetPhysics.rotation;*/
					server.entityServer.sendUpdatePacket(entity.uuid);
					AI.lastPacket = new Date();
					
					/*console.log("----------");
					console.log(dx + " " + dy);
					console.log("g " + physics.gx + " " + physics.gy);
					console.log(physics.x + " " + physics.y);
					console.log("gv " + physics.gvx + " " + physics.gvy);
					console.log(physics.vx + " " + physics.vy);*/
				}
			});
        }.bind(this));
    }
});