'use strict'

/**
 * Module dependencies.
 */

import { MediaCommand } from './commands'
import resl from 'resl'
import raf from 'raf'

/**
 * Creates a MediaCommand function instance.
 *
 * @param {Object} ctx
 * @param {Object} manifest
 * @return {Function}
 */

export function Media(ctx, manifest) {
  return new MediaCommand(ctx, manifest)
}
