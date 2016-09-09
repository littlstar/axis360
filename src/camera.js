'use strict'

/**
 * Module dependencies.
 */

import { CameraCommand } from './commands'

/**
 * Creates a CameraCommand function instance.
 *
 * @param {Object} ctx
 * @param {(Object)?} opts
 * @return {Function}
 */

export function Camera(ctx, opts = {}) {
  return new CameraCommand(ctx, opts)
}
