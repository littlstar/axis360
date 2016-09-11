'use strict'

/**
 * Module dependencies.
 */

import { SphereGeometry } from '../geometry/sphere'
import { ObjectCommand } from './object'
import mat4 from 'gl-mat4'
import glsl from 'glslify'

/**
 * SphereCommand constructor.
 * @see SphereCommand
 */

export default (...args) => new SphereCommand(...args)

/**
 * SphereCommand class.
 *
 * @public
 * @class SphereCommand
 * @extends ObjectCommand
 */

export class SphereCommand extends ObjectCommand {
  constructor(ctx, opts = {}) {
    const geometry = new SphereGeometry(opts)
    const defaults = {}
    const uniforms = {}

    super(ctx, {
      ...opts,
      type: 'sphere',
      defaults,
      uniforms,
      geometry,
    })
  }
}
