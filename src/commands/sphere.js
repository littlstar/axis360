'use strict'

/**
 * Module dependencies.
 */

import { SphereGeometry } from '../geometry/sphere'
import { ObjectCommand } from './object'
import mat4 from 'gl-mat4'
import glsl from 'glslify'

/**
 * SphereCommand class.
 *
 * @public
 * @class SphereCommand
 * @extends ObjectCommand
 */

export class SphereCommand extends ObjectCommand {
  constructor(ctx, opts = {}) {
    const geometry = new SphereGeometry(opts.geometry)
    const defaults = {color: [0, 0, 1, 1]}
    const uniforms = {
      image: opts.image && opts.image.texture ? opts.image.texture : opts.image,
      color: ctx.regl.prop('color')
    }

    super(ctx, {
      type: 'sphere',
      defaults,
      uniforms,
      geometry,
    })
  }
}
