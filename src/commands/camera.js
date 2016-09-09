'use strict'

/**
 * Module dependencies.
 */

import createCameraRenderer from 'regl-camera'
import { ObjectCommand } from './object'

/**
 * CameraCommand class.
 *
 * @public
 * @class CameraCommand
 * @extends Command
 */

export class CameraCommand extends ObjectCommand {

  /**
   * Camera class constructor.
   *
   * @param {Function} renderer
   */

  constructor(ctx, opts) {
    let render = createCameraRenderer(ctx.regl, opts)
    super(ctx, {draw: (_, ...args) => render(...args)})
  }
}
