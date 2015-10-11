ChunkManager = function(gl) {

	this._chunkSize = 30;
	this._chunkRenderer = new ChunkRenderer(gl, 32, 32, 32, 32);
	this._tileRegister = new TileRegister();
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
			var x = parseInt(xPos + ((xPos > 0)? 0.5:-0.5)) + xx;
			var y = parseInt(yPos + ((yPos > 0)? 0.5:-0.5)) + yy;
		
			var xxx = xx + xPos - Math.floor(xPos);
			var yyy = yy + yPos - Math.floor(yPos);
		
			var dis = Math.sqrt(xxx*xxx + yyy*yyy);
			if (dis > radius)
				continue;
			
			var oldDensity = this.getDensity(x, y);
			var tileId = this.getTileId(x, y);
			var tile = this._tileRegister.getById(tileId);
				
			var fillStrength = Math.max(Math.min(radius-dis, 1.0), 0.0)/tile.hardness;
			var intDensity = Math.max(oldDensity-parseInt(255.0*fillStrength), 0);
			this.setDensity(x, y, intDensity, true);
		}
	}
	this._isDensityChanged = true;
}

ChunkManager.prototype.update = function(camera) {
	var x1 = Math.floor(camera.pos.x/32.0/30.0)-2;
	var y1 = Math.floor(camera.pos.y/32.0/30.0)-2;
	var x2 = Math.ceil((camera.pos.x+camera.width)/32.0/30.0)+2;
	var y2 = Math.ceil((camera.pos.y+camera.width)/32.0/30.0)+2;
	
	// Create/Load chunks:
	for (var y = y1; y <= y2; ++y) {
		for (var x = x1; x <= x2; ++x) {
			var chunk = this.getChunk(x, y);
			if (chunk)
				continue;
			
			var chunkPosString = x + "," + y;
			
			// Create Chunk
			var chunk = new Chunk(this, x, y, this._chunkSize, this._chunkSize);
			this._chunks[chunkPosString] = chunk;
		}
	}
	
}

ChunkManager.prototype.render = function(gl, vpMatrix, camera) {
	var chunksToRender = [];

	var x1 = Math.floor(camera.pos.x/32.0/30.0);
	var y1 = Math.floor(camera.pos.y/32.0/30.0);
	var x2 = Math.ceil((camera.pos.x+camera.width)/32.0/30.0);
	var y2 = Math.ceil((camera.pos.y+camera.width)/32.0/30.0);
	
	for (var y = y1; y <= y2; ++y) {
		for (var x = x1; x <= x2; ++x) {
			var chunk = this.getChunk(x, y);
			if (!chunk)
				continue;
			
			chunksToRender.push(chunk);
			
			// Notify neighbor chunks
			if (chunk.isChanged)
				this.onChunkChange(gl, x, y, chunk);
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
		localX = (x-chunkX*this._chunkSize)%this._chunkSize;
	}
	if (y < 0) {
		chunkY--;
		localY = (y-chunkY*this._chunkSize)%this._chunkSize;
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
		localX = (x-chunkX*this._chunkSize)%this._chunkSize;
	}
	if (y < 0) {
		chunkY--;
		localY = (y-chunkY*this._chunkSize)%this._chunkSize;
	}
		
	var chunkPosString = chunkX + "," + chunkY;
	
	if (this._chunks[chunkPosString] == undefined) {
		if (!createChunk)
			return;
	
		var chunk = new Chunk(this, chunkX, chunkY, this._chunkSize, this._chunkSize);
		chunk.setDensity(localX, localY, value);
		this._chunks[chunkPosString] = chunk;
		
		this.onChunkChange(this._gl, chunkX, chunkY, chunk);
	}
	else {
		this._chunks[chunkPosString].setDensity(localX, localY, value);
	}
}

ChunkManager.prototype.getTileId = function(x, y) {
	var localX = x%this._chunkSize;
	var localY = y%this._chunkSize;
	var chunkX = (x-localX)/this._chunkSize;
	var chunkY = (y-localY)/this._chunkSize;
	
	// Fix indexing of negative values:
	if (x < 0) {
		chunkX--;
		localX = (x-chunkX*this._chunkSize)%this._chunkSize;
	}
	if (y < 0) {
		chunkY--;
		localY = (y-chunkY*this._chunkSize)%this._chunkSize;
	}
		
	var chunkPosString = chunkX + "," + chunkY;
	
	if (this._chunks[chunkPosString] == undefined) {
		return 0;
	}
	
	return this._chunks[chunkPosString].getTileId(localX, localY);
}

ChunkManager.prototype.setTileId = function(x, y, value, createChunk) {
	if (typeof(createChunk)==='undefined') createChunk = false;

	var localX = x%this._chunkSize;
	var localY = y%this._chunkSize;
	var chunkX = (x-localX)/this._chunkSize;
	var chunkY = (y-localY)/this._chunkSize;
	
	// Fix indexing of negative values:
	if (x < 0) {
		chunkX--;
		localX = (x-chunkX*this._chunkSize)%this._chunkSize;
	}
	if (y < 0) {
		chunkY--;
		localY = (y-chunkY*this._chunkSize)%this._chunkSize;
	}
		
	var chunkPosString = chunkX + "," + chunkY;
	
	if (this._chunks[chunkPosString] == undefined) {
		if (!createChunk)
			return;
	
		var chunk = new Chunk(this, chunkX, chunkY, this._chunkSize, this._chunkSize);
		chunk.setTileId(localX, localY, value);
		this._chunks[chunkPosString] = chunk;
		
		this.onChunkChange(this._gl, chunkX, chunkY, chunk);
	}
	else {
		this._chunks[chunkPosString].setTileId(localX, localY, value);
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

/* Is called whenever a chunk is changed or created.
 *
 */
ChunkManager.prototype.onChunkChange = function(gl, x, y, chunk) {
	console.log("onChunkChange event! x:" + x + " y:" + y);
	
	var l = function(that, gl, ex, ey, x2, y2, eChunk) {
		var chunk2 = that.getChunk(x2, y2);
		if (chunk2) {
			that._chunkRenderer.onChunkChange(gl, ex, ey, x2, y2, eChunk, chunk2);
			that._chunkRenderer.onChunkChange(gl, x2, y2, ex, ey, chunk2, eChunk);
		}
	}
	
	l(this, gl, x, y, x+1, y, chunk);
	l(this, gl, x, y, x-1, y, chunk);
	l(this, gl, x, y, x, y+1, chunk);
	l(this, gl, x, y, x, y-1, chunk);
	
}

ChunkManager.prototype.calcDensity = function(x, y) {
	var x1 = Math.floor(x);
	var y1 = Math.floor(y);
	var x2 = x1 + 1;
	var y2 = y1 + 1;
		
	var fractX = x - x1;
	var fractY = y - y1;
	
	var a = [
		1.0 - fractX,
		1.0 - fractY,
		fractX,
		fractY
	];
	var b = [
		this.getDensity(x1, y1),
		this.getDensity(x2, y1),
		this.getDensity(x1, y2),
		this.getDensity(x2, y2)
	];
	
	return a[0] * a[1] * b [0] +
		   a[2] * a[1] * b [1] +
		   a[0] * a[3] * b [2] +
		   a[2] * a[3] * b [3];
}

ChunkManager.prototype.calcNormal = function(x, y) {
	var epsilon = 0.1;
	var a = -this.calcDensity(x+epsilon, y+epsilon);
	var b = -this.calcDensity(x-epsilon, y+epsilon);
	var c = -this.calcDensity(x-epsilon, y-epsilon);
	var d = -this.calcDensity(x+epsilon, y-epsilon);
	
	var f = vec2.fromValues(+a, +a);
	var g = vec2.fromValues(-b, +b);
	var h = vec2.fromValues(-c, -c);
	var i = vec2.fromValues(+d, -d);
	
	var vec = vec2.create();
	vec2.add(vec, vec, f);
	vec2.add(vec, vec, g);
	vec2.add(vec, vec, h);
	vec2.add(vec, vec, i);
	if (vec2.sqrDist(vec, vec2.create()) > 0.0)
		vec2.normalize(vec, vec);
	
	return vec;
}
