'use strict'

/**
 * Module dependencies.
 */

import { define, radians } from './utils'
import { MeshCommand } from './mesh'
import { Vector } from './math'
import coalesce from 'defined'
import mat4 from 'gl-mat4'
import vec3 from 'gl-vec3'

/**
 * CameraCommand constructor.
 * @see CameraCommand
 */

export default (...args) => new CameraCommand(...args)

/**
 * Scratch matrix
 *
 * @private
 * @const
 * @type {mat4}
 */

const scratch = mat4.identity([])

/**
 * Euler angle of the origin camera orientation
 * express in radians.
 *
 * @public
 * @const
 * @type {Vector}
 */

export const DEFAULT_CAMERA_ORIENTATION_ORIGIN =
  // pitch, yaw, roll
  new Vector(radians(90), 0, 0)

/**
 * Default field of view frustrum angle for the
 * persective camera projection. This value is
 * expressed in radians.
 *
 * @public
 * @const
 * @type {Number}
 */

export const DEFAULT_CAMERA_FIELD_OF_VIEW = radians(60)

/**
 * Default near value for the persective camera
 * projection.
 *
 * @public
 * @const
 * @type {Number}
 */

export const DEFAULT_CAMERA_NEAR = 0.01

/**
 * Default far value for the persective camera
 * projection.
 *
 * @public
 * @const
 * @type {Number}
 */

export const DEFAULT_CAMERA_FAR = 1000.0

/**
 * CameraCommand class.
 *
 * @public
 * @class CameraCommand
 * @extends Command
 */

export class CameraCommand extends MeshCommand {

  /**
   * Camera class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}) {
    const worldUp = new Vector(0, 1, 0)
    const target = new Vector(0, 0, 0)
    const front = new Vector(0, 0, -1)
    const right = new Vector(1, 0, 0)
    const eye = new Vector(0, 0, 0)
    const up = new Vector(0, 0, 0)

    const projection = mat4.identity([])
    const view = mat4.identity([])

    const orientation = Object.assign(DEFAULT_CAMERA_ORIENTATION_ORIGIN, { })

    const state = {
      viewportHeight: coalesce(opts.viewportHeight, 1),
      viewportWidth: coalesce(opts.viewportWidth, 1),
      near: coalesce(opts.near, DEFAULT_CAMERA_NEAR),
      far: coalesce(opts.far, DEFAULT_CAMERA_FAR),
      fov: coalesce(opts.fov, opts.fieldOfView, DEFAULT_CAMERA_FIELD_OF_VIEW),
    }

    const context = {
      projection: ({viewportWidth, viewportHeight}) => {
        update({viewportWidth, viewportHeight})
        return projection
      },

      view: ({viewportWidth, viewportHeight}) => {
        update({viewportWidth, viewportHeight})
        return view
      }
    }

    const uniforms = { ...context }
    const render = ctx.regl({context, uniforms})

    const update = (updates) => {
      const sync = (prop) => {
        if (prop in updates) {
          state[prop] = updates[prop]
        }
      }

      // sycn properties
      sync('fov')
      sync('far')
      sync('near')
      sync('viewportWidth')
      sync('viewportHeight')

      const position = this.position
      const aspect = state.viewportWidth / state.viewportHeight
      const vector = new Vector(0, 0, 0)
      const near = state.near
      const far = state.far
      const fov = state.fov

      // update camera direction vectors
      vec3.set(front,
        Math.cos(orientation.x) * Math.cos(orientation.y),
        Math.sin(orientation.y),
        Math.sin(orientation.x) * Math.sin(orientation.y)
      )

      vec3.normalize(front, front)
      vec3.copy(right, vec3.normalize([], vec3.cross([], front, worldUp)))
      vec3.copy(up, vec3.normalize([], vec3.cross([], right, front)))

      // set projection
      mat4.perspective(projection, fov, aspect, near, far)

      // update transform from context if present
      if (ctx.previous && ctx.previous.id != this.id) {
        mat4.copy(this.transform, mat4.multiply([], ctx.previous.transform, view))
      } else {
        mat4.copy(this.transform, view)
      }

      // update view matrix
      mat4.copy(view, this.transform)
      mat4.lookAt(view, position, target, up)
      mat4.multiply(view, view, mat4.fromQuat([], this.rotation))

      // set eye vector
      mat4.invert(scratch, view)
      vec3.set(eye, scratch[12], scratch[13], scratch[14])
      return this
    }

    super(ctx, {
      ...opts,
      draw: false,
      render(_, state, ...args) {
        if ('object' == typeof state) {
          update(state)
          render(state, ...args)
        } else if ('function' == typeof state) {
          render(state)
        }
      }
    })

    /**
     * Camera field of view value.
     *
     * @type {Number}
     */

    define(this, 'fov', {
      get: () => state.fov,
      set: (fov) => update({fov})
    })

    /**
     * Camera far value.
     *
     * @type {Number}
     */

    define(this, 'far', {
      get: () => state.far,
      set: (far) => update({far})
    })

    /**
     * Camera near value.
     *
     * @type {Number}
     */

    define(this, 'near', {
      get: () => state.near,
      set: (near) => update({near})
    })

    /**
     * Camera projection value.
     *
     * @type {Number}
     */

    define(this, 'projection', { get: () => projection })

    /**
     * Camera view matrix value.
     *
     * @type {Number}
     */

    define(this, 'view', { get: () => view })

    /**
     * Camera world up vector.
     *
     * @type {Vector}
     */

    define(this, 'worldUp', { get: () => worldUp })

    /**
     * Camera front vector.
     *
     * @type {Vector}
     */

    define(this, 'front', { get: () => front })

    /**
     * Camera right vector.
     *
     * @type {Vector}
     */

    define(this, 'right', { get: () => right })

    /**
     * Camera eye vector.
     *
     * @type {Vector}
     */

    define(this, 'eye', { get: () => eye })

    /**
     * Camera up vector.
     *
     * @type {Vector}
     */

    define(this, 'up', { get: () => up })

    /**
     * Camera lookAt target vector.
     *
     * @type {Vector}
     */

    define(this, 'target', { get: () => target })

    /**
     * Camera orientation vector.
     *
     * @type {Vector}
     */

    define(this, 'orientation', { get: () => orientation })

    /**
     * Looks at a target vector.
     *
     * @type {Number}
     */

    define(this, 'lookAt', {
      value(vector) {
        vec3.copy(target, vector)
        return this
      }
    })
  }
}
