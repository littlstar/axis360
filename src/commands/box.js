'use strict'

/**
 * Module dependencies.
 */

import { BoxGeometry } from '../geometry/box'
import { ObjectCommand } from './object'
import mat4 from 'gl-mat4'
import glsl from 'glslify'

/**
 * BoxCommand constructor.
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
    const uniforms = {
    }

    if (opts.image) {
      uniforms.image = opts.image && opts.image.texture ?
        opts.image.texture :
        opts.image
    }

    super(ctx, {
      type: 'box',
      uniforms,
      geometry,
    })
  }
}
