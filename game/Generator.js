Generator = function() {
	this._seed = Math.random();
	this._noise = noise.seed(this._seed);
}

Generator.prototype.generate = function(chunk) {
	for (var yy = 0; yy < chunk.width; ++yy) {
		for (var xx = 0; xx < chunk.height; ++xx) {
			var x = xx+chunk.x*chunk.width;
			var y = yy+chunk.y*chunk.height;
			
			var value = noise.perlin2(x / 20.0, y / 20.0);
			var tileId = 0;
			
			if (value > 0.0)
				tileId = 1;
				
			if (value > 0.5)
				tileId = 2;
				
			chunk.setTileId(xx, yy, tileId);
		}
	}
}