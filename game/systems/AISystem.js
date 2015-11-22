
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
				
				physics.dx = targetPhysics.gx - physics.gx;
				physics.dy = targetPhysics.gy - physics.gy;
				
				if(new Date() - AI.lastPacket > 200) {
					server.entityServer.sendUpdatePacket(entity.uuid);
					AI.lastPacket = new Date();
					console.log("sent packet. x:" + physics.gx + " y:" + physics.gy);
				}
			});
        }.bind(this));
    }
});