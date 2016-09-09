'use strict'

/**
 * Module dependencies.
 */

import PrimitiveSphere from 'primitive-sphere'
import { Geometry } from './geometry'

/**
 * SphereGeometry class.
 *
 * @public
 * @class SphereGeometry
 * @extends Geometry
 * @see https://www.npmjs.com/package/primitive-sphere
 */

export class SphereGeometry extends Geometry {

  /**
   * SphereGeometry class constructor.
   *
   * @param {(Object)?} opts
   * @param {(Number)?} opts.radius
   * @param {(Number)?} opts.segments
   * @param {(Object)?} primitive
   */

  constructor({radius = 1, segments = 24} = {}, primitive) {
    primitive = primitive || PrimitiveSphere(radius, {segments})
    super({radius, segments, primitive})
  }

  /**
   * Updates SphereGeometry state
   *
   * @return {SphereGeometry}
   */

  update() {
    const segments = this.segments
    const radius = this.radius
    this.primitive = PrimitiveSphere(radius, {segments})
    return this
  }
}
