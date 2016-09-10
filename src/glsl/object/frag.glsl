precision mediump float;

/**
 * Shader uniforms.
 */

uniform vec4 color;
#ifdef HAS_IMAGE
uniform sampler2D image;
#endif

/**
 * Shader outputs
 */

varying vec2 vuv;

/**
 * Shader entry.
 */

#pragma glslify: export(main)
void main() {
#ifdef HAS_IMAGE
  gl_FragColor = vec4(texture2D(image, vuv).rgb, 1.0);
#else
  gl_FragColor = color;
#endif
}
