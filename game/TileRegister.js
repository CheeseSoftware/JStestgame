TileRegister = function() {
	this._tileTypes = [];
	this._nameToTypeMap = {};
	
	this.register("dirt", true, false, 1.0);
	this.register("stone", true, false, 4.0);
	this.register("stone2", true, false, 8.0);
	this.register("stone3", true, false, 16.0);
	this.register("ore1", true, false, 32.0);
	this.register("ore2", true, false, 64.0);
}

TileRegister.prototype.register = function(name, isSolid, isOre, hardness) {
	var id = this._tileTypes.length;
	var tileType = new TileType(id, name, isSolid, isOre, hardness);
	
	if (this._nameToTypeMap[name]) {
		return;
	}
		
	this._tileTypes.push(tileType);
	this._nameToTypeMap[name] = tileType;
}

TileRegister.prototype.getById = function(id) {
	return this._tileTypes[id];
}

TileRegister.prototype.getIdByName = function(name) {
	return this._nameToTypesMap[id];
}