#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uOpacity;

in vec2 vUV;
out vec4 fragColor;

void main() {
  // Animated gradient based on position and time
  vec2 uv = vUV;
  
  float r = 0.5 + 0.5 * sin(uTime * 0.3 + uv.x * 3.0);
  float g = 0.5 + 0.5 * sin(uTime * 0.4 + uv.y * 3.0 + 1.0);
  float b = 0.5 + 0.5 * sin(uTime * 0.5 + (uv.x + uv.y) * 2.0 + 2.0);
  
  fragColor = vec4(r, g, b, uOpacity);
}
