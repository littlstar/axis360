'use strict'

/**
 * Module dependencies.
 */

import { Command } from './command'

/**
 * FrameCommand class.
 *
 * @public
 */

export class FrameCommand extends Command {

  /**
   * FrameCommand class constructor.
   *
   * @param {Context} ctx
   */

  constructor(ctx) {
    super((_, refresh) => {
      this.ctx.regl.frame((...args) => {
        ctx.update(() => {
          if ('function' == typeof refresh) {
            refresh(ctx, ...args)
          }
        })
      })
    })

    this.ctx = ctx
  }
}
