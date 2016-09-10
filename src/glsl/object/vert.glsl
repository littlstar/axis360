precision highp float;

/**
 * Shader uniforms.
 */

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

/**
 * Shader attributes.
 */

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

/**
 * Shader outputs
 */

varying vec3 vposition;
varying vec3 vnormal;
varying vec2 vuv;

/**
 * Shader entry.
 */

#pragma glslify: export(main)
void main() {
  gl_Position = projection * view * model * vec4(position, 1.0);
  vposition = position;
  vnormal = normal;
  vuv = uv;
}
