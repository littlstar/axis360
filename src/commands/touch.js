'use strict'

/**
 * Module dependencies.
 */

import { emitter as TouchPosition } from 'touch-position'
import { Command } from './command'
import events from 'dom-events'
import raf from 'raf'

/**
 * Touch function.
 *
 * @see TouchCommand
 */

export default (...args) => new TouchCommand(...args)

/**
 * TouchCommand class.
 *
 * @public
 * @class TouchCommand
 * @extends Command
 */

export class TouchCommand extends Command {

  /**
   * TouchCommand class constructor.
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

    const touch = TouchPosition({element: ctx.domElement})

    events.on(ctx.domElement, 'touchstart', (e) => {
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      e.preventDefault()
      Object.assign(this, {
        touches: e.targetTouches,

        currentX: x,
        currentY: y,

        deltaX: 0,
        deltaY: 0,

        prevX: this.currentX,
        prevY: this.currentY,
      })

    })

    events.on(ctx.domElement, 'touchend', (e) => {
      e.preventDefault()
      Object.assign(this, {
        touches: 0,

        currentX: 0,
        currentY: 0,

        deltaX: 0,
        deltaY: 0,

        prevX: 0,
        prevY: 0,
      })
    })

    touch.on('move', (t) => {
      const x = t.clientX
      const y = t.clientY
      Object.assign(this, {
        deltaX: x - this.currentX,
        deltaY: y - this.currentY,
      })

      raf(() => Object.assign(this, {
        deltaX: 0,
        deltaY: 0,
      }))
    })

    /**
     * Current active touches
     *
     * @type {Number}
     */

    this.touches = null

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
  }
}
