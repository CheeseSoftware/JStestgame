var ChunkRenderer = function(gl, chunkManager, chunkSizeX, chunkSizeY, tileSizeX, tileSizeY) {

	chunkManager.subscribe(this);

	this._chunkSize = 30;
	this._tileSize = tileSizeX;
	this._gl = gl;
	this._chunkManager = chunkManager;
	
	var vertexShader = new Shader("terrain/vert.glsl", gl.VERTEX_SHADER);
	var fragmentShader = new Shader("terrain/frag.glsl", gl.FRAGMENT_SHADER);
	var shaders = [vertexShader, fragmentShader];
	this._shaderProgram = new ShaderProgram(shaders);
	
	// Attribute locations:
	this._positionAttribute = 0;
	this._uvAttribute = 0;
	// Uniform locations:
	this._textureUniform = 0;
	this._vpMatrixUniform = 0;
	this._modelMatrixUniform = 0;
	this._isReady = false;
	
	this._texture = null;
	this.loadTexture(gl);
}

ChunkRenderer.prototype.lazyInit = function(gl) {
	if (!this._shaderProgram.isReady())
		this._shaderProgram.tryLink(gl);
		
	if (this._shaderProgram.isReady()) {

		this._positionAttribute = this._shaderProgram.getAttributeLocation(gl, "aPosition");
		this._uvAttribute = this._shaderProgram.getAttributeLocation(gl, "aUV");
		
		// Get uniform locations
		//this._densityTextureUniform = this._shaderProgram.getUniformLocation(gl, "densityTexture");
		this._textureUniform = this._shaderProgram.getUniformLocation(gl, "texture");
		this._vpMatrixUniform = this._shaderProgram.getUniformLocation(gl, "vpMatrix");
		this._modelMatrixUniform = this._shaderProgram.getUniformLocation(gl, "modelMatrix");

		this._isReady = true;
	}
}

ChunkRenderer.prototype.render = function(gl, chunkManager, vpMatrix, camera) {
	var chunksToRender = [];

	var x1 = Math.floor(camera.pos.x/32.0/30.0);
	var y1 = Math.floor(camera.pos.y/32.0/30.0);
	var x2 = Math.ceil((camera.pos.x+camera.width)/32.0/30.0);
	var y2 = Math.ceil((camera.pos.y+camera.width)/32.0/30.0);
	
	for (var y = y1; y <= y2; ++y) {
		for (var x = x1; x <= x2; ++x) {
			var chunk = chunkManager.getChunk(x, y);
			if (!chunk)
				continue;
			
			chunksToRender.push(chunk);
		}
	}
	
	this.renderChunk(gl, vpMatrix, chunksToRender, this._texture.webglTexture);
}

/* Render terrain.
 * gl: webgl context
 * vpMatrix: View-projection-matrix.
 * chunks: array of chunks to render.
 * texture: texture of terrain.
 */
ChunkRenderer.prototype.renderChunk = function(gl, vpMatrix, chunks, texture) {
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

		if (chunk.isRenderChanged || !chunk.indexBuffer || !chunk.vertexBuffer || !chunk.bufferSize)
			this.genMesh(chunk.x, chunk.y)
		
		/********************************************************
		 * Render the chunk:
		 ********************************************************/
		
		// MVP matrix
		var modelMatrix = PIXI.Matrix.IDENTITY.clone().translate(chunk.x*this._chunkSize*this._tileSize,chunk.y*this._chunkSize*this._tileSize);
		var mvpMatrix = vpMatrix.clone().append(modelMatrix);
		// Bind matrix
		gl.uniformMatrix3fv(this._vpMatrixUniform, false, vpMatrix.toArray());
		gl.uniformMatrix3fv(this._modelMatrixUniform, false, modelMatrix.toArray());
		
		
		// Bind textures
		if (texture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
		}
		
		// Set texture uniforms:
		gl.uniform1i(this._textureUniform, 0);
		
		// Bind array buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, chunk.indexBuffer);

		// Attributes
		gl.vertexAttribPointer(this._positionAttribute, 2, gl.FLOAT, false,4*4,0);
		gl.vertexAttribPointer(this._uvAttribute, 2, gl.FLOAT, false,4*4,8);

		// Render chunk
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.vertexBuffer);
		gl.drawElements(gl.TRIANGLES, chunk.bufferSize*3, gl.UNSIGNED_SHORT, 0);
		
		// Unbind buffers
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
	}
	
	// Unbind textures:

	if (texture) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	// unbind shader program:
	this._shaderProgram.unbind(gl);
}


ChunkRenderer.prototype.loadTexture = function(gl) {
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
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			image.webglTexture = texture;
		};
		return image;
	};

	this._texture = get_texture("game/textures/ground.png");
}


ChunkRenderer.prototype.genMesh = function(chunkX, chunkY) {
	var gl = this._gl;

	var chunk = this._chunkManager.getChunk(chunkX, chunkY);
	if (!chunk)
		return;

	//if (chunk.vertexBuffer != undefined)
	//	return;

	//if (chunkX != 0 || chunkY != 0)
	//	return;

	var vertices = [];
	var numVertices = 0;
	var vertexTable = {};
	var indices = [];

	var Triangle = function(a, b, c, aUV, bUV, cUV, borderSide) {
		this.vertices = [a, b, c];
		this.uv = [aUV, bUV, cUV];
		this.borderSide = borderSide;
		return this;
	};
	var baseTriangles = [];

	var that = this;
	var getTileID = function(x, y) {
		if (x < 0 || y < 0 || x >= that._chunkSize || y >= that._chunkSize) {
			if (that._chunkManager.getDensity(x + chunkX*that._chunkSize, y + chunkY*that._chunkSize) < 128)
				return 0;
			return 1+that._chunkManager.getTileId(x + chunkX*that._chunkSize, y + chunkY*that._chunkSize);
		}
		else {
			if (chunk.getDensity(x, y) < 128)
				return 0;
			return 1+chunk.getTileId(x, y);
		}
	};

	// Generate base triangles:
	for (var y = 0; y < this._chunkSize; ++y) {
		for (var x = 0; x < this._chunkSize; ++x) {
			var tileID = getTileID(x, y);

			if (tileID == 0)
				continue;

			var x1 = (x)*this._tileSize;
			var x2 = (x+1.0)*this._tileSize;
			var y1 = (y)*this._tileSize;
			var y2 = (y+1.0)*this._tileSize;

			var uv = [x, y];
			var textureBlockSize = 32.0;
			v2.divide(uv, textureBlockSize, uv);
			v2.divide(uv, 4.0, uv);
			v2.mod(uv, 1.0/4.0, uv);
			uv[0] += (tileID % 4)/4.0;
			uv[1] += Math.floor(tileID / 4.0)/4.0;

			

			// Corner vectors
			var a = [x1, y1];
			var b = [x2, y1];
			var c = [x2, y2];
			var d = [x1, y2];
			var uvA = [0/4.0/textureBlockSize, 0/4.0/textureBlockSize];     v2.add(uvA, uv, uvA);// v2.mod(uvA, 1.0/4.0, uvA);
			var uvB = [1/4.0/textureBlockSize, 0/4.0/textureBlockSize];     v2.add(uvB, uv, uvB);// v2.mod(uvB, 1.0/4.0, uvB);
			var uvC = [1/4.0/textureBlockSize, 1/4.0/textureBlockSize];     v2.add(uvC, uv, uvC);// v2.mod(uvC, 1.0/4.0, uvC);
			var uvD = [0/4.0/textureBlockSize, 1/4.0/textureBlockSize];     v2.add(uvD, uv, uvD);// v2.mod(uvD, 1.0/4.0, uvD);
			var uvM = [0.5/4.0/textureBlockSize, 0.5/4.0/textureBlockSize]; v2.add(uvM, uv, uvM);// v2.mod(uvM, 1.0/4.0, uvM);


			// Middle vector
			var m = [0.5*x1+0.5*x2, 0.5*y1+0.5*y2];

			// TileID's of borders
			var abTile = getTileID(x+1, y);
			var bcTile = getTileID(x, y+1);
			var cdTile = getTileID(x-1, y);
			var daTile = getTileID(x, y-1);

			// Border factors.
			var abFactor = (abTile == tileID)? 0 : 1;
			var bcFactor = (bcTile == tileID)? 0 : 1;
			var cdFactor = (cdTile == tileID)? 0 : 1;
			var daFactor = (daTile == tileID)? 0 : 1;

			// We need 4 triangles per tile if both sides at any direction are different.
			if ((abTile != tileID && cdTile != tileID) ||
			    (bcTile != tileID && daTile != tileID)) {
				
				// Create 4 triangles: 
				baseTriangles.push(new Triangle(a, b, m, uvA, uvB, uvM, abFactor));
				baseTriangles.push(new Triangle(b, c, m, uvB, uvC, uvM, bcFactor));
				baseTriangles.push(new Triangle(c, d, m, uvC, uvD, uvM, cdFactor));
				baseTriangles.push(new Triangle(d, a, m, uvD, uvA, uvM, daFactor));
			}
			else {
				// Create 2 triangles: 
				baseTriangles.push(new Triangle(a, b, c, uvA, uvB, uvC, abFactor+2.0*bcFactor));
				baseTriangles.push(new Triangle(c, d, a, uvC, uvD, uvA, cdFactor+2.0*daFactor));
			}
		}
	}

	/*var moveVertex = function(that, vertex) {
		var x = vertex[0]/32.0;
		var y = vertex[1]/32.0;

		var density = 0.5;// - that._chunkManager.calcDensity(x-0.0, y-0.0)/255.0;
		if (density == -0.5)
			return;
		var normal = that._chunkManager.calcNormal(x-0.5, y-0.5);
		var dir = v2.clone(normal);
		v2.multiply(-1.0, dir, dir);

		var pos = [x, y];

		var delta = v2.clone(dir);
		v2.multiply(density, delta, delta);
		//v2.multiply(8.0/that._chunkSize, delta, delta);
		v2.add(delta, pos, pos);

	


		vertex[0] = pos[0]*32.0;
		vertex[1] = pos[1]*32.0;
	}*/

	// Generate vertices and indices buffer
	for (var i = 0; i < baseTriangles.length; ++i) {
		var triangle = baseTriangles[i];

		for (var j = 0; j < 3; ++j) {
			var vertex = triangle.vertices[j];
			var uv = triangle.uv[j];
			var vertexKey = vertex[0].toString() + ":" + vertex[1].toString();
			var index;

			/*{//if (triangle.borderSide != 0.0) {
				moveVertex(this, vertex);
			}*/

			/*if (vertexTable.hasOwnProperty(vertexKey)) {
				index = vertexTable[vertexKey];
			}
			else*/ {
				index = numVertices;
				numVertices++;
				vertexTable[vertexKey] = index;

				// Add vertex to vertices
				vertices.push(vertex[0]);
				vertices.push(vertex[1]);
				vertices.push(uv[0]);
				vertices.push(uv[1]);
			}

			indices.push(index);
		}
	}

	// Move vertices
	/*for (var i = 0; i < vertices.length/2; ++i) {
		var x = vertices[i*2]/32.0;
		var y = vertices[i*2+1]/32.0;

		var density = 0.5 - this._chunkManager.calcDensity(x-0.5, y-0.5)/255.0;
		if (density == -0.5)
			continue;
		var normal = this._chunkManager.calcNormal(x-0.5, y-0.5);
		var dir = v2.clone(normal);
		v2.multiply(-1.0, dir, dir);

		var pos = [x, y];

		var delta = v2.clone(dir);
		v2.multiply(density, delta, delta);
		//v2.multiply(8.0/this._chunkSize, delta, delta);
		v2.add(delta, pos, pos);

	


		vertices[i*2] = pos[0]*32.0;
		vertices[i*2+1] = pos[1]*32.0;

	}*/

	// Generate Index buffer:
	//if (!chunk.indexBuffer)
		chunk.indexBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, chunk.indexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,
		new Float32Array(vertices),
		gl.STATIC_DRAW);

	// Generate Vertex buffer:
	//if (!chunk.vertexBuffer)
		chunk.vertexBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.vertexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		gl.STATIC_DRAW);

	chunk.bufferSize = indices.length/3;
	chunk.isRenderChanged = false;
	//console.log("Num triangles: " + chunk.bufferSize);
	//console.log("Num vertices: " + numVertices);

}

/* Is called whenever a chunk is changed or created.
 * Subscribed by ChunkManager
 */
ChunkRenderer.prototype.onChunkChange = function(x, y, chunk) {
	var that = this;
	var l = function(x, y) {
		var chunk = that._chunkManager.getChunk(x, y);
		if (chunk)
			chunk.isRenderChanged = true;
	}

	// Rebuild meshes:
	l(x, y);	
	l(x+1, y);
	l(x-1, y);
	l(x, y+1);
	l(x, y-1);
}