
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
 * The orientation controls module.
 *
 * @module axis/controls/orientation
 * @type {Function}
 */

void module.exports;

/**
 * Module dependencies.
 * @private
 */

var keycode = require('keycode')
  , inherits = require('inherits')

/**
 * Local dependencies.
 * @private
 */

var AxisController = require('./controller')
  , constants = require('../constants')

/**
 * Converts degrees to radians
 *
 * @private
 * @param {Number} degrees
 */

function dtor (degrees) {
  return 'number' == typeof degrees && degrees == degrees ?
    (Math.PI / 180) * degrees : 0;
}

/**
 * Initialize orientation controls on Axis.
 *
 * @public
 * @param {Axis} scope - The axis instance
 * @return {OrientationController}
 */

module.exports = function orientation (axis) {
  return OrientationController(axis)
  .target(axis.camera)
  .enable()
  .update();
};

/**
 * OrientationController constructor
 *
 * @public
 * @constructor
 * @class OrientationController
 * @extends AxisController
 * @see {@link module:axis/controls/controller~AxisController}
 * @param {Axis} scope - The axis instance
 */

module.exports.OrientationController = OrientationController;
inherits(OrientationController, AxisController);
function OrientationController (scope) {

  // ensure instance
  if (!(this instanceof OrientationController)) {
    return new OrientationController(scope);
  }

  // inherit from `AxisController'
  AxisController.call(this, scope, window);

  /**
   * Reference to this instance.
   *
   * @private
   * @type {OrientationController}
   */

  var self = this;

  /**
   * The current device orientation angle in
   * degrees.
   *
   * @public
   * @name state.deviceOrientation
   * @type {Number}
   */

  this.state.define('deviceOrientation', function () {
    var orientation = null;
    var angle = 0;
    if (window.screen.orientation && window.screen.orientation.angle) {
      angle = window.screen.orientation.angle;
    }

    if (window.screen.mozOrientation && window.screen.mozOrientation.angle) {
      angle = window.screen.mozOrientation.angle;
    }

    switch (angle) {
      case 'landscape-primary': return 90;
      case 'landscape-secondary': return -90;
      case 'portrait-secondary': return 180;
      case 'portrait-primary': return 0;
      default: return window.orientation || 0;
    }
  });

  /**
   * The current alpha angle rotation
   *
   * @public
   * @name state.alpha
   * @type {Number}
   */

  this.state.alpha = 0;

  /**
   * The current beta angle rotation
   *
   * @public
   * @name state.beta
   * @type {Number}
   */

  this.state.beta = 0;

  /**
   * The current gamma angle rotation
   *
   * @public
   * @name state.gamma
   * @type {Number}
   */

  this.state.gamma = 0;

  // Initialize event delegation
  this.events.bind('deviceorientation');
}

/**
 * Handle 'ondeviceorientation' event.
 *
 * @private
 * @param {Event} e
 */

OrientationController.prototype.ondeviceorientation = function (e) {
  this.state.alpha = e.alpha;
  this.state.beta = e.beta;
  this.state.gamma = e.gamma;
};

/**
 * Update orientation controller state.
 *
 * @public
 */

OrientationController.prototype.update = function () {
  var interpolationFactor = this.scope.state.interpolationFactor;
  var orientation = dtor(this.state.deviceOrientation);
  var alpha = dtor(this.state.alpha);
  var beta = dtor(this.state.beta);
  var gamma = dtor(this.state.gamma);
  var angle = 0;

  if (0 != alpha && 0 != beta && 0 != gamma) {
    angle = - (this.state.deviceOrientation / 2);
    this.state.eulers.device.set(beta, alpha, -gamma, 'YXZ');
    this.state.quaternions.direction.setFromEuler(
      this.state.eulers.device
    );

    if (this.scope.controls.touch) {
      this.state.quaternions.direction.multiply(
        this.scope.controls.touch.state.quaternions.touch
      );
    }
    //this.state.quaternions.direction.multiply(this.state.quaternions.device);
    //this.state.quaternions.direction.multiply(this.state.quaternions.world);
    //AxisController.prototype.update.call(this);
    this.state.target.quaternion.slerp(this.state.quaternions.direction,
                                       interpolationFactor);
  }
  return this;
};
