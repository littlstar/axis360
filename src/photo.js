'use strict'

/**
 * Module dependencies.
 */

import { PhotoCommand } from './commands'

/**
 * Creates a Photo from a context and source.
 *
 * @public
 * @param {Context}
 * @param {String} src
 * @return {PhotoCommand}
 */

export function Photo(ctx, src) {
  return new PhotoCommand(ctx, src)
}
