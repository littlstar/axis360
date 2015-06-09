
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
 * The tiny planet projection mode.
 *
 * @public
 * @module axis/projection/tinyplanet
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

// max camera lens value
var TINY_PLANET_CAMERA_LENS_VALUE = constants.TINY_PLANET_CAMERA_LENS_VALUE;

// animation factor
var ANIMATION_FACTOR = constants.ANIMATION_FACTOR;

// min/max x/y coordinates
var MIN_Y_COORDINATE = constants.MIN_Y_COORDINATE;

/**
 * Tiny planet projection constraints.
 *
 * @public
 * @type {Object}
 */

var constraints = tinyplanet.constraints = {
  y: true,
  cache: true,
  keys: {up: true, down: true}
};

/**
 * Applies a tinyplanet projection to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = tinyplanet;
function tinyplanet (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;
  var rotation = new three.Vector3(0, 0, 0);

  // bail if camera not initialized
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if geometry is a cylinder because tiny planet
  // projection is only supported in a spherical geometry
  if ('cylinder' == axis.geometry()) { return; }

  // cancel current projection animations
  this.cancel();

  // apply equilinear if current projection is a mirror ball
  if ('mirrorball' == axis.projection()) {
    this.apply('equilinear');
  }

  // cache coordinates if current projection is not
  // already tiny planet
  if ('tinyplanet' != axis.projection()) {
    // cache current coordinates
    axis.cache(axis.coords());
  }

  // set camera lens
  camera.setLens(TINY_PLANET_CAMERA_LENS_VALUE);

  // update axis field of view
  axis.fov(camera.fov);

  // begin animation
  axis.debug("animate: TINY_PLANET begin");
  constraints.x = true;
  constraints.y = false;
  rotation.x = camera.target.x || 0;
  rotation.y = camera.target.y || 0;
  rotation.z = camera.target.z || -1;
  this.animate(function () {
    var y = rotation.y;
    axis.debug("animate: TINY_PLANET y=%d", y);
    if (y > MIN_Y_COORDINATE) {

      if (y > MIN_Y_COORDINATE) {
        rotation.y = y -ANIMATION_FACTOR;
      } else {
        rotation.y = MIN_Y_COORDINATE;
      }
    } else {
      axis.orientation.x = -Infinity;
      constraints.x = false;
      constraints.y = true;
      axis.debug("animate: TINY_PLANET end");
      this.cancel();
    }

    axis.lookAt(rotation.x, rotation.y, rotation.z);
  });
};
