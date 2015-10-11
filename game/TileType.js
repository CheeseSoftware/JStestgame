TileType = function(id, name, isSolid, isOre, hardness) {
	this._id = id;
	this._name = name;
	this._isSolid = isSolid;
	this._isOre = isOre;
	this._hardness = hardness;
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
    },
	hardness: {
		get: function() {
			return this._hardness;
		},
	},
	
});