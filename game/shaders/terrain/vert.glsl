#version 100

attribute vec2 aPosition;
attribute vec2 aUV;

uniform mat3 matrix;

varying highp vec2 uv;

void main() {
	gl_Position = vec4(vec3(aPosition, 1.0)*matrix, 1.0);
	uv = aUV;
}