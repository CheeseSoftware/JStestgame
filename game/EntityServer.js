
EntityServer = function(entityWorld) {
	this._entityWorld = entityWorld;
	this._entityMap = new EntityMap();
}

EntityServer.prototype.createEntity = function(uuid) {
	if(!uuid)
		uuid = generateUUID();
	var entity = new CES.Entity();
	entity.uuid = uuid;
	this._entityMap.map(uuid, entity.id);
	console.log("Mapped entity. entityId:" + entity.id + " UUID:" + uuid);
	return entity;
}

EntityServer.prototype.getEntity = function(uuid) {
	var entityId = this._entityMap.getEntityId(uuid);
	if(entityId != undefined) {
		return this._entityWorld.getEntity(entityId);
	}
	else
		console.log("EntityServer getEntity: entityId undefined.");
	return undefined;
}

EntityServer.prototype.removeEntity = function(uuid) {
	var entityId = this._entityMap.getEntityId(uuid);
	if(entityId != undefined) {
		var entity = this._entityWorld.getEntity(entityId);
		this._entityWorld.removeEntity(entity);
		this._entityMap.remove(uuid);
	}
	else
		console.log("EntityServer removeEntity: entityId undefined.");
	return undefined;
}


