
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
 * The pointer controls module.
 *
 * @module axis/controls/pointer
 * @type {Function}
 */

void module.exports;

/**
 * Module dependencies.
 * @private
 */

var inherits = require('inherits')
  , three = require('three')
  , lock = require('pointer-lock')

/**
 * Local dependencies.
 * @private
 */

var MouseController = require('./mouse').MouseController
  , AxisController = require('./controller')
  , constants = require('../constants')

/**
 * Initializes pointer controls on Axis.
 *
 * @public
 * @param {Axis} scope - The axis instance
 * @return {PointerController}
 */

module.exports = function pointer (axis) {
  return PointerController(axis).target(axis.camera)
};

/**
 * PointerController constructor
 *
 * @public
 * @constructor
 * @class PointerController
 * @extends MouseController
 * @see {@link module:axis/controls/controller~MouseController}
 * @param {Axis} scope - The axis instance
 */

module.exports.PointerController = PointerController;
inherits(PointerController, MouseController);
function PointerController (scope) {

  // ensure instance
  if (!(this instanceof PointerController)) {
    return new PointerController(scope);
  }

  // inherit from `MouseController'
  MouseController.call(this, scope);

  /**
   * Reference to this instance.
   *
   * @private
   * @type {PointerController}
   */

  var self = this;

  /**
   * Pointer lock on scopes DOM Element
   *
   * @public
   * @name state.lock
   * @type {EventEmitter}
   */

  this.state.lock = null;
}

/**
 * Enables mouse pointer lock
 *
 * @public
 * @method
 * @name enable
 * @return {PointerController}
 */

PointerController.prototype.enable = function () {
  // init lock if not created
  if (null == this.state.lock) {
    this.state.lock = lock(this.scope.domElement);
  }

  return MouseController.prototype.enable.call(this);;
};

/**
 * Disables mouse pointer lock
 *
 * @public
 * @method
 * @name disable
 * @return {PointerController}
 */

PointerController.prototype.disable = function () {
  // init lock if not created
  if (null != this.state.lock) {
    this.state.isMousedown = false;
    this.state.lock.destroy();
  }
  return MouseController.prototype.disable.call(this);;
};

/**
 * Request mouse pointer lock.
 *
 * @private
 * @method
 * @name request
 * @return {PointerController}
 */

PointerController.prototype.request = function () {
  var friction = this.scope.state.mouseFriction || DEFAULT_MOUSE_MOVEMENT_FRICTION;
  var scope = this.scope;
  var self = this;

  // request lock from user
  this.state.lock.request();

  // handle updates when attained
  this.state.lock.on('attain', function () {
    var movements = self.state.movements;
    self.state.isMousedown = true;
    // update movements when lock has been attained
    self.state.lock.on('data', function (e) {
      self.state.isMousedown = true;
      movements.x += e.x;
      movements.y += e.y;
      // apply friction
      movements.y *= (friction/4);
      movements.x *= (friction/4);
    });

    // reset state when released
    self.state.lock.on('release', function () {
      self.state.isMousedown = false;
      if (self.state.lock) {
        self.state.lock.destroy();
      }
    });
  });

  return this;
};

/**
 * Overloads MouseController#update() method.
 *
 * @public
 * @method
 * @name update
 * @return {PointerController}
 */

PointerController.prototype.update = function () {
  AxisController.prototype.update.call(this);
  return this;
};

/**
 * Overloads MouseController#disable() method.
 *
 * @public
 * @method
 * @name disable
 * @return {PointerController}
 */

PointerController.prototype.disable = function () {
  MouseController.prototype.disable.call(this);
  if (null != this.state.lock) {
    this.state.lock.release();
    this.state.lock.destroy();
  }
  this.state.lock = null;
  return this;
};
