'use strict'

/**
 * Module dependencies.
 */

import { TriangleGeometry } from '../geometry/triangle'
import { ObjectCommand } from './object'
import glsl from 'glslify'

const vert = `
precision mediump float;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

attribute vec2 position;
void main() {
  gl_Position = projection * view * model * vec4(position, 0.0, 1.0);
}
`

/**
 * TriangleCommand class.
 *
 * @public
 * @class TriangleCommand
 * @extends Command
 */

export class TriangleCommand extends ObjectCommand {
  constructor(ctx, opts = {}) {
    const geometry = new TriangleGeometry(opts.geometry)
    const uniforms = {color: ctx.regl.prop('color')}
    const defaults = {color: [0, 0, 1, 1]}

    super(ctx, {
      type: 'triangle',
      defaults,
      uniforms,
      geometry,
      count: 3,
      vert,
      regl: {}
    })
  }
}
