Chunk = function(chunkManager, x, y, sizeX, sizeY) {
	this._tileIds = new Uint8Array(sizeX * sizeY);
	this._density = new Uint8Array(sizeX * sizeY);
	this._x = x;
	this._y = y;
	this._sizeX = sizeX;
	this._sizeY = sizeY;
	this._chunkManager = chunkManager;
	this.isChanged = true;
	
	for(var y = 0; y < sizeY; ++y) {
		for (var x = 0; x < sizeX; ++x) {
			this._tileIds[y*sizeX + x] = (this._x*2+x/16+this._y*2+y/16)%4;
			this._density[y*sizeX + x] = 255;
		}
	}
	
	this._tileIds[4*sizeX + 4] = 1;
	
}



Chunk.prototype.getDensity = function(x, y) {
	return this._density[x+y*this._sizeX];
}

Chunk.prototype.setDensity = function(x, y, value) {
	this._density[x+y*this._sizeX] = value;
	this.isChanged = true;
}

Chunk.prototype.getTileId = function(x, y) {
	return this._tileIds[x+y*this._sizeX];
}

Chunk.prototype.setTileId = function(x, y, value) {
	this._tileIds[x+y*this._sizeX] = value;
	this.isChanged = true;
}

Object.defineProperties(Chunk.prototype, {

    width: {
        get: function () {
            return this._sizeX;
        }
    },

    height: {
        get: function () {
            return this._sizeY;
		}
    },
	
	x : {
		get : function() {
			return this._x;
		}
	},
	
	y : {
		get : function() {
			return this._y;
		}
	},
	
	tileData: {
		get: function()  {
			return this._tileIds;
		},
		set: function(data)  {
			this._tileIds = data;
		}
	},
	
	densityData: {
		get: function()  {
			return this._density;
		},
		set: function(data)  {
			this._density = data;
		}
	},
	
	chunkManager : {
		get : function() {
			return this._chunkManager;
		}
	}

});
