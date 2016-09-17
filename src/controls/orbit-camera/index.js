'use strict'

/**
 * Module dependencies.
 */

import { AbstractController } from '../controller'
import { radians } from '../../utils'
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

      if (orientation) { applyOrientationInput(this, orientation, opts) }
      if (keyboard) { applyKeyboardInput(this, keyboard, opts) }
      if (touch) { applyTouchInput(this, touch, opts) }
      if (mouse) { applyMouseInput(this, mouse, opts) }

      if (true == opts.transform) {
        vec3.transformQuat(camera.target, camera.target, this.rotation)
        //console.log('transform', ...this.rotation)
      } else {
        quat.copy(camera.rotation, this.rotation)
      }
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
