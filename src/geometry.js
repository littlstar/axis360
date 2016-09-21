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
    this.primitive = this.primitive || null
  }

  /**
   * An array of position values sourced from
   * the geometry primitive.
   *
   * @getter
   * @type {Array}
   */

  get positions() {
    return this.primitive ? this.primitive.positions : null
  }

  /**
   * An array of normal values sourced from
   * the geometry primitive.
   *
   * @getter
   * @type {Array}
   */

  get normals() {
    return this.primitive ? this.primitive.normals : null
  }

  /**
   * An array of uv values sourced from
   * the geometry primitive.
   *
   * @getter
   * @type {Array}
   */

  get uvs() {
    return this.primitive ? this.primitive.uvs : null
  }

  /**
   * An array of cell values sourced from
   * the geometry primitive.
   *
   * @getter
   * @type {Array}
   */

  get cells() {
    return this.primitive ? this.primitive.cells : null
  }

  /**
   * Abstract update method to be overloaded
   */

  update() {
    return this
  }
}
