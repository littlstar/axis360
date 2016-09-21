'use strict'

/**
 * Module dependencies.
 */

import PrimitivePlane from 'primitive-plane'
import { Geometry } from '../geometry'

/**
 * PlaneGeometry class.
 *
 * @public
 * @class PlaneGeometry
 * @extends Geometry
 * @see https://www.npmjs.com/package/primitive-plane
 */

export class PlaneGeometry extends Geometry {

  /**
   * PlaneGeometry class constructor.
   *
   * @param {(Object)?} opts
   * @param {(Object)?} opts.size
   * @param {(Number)?} opts.size.x
   * @param {(Number)?} opts.size.y
   * @param {(Object)?} opts.segments
   * @param {(Number)?} opts.segments.x
   * @param {(Number)?} opts.segments.y
   * @param {(Object)?} primitive
   */

  constructor({size = {x : 1, y: 1}, segments = {x: 1, y: 1}} = {}, primitive) {
    primitive = primitive || PrimitivePlane(
      size.x, size.y,
      segments.x, segments.y,
      { quad: false }
    )
    super({size, segments, primitive})
  }

  /**
   * Updates PlaneGeometry state
   *
   * @return {PlaneGeometry}
   */

  update() {
    const segments = this.segments
    const size = this.size
    this.primitive = PrimitivePlane({size, segments})
    return this
  }
}
