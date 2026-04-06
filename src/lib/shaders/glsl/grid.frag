#version 300 es
precision highp float;

uniform vec2  uResolution;
uniform float uCellSize;
uniform float uOpacity;
uniform int   uGridType;   // 0 = square, 1 = hex, 2 = gridless
uniform vec3  uColor;
uniform vec2  uOffset;     // pan offset in pixels
uniform float uZoom;       // zoom factor

in  vec2 vUV;
out vec4 fragColor;

// ── helpers ──

float squareGrid(vec2 p, float size) {
  vec2 g = abs(fract(p / size) - 0.5);
  float lineW = 1.0 / size;
  float d = min(g.x, g.y);
  return 1.0 - smoothstep(0.0, lineW * 1.5, d);
}

// hexDist must be declared before hexGrid which calls it
float hexDist(vec2 p, float size) {
  p = abs(p);
  float c = dot(p, normalize(vec2(1.0, 1.7320508)));
  c = max(c, p.x);
  return c - size;
}

float hexGrid(vec2 p, float size) {
  // Flat-top hex tiling
  float h = size * 1.7320508;  // sqrt(3)
  float w = size * 1.5;

  // Two offset rows of hexes
  vec2 a = mod(p, vec2(w * 2.0, h)) - vec2(w, h * 0.5);
  vec2 b = mod(p - vec2(w, h * 0.5), vec2(w * 2.0, h)) - vec2(w, h * 0.5);

  float da = hexDist(a, size);
  float db = hexDist(b, size);
  float d  = min(da, db);

  float lineW = 1.0 / size;
  return 1.0 - smoothstep(0.0, lineW * 1.5, d);
}

// ── main ──

void main() {
  vec2 pixel = vUV * uResolution;
  // Apply pan and zoom
  vec2 world = (pixel - uOffset) / uZoom;

  float alpha = 0.0;

  if (uGridType == 0) {
    // Square grid
    alpha = squareGrid(world, uCellSize) * uOpacity;
  } else if (uGridType == 1) {
    // Hex grid
    alpha = hexGrid(world, uCellSize) * uOpacity;
  }
  // uGridType == 2 → gridless → alpha stays 0

  fragColor = vec4(uColor, alpha);
}
