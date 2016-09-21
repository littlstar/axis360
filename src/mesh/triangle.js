'use strict'

/**
 * Module dependencies.
 */

import { TriangleGeometry } from '../geometry/triangle'
import { MeshCommand } from '../mesh'
import glsl from 'glslify'

// @TODO(werle) - move this into a glsl file
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
 * TriangleCommand constructor.
 * @see TriangleCommand
 */

export default (...args) => new TriangleCommand(...args)

/**
 * TriangleCommand class.
 *
 * @public
 * @class TriangleCommand
 * @extends Command
 */

export class TriangleCommand extends MeshCommand {
  constructor(ctx, opts = {}) {
    const geometry = new TriangleGeometry(opts.geometry)
    super(ctx, { ...opts, count: 3, type: 'triangle', geometry, vert })
  }
}
