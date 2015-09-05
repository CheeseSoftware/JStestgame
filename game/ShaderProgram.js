
/* Loads multiple shaders and links an useable shader program.
 * shaders: An array of shaders.
 */
ShaderProgram = function(shaders) {
	
	this._shaders = shaders;
	this._glProgram = null;
}

ShaderProgram.prototype.isReady = function() {
	return (this._glProgram != null);
}


/* Links the shaders to create a useable shader program, but only if all shaders are loaded! The shaderprogram will attempt to compile any uncompiled shader.
 */
ShaderProgram.prototype.tryLink = function(gl) {
	// Check all the shaders. Compile them if needed.
	var ready = true;
	//for (shader in this._shaders) {
	for (var i = 0; i < this._shaders.length; ++i) {
		if (!this._shaders[i].isReady()) {
			ready &= this._shaders[i].tryCompile(gl);
		}
	}
	if (!ready)
		return false;
	
	var shaderProgram = gl.createProgram();
	// Attach shaders:
	for (var i = 0; i < this._shaders.length; ++i) {
		gl.attachShader(shaderProgram, this._shaders[i].getGL());
	}
	
	gl.linkProgram(shaderProgram);
	this._glProgram = shaderProgram;
}

ShaderProgram.prototype.getUniformLocation = function(gl, uniformName) {
	// TODO: Create a hashtable of uniform locations.
	gl.getUniformLocation(shaderProgram, uniformName);
}

/* Bind the shader program before use. Don't forget to unbind the shader program!
 */
ShaderProgram.prototype.bind = function() {
	GL.useProgram(this._glProgram);
}

/* Unbind after use!
 */
ShaderProgram.prototype.unbind = function() {
	GL.useProgram(0);
}