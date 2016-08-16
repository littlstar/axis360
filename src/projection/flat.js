
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
 * The flat projection mode.
 *
 * @public
 * @module axis/projection/flat
 * @type {Function}
 */

/**
 * Applies a flat projection to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

export default function flat (axis) {
  // this projection requires an already initialized
  // camera on the `Axis' instance
  const { camera } = axis

  // bail if camera not initialized
  if (camera == null) { return false }

  // bail if not ready
  if (!this.isReady()) { return false }

  // bail if geometry is a cylinder because a flat
  // projection is only supported in a spherical geometry
  if (axis.geometry() === 'cylinder') { return false }

  // apply equilinear projection
  this.apply('equilinear')

  this.constraints = {
    keys: {
      up: true,
      down: true,
      left: true,
      right: true
    },
    panoramic: true,
    x: true,
    y: true
  }

  // update camera lens
  camera.setLens(80)

  // update current fov
  axis.fov(camera.fov)

  // position in center (90) around equator (0)
  axis.coords(90, 0)
}
