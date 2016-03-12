#version 100

attribute vec2 aPosition;
attribute vec2 aUV;

uniform mat3 viewMatrix;
uniform mat3 modelMatrix;

varying highp vec2 fragUv;
varying highp vec2 fragPos;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	gl_Position = vec4(rand(vec2(5,5)), rand(vec2(5,5)), rand(vec2(5,5)), rand(vec2(5,5)));
	fragUv = aUV;
	fragPos = (vec3(aPosition, 1.0)*modelMatrix).xy/32.0/30.0;
}