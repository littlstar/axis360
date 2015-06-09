
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
 * The touch controls module.
 *
 * @module axis/controls/touch
 * @type {Function}
 */

void module.exports;

/**
 * Module dependencies.
 * @private
 */

var inherits = require('inherits')
  , three = require('three.js')

/**
 * Local dependencies.
 * @private
 */

var AxisController = require('./controller')
  , constants = require('../constants')

/**
 * Initializes touch controls on Axis.
 *
 * @public
 * @param {Axis} scope - The axis instance
 * @return {TouchController}
 */

module.exports = function touch (axis) {
  return TouchController(axis)
  .target(axis.camera)
  .enable()
  .update();
};

/**
 * TouchController constructor
 *
 * @public
 * @constructor
 * @class TouchController
 * @extends AxisController
 * @see {@link module:axis/controls/controller~AxisController}
 * @param {Axis} scope - The axis instance
 */

module.exports.TouchController = TouchController;
inherits(TouchController, AxisController);
function TouchController (scope) {

  // ensure instance
  if (!(this instanceof TouchController)) {
    return new TouchController(scope);
  }

  // inherit from `AxisController'
  AxisController.call(this, scope, document);

  /**
   * Reference to this instance.
   *
   * @private
   * @type {TouchController}
   */

  var self = this;

  /**
   * Predicate indicating if touching.
   *
   * @public
   * @name state.isTouching
   * @type {Boolean}
   */

  this.state.isTouching = false;

  /**
   * Drag state
   *
   * @public
   * @name state.drag
   * @type {Object}
   */

  this.state.drag = {

    /**
     * X coordinate drag state
     *
     * @public
     * @name state.drag.x
     * @type {Number}
     */

    x: 0,

    /**
     * Y coordinate drag state
     *
     * @public
     * @name state.drag.y
     * @type {Number}
     */

    y: 0
  };

  /**
   * Current touchs
   *
   * @public
   * @name state.touches
   * @type {Array}
   */

  this.state.touches = [];

  /**
   * Current touch quaternion
   *
   * @public
   * @name state.quaternions.touch
   * @type {THREE.Quaternion}
   */

  this.state.quaternions.touch = new three.Quaternion();

  // initialize event delegation
  this.events.bind('touchstart');
  this.events.bind('touchmove');
  this.events.bind('touchend');
  this.events.bind('touch');
}

/**
 * Handle 'ontouchstart' event.
 *
 * @private
 * @param {Event} e
 */

TouchController.prototype.ontouchstart = function (e) {
  var touch = e.touches[0];
  this.state.isTouching = true;
  this.state.touches = e.touches;
  this.state.drag.x = touch.pageX;
  this.state.drag.y = touch.pageY;
};

/**
 * Handle 'ontouchmove' event.
 *
 * @private
 * @param {Event} e
 */

TouchController.prototype.ontouchmove = function (e) {
  var touch = e.touches[0];
  var x = touch.pageX - this.state.drag.x;
  var y = touch.pageY - this.state.drag.y;
  this.state.drag.x = touch.pageX;
  this.state.drag.y = touch.pageY;
  this.pan({x: x, y: y});
};

/**
 * Handle 'ontouchend' event.
 *
 * @private
 * @param {Event} e
 */

TouchController.prototype.ontouchend = function (e) {
  this.state.isTouching = false;
};

/**
 * Update touch controller state.
 *
 * @public
 */

TouchController.prototype.update = function () {
  if (false == this.state.isTouching) { return this; }
  AxisController.prototype.update.call(this);
  this.state.quaternions.touch.copy(this.state.target.quaternion)
  return this;
};
