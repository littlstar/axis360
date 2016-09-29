'use strict'

/**
 * Module dependencies.
 */

import clamp from 'clamp'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'

import { ControllerCommand } from '../../controller'
import { DEFAULT_FRICTION  } from '../orbit-camera'
import { define, radians } from '../../utils'
import applyKeyboardInput from './keyboard'
import applyMouseInput from '../orbit-camera/mouse'
import { Vector } from '../../math'

/**
 * FirstPersonCameraController function.
 *
 * @see FirstPersonCameraController
 */

export default (...args) => new FirstPersonCameraController(...args)

/**
 * FirstPersonCameraController class
 *
 * @public
 * @class FirstPersonCameraController
 * @extends ControllerCommand
 */

export class FirstPersonCameraController extends ControllerCommand {

  /**
   * FirstPersonCameraController class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}) {
    super(ctx, { ...opts, rotate: false }, (_, updates) => {
      const { keyboard, mouse } = this.inputs
      const friction = this.friction
      const camera = this.target

      if (keyboard) { applyKeyboardInput(this, {keyboard}, opts) }
      if (mouse) { applyMouseInput(this, {mouse}, opts) }
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
