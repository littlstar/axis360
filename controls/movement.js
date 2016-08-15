
'use strict'

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
 * The movement controls module.
 *
 * @module axis/controls/movement
 * @type {Function}
 */

void module.exports

/**
 * Module dependencies.
 * @private
 */

var inherits = require('inherits')

/**
 * Local dependencies.
 * @private
 */

var MouseController = require('./mouse').MouseController
var AxisController = require('./controller')
var constants = require('../constants')

/**
 * Initializes movement controls on Axis.
 *
 * @public
 * @param {Axis} scope - The axis instance
 * @return {MovementController}
 */

module.exports = function movement (axis) {
  return MovementController(axis).target(axis.camera)
}

/**
 * MovementController constructor
 *
 * @public
 * @constructor
 * @class MovementController
 * @extends MouseController
 * @see {@link module:axis/controls/controller~MouseController}
 * @param {Axis} scope - The axis instance
 */

module.exports.MovementController = MovementController
inherits(MovementController, MouseController)
function MovementController (scope) {
  // ensure instance
  if (!(this instanceof MovementController)) {
    return new MovementController(scope)
  }

  // inherit from `MouseController'
  MouseController.call(this, scope)
}

/**
 * Overloads MouseController#update() method.
 *
 * @public
 * @method
 * @name update
 * @return {PointerController}
 */

MovementController.prototype.update = function () {
  if (!this.state.isMousedown) { return this }
  var movements = this.state.movements
  this.rotate(movements)
  AxisController.prototype.update.call(this)
  return this
}

/**
 * Overloads MouseController#onmousedown
 *
 * @private
 * @name onmousedown
 * @param {Event} e - Event object.
 */

MovementController.prototype.onmousedown = function (e) {
  this.state.movements.x = 0
  this.state.movements.y = 0
  this.state.movementsStart.x = 0
  this.state.movementsStart.y = 0
  MouseController.prototype.onmousedown.call(this, e)
}

/**
 * Overloads MouseController#onmousemove
 *
 * @private
 * @name onmousemove
 * @param {Event} e - Event object.
 */

MovementController.prototype.onmousemove = function (e) {
  var movements = this.state.movements
  var friction = this.scope.state.mouseFriction || constants.DEFAULT_MOUSE_MOVEMENT_FRICTION
  var tmp = 0

  // handle mouse movements only if the mouse controller is enabled
  if (!this.state.isEnabled || !this.state.isMousedown) {
    return
  }

  movements.x = (e.screenX * friction) - this.state.movementsStart.x
  movements.y = (e.screenY * friction) - this.state.movementsStart.y

  // apply friction
  movements.y *= (friction)
  movements.x *= (friction)

  // swap for rotation
  tmp = movements.y
  movements.y = movements.x
  movements.x = tmp

  // invert for true directional movement
  movements.x *= -1
  movements.y *= -1
}

/**
 * Overloads MouseController#onmousemove
 *
 * @private
 * @name onmousemove
 * @param {Event} e - Event object.
 */

MovementController.prototype.onmouseup = function (e) {
  clearTimeout(this.state.mouseupTimeout)
  this.state.isMousedown = false
  this.state.movementsStart.x = 0
  this.state.movementsStart.y = 0
}
