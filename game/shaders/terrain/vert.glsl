#version 100

attribute vec2 position;

varying highp vec2 uv;

void main() {
	gl_Position = vec4(position, 0.0, 1.0);
	uv = position;
}