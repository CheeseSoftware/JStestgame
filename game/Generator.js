Generator = function() {
	this._seed = Math.random();
	this._noise = this._seed;
	this._oreNoise1 = this._seed+1;
	this._oreNoise2 = this._seed+331;
	this._oreNoise3 = this._seed+71117;
}

Generator.prototype.generate = function(chunk) {
	for (var yy = 0; yy < chunk.width; ++yy) {
		for (var xx = 0; xx < chunk.height; ++xx) {
			var x = xx+chunk.x*chunk.width;
			var y = yy+chunk.y*chunk.height;
			
			noise.seed(this._noise);
			var value = noise.perlin2(x / 20.0, y / 20.0);
			noise.seed(this._oreNoise1);
			var oreValue1 = noise.perlin2(x / 4.0, y / 4.0);
			noise.seed(this._oreNoise2);
			var oreValue2 = noise.perlin2(x / 4.0, y / 4.0);
			noise.seed(this._oreNoise3);
			var oreValue3 = noise.perlin2(x / 4.0, y / 4.0);

			var tileId = 0;
			
			if (value > 0.0)
				tileId = 1;
				
			if (value > 0.5)
				tileId = 2;

			if (value > 0.0) {
				if (oreValue1 > 0.45) {
					tileId = 4;
				}
				if (oreValue2 > 0.50) {
					tileId = 5;
				}
				if (oreValue3 > 0.25) {
					tileId = 3;
				}
			}
				
			chunk.setTileId(xx, yy, tileId);
		}
	}
}