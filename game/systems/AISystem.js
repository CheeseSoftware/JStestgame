
ECS.Systems.AISystem = CES.System.extend({
	init: function(entityServer) {
		this._entityServer = entityServer;
	},
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'AI');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var AI = entity.getComponent('AI');
			
			if(AI.target) {
				var target = this._entityServer.getEntity(AI.target);
				if(target) {
					var targetPhysics = target.getComponent("physics");		
					if(new Date() - AI.lastPacket > 100) {
						var dx = targetPhysics.gx - physics.gx;
						var dy = targetPhysics.gy - physics.gy;
						
						physics.dx = dx;
						physics.dy = dy;
						server.entityServer.sendUpdatePacket(entity.uuid);
						AI.lastPacket = new Date();
					}
				}
			}
        }.bind(this));
    }
});