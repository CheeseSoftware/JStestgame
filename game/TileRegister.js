TileRegister = function() {
	this._tileTypes = [];
	this._nameToTypeMap = {};
	
	this.register("air", false, false);
	this.register("dirt", true, false);
}

TileRegister.prototype.register = function(name, isSolid, isOre) {
	var id = tileTypes.length;
	var tileType = new TileType(id, name, isSolid, isOre);
	
	if (this._nameToTypeMap[name]) {
		return;
	}
		
	this._tileTypes.push(tileType);
	this._nameToTypeMap[name] = tileType;
}