'use strict'

/**
 * Module dependencies.
 */

import { AbstractController } from './controller'
import { radians } from '../utils'
import clamp from 'clamp'

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
      const keyboard = inputs.keyboard
      const mouse = inputs.mouse

      // update orientation from coordinates
      mouse && mouse(() => {
        const c = 0.0025
        const xf = X_AXIS_MOUSE_FRICTION
        const yf = Y_AXIS_MOUSE_FRICTION
        const dy = mouse.deltaY
        const dx = mouse.deltaX

        // update if a singled button is pressed
        if (1 == mouse.buttons) {
          this.orientation.x += -1*xf*dy*friction + (c*Math.random())
          this.orientation.y += -1*yf*dx*friction + (c*Math.random())
        }

        // clamp at north/south poles
        if (false !== opts.lockPoles) {
          this.orientation.x = clamp(this.orientation.x, radians(-90), radians(90))
        }
      })

      // update field of view from mouse wheel
      mouse && mouse(() => {
        const c = 0.033
        const dv = c*friction*mouse.wheel.deltaY
        camera.fov += dv
        camera.fov = clamp(camera.fov, radians(0.1) , radians(180))
      })

      // update orientation from keyboard input
      keyboard && keyboard((({dx = 0, dy = 0} = {}) => () => {

        if (mouse && mouse.buttons) {
          keyboard.reset()
        }

        const c = 0.075
        const step = c*friction
        const keys = keyboard.keys
        const up = keys.up || keys.w || keys.k
        const down = keys.down || keys.s || keys.j
        const left = keys.left || keys.a || keys.h
        const right = keys.right || keys.d || keys.l

        if (up) {
          dx = dx - step
          this.orientation.x -= 0.7*step
        } else if (down) {
          dx = dx + step
          this.orientation.x += 0.7*step
        }

        if (left) {
          dy = dy - step
          this.orientation.y -= step
        } else if (right) {
          dy = dy + step
          this.orientation.y += step
        }

        this.orientation.x += c*dx
        this.orientation.y += c*dy
      })())
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
