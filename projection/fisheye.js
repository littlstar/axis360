
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
 * @module axis/projection/fisheye
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

var three = require('three.js')

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
 * Applies a fisheye projection to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = fisheye;
function fisheye (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;

  // bail if camera not initialized
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if geometry is a cylinder because fisheye
  // projection is only supported in a spherical geometry
  if ('cylinder' == axis.geometry()) { return; }

  if ('mirrorball' == axis.projection()) {
    this.apply('equilinear');
  }

  // max Z and FOV
  var maxZ = (axis.height() / 100) | 0;
  var maxFov = 75;

  if ('mirrorball' == axis.projection() || 'tinyplanet' == axis.projection()) {
    // position latitude at equator
    axis.x(0);
  }

  // begin animation
  axis.debug("animate: FISHEYE begin");
  this.animate(function () {
    var fov = axis.fov();
    var y = axis.state.y;
    var x = axis.state.x;

    axis.debug("animate: FISHEYE maxFov=%d maxZ=%d fov=%d z=%d, y=%d",
               maxFov, maxZ, fov, camera.position.z, y);

    // cancel when we've reached max field of view
    if (maxFov == axis.fov() && 0 == x && 0 == y) {
      axis.debug("animate: FISHEYE end");
      return this.cancel();
    }

    // normalize field of view
    if (fov < maxFov) {
      axis.fov(Math.min(maxFov, axis.fov() + ANIMATION_FACTOR));
    } else if (fov > maxFov) {
      axis.fov(Math.min(maxFov, axis.fov() - ANIMATION_FACTOR));
    }

    // normalize z coordinate
    if (camera.position.z < maxZ) {
      camera.position.z++;
      camera.position.z = Math.min(maxZ, camera.position.z);
    } else if (camera.position.z > maxZ) {
      camera.position.z--;
      camera.position.z = Math.max(maxZ, camera.position.z);
    }

    // normalize y coordinate
    if (y > 0) {
      axis.y(Math.max(0, y - ANIMATION_FACTOR));
    } else if (y < 0) {
      axis.y(Math.min(0, y + ANIMATION_FACTOR));
    }

    // normalize x coordinate
    if (x > 0) {
      axis.x(Math.max(0, x - ANIMATION_FACTOR));
    } else if (x < 0) {
      axis.x(Math.min(0, x + ANIMATION_FACTOR));
    }
  });
};
