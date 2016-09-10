'use strict'

/**
 * Module dependencies.
 */

import { Vector } from './vector'
import coalesce from 'defined'

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
}
