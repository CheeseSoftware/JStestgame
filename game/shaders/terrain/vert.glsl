#version 100

attribute vec2 a_position;
attribute vec2 a_uv;

uniform mat3 vpMatrix;
uniform mat3 modelMatrix;

uniform vec2 u_resolution;

varying highp vec2 fragUv;
varying highp vec2 fragPos;
 
void main() {

    vec2 position = (vec3(a_position, 1) * modelMatrix * vpMatrix).xy;

    // convert from pixels to clipspace
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    
    gl_Position = vec4(vec3(clipSpace * vec2(1, -1), 0), 1);
    //gl_Position = vec4(vec3(a_position, 1.0)*modelMatrix*vpMatrix, 1.0);
    fragUv = a_uv;
    fragPos = (vec3(a_position, 1) * modelMatrix).xy/32.0/30.0;
}