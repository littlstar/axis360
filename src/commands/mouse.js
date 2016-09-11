'use strict'

/**
 * Module dependencies.
 */

import onMouseChange from 'mouse-change'
import onMouseWheel from 'mouse-wheel'
import { Command } from './command'
import raf from 'raf'

/**
 * MouseCommand constructor.
 * @see MouseCommand
 */

export default (...args) => new MouseCommand(...args)

/**
 * MouseCommand class.
 *
 * @public
 * @class MouseCommand
 * @extends Command
 */

export class MouseCommand extends Command {

  /**
   * MouseCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?} opts
   */

  constructor(ctx, opts = {}) {
    super((_, block) => {
      if ('function' == typeof block) {
        block(this)
      }
    })

    /**
     * Count of buttons currently pressed.
     *
     * @type {Number}
     */

    this.buttons = 0

    /**
     * Previous X coordinate.
     *
     * @type {Number}
     */

    this.prevX = 0

    /**
     * Previous Y coordinate.
     *
     * @type {Number}
     */

    this.prevY = 0

    /**
     * Current X coordinate.
     *
     * @type {Number}
     */

    this.currentX = 0

    /**
     * Current Y coordinate.
     *
     * @type {Number}
     */

    this.currentY = 0

    /**
     * Delta between previous and.
     * current X coordinates.
     *
     * @type {Number}
     */

    this.deltaX = 0

    /**
     * Delta between previous and.
     * current Y coordinates.
     *
     * @type {Number}
     */

    this.deltaY = 0

    /**
     * The amount of scrolling vertically,
     * horizontally and depth-wise in pixels.
     *
     * @see https://www.npmjs.com/package/mouse-wheel
     */

    this.wheel = {dx: 0, dy: 0, dz: 0}

    // update state on mouse change and reset
    // delta values on next animation frame
    onMouseChange((buttons, x, y) => {
      raf(() => Object.assign(this, {deltaX: 0, deltaY: 0}))
      Object.assign(this, {
        buttons,
        currentX: x,
        currentY: y,
        deltaX: x - this.currentX,
        deltaY: y - this.currentY,
        prevX: this.currentX,
        prevY: this.currentY,
      })
    })

    // update mouse wheel deltas and then
    // reset them on the next animation frame
    onMouseWheel((dx, dy, dz) => {
      Object.assign(this.wheel, {dx, dy, dz})
      raf(() => Object.assign(this.wheel, {dx: 0, dy: 0, dz: 0}))
    })
  }
}
