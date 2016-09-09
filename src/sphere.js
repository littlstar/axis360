'use strict'

/**
 * Module dependencies.
 */

import { SphereCommand } from './commands'
import glsl from 'glslify'

export function Sphere(ctx, opts = {}) {
  return new SphereCommand(ctx, opts)
}
