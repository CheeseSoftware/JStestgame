
ECS.Systems.AISystem = CES.System.extend({
	init: function(entityServer) {
		this._entityServer = entityServer;
	},
    update: function (dt) {
        var entities = this.world.getEntities('physics', 'AI', 'control');
 
        entities.forEach(function (entity) {
			var physics = entity.getComponent('physics');
            var AI = entity.getComponent('AI');
            var control = entity.getComponent('control');
			
			if(AI.target) {
				var target = this._entityServer.getEntity(AI.target);
				if(target) {
					var targetPhysics = target.getComponent("physics");
					var targetControl = target.getComponent("control");	
					if(new Date() - AI.lastPacket > 500) {
						var dx = targetPhysics.x - physics.x;
						var dy = targetPhysics.y - physics.y;
						
						if(dx == 0 && dy == 0)
							return;
						
						control.moveDir[0] = dx;
						control.moveDir[1] = dy;
						
						v2.normalize(control.moveDir, control.moveDir)
						control.isChanged = true;
						AI.lastPacket = new Date();
					}
				}
			}
        }.bind(this));
    }
});