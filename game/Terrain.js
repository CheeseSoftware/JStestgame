Terrain = function(gl, sizeX, sizeY, texturePath) {
	
	this._sizeX = sizeX;
	this._sizeY = sizeY;
	this._densityField = new DensityField(sizeX, sizeY);
	this._densityField.array.set(1, 1, 0);
	this._texturePath = texturePath;
	this._texture = null;
	this._densityTexture = null;
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
}

Terrain.prototype.fillCircle = function(xPos, yPos, radius, density) {

	var intR = parseInt(radius+0.5);

	for (var yy = -intR; yy < intR; ++yy) {
		for (var xx = -intR; xx < intR; ++xx) {
			var x = xPos + xx;
			var y = yPos + yy;
		
			var dis = Math.sqrt(xx*xx + yy*yy);
			if (dis > radius)
				continue;
			
			var oldDensity = this._densityField.array.get(x+intR, y+intR);
				
			var fillStrength = Math.min(radius-dis, 1.0);
			var intDensity = density;//parseInt((fillStrength*255 - oldDensity)*density/255);
			this._densityField.array.set(x+intR, y+intR, density);
		}
	}
}

Terrain.prototype.render = function(gl, camera, vpMatrix) {
	
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
				this._densityTexture = texture;
			 }
			 {
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
		}
		
		// MVP Matrix
		var modelMatrix = PIXI.Matrix.IDENTITY;
		var mvpMatrix = modelMatrix * vpMatrix;
		
		this._shaderProgram.bind(gl);
		
		// Uniforms:
		gl.uniform1i(this._densityTextureUniform, 0);
		gl.uniform1i(this._textureUniform, 1);
		var view = [camera.x, camera.y, camera.x + camera.width, camera.y + camera.height];
		gl.uniformMatrix3fv(this._matrixUniform, false, vpMatrix.toArray());//view[0], view[1], view[2], view[3]);
		
		//Textures:
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._densityTexture);
		if (this._texture.webglTexture) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this._texture.webglTexture);
		}
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this._indexBuffer);


		gl.vertexAttribPointer(this._positionAttribute, 2, gl.FLOAT, false,4*4,0) ;
		gl.vertexAttribPointer(this._uvAttribute, 2, gl.FLOAT, false,4*4,8) ;

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this._shaderProgram.unbind(gl);
	}
}