
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
 * @module scope/projection/tinyplanet
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
var MIN_X_COORDINATE = constants.MIN_X_COORDINATE;
var MAX_X_COORDINATE = constants.MAX_X_COORDINATE;

/**
 * Applies a tinyplanet projection to scope frame
 *
 * @api public
 * @param {Axis} scope
 */

module.exports = tinyplanet;
function tinyplanet (scope) {

  var camera = scope.camera;
  var rotation = new three.Vector3(0, 0, 0);

  // bail if camera not initialized
  if (null == camera) { return false; }

  // bail if not ready
  if (false == this.isReady()) { return false; }

  // bail if geometry is a cylinder because tiny planet
  // projection is only supported in a spherical geometry
  if ('cylinder' == scope.geometry()) { return false; }

  // prevent duplicate tiny planet rotation requests
  if ('tinyplanet' == this.current) { return false; }

  this.constraints = {
    y: true,
    cache: true,
    keys: {up: true, down: true}
  };

  if ('cylinder' == scope.geometry()) {
    scope.orientation.x = 0;
    this.constraints.y = true;
    this.constraints.x = false;
  }

  var fovOffset = 15;
  camera.setLens(TINY_PLANET_CAMERA_LENS_VALUE);
  scope.fov(camera.fov + fovOffset);
  scope.debug("animate: TINY_PLANET begin");
  this.constraints.x = true;
  this.constraints.y = false;
  rotation.x = camera.target.x || 0;
  rotation.y = camera.target.y || 0;
  rotation.z = camera.target.z || -1;
  this.animate(function () {
    var y = rotation.y;
    var x = rotation.x;
    scope.debug("animate: TINY_PLANET y=%d", y);
    rotation.x = MIN_X_COORDINATE;
    rotation.y = -360;
    scope.lookAt(rotation.x, rotation.y, rotation.z);
    scope.orientation.x = -Infinity;
    this.constraints.x = false;
    this.constraints.y = true;
    scope.debug("animate: TINY_PLANET end");
    this.cancel();
  });
};
