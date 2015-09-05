/* Loads and compiles a shader.
 * filePath: a path relative to /shaders/.
 * type: a shader type.
 */
Shader = function(filePath, type) {
	
	this._glShader = null;
	this._source = null;
	this._type = type;
	
	var client = new XMLHttpRequest();
	client.open('GET', 'game/shaders/' + filePath);
	client.onreadystatechange = (function() {
		this._source = client.responseText;
	}).bind(this);
	client.send();
}

Shader.prototype.getGL = function() {
	return this._glShader;
}

/* Returns whether the shader is ready to use.
 * Compile shader to make it ready to use, but remember that the shader need to download its source from the server.
 */
Shader.prototype.isReady = function() {
	return (this._glShader != null);
}

/* Compiles the shader, but only if the source has been loaded from the server.
 */
Shader.prototype.tryCompile = function(gl) {
	
	if (this._glShader == null && this._source != null) {
		var shader = gl.createShader(this._type);
		gl.shaderSource(shader, this._source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		  console.log("ERROR IN "+ " SHADER : " + gl.getShaderInfoLog(shader));
		  return false;
		}
		this._glShader = shader;
		return true;
	}
	return false;
}