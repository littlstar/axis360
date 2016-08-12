
'use strict';

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
 * The fisheye projection mode.
 *
 * @public
 * @module scope/projection/fisheye
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

var three = require('three')

/**
 * Local dependencies
 * @private
 */

var constants = require('../constants')

// animation factor
var ANIMATION_FACTOR = constants.ANIMATION_FACTOR;

/**
 * Fisheye projection constraints.
 *
 * @public
 * @type {Object}
 */

var constraints = fisheye.constraints = {};

/**
 * Applies a fisheye projection to scope frame
 *
 * @api public
 * @param {Axis} scope
 */

module.exports = fisheye;
function fisheye (scope) {

  // this projection requires an already initialized
  // camera on the `scope' instance
  var camera = scope.camera;

  // bail if camera not initialized
  if (null == camera) { return false; }

  // bail if not ready
  if (false == this.isReady()) { return false; }

  // bail if geometry is a cylinder because fisheye
  // projection is only supported in a spherical geometry
  if ('cylinder' == scope.geometry()) { return false; }

  // max Z and fov
  var maxZ = (scope.height() / 100) | 0;
  var current = this.current;

  scope.fov(scope.state.originalfov + 20);
  this.constraints = {};

  if ('cylinder' == scope.geometry()) {
    scope.orientation.x = 0;
    this.constraints.y = true;
    this.constraints.x = false;
  }

  // begin animation
  scope.debug("animate: FISHEYE begin");
  this.animate(function () {
    scope.camera.position.z = maxZ;

    if ('tinyplanet' == current) {
      scope.orientation.x = 0;
      scope.lookAt(0, 0, 0);
    } else if ('equilinear' != current) {
      scope.orientation.x = (Math.PI/180);
    }

    this.cancel();
  });
};
