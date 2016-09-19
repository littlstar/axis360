'use strict'

/**
 * Module dependencies.
 */

import { Command } from './command'
import { define } from '../utils'

/**
 * FrameCommand constructor.
 * @see FrameCommand
 */

export default (...args) => new FrameCommand(...args)

/**
 * FrameCommand class.
 *
 * @public
 * @class FrameCommand
 * @extends Command
 */

export class FrameCommand extends Command {

  /**
   * FrameCommand class constructor.
   *
   * @param {Context} ctx
   */

  constructor(ctx, opts = {}) {
    // @TODO(werle) - use framebuffer

    let tick = null
    let isRunning = false
    let reglContext = null

    const queue = []

    super((_, refresh) => {
      this.start()
      queue.push(refresh)
    })

    /**
     * Starts the frame loop.
     *
     * @return {FrameCommand}
     */

    this.start = () => {
      if (isRunning) { return this }
      tick = ctx.regl.frame((_, ...args) => {
        reglContext = _

        ctx.clear()
        for (let refresh of queue) {
          if ('function' == typeof refresh) {
            refresh(reglContext, ...args)
          }
        }

      })
      return this
    }
  }
}
