'use strict'

/**
 * Module dependencies.
 */

import { AbstractController } from '../controller'
import { radians } from '../../utils'
import clamp from 'clamp'

import applyMouseInput from './mouse'

/**
 * OrbitCameraController function.
 *
 * @see OrbitCameraController
 */

export default (...args) => new OrbitCameraController(...args)

/**
 * Local friction applied to rotations around
 * the x axis for mouse inputs.
 */

const X_AXIS_MOUSE_FRICTION = 0.0033

/**
 * Local friction applied to rotations around
 * the y axis for mouse inputs.
 */

const Y_AXIS_MOUSE_FRICTION = 0.0046

/**
 * Default friction value applied to inputs.
 */

const DEFAULT_FRICTION = 0.8

/**
 * OrbitCameraController class
 *
 * @public
 * @class OrbitCameraController
 * @extends AbstractController
 */

export class OrbitCameraController extends AbstractController {

  /**
   * OrbitCameraController class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}) {
    super(ctx, { ...opts }, (_, updates, target) => {
      const friction = this.friction
      const camera = this.target
      const inputs = this.inputs || {}

      // supported inputs
      const orientation = inputs.orientation
      const keyboard = inputs.keyboard
      const mouse = inputs.mouse
      const touch = inputs.touch

      if (mouse) { applyMouseInput(this, mouse) }

      // update orientation from keyboard input
      keyboard && keyboard((({dx = 0, dy = 0} = {}) => () => {
        if (mouse && mouse.buttons) {
          keyboard.reset()
        }

        let c = 0.07
        const step = c*friction
        const keys = keyboard.keys
        const on = (which) => states[which].map((key) => keys[key] = true)
        const off = (which) => states[which].map((key) => keys[key] = false)
        const value = (which) => states[which].some((key) => Boolean(keys[key]))
        const states = {
          up: ['up', 'w', 'k'],
          down: ['down', 's', 'j'],
          left: ['left', 'a', 'h'],
          right: ['right', 'd', 'l'],
          control: [
            'control',
            'right command', 'left command',
            'right control', 'left control',
            'super', 'ctrl', 'alt', 'fn',
          ]
        }

        // @TODO(werle) - should we reset keyboard state ?
        if (value('control')) { return }

        if (value('up')) {
          dx = dx - step
          this.orientation.x -= step
          off('down')
        } else if (value('down')) {
          dx = dx + step
          this.orientation.x += step
          off('up')
        }

        if (value('left')) {
          dy = dy - step
          this.orientation.y -= step
          off('right')
        } else if (value('right')) {
          dy = dy + step
          this.orientation.y += step
          off('left')
        }

        c = 0.075
        if (dx) { this.orientation.x += c*dx}
        if (dy) { this.orientation.y += c*dy}
      })())

      // update orientation from orientation input
      orientation && orientation(() => {
        this.orientation.x -= friction*radians(orientation.deltaBeta)
        this.orientation.y -= friction*radians(orientation.deltaGamma)
        this.orientation.z -= friction*radians(orientation.deltaAlpha)
      })

      // update orientation from touch input
      touch && touch(() => {
        const xf = X_AXIS_MOUSE_FRICTION
        const yf = Y_AXIS_MOUSE_FRICTION
        const dx = touch.deltaX
        const dy = touch.deltaY
        const c = 0.075

        if (touch.touches && touch.touches.length) {
          this.orientation.x -= c*xf*dy*friction
          this.orientation.y -= c*yf*dx*friction
        }
      })
    })

    /**
     * Orbit control inputs.
     *
     * @public
     * @type {Object}
     */

    this.inputs = Object.assign({}, opts.inputs || {})

    /**
     * Friction value applied to various inputs.
     *
     * @public
     * @type {Number}
     */

    this.friction = null != opts.friction ? opts.friction : DEFAULT_FRICTION
  }
}
