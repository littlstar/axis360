'use strict'

/**
 * Module dependencies.
 */

import { Quaternion, Vector } from '../math'
import { Command } from '../commands'
import { define } from '../utils'
import quat from 'gl-quat'

const XVECTOR = new Vector(1, 0, 0)
const YVECTOR = new Vector(0, 1, 0)
const ZVECTOR = new Vector(0, 0, 1)

/**
 * AbstractController class.
 *
 * @public
 * @abstract
 * @class AbstractController
 * @extends Command
 */

export class AbstractController extends Command {

  /**
   * AbstractController class contructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}, update = () => void 0) {
    super((_, updates) => {
      updateState(updates)
      syncTarget()
      if ('function' == typeof updates) {
        updates(_)
        update(_, {...state}, target)
      } else {
        update(_, {...state}, target)
      }

      for (let fn of middleware) {
        fn(this, _, {...state}, target)
      }
    })

    /**
     * Controller middleware
     *
     * @private
     * @const
     * @type {Array}
     */

    const middleware = []

    /**
     * Controller state.
     *
     * @private
     * @const
     * @type {Object}
     */

    const state = Object.assign({
      interpolationFactor: 0.1,
      orientation: new Vector(0, 0, 0),
      quaternions: {
        x: new Quaternion(), y: new Quaternion(), z: new Quaternion()
      },
    }, opts)

    /**
     * Target ObjectCommand instance.
     *
     * @private
     * @type {ObjectCommand}
     */

    let target = opts.target || null

    /**
     * Updates controller state.
     *
     * @private
     * @param {Object} updates
     */

    const updateState = (updates) => {
      if (updates && 'object' == typeof updates) {
        Object.assign(state, updates)
      }
    }

    /**
     * Syncs controller state to target.
     *
     * @private
     */

    const syncTarget = () => {
      rotateTarget()
    }

    /**
     * Rotates target at given orientation.
     *
     * @private
     */

    const rotateTarget = () => {
      const x = state.quaternions.x
      const y = state.quaternions.y
      const z = state.quaternions.z
      quat.setAxisAngle(x, XVECTOR, state.orientation.x)
      quat.setAxisAngle(y, YVECTOR, state.orientation.y)
      quat.setAxisAngle(z, ZVECTOR, state.orientation.z)
      quat.slerp(target.rotation,
                 target.rotation,
                 quat.multiply([], quat.multiply([], x, y), z),
                 state.interpolationFactor)
    }

    /**
     * Target getter.
     *
     * @public
     * @getter
     * @type {ObjectCommand}
     */

    define(this, 'target', { get: () => target })

    /**
     * Orientation getter.
     *
     * @public
     * @getter
     * @type {Vector}
     */

    define(this, 'orientation', { get: () => state.orientation })

    /**
     * Connects this controller to an input
     * object.
     *
     * @public
     * @param {ObjectCommand} object
     * @return {AbstractController}
     */

    this.connect = (object) => {
      if ('function' == typeof object) {
        target = object
      }
      return this
    }

    /**
     * Sets the x axis angle orientation in
     * radians.
     *
     * @param {Number} radians
     * @return {AbstractController}
     */

    this.setAxisAngleX = (radians) => {
      state.orientation.x = radians
      return this
    }

    /**
     * Sets the y axis angle orientation in
     * radians.
     *
     * @param {Number} radians
     * @return {AbstractController}
     */

    this.setAxisAngleY = (radians) => {
      state.orientation.y = radians
      return this
    }

    /**
     * Sets the z axis angle orientation in
     * radians.
     *
     * @param {Number} radians
     * @return {AbstractController}
     */

    this.setAxisAngleZ = (radians) => {
      state.orientation.z = radians
      return this
    }

    /**
     * Installs controller middleware.
     *
     * @param {Function} fn
     * @return {AbstractController}
     */

    this.use = (fn) => {
      middleware.push(fn)
      return this
    }
  }
}
