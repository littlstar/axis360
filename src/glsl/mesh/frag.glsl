precision mediump float;

/**
 * Shader uniforms.
 */

uniform vec4 color;

#ifdef HAS_MAP
uniform sampler2D map;
#endif

/**
 * Shader IO.
 */

#ifdef HAS_POSITIONS
varying vec3 vposition;
#endif

#ifdef HAS_NORMALS
varying vec3 vnormal;
#endif

#ifdef HAS_UVS
varying vec2 vuv;
#endif

/**
 * Shader entry.
 */

#pragma glslify: export(main)
void main() {
#if defined(HAS_MAP) && defined(HAS_UVS)
  gl_FragColor = texture2D(map, vuv);
#else
  gl_FragColor = color;
#endif
}
