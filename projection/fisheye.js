
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
var DEFAULT_FOV = constants.DEFAULT_FOV;

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

  // max Z and FOV
  var maxZ = (axis.height() / 100) | 0;
  var fov = DEFAULT_FOV + 20;
  var rotation = new three.Vector3(0, 0, 0);

  if ('tinyplanet' != axis.projections.current) {
    rotation.x = camera.position.x;
    rotation.y = camera.position.y;
    rotation.z = camera.position.z;
  }

  // begin animation
  axis.debug("animate: FISHEYE begin");
  this.animate(function () {
    axis.fov(fov);
    axis.camera.position.z = maxZ;
    axis.lookAt(rotation.x, rotation.y, rotation.z);
    axis.orientation.x = (Math.PI/180);
    this.cancel();
  });
};
