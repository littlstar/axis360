'use strict'

/**
 * Module dependencies.
 */

import coalesce from 'defined'
import quat from 'gl-quat'

import {
  Vector,
  XVector3,
  YVector3,
  ZVector3,
} from './vector'


/**
 * Quaternion class.
 *
 * @public
 * @class Quaternion
 * @extends Vector
 */

export class Quaternion extends Vector {

  /**
   * Quaternion class constructor.
   *
   * @public
   * @constructor
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @param {Number} w
   */

  constructor(x = 0, y = 0, z = 0, w = 1) {
    super(coalesce(x, 0),
          coalesce(y, 0),
          coalesce(z, 0),
          coalesce(w, 1))
  }


  /**
   * Rotates target at given orientation.
   *
   * @public
   * @param {Quaternion} target
   * @param {Object} angles
   * @param {Number} interpolationFactor
   */

  static slerpTargetFromAxisAngles(target,
                                   angles,
                                   interpolationFactor = 0.1) {
    const multiply = (...args) => quat.multiply([], ...args)
    const slerp = (t, ...args) => quat.slerp(t, t, ...args)
    const set = (...args) => quat.setAxisAngle(...args)

    const vx = XVector3, vy = YVector3, vz = ZVector3
    const ax = angles.x, ay = angles.y, az = angles.z
    const x = _scratchX, y = _scratchY, z = _scratchZ

    const f = interpolationFactor
    const t = target

    set(x, vx, ax)
    set(y, vy, ay)
    set(z, vz, az)

    slerp(t, multiply(multiply(x, y), z), f)
  }
}

const _scratchX = new Quaternion()
const _scratchY = new Quaternion()
const _scratchZ = new Quaternion()
