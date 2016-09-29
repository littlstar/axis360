'use strict'

/**
 * Module dependencies.
 */

import { Quaternion, Vector } from './math'
import { Command } from './command'
import { define } from './utils'
import vec3 from 'gl-vec3'
import quat from 'gl-quat'

/**
 * Static vectors used for reference in
 * quaternion axis rotations.
 *
 */

const XVECTOR = new Vector(1, 0, 0)
const YVECTOR = new Vector(0, 1, 0)
const ZVECTOR = new Vector(0, 0, 1)

/**
 * ControllerCommand class.
 *
 * @public
 * @abstract
 * @class ControllerCommand
 * @extends Command
 */

export class ControllerCommand extends Command {

  /**
   * ControllerCommand class contructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}, update = () => void 0) {
    super((_, updates) => {
      if (updates && 'target' in updates) {
        target = updates.target
      }

      if (updates && 'source' in updates) {
        source = updates.source
      }

      updateState(updates)
      syncTarget()

      if ('function' == typeof updates) {
        updates(_)
      }

      update(_, {...state}, target, source)

      for (let fn of middleware) {
        fn(this, _, {...state}, target, source)
      }
    })

    /**
     * ControllerCommand middleware
     *
     * @private
     * @const
     * @type {Array}
     */

    const middleware = []

    /**
     * ControllerCommand state.
     *
     * @private
     * @const
     * @type {Object}
     */

    const state = Object.assign({
      interpolationFactor: 0.15,
      orientation: Object.assign(new Vector(0, 0, 0), opts.orientation),
      quaternions: {
        x: new Quaternion(), y: new Quaternion(), z: new Quaternion()
      },
    }, opts)

    /**
     * ControllerCommand rotation quaternion.
     *
     * @private
     * @type {Quaternion}
     */

    let rotation = new Quaternion()

    /**
     * Target MeshCommand instance.
     *
     * @private
     * @type {MeshCommand}
     */

    let target = opts.target || null

    /**
     * Source MeshCommand instance.
     *
     * @private
     * @type {MeshCommand}
     */

    let source = opts.source || null

    /**
     * Updates controller state.
     *
     * @private
     * @param {Object} updates
     */

    const updateState = (updates) => {
      if (updates && 'object' == typeof updates) {
        Object.assign(state, updates, {
          orientation: Object.assign(state.orientation, updates.orientation),
          quaternions: Object.assign(state.orientation, updates.orientation),
        })
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
      Quaternion.slerpTargetFromAxisAngles(rotation,
                                           state.orientation,
                                           state.interpolationFactor)
    }

    /**
     * Target getter.
     *
     * @public
     * @getter
     * @type {MeshCommand}
     */

    define(this, 'target', { get: () => target })

    /**
     * Rotation getter.
     *
     * @public
     * @getter
     * @type {MeshCommand}
     */

    define(this, 'rotation', { get: () => rotation })

    /**
     * Source getter.
     *
     * @public
     * @getter
     * @type {MeshCommand}
     */

    define(this, 'source', { get: () => source })

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
     * @param {MeshCommand} object
     * @return {ControllerCommand}
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
     * @return {ControllerCommand}
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
     * @return {ControllerCommand}
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
     * @return {ControllerCommand}
     */

    this.setAxisAngleZ = (radians) => {
      state.orientation.z = radians
      return this
    }

    /**
     * Installs controller middleware.
     *
     * @param {Function} fn
     * @return {ControllerCommand}
     */

    this.use = (fn) => {
      middleware.push(fn)
      return this
    }
  }
}
