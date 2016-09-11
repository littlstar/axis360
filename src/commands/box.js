'use strict'

/**
 * Module dependencies.
 */

import { BoxGeometry } from '../geometry/box'
import { ObjectCommand } from './object'
import mat4 from 'gl-mat4'
import glsl from 'glslify'

/**
 * Box function.
 *
 * @see BoxCommand
 */

export default (...args) => new BoxCommand(...args)

/**
 * BoxCommand class.
 *
 * @public
 * @class BoxCommand
 * @extends ObjectCommand
 */

export class BoxCommand extends ObjectCommand {
  constructor(ctx, opts = {}) {
    const geometry = new BoxGeometry(opts.geometry)
    const uniforms = {}
    super(ctx, {
      ...opts,
      type: 'box',
      uniforms,
      geometry,
    })
  }
}
