'use strict'

/**
 * Module dependencies.
 */

import { AbstractController } from '../controller'
import { lerp, radians } from '../../utils'
import clamp from 'clamp'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'

import applyOrientationInput from './orientation'
import applyKeyboardInput from './keyboard'
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

      if (orientation) { applyOrientationInput(this, orientation, opts) }
      if (keyboard) { applyKeyboardInput(this, keyboard, opts) }
      if (touch) { applyTouchInput(this, touch, opts) }
      if (mouse) { applyMouseInput(this, mouse, opts) }

      const { x: ax, y: ay, z: az } = this.orientation
      const { x: cx, y: cy, z: cz } = camera.orientation
      const f = 1

      if (true == opts.transform) {
        const f = 1.0
        const rx = clamp(lerp(cx, ax, 0.7), radians(-90), radians(90))
        const ry = lerp(cy, ay, f)
        //quat.copy(camera.rotation, this.rotation)
        //camera.orientation.z = lerp(cx, ax, 0.7)
        //camera.target.x = camera.position.x * this.orientation.x
        //camera.target.y = camera.position.y * this.orientation.y
        //vec3.transformQuat(camera.position, camera.position, this.rotation)
        //camera.target.z = camera.position.z * this.orientation.x
        //vec3.transformQuat(camera.target, camera.target, this.rotation)
      }

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
