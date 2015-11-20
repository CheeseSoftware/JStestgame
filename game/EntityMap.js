
EntityMap = function() {
	this.UUIDToEntityId = {};
	this.entityIdToUUID = {};
}

EntityMap.prototype.map = function(UUID, entityId) {
	this.UUIDToEntityId[UUID] = entityId;
	this.entityIdToUUID[entityId] = UUID;
}

EntityMap.prototype.getEntityId = function(UUID) {
	return this.UUIDToEntityId[UUID];
}

EntityMap.prototype.getUUID = function(entityId) {
	return this.entityIdToUUID[entityId];
}

EntityMap.prototype.remove = function(UUID) {
	delete this.entityIdToUUID[this.UUIDToEntityId[UUID]];
	delete this.UUIDToEntityId[UUID];
	console.log("Removed mapping for " + UUID);
}