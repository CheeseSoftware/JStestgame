Terrain = function(gl, sizeX, sizeY, tileSizeX, tileSizeY, texturePath) {
	
	this._sizeX = sizeX;
	this._sizeY = sizeY;
	this._tileSizeX = tileSizeX;
	this._tileSizeY = tileSizeY;
	this._densityField = new DensityField(30, 30);
	this._terrainRenderer = new TerrainRenderer(gl, 30, 30, tileSizeX, tileSizeY);
	this._texturePath = texturePath;
	this._texture = null;
	
	
	this._densityField.array.onPageCreate = this.onPageCreate.bind(this, gl);//function(x, y, page) { console.log("onPageCreate event! x:" + x + " y:" + y); };//this._terrainRenderer(
	this._densityField.array.set(1, 1, 0);
	
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

Terrain.prototype.render = function(gl, vpMatrix, camera) {
	var pagesToRender = [];

	var x1 = Math.floor(camera.pos.x/32.0/30.0);
	var y1 = Math.floor(camera.pos.y/32.0/30.0);
	var x2 = Math.ceil((camera.pos.x+camera.width)/32.0/30.0);
	var y2 = Math.ceil((camera.pos.y+camera.width)/32.0/30.0);
	
	for (var y = y1; y <= y2; ++y) {
		for (var x = x1; x <= x2; ++x) {
			pagesToRender.push(this._densityField.array.getPage(x, y));
		}
	}
	
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

Terrain.prototype.onPageCreate = function(gl, x, y, page) {
	console.log("onPageCreate event! x:" + x + " y:" + y);
	
	var l = function(that, gl, ex, ey, x2, y2, ePage) {
		var page2 = that._densityField.array.getPage(x2, y2);
		if (page2) {
			that._terrainRenderer.onPageCreate(gl, ex, ey, x2, y2, ePage, page2);
			that._terrainRenderer.onPageCreate(gl, x2, y2, ex, ey, page2, ePage);
		}
	}
	
	l(this, gl, x, y, x+1, y, page);
	l(this, gl, x, y, x-1, y, page);
	l(this, gl, x, y, x, y+1, page);
	l(this, gl, x, y, x, y-1, page);
	
}