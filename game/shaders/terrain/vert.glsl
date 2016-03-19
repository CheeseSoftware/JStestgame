#version 100

attribute vec2 a_position;
attribute vec2 a_uv;

uniform mat3 vpMatrix;
uniform mat3 modelMatrix;

uniform vec2 u_resolution;

varying highp vec2 fragUv;
varying highp vec2 fragPos;
 
void main() {

    vec2 position = (vec3(a_position, 1) * vpMatrix * modelMatrix).xy;

    // convert from pixels to clipspace
    vec2 clipSpace = (position / u_resolution * 2.0) - 1.0;
    
    gl_Position = vec4(vec3(clipSpace * vec2(1, -1), 0), 1);
    fragUv = a_uv;
    fragPos = (vec3(a_position, 1) * modelMatrix).xy;
}