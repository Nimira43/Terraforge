uniform vec3 uColourWaterDeep;
uniform vec3 uColourWaterSurface;
uniform vec3 uColourSand;
uniform vec3 uColourGrass;
uniform vec3 uColourSnow;
uniform vec3 uColourRock;

varying vec3 vPosition;
varying float vUpDot;

#include ../includes/simplexNoise2d.glsl

void main() {
  vec3 colour = vec3(1.0);
  float surfaceWaterMix = smoothstep(-1.0, -0.1, vPosition.y);
  colour = mix(uColourWaterDeep, uColourWaterSurface, surfaceWaterMix);
  float sandMix = step(-0.1, vPosition.y);
  colour = mix(colour, uColourSand, sandMix);
  float grassMix = step(-0.06, vPosition.y);
  colour = mix(colour, uColourGrass, grassMix);
  
  float rockMix = vUpDot;
  rockMix = 1.0 - step(0.8, rockMix);
  rockMix *= step(-0.06, vPosition.y);
  colour = mix(colour, uColourRock, rockMix);

  float snowThreshold = 0.45;
  snowThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.1;
  float snowMix = step(snowThreshold, vPosition.y);
  colour = mix(colour, uColourSnow, snowMix);

  csm_DiffuseColor = vec4(colour, 1.0);

}