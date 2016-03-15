#version 100

varying highp vec2 fragPos;

void main() {
  gl_FragColor = vec4(fragPos, 0, 1);  // green
}