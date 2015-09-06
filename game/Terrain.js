Terrain = function(gl, sizeX, sizeY, texturePath) {
	
	this._sizeX = sizeX;
	this._sizeY = sizeY;
	this._densityField = new DensityField(sizeX, sizeY);
	this._densityField.array.set(1, 1, 0);
	this._texturePath = texturePath;
	this._texture = null;
	// DIg a hole
	/*for (var y = -16; y < 16; ++y) {
		for (var x = -16; x < 16; ++x) {
			var dis = Math.sqrt(x*x + y*y);
			var density = Math.min(12.0-dis, 1.0);
			var intDensity = 255 - parseInt(density*255);
			if (dis <= 12.0)
				this._densityField.array.set(x+16, y+16, intDensity);
		}
	}*/
	this.fillCircle(8, 8, 2.3, 0.0);

	this._terrainRenderer = new TerrainRenderer(gl, sizeX, sizeY);

	
	this.loadTexture(gl);
}

Terrain.prototype.fillCircle = function(xPos, yPos, radius, density) {

	var intR = parseInt(radius+0.5);

	for (var yy = -intR; yy < intR; ++yy) {
		for (var xx = -intR; xx < intR; ++xx) {
			var x = parseInt(xPos+0.5) + xx;
			var y = parseInt(yPos+0.5) + yy;
		
			var xxx = xx + xPos - Math.floor(xPos);
			var yyy = yy + yPos - Math.floor(yPos);
		
			var dis = Math.sqrt(xxx*xxx + yyy*yyy);
			if (dis > radius)
				continue;
			
			var oldDensity = this._densityField.array.get(x, y);
				
			var fillStrength = Math.max(Math.min(radius-dis, 1.0), 0.0);
			var intDensity = Math.max(oldDensity-parseInt(255.0*fillStrength), 0);
			this._densityField.array.set(x, y, intDensity);
		}
	}
	this._isDensityChanged = true;
}

Terrain.prototype.render = function(gl, vpMatrix) {
	var pagesToRender = [this._densityField.array.getPage(0, 0), this._densityField.array.getPage(0, 1), this._densityField.array.getPage(1, 0), this._densityField.array.getPage(1, 1)];

	this._terrainRenderer.render(gl, vpMatrix, pagesToRender, this._texture.webglTexture);
}

Terrain.prototype.loadTexture = function(gl) {
	/***********************************************************
	 * Load texture : 
	 ***********************************************************/
	/*========================= TEXTURES ========================= */
	var get_texture=function(image_URL){
		var image = new Image();

		image.src = image_URL;
		image.webglTexture = false;

		image.onload = function(e) {
			var texture = gl.createTexture();
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			image.webglTexture = texture;
		};
		return image;
	};

	this._texture = get_texture("game/textures/ground.png");
}