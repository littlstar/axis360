
'use strict'

/**
 * @license
 * Copyright Little Star Media Inc. and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * The tiny planet projection mode.
 *
 * @public
 * @module scope/projection/tinyplanet
 * @type {Function}
 */

 /**
  * Module dependencies
  * @private
  */

import Debug from 'debug'
import { Vector3 } from 'three'
import { TINY_PLANET_CAMERA_LENS_VALUE, MIN_X_COORDINATE } from '../constants'

const debug = new Debug('axis:projection:tinyplanet')

/**
 * Applies a tinyplanet projection to scope frame
 *
 * @api public
 * @param {Axis} scope
 */

export default function tinyplanet (scope) {
  const { camera } = scope
  const rotation = new Vector3(0, 0, 0)

  // bail if camera not initialized
  if (!camera) { return false }

  // bail if not ready
  if (!this.isReady()) { return false }

  // bail if geometry is a cylinder because tiny planet
  // projection is only supported in a spherical geometry
  if (scope.geometry() === 'cylinder') { return false }

  // prevent duplicate tiny planet rotation requests
  if (this.current === 'tinyplanet') { return false }

  this.constraints = {
    x: true,
    cache: true,
    keys: {
      left: true,
      right: true,
      h: true,
      l: true
    }
  }

  if (scope.geometry() === 'cylinder') {
    scope.orientation.x = 0
    this.constraints.y = false
    this.constraints.x = true
  }

  this.constraints.x = false
  this.constraints.y = true

  camera.setLens(TINY_PLANET_CAMERA_LENS_VALUE)
  scope.fov(Math.min(scope.state.originalfov * 2, 130))
  debug('animate: TINY_PLANET begin')
  rotation.x = camera.target.x || 0
  rotation.y = camera.target.y || 0
  rotation.z = camera.target.z || -1
  this.animate(() => {
    const { y } = rotation
    debug('animate: TINY_PLANET y=%d', y)
    rotation.x = MIN_X_COORDINATE
    rotation.y = -180
    scope.lookAt(rotation.x, rotation.y, rotation.z)
    scope.orientation.x = -Infinity
    this.constraints.x = true
    this.constraints.y = false
    debug('animate: TINY_PLANET end')
    this.cancel()
  })
}
