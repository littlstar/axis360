'use strict'

/**
 * Module dependencies.
 */

import clamp from 'clamp'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'

import { ControllerCommand } from '../../controller'
import applyOrientationInput from './orientation'
import applyKeyboardInput from './keyboard'
import { lerp, radians } from '../../utils'
import applyMouseInput from './mouse'
import applyTouchInput from './touch'

/**
 * OrbitCameraController function.
 *
 * @see OrbitCameraController
 */

export default (...args) => new OrbitCameraController(...args)

/**
 * Default friction value applied to inputs.
 *
 * @public
 * @const
 * @type {Number}
 */

export const DEFAULT_FRICTION = 0.8

/**
 * OrbitCameraController class
 *
 * @public
 * @class OrbitCameraController
 * @extends ControllerCommand
 */

export class OrbitCameraController extends ControllerCommand {

  /**
   * OrbitCameraController class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}) {
    super(ctx, { ...opts }, (_, updates, target) => {
      const friction = this.friction
      const camera = updates.target || this.target
      const inputs = this.inputs || {}

      if (true != opts.invert) {
        opts.invert = false
      }

      // supported inputs
      const orientation = inputs.orientation
      const keyboard = inputs.keyboard
      const mouse = inputs.mouse
      const touch = inputs.touch

      if (orientation) { applyOrientationInput(this, {orientation}, opts) }
      if (keyboard) { applyKeyboardInput(this, {keyboard}, opts) }
      if (touch) { applyTouchInput(this, {touch}, opts) }
      if (mouse) { applyMouseInput(this, {mouse}, opts) }

      const { x: ax, y: ay, z: az } = this.orientation
      const { x: cx, y: cy, z: cz } = camera.orientation
      const f = 1

      quat.copy(camera.rotation, this.rotation)
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
