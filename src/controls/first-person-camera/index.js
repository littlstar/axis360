'use strict'

/**
 * Module dependencies.
 */

import { AbstractController } from '../controller'
import { define, radians } from '../../utils'
import { Vector } from '../../math'
import clamp from 'clamp'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'

import applyKeyboardInput from './keyboard'
import applyMouseInput from '../orbit-camera/mouse'

/**
 * FirstPersonCameraController function.
 *
 * @see FirstPersonCameraController
 */

export default (...args) => new FirstPersonCameraController(...args)

/**
 * Default friction value applied to inputs.
 */

const DEFAULT_FRICTION = 0.8

/**
 * FirstPersonCameraController class
 *
 * @public
 * @class FirstPersonCameraController
 * @extends AbstractController
 */

export class FirstPersonCameraController extends AbstractController {

  /**
   * FirstPersonCameraController class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}) {
    const target = new Vector(0, 0, 0)
    super(ctx, { ...opts, rotate: false }, (_, updates) => {
      const friction = this.friction
      const camera = this.target
      const inputs = this.inputs || {}

      // supported inputs
      const keyboard = inputs.keyboard
      const mouse = inputs.mouse

      if (keyboard) { applyKeyboardInput(this, keyboard) }
      if (mouse) { applyMouseInput(this, mouse) }
    })

    /**
     * FirstPerson control inputs.
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
