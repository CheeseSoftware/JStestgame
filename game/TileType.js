TileType = function(id, name, isSolid, isOre) {
	this._id = id;
	this._name = name;
	this._isSolid = isSolid;
	this._isOre = isOre;
}

Object.defineProperties(TileType.prototype, {

    id: {
        get: function () {
            return this._id;
        },
    },
	name: {
        get: function () {
            return this._name;
        },
    },
	isSolid: {
        get: function () {
            return this._isSolid;
        },
    },
	isOre: {
        get: function () {
            return this._isOre;
        },
    }
	
});