
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
 * The equilinear projection mode.
 *
 * @public
 * @module axis/projection/equilinear
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

var raf = require('raf')
  , three = require('three.js')

/**
 * Local dependencies
 * @private
 */

var constants = require('../constants')
  , createCamera = require('../camera')
  , createPlane = require('../geometry/plane')
  , createSphere = require('../geometry/sphere')
  , createCylinder = require('../geometry/cylinder')

// default field of view
var DEFAULT_FOV = constants.DEFAULT_FOV;

// animation factor
var ANIMATION_FACTOR = constants.ANIMATION_FACTOR;

// cylinder zoom offet
var CYLINDRICAL_ZOOM = constants.CYLINDRICAL_ZOOM;

/**
 * Equilinear projection constraints.
 *
 * @public
 * @type {Object}
 */

var constraints = equilinear.constraints = {};

/**
 * Applies an equilinear projection to Axis frame
 *
 * @public
 * @param {Axis} axis
 */

module.exports = equilinear;
function equilinear (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;

  // bail if camera not present
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if content sizing is incorrect
  if (false == this.contentHasCorrectSizing()) { return; }

  // initializes scene
  this.initializeScene();

  // initialize camera
  createCamera(axis);

  // cancel current projection animations
  this.cancel();

  // max FOV for animating
  var maxFov = DEFAULT_FOV;

  // current fov
  var fov = axis.fov();

  // zoom offset where applicable
  var zoom = CYLINDRICAL_ZOOM;

  // apply zoom to cylinder geometry type
  if ('cylinder' == axis.geometry()) {
    maxFov += zoom;
    axis.fov(fov += zoom);
  }

  if ('tinyplanet' == axis.projection() || this.isMirrorBall()) {
    axis.x(0);
  }

  // bail if projection is mirror ball
  if (this.isMirrorBall()) {
    return;
  }

  // animate
  axis.debug("animate: EQUILINEAR begin");
  this.animate(function () {
    var y = axis.state.y;

    axis.debug("animate: EQUILINEAR maxFov=%d fov=%d y=%d",
               maxFov, axis.fov(), axis.y());

    // cancel animation if max fov reached and
    // latitude has reached equator
    if (maxFov == axis.fov() && 0 == axis.y()) {
      axis.debug("animate: EQUILINEAR end");
      return this.cancel();
    }

    // normalize field of view value
    if (fov > maxFov) {
      fov = Math.max(fov - ANIMATION_FACTOR, maxFov);
    } else if (fov < maxFov) {
      fov = Math.min(fov + ANIMATION_FACTOR, maxFov);
    } else {
      fov = maxFov;
    }

    // prevent negative field of view
    if (fov < 0) { fov = 0; }

    // update field of view
    axis.fov(fov);

    // normalize y coordinate
    if (y > 0) {
      axis.y(Math.max(0, y - ANIMATION_FACTOR));
    } else if (y < 0) {
      axis.y(Math.min(0, y + ANIMATION_FACTOR));
    }
  });
};
