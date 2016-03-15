#version 100

attribute vec2 a_position;

uniform mat3 vpMatrix;
uniform mat3 modelMatrix;

uniform vec2 u_resolution;

varying highp vec2 fragPos;
 
void main() {

    vec2 position = (vec3(a_position, 1) * modelMatrix * vpMatrix).xy;

    // convert from pixels to clipspace
   vec2 zeroToOne = position / u_resolution;
   vec2 zeroToTwo = zeroToOne * 2.0;
   vec2 clipSpace = zeroToTwo - 1.0;
    
    gl_Position = vec4(vec3(clipSpace * vec2(1, -1), 0), 1);
    fragPos = vec2(mod(a_position.x,2569.0), mod(a_position.y,2569.0));
}