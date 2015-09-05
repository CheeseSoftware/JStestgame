Terrain = function(gl, sizeX, sizeY) {
	
	this._sizeX = sizeX;
	this._sizeY = sizeY;
	this._densityField = new DensityField(sizeX, sizeY);
	this._densityField.array.set(1, 1, 0);
	// DIg a hole
	for (var y = -16; y < 16; ++y) {
		for (var x = -16; x < 16; ++x) {
			var dis = Math.sqrt(x*x + y*y);
			var density = Math.min(12.0-dis, 1.0);
			var intDensity = 255 - parseInt(density*255);
			if (dis <= 12.0)
				this._densityField.array.set(x+16, y+16, intDensity);
		}
	}
	this._buffer = null;
	this._indexBuffer = null;
	
	var vertexShader = new Shader("terrain/vert.glsl", gl.VERTEX_SHADER);
	var fragmentShader = new Shader("terrain/frag.glsl", gl.FRAGMENT_SHADER);
	var shaders = [vertexShader, fragmentShader];
	this._shaderProgram = new ShaderProgram(shaders);
	
	// Attribute locations:
	this._positionAttribute = 0;
	// Uniform locations:
	this._densityTextureUniform = 0;
}

Terrain.prototype.render = function(gl) {
	
	if (!this._shaderProgram.isReady())
		this._shaderProgram.tryLink(gl);
		
	if (this._shaderProgram.isReady()) {
		if (this._buffer == null) {
			/*========================= THE TRIANglE ========================= */
			//POINTS :
			var triangle_vertex=[
				-1,-1, //first summit -> bottom left of the viewport
				1,-1, //bottom right of the viewport
				-1,1, //top left of the viewport
				1,1,  //top right of the viewport
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
			this._positionAttribute = this._shaderProgram.getAttributeLocation(gl, "position");
			
			// Get uniform locations
			this._densityTextureUniform = this._shaderProgram.getUniformLocation(gl, "densityTexture");
			//gl.uniform1i(this._densityTextureUniform, 0);
			
			/***********************************************************
			 * Load density texture : 
			 ***********************************************************/
			 {
				var texture = gl.createTexture();

				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 32, 32, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, this._densityField.array.getPage(0, 0).data);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.bindTexture(gl.TEXTURE_2D, null);
				this._texture = texture;
			 }
		}
		
		this._shaderProgram.bind(gl);
		
		// Uniforms:
		gl.uniform1i(this._densityTextureUniform, 0);
		
		//Textures:
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this._indexBuffer);

		gl.vertexAttribPointer(this._positionAttribute, 2, gl.FLOAT, false,4*2,0) ;

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this._shaderProgram.unbind(gl);
	}
}