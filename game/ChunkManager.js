ChunkManager = function(gl) {

	this._chunkSize = 30;
	this._chunkRenderer = new ChunkRenderer(gl, 32, 32, 32, 32);
	this._gl = gl;
	
	this._chunks = {};
	//this._chunkRenderer = new ChunkRenderer();
	
	
	//this.onChunkCreate = function(x, y, chunk) {};
	
	this._texture = null;
	this.loadTexture(gl);
}

ChunkManager.prototype.fillCircle = function(xPos, yPos, radius, density) {

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
			
			var oldDensity = this.getDensity(x, y);
				
			var fillStrength = Math.max(Math.min(radius-dis, 1.0), 0.0);
			var intDensity = Math.max(oldDensity-parseInt(255.0*fillStrength), 0);
			this.setDensity(x, y, intDensity, true);
		}
	}
	this._isDensityChanged = true;
}

ChunkManager.prototype.render = function(gl, vpMatrix, camera) {
	var chunksToRender = [];

	var x1 = Math.floor(camera.pos.x/32.0/30.0);
	var y1 = Math.floor(camera.pos.y/32.0/30.0);
	var x2 = Math.ceil((camera.pos.x+camera.width)/32.0/30.0);
	var y2 = Math.ceil((camera.pos.y+camera.width)/32.0/30.0);
	
	for (var y = y1; y <= y2; ++y) {
		for (var x = x1; x <= x2; ++x) {
			chunksToRender.push(this.getChunk(x, y));
		}
	}
	
	this._chunkRenderer.render(gl, vpMatrix, chunksToRender, this._texture.webglTexture);
}


ChunkManager.prototype.getDensity = function(x, y) {
	var localX = x%this._chunkSize;
	var localY = y%this._chunkSize;
	var chunkX = (x-localX)/this._chunkSize;
	var chunkY = (y-localY)/this._chunkSize;
	
	// Fix indexing of negative values:
	if (x < 0) {
		chunkX--;
		localX = (localX-chunkX*this._chunkSize)%this._chunkSize;
	}
	if (y < 0) {
		chunkY--;
		localY = (localY-chunkY*this._chunkSize)%this._chunkSize;
	}
		
	var chunkPosString = chunkX + "," + chunkY;
	
	if (this._chunks[chunkPosString] == undefined) {
		return 255;
	}
	
	return this._chunks[chunkPosString].getDensity(localX, localY);
}

ChunkManager.prototype.setDensity = function(x, y, value, createChunk) {
	if (typeof(createChunk)==='undefined') createChunk = false;

	var localX = x%this._chunkSize;
	var localY = y%this._chunkSize;
	var chunkX = (x-localX)/this._chunkSize;
	var chunkY = (y-localY)/this._chunkSize;
	
	// Fix indexing of negative values:
	if (x < 0) {
		chunkX--;
		localX = (localX-chunkX*this._chunkSize)%this._chunkSize;
	}
	if (y < 0) {
		chunkY--;
		localY = (localY-chunkY*this._chunkSize)%this._chunkSize;
	}
		
	var chunkPosString = chunkX + "," + chunkY;
	
	if (this._chunks[chunkPosString] == undefined) {
		if (!createChunk)
			return;
	
		var chunk = new Chunk(this, chunkX, chunkY, this._chunkSize, this._chunkSize);
		chunk.setDensity(localX, localY, value);
		this._chunks[chunkPosString] = chunk;
		
		this.onChunkCreate(this._gl, chunkX, chunkY, chunk);
	}
	else {
		this._chunks[chunkPosString].setDensity(localX, localY, value);
	}
}

ChunkManager.prototype.getChunk = function(chunkX, chunkY) {
	var chunkPosString = chunkX + "," + chunkY;
	return this._chunks[chunkPosString];
}

ChunkManager.prototype.loadTexture = function(gl) {
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

ChunkManager.prototype.onChunkCreate = function(gl, x, y, chunk) {
	console.log("onChunkCreate event! x:" + x + " y:" + y);
	
	var l = function(that, gl, ex, ey, x2, y2, eChunk) {
		var chunk2 = that.getChunk(x2, y2);
		if (chunk2) {
			that._chunkRenderer.onChunkCreate(gl, ex, ey, x2, y2, eChunk, chunk2);
			that._chunkRenderer.onChunkCreate(gl, x2, y2, ex, ey, chunk2, eChunk);
		}
	}
	
	l(this, gl, x, y, x+1, y, chunk);
	l(this, gl, x, y, x-1, y, chunk);
	l(this, gl, x, y, x, y+1, chunk);
	l(this, gl, x, y, x, y-1, chunk);
	
}
