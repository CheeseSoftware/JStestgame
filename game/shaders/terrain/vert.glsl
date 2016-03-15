attribute vec2 a_position;

uniform mat3 vpMatrix;
uniform mat3 modelMatrix;

uniform vec2 u_resolution;
 
void main() {

    // convert from pixels to clipspace
   vec2 zeroToOne = a_position / u_resolution;
   vec2 zeroToTwo = zeroToOne * 2.0;
   vec2 clipSpace = zeroToTwo - 1.0;
    
    gl_Position = vec4(vec3(clipSpace * vec2(1, -1), 0) * modelMatrix * vpMatrix, 1);
}