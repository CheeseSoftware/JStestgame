 

ECS.Systems.ControlServerSystem = CES.System.extend({
    update: function (dt) {
    	var entities = this.world.getEntities('control');

    	if (!isServer)
    		return;

        entities.forEach(function (entity) {
        	var control = entity.getComponent('control');

        	if (control.isChanged) {
        		server.entityServer.sendUpdatePacket(entity.uuid);
        		control.isChanged = false;
        	}
        });
    }
});