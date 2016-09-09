'use strict'

/**
 * Geometry class.
 *
 * @public
 * @class Geometry
 */

export class Geometry {

  /**
   * Geometry class constructor.
   *
   * @param {(Object)?} initialState
   */

  constructor(initialState) {
    Object.assign(this, initialState || {})
  }

  /**
   * Abstract update method to be overloaded
   */

  update() {
    return this
  }
}
