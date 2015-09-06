TerrainRenderer = function(gl, pageSizeX, pageSizeY) {
	this._pageSizeX = pageSizeX;
	this._pageSizeY = pageSizeY;
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
	this._matrixUniform = 0;
	this._isReady = false;
}

TerrainRenderer.prototype.lazyInit = function(gl) {
	if (!this._shaderProgram.isReady())
		this._shaderProgram.tryLink(gl);
		
	if (this._shaderProgram.isReady()) {
		if (this._buffer == null) {
			/*========================= THE TRIANglE ========================= */
			//POINTS :
			var size = 32*32;
			
			var triangle_vertex=[
				-size,-size,
				-1,-1,
				size,-size,
				1,-1,
				-size,size,
				-1,1,
				size,size,
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
			this._matrixUniform = this._shaderProgram.getUniformLocation(gl, "matrix");
			
			 this._isReady = true;
		}
	}
}

/* Render terrain.
 * gl: webgl context
 * vpMatrix: View-projection-matrix.
 * pages: array of pages to render.
 * texture: texture of terrain.
 */
TerrainRenderer.prototype.render = function(gl, vpMatrix, pages, texture) {
	// Lazy init
	if (!this._isReady)
		this.lazyInit(gl);
	
	// Make sure the renderer is ready.
	if (!this._isReady)
		return;
		
	// Bind shader program:
	this._shaderProgram.bind(gl);

	// Loop through every page
	for (var i = 0; i < pages.length; ++i) {
		var page = pages[i];
		
		if (!page)
			continue;
		
		// Lazy init of page texture.
		if (page.texture == undefined) {
			page.texture = gl.createTexture();
			
			gl.bindTexture(gl.TEXTURE_2D, page.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this._pageSizeX, this._pageSizeY, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, page.data);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.bindTexture(gl.TEXTURE_2D, null);
			
			page.isChanged = false;
		}
	
		// Update density texture
		if (page.isChanged) {
			gl.bindTexture(gl.TEXTURE_2D, page.texture);
			//gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._pageSizeX, this.pageSizeY, gl.LUMINANCE, gl.UNSIGNED_BYTE, page.data);
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this._pageSizeX, this._pageSizeY, gl.LUMINANCE, gl.UNSIGNED_BYTE, page.data);
			gl.bindTexture(gl.TEXTURE_2D, null);
			
			page.isChanged = false; 
		}
		
		/********************************************************
		 * Render the page:
		 ********************************************************/
		
		// MVP matrix
		var modelMatrix = PIXI.Matrix.IDENTITY.clone().translate(page.x*this._pageSizeX*64.0,page.y*this._pageSizeY*64.0);
		var mvpMatrix = vpMatrix.clone().append(modelMatrix);
		// Bind matrix
		gl.uniformMatrix3fv(this._matrixUniform, false, mvpMatrix.toArray());
		
		
		
		// Bind textures
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, page.texture);
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

		// Render page
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