precision highp float;

/**
 * Shader uniforms.
 */

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

/**
 * Shader IO.
 */

#ifdef HAS_POSITIONS
attribute vec3 position;
varying vec3 vposition;
#endif

#ifdef HAS_NORMALS
attribute vec3 normal;
varying vec3 vnormal;
#endif

#ifdef HAS_UVS
attribute vec2 uv;
varying vec2 vuv;
#endif

/**
 * Shader entry.
 */

#pragma glslify: export(main)
void main() {
#ifdef HAS_POSITIONS
  gl_Position = projection * view * model * vec4(position, 1.0);
#elif defined HAS_NORMALS
  gl_Position = projection * view * model * vec4(normal, 1.0);
#elif defined HAS_UVS
  gl_Position = projection * view * model * vec4(vec3(uv, 1.0), 1.0);
#endif

#ifdef HAS_POSITIONS
  vposition = position;
#endif

#ifdef HAS_NORMALS
  vnormal = normal;
#endif

#ifdef HAS_UVS
  vuv = uv;
#endif
}
