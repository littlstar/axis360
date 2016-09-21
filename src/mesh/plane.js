'use strict'

/**
 * Module dependencies.
 */

import { PlaneGeometry } from '../geometry/plane'
import { MeshCommand } from '../mesh'
import mat4 from 'gl-mat4'
import glsl from 'glslify'

/**
 * Plane function.
 *
 * @see PlaneCommand
 */

export default (...args) => new PlaneCommand(...args)

/**
 * PlaneCommand class.
 *
 * @public
 * @class PlaneCommand
 * @extends MeshCommand
 */

export class PlaneCommand extends MeshCommand {
  constructor(ctx, opts = {}) {
    const geometry = new PlaneGeometry(opts.geometry)
    super(ctx, { ...opts, type: 'plane', geometry })
  }
}
