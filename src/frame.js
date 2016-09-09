'use strict'

/**
 * Module dependencies.
 */

import { FrameCommand } from './commands'

/**
 * Creates a FrameCommand function instance.
 *
 * @param {Context} ctx
 * @return {Function}
 */

export function Frame(ctx) {
  return new FrameCommand(ctx)
}
