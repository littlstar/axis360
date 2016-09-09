'use strict'

/**
 * Module dependencies.
 */

import { Geometry } from './geometry'

/**
 * TriangleGeometry class.
 *
 * @public
 * @class TriangleGeometry
 * @see https://www.npmjs.com/package/primitive-sphere
 */

export class TriangleGeometry extends Geometry {

  /**
   * TriangleGeometry class constructor.
   */

  constructor(primitive) {
    primitive = primitive || {
      positions: [
        -0.0, +1.0,
        +1.0, -1.0,
        -1.0, -1.0,
      ],

      normals: [
        -0.00000, +0.57735,
        +0.57735, -0.57735,
        -0.57735, -0.57735,
      ],

      uvs: [
        -0.0, +1.0,
        +1.0, -1.0,
        -1.0, -1.0,
      ],
    }

    super({primitive})
  }
}
