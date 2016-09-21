'use strict'

/**
 * Module dependencies.
 */

import PrimitiveBox from 'geo-3d-box'
import { Geometry } from '../geometry'

/**
 * BoxGeometry class.
 *
 * @public
 * @class BoxGeometry
 * @extends Geometry
 * @see https://www.npmjs.com/package/geo-3d-box
 */

export class BoxGeometry extends Geometry {

  /**
   * BoxGeometry class constructor.
   *
   * @param {(Object)?} opts
   * @param {(Number)?} opts.size
   * @param {(Number)?} opts.segments
   * @param {(Object)?} primitive
   */

  constructor({size = 1, segments = 2} = {}, primitive) {
    primitive = primitive || PrimitiveBox({size, segments})
    super({size, segments, primitive})
  }

  /**
   * Updates BoxGeometry state
   *
   * @return {BoxGeometry}
   */

  update() {
    const segments = this.segments
    const size = this.size
    this.primitive = PrimitiveBox({size, segments})
    return this
  }
}
