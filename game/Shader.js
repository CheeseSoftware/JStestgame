/* Loads and compiles a shader.
 * filePath: a path relative to /shaders/.
 * type: a shader type.
 */
Shader = function(filePath, type) {
	
	this._glShader = null;
	this._source = null;
	this._type = type;
	
	var client = new XMLHttpRequest();
	client.open('GET', '/shaders/' + filePath + '.txt');
	client.onreadystatechange = function() {
		this._source = client.responseText;
	}
	client.send();
}

Shader.prototype.getgl() {
	return this._glShader;
}

/* Returns whether the shader is ready to use.
 * Compile shader to make it ready to use, but remember that the shader need to download its source from the server.
 */
Shader.prototype.isReady() {
	return (this._glShader != null);
}

/* Compiles the shader, but only if the source has been loaded from the server.
 */
Shader.prototype.tryCompile(gl) {
	
	if (_glShader == null && _shaderSource != null) {
		var shader = gl.createShader(this._type);
		gl.source(shader, this._source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		  alert("ERROR IN "+ " SHADER : " + gl.getShaderInfoLog(shader));
		  return false;
		}
		this._glShader = shader;
		return true;
	}
	return false;
}