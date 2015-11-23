
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
					var dx = targetPhysics.gx - physics.x;
					var dy = targetPhysics.gy - physics.y;
					console.log(dx + " " + dy);
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
				}
			});
        }.bind(this));
    }
});