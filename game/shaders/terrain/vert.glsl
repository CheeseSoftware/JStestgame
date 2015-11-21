#version 100

attribute vec2 aPosition;
attribute vec2 aUV;
attribute vec2 aTilePos;

uniform mat3 vpMatrix;
uniform mat3 modelMatrix;

varying highp vec2 fragTilePos;
varying highp vec2 fragPos;
varying highp vec2 fragLocalPos;
varying highp vec2 fragUV;

void main() {
	gl_Position = vec4(vec3(aPosition, 1.0)*modelMatrix*vpMatrix, 1.0);
	fragTilePos = aUV;
	fragUV = (aTilePos*30.0+1.0)/32.0;
	fragPos = (vec3(aPosition, 1.0)*modelMatrix).xy/32.0/30.0;
	fragLocalPos = (aPosition/32.0+1.0)/32.0;
}