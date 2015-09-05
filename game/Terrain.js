Terrain = function(gl, sizeX, sizeY) {
	
	this._sizeX = sizeX;
	this._sizeY = sizeY;
	this._densityField = DensityField(sizeX, sizeY);
	
	var vertexShader = new Shader("terrain/vert.glsl", gl.VERTEX_SHADER);
	var fragmentShader = new Shader("terrain/frag.glsl", gl.FRAGMENT_SHADER);
	var shaders = [vertexShader, fragmentShader];
	this._shaderProgram = new ShaderProgram(shaders);
}

Terrain.prototype.render = function(gl) {
	
	if (!this._shaderProgram.isReady())
		this._shaderProgram.tryLink(gl);
		
	if (this._shaderProgram.isReady()) {
	
		
	}
}