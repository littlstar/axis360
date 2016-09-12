'use strict'

/**
 * Module dependencies.
 */

import { Command } from './command'
import { define } from '../utils'
import events from 'dom-events'

/**
 * Orientation function.
 *
 * @see OrientationCommand
 */

export default (...args) => new OrientationCommand(...args)

/**
 * OrientationCommand class
 *
 * @public
 * @class OrientationCommand
 * @extends Command
 */

export class OrientationCommand extends Command {

  /**
   * OrientationCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?) opts
   */

  constructor(ctx, opts = {}) {
    super((_, block) => {
      if ('function' == typeof block) {
        block(this)
      }
    })

    /**
     * Orientation state.
     *
     * @private
     * @type {Object}
     */

    const state = {
      absolute: null,
      alpha: 0,
      beta: 0,
      gamma: 0,
    }

    /**
     *
     * @public
     * @return {OrientationCommand}
     */

    this.reset = () => {
      return this
    }

    // update orientation states
    events.on(document, 'deviceorientation', (e) => {
      if (false == ctx.hasFocus) { return }
      console.log('orientation', e)
      state.absolute = e.absolute
      state.alpha = e.alpha
      state.beta = e.beta
      state.gamma = e.gamma
    })
  }
}
