#version 100

uniform sampler2D densityTexture;
uniform sampler2D tileTexture;
uniform sampler2D texture;

varying highp vec2 fragUv;
varying highp vec2 fragPos;

void main() {
	gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}