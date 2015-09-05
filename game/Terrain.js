Terrain = function(gl, sizeX, sizeY) {
	
	this._sizeX = sizeX;
	this._sizeY = sizeY;
	this._densityField = DensityField(sizeX, sizeY);
	this._buffer = null;
	this._indexBuffer = null;
	
	var vertexShader = new Shader("terrain/vert.glsl", gl.VERTEX_SHADER);
	var fragmentShader = new Shader("terrain/frag.glsl", gl.FRAGMENT_SHADER);
	var shaders = [vertexShader, fragmentShader];
	this._shaderProgram = new ShaderProgram(shaders);
	
	this._positionAttribute = 0;
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
			
			this._positionAttribute = this._shaderProgram.getAttributeLocation(gl, "position");
		}
		
		this._shaderProgram.bind(gl);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this._indexBuffer);

		gl.vertexAttribPointer(this._positionAttribute, 2, gl.FLOAT, false,4*2,0) ;

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffer);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this._shaderProgram.unbind(gl);
		
		gl.flush();
	}
}