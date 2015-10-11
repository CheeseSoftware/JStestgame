ChunkRenderer = function(gl, chunkSizeX, chunkSizeY, tileSizeX, tileSizeY) {
	this._chunkSizeX = 30;
	this._chunkSizeY = 30;
	this._tileSizeX = tileSizeX;
	this._tileSizeY = tileSizeY;
	this._densityTexture = null;
	this._buffer = null;
	this._indexBuffer = null;
	
	var vertexShader = new Shader("terrain/vert.glsl", gl.VERTEX_SHADER);
	var fragmentShader = new Shader("terrain/frag.glsl", gl.FRAGMENT_SHADER);
	var shaders = [vertexShader, fragmentShader];
	this._shaderProgram = new ShaderProgram(shaders);
	
	// Attribute locations:
	this._positionAttribute = 0;
	this._uvAttribute = 0;
	// Uniform locations:
	this._densityTextureUniform = 0;
	this._textureUniform = 0;
	this._vpMatrixUniform = 0;
	this._modelMatrixUniform = 0;
	this._isReady = false;
}

ChunkRenderer.prototype.lazyInit = function(gl) {
	if (!this._shaderProgram.isReady())
		this._shaderProgram.tryLink(gl);
		
	if (this._shaderProgram.isReady()) {
		if (this._buffer == null) {
			/*========================= THE TRIANglE ========================= */
			//POINTS :
			var sizeX = 30*this._tileSizeX;
			var sizeY = 30*this._tileSizeY;
			
			var triangle_vertex=[
				0,0,
				0,0,
				sizeX,0,
				1,0,
				0,sizeY,
				0,1,
				sizeX,sizeY,
				1,1,
			];

			this._indexBuffer = gl.createBuffer ();
			gl.bindBuffer(gl.ARRAY_BUFFER, this._indexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,
			new Float32Array(triangle_vertex),
			gl.STATIC_DRAW);
			
			//FACES :
			var triangle_faces = [0,1,3,0,3,2];
			this._buffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
				new Uint16Array(triangle_faces),
			gl.STATIC_DRAW);
			
			// Get attribute locations
			this._positionAttribute = this._shaderProgram.getAttributeLocation(gl, "aPosition");
			this._uvAttribute = this._shaderProgram.getAttributeLocation(gl, "aUV");
			
			// Get uniform locations
			this._densityTextureUniform = this._shaderProgram.getUniformLocation(gl, "densityTexture");
			this._textureUniform = this._shaderProgram.getUniformLocation(gl, "texture");
			this._vpMatrixUniform = this._shaderProgram.getUniformLocation(gl, "vpMatrix");
			this._modelMatrixUniform = this._shaderProgram.getUniformLocation(gl, "modelMatrix");
			
			 this._isReady = true;
		}
	}
}

/* Render terrain.
 * gl: webgl context
 * vpMatrix: View-projection-matrix.
 * chunks: array of chunks to render.
 * texture: texture of terrain.
 */
ChunkRenderer.prototype.render = function(gl, vpMatrix, chunks, texture) {
	// Lazy init
	if (!this._isReady)
		this.lazyInit(gl);
	
	// Make sure the renderer is ready.
	if (!this._isReady)
		return;
		
	// Bind shader program:
	this._shaderProgram.bind(gl);

	// Loop through every chunk
	for (var i = 0; i < chunks.length; ++i) {
		var chunk = chunks[i];
		
		if (!chunk)
			continue;
		
		// Lazy init of chunk texture.
		if (chunk.texture == undefined) {
			this.loadChunkTexture(gl, chunk);
		}
	
		// Update density texture
		if (chunk.isChanged) {
			gl.bindTexture(gl.TEXTURE_2D, chunk.texture);
			//gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._chunkSizeX, this.chunkSizeY, gl.LUMINANCE, gl.UNSIGNED_BYTE, chunk.data);
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 1, 1, 30, 30, gl.LUMINANCE, gl.UNSIGNED_BYTE, chunk.densityData);
			gl.bindTexture(gl.TEXTURE_2D, null);
			
			chunk.isChanged = false; 
		}
		
		/********************************************************
		 * Render the chunk:
		 ********************************************************/
		
		// MVP matrix
		var modelMatrix = PIXI.Matrix.IDENTITY.clone().translate(chunk.x*this._chunkSizeX*this._tileSizeX,chunk.y*this._chunkSizeY*this._tileSizeX);
		var mvpMatrix = vpMatrix.clone().append(modelMatrix);
		// Bind matrix
		gl.uniformMatrix3fv(this._vpMatrixUniform, false, vpMatrix.toArray());
		gl.uniformMatrix3fv(this._modelMatrixUniform, false, modelMatrix.toArray());
		
		
		
		// Bind textures
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, chunk.texture);
		if (texture) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, texture);
		}
		
		// Set texture uniforms:
		gl.uniform1i(this._densityTextureUniform, 0);
		gl.uniform1i(this._textureUniform, 1);
		
		// Bind array buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this._indexBuffer);

		// Attributes
		gl.vertexAttribPointer(this._positionAttribute, 2, gl.FLOAT, false,4*4,0) ;
		gl.vertexAttribPointer(this._uvAttribute, 2, gl.FLOAT, false,4*4,8) ;

		// Render chunk
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		
		// Unbind buffers
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
	}
	
	// Unbind textures:
	if (texture) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	// unbind shader program:
	this._shaderProgram.unbind(gl);
}

ChunkRenderer.prototype.loadChunkTexture = function(gl, chunk) {
	chunk.texture = gl.createTexture();
	
	gl.bindTexture(gl.TEXTURE_2D, chunk.texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this._chunkSizeX + 2, this._chunkSizeY + 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);// chunk.data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
	gl.pixelStorei(gl.PACK_ALIGNMENT, 1)
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 1, 1, 30, 30, gl.LUMINANCE, gl.UNSIGNED_BYTE, chunk.densityData);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	chunk.isChanged = false;
}

ChunkRenderer.prototype.onChunkChange = function(gl, x1, y1, x2, y2, chunk1, chunk2) {
	if (!chunk1 || !chunk2)
		return;

	console.log("onChunkCreate event! x:" + x1 + " x2:" + x2 + " y:" + y1 + " y2:" + y2);
	// TODO: ChunkRenderer.prototype.onChunkCreate
	
	// Calculate intersecting rectangle.
	var rx1 = Math.max(x1*30-1, x2*30);
	var ry1 = Math.max(y1*30-1, y2*30);
	var rx2 = Math.min(x1*30+30, x2*30+29);
	var ry2 = Math.min(y1*30+30, y2*30+29);
	
	// Calculate texture position:
	var textureX1 = rx1 - x1*30+1;
	var textureY1 = ry1 - y1*30+1;
	var textureX2 = rx2 - x1*30+1;
	var textureY2 = ry2 - y1*30+1;
	
	var dataX = rx1 - x2*30;
	var dataY = ry1 - y2*30;
	
	var width = textureX2-textureX1+1;
	var height = textureY2-textureY1+1;
	
	var densityData = new Uint8Array(width * height);
	for (var xx = 0; xx < width; ++xx) {
		for (var yy = 0; yy < height; ++yy) {
			densityData[xx+yy*width] = chunk2.densityData[dataX+xx + (dataY+yy)*30];
		}
	}
	
	// Lazy init of chunk texture.
	if (chunk1.texture == undefined) {
		this.loadChunkTexture(gl, chunk1);
	}
	
	gl.bindTexture(gl.TEXTURE_2D, chunk1.texture);
	//gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
	//gl.pixelStorei(gl.PACK_ALIGNMENT, 1)
	//gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._chunkSizeX, this.chunkSizeY, gl.LUMINANCE, gl.UNSIGNED_BYTE, chunk.data);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, textureX1, textureY1, textureX2-textureX1+1, textureY2-textureY1+1, gl.LUMINANCE, gl.UNSIGNED_BYTE, densityData);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	//chunk1.isChanged = false; 
}