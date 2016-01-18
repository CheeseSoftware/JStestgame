
ECS.Systems.AISystem = CES.System.extend({
	init: function(entityServer) {
		this._entityServer = entityServer;
	},
    update: function (dt) {
    	return;
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

						var delta = [dx, dy];
						var distance = v2.length(delta);

						var battleInfo = {
							distance : 0.05*32.0,
							radius : 0.3*32.0,
							damage : 4.0,
						}

						if (distance/32.0 < battleInfo.radius) {
							server.battleManager.hit(entity, battleInfo.distance, battleInfo.radius, battleInfo.damage);
						}
						
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