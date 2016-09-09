'use strict'

/**
 * Module dependencies.
 */

import { TriangleCommand } from './commands'
import glsl from 'glslify'

export function Triangle(ctx, opts = {}) {
  return new TriangleCommand(ctx, opts)
}
