'use strict'

/**
 * Module dependencies.
 */

import onMouseChange from 'mouse-change'
import onMouseWheel from 'mouse-wheel'
import { Command } from '../command'
import events from 'dom-events'
import raf from 'raf'

/**
 * Mouse function.
 *
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

    ctx.on('blur', () => {
      this.buttons = 0
    })

    // focus/blur context on mouse down
    events.on(document, 'mousedown', (e) => {
      if (e.target == ctx.domElement) {
        ctx.focus()
      } else {
        ctx.blur()
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

    this.wheel = {
      currentX: 0, currentY: 0,
      deltaX: 0, deltaY: 0,
      prevX: 0, prevY: 0,
    }

    // update state on mouse change and reset
    // delta values on next animation frame
    onMouseChange(ctx.domElement, (buttons, x, y) => {
      Object.assign(this, {
        buttons,
        currentX: x,
        currentY: y,
        deltaX: x - this.currentX,
        deltaY: y - this.currentY,
        prevX: this.currentX,
        prevY: this.currentY,
      })

      raf(() => Object.assign(this, {
        deltaX: 0,
        deltaY: 0,
      }))
    })

    // update mouse wheel deltas and then
    // reset them on the next animation frame
    onMouseWheel(ctx.domElement, (dx, dy, dz) => {
      if (false === opts.allowWheel) { return }
      Object.assign(this.wheel, {
        currentX: this.wheel.currentX + dx,
        currentY: this.wheel.currentY + dy,
        currentZ: this.wheel.currentZ + dz,
        deltaX: dx,
        deltaY: dy,
        deltaZ: dz,
        prevX: this.wheel.currentX,
        prevY: this.wheel.currentY,
        prevZ: this.wheel.currentZ,
      })

      raf(() => Object.assign(this.wheel, {
        deltaX: 0,
        deltaY: 0,
        deltaZ: 0,
      }))
    })
  }
}
