'use strict'

/**
 * Module dependencies.
 */

import { Command } from './command'

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
    const color = ctx.regl.texture({mag: 'linear'})
    const fbo = ctx.regl.framebuffer({color})

    //const render = ctx.regl({
      //fbo
    //})

    super((_, refresh) => {
      ctx.regl.frame((reglCtx, ...args) => {
        Object.assign(this, reglCtx)
        ctx.time = reglCtx.time
        ctx.update(() => {
          if ('function' == typeof refresh) {
            refresh(ctx, reglCtx, ...args)
          }
        })
      })
    })
  }
}
