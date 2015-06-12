
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
 * @module scope/projection/equilinear
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
 * Applies an equilinear projection to scope frame
 *
 * @public
 * @param {Axis} scope
 */

module.exports = equilinear;
function equilinear (scope) {

  // this projection requires an already initialized
  // camera on the `scope' instance
  var camera = scope.camera;

  // bail if camera not present
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if content sizing is incorrect
  if (false == this.contentHasCorrectSizing()) { return; }

  var fov = DEFAULT_FOV;
  var zoom = CYLINDRICAL_ZOOM;
  var rotation = new three.Vector3(0, 0, 0);
  var current = this.current;

  this.constraints = {};

  if ('cylinder' == scope.geometry()) {
    scope.orientation.x = 0;
    this.constraints.y = true;
    this.constraints.x = false;
  }

  // apply zoom to cylinder geometry type
  if ('cylinder' == scope.geometry()) {
    fov += zoom;
    this.constraints.y = true;
    this.constraints.x = false;
  } else {
    this.constraints.y = false;
    this.constraints.x = false;
  }

  // animate
  scope.debug("animate: EQUILINEAR begin");
  this.animate(function () {
    scope.fov(fov);

    if ('tinyplanet' == current) {
      scope.lookAt(0, 0, 0);
    }

    scope.orientation.x = Math.PI/180;
    this.cancel();
  });
};
