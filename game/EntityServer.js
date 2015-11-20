
EntityServer = function() {
	this.entityMap = new EntityMap();
}

EntityServer.prototype.generateUUID = function() {
	return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = crypto.randomBytes(1)[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	}));
}

EntityServer.prototype.createEntity = function() {
	var uuid = this.generateUUID();
	var entity = new CES.Entity();
	entity.uuid = uuid;
	this.entityMap.map(uuid, entity.id);
	console.log("Mapped entity. entityId:" + entity.id + " UUID:" + uuid);
	return entity;
}

