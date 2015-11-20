
EntityClient = function() {
	this.entityMap = new EntityMap();
}

EntityClient.prototype.createEntity = function(uuid) {
	var entity = new CES.Entity();
	entity.uuid = uuid;
	this.entityMap.map(uuid, entity.id);
	console.log("Mapped entity. entityId:" + entity.id + " UUID:" + uuid);
	return entity;
}
