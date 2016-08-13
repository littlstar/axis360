
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
 * The equilinear projection mode.
 *
 * @public
 * @module scope/projection/equilinear
 * @type {Function}
 */

/**
 * Applies an equilinear projection to scope frame
 *
 * @public
 * @param {Axis} scope
 */

module.exports = equilinear
function equilinear (scope) {
  // this projection requires an already initialized
  // camera on the `scope' instance
  var camera = scope.camera

  // bail if camera not present
  if (camera == null) { return }

  // bail if not ready
  if (!this.isReady()) { return }

  // bail if content sizing is incorrect
  if (!this.contentHasCorrectSizing()) { return }

  var current = this.current
  var targetX = Math.PI / 180
  var factor = targetX * 0.8999

  this.constraints = {}

  if (scope.geometry() === 'cylinder') {
    scope.orientation.x = 0
    this.constraints.y = true
    this.constraints.x = false
  }

  // apply zoom to cylinder geometry type
  if (scope.geometry() === 'cylinder') {
    this.constraints.y = true
    this.constraints.x = false
    scope.orientation.x = 0
  } else {
    this.constraints.y = false
    this.constraints.x = false
  }

  // animate
  scope.debug('animate: EQUILINEAR begin')

  scope.fov(scope.state.originalfov || scope.state.fov)

  if (scope.geometry() === 'cylinder') {
    scope.orientation.x = targetX
    this.cancel()
  } else {
    this.animate(function () {
      var x = scope.orientation.x

      if (current === 'tinyplanet') {
        scope.lookAt(0, 0, 0)
        scope.orientation.x = 0
        return this.cancel()
      }

      if (current === 'fisheye') {
        return this.cancel()
      }

      if (x > targetX) {
        scope.orientation.x -= factor
      } else {
        scope.orientation.x = targetX
      }

      if (x < targetX) {
        scope.orientation.x += factor
      } else {
        scope.orientation.x = targetX
      }

      if (scope.orientation.x === targetX) {
        return this.cancel()
      }
    })
  }
};
