
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
 * The axis controller module.
 *
 * @module axis/controls/controller
 * @type {Function}
 */

void module.exports

/**
 * Module dependencies.
 * @private
 */

var three = require('three')
var events = require('component-events')
var Emitter = require('component-emitter')

/**
 * Tiny planet interpolation factor
 *
 * @private
 * @type {Number}
 */

var TINY_PLANET_INTERPOLATION_FACTOR = 0.13

/**
 * AxisController constructor
 *
 * @public
 * @constructor
 * @class AxisController
 * @param {Axis} scope - An Axis instance.
 * @param {Element} [domElement] - Optional DOM Element to bind events to.
 */

module.exports = AxisController
function AxisController (scope, domElement) {
  // ensure instance
  if (!(this instanceof AxisController)) {
    return new AxisController(scope, domElement)
  }

  /**
   * Reference to this instance.
   *
   * @private
   * @type {AxisController}
   */

  var self = this

  /**
   * Axis scope instance.
   *
   * @public
   * @type {Axis}
   */

  this.scope = scope

  /**
   * Current state of the controller.
   *
   * @public
   * @type {Object}
   */

  this.state = {

    /**
     * Defines a getter for a state property.
     *
     * @public
     * @name state.define
     * @type {Function}
     * @param {String} key - Property name.
     * @param {Function} getter - Accessor function.
     */

    define: function (key, getter) {
      this.__defineGetter__(key, getter)
      return this
    },

    /**
     * Predicate indicating if controller is enabled.
     *
     * @public
     * @name state.isEnabled
     * @type {Boolean}
     */

    isEnabled: false,

    /**
     * Predicate indicating if controller should force update.
     *
     * @public
     * @name state.forceUpdate
     * @type {Boolean}
     */

    forceUpdate: false,

    /**
     * Target quaternion to perform
     * rotations on.
     *
     * @public
     * @type {THREE.Object3D}
     */

    target: new three.Object3D(),

    /**
     * Theta value
     *
     * @public
     * @type {Number}
     */

    get theta () {
      var x = self.state.orientation.x
      return x * (Math.PI / 180)
    },

    /**
     * Phi value
     *
     * @public
     * @type {Number}
     */

    get phi () {
      var y = self.state.orientation.y
      return (90 - y) * (Math.PI / 180)
    },

    /**
     * Theta delta value
     *
     * @public
     * @type {Number}
     */

    thetaDelta: 0,

    /**
     * Phi delta value
     *
     * @public
     * @type {Number}
     */

    phiDelta: 0,

    /**
     * Scale value
     *
     * @public
     * @type {Number}
     */

    scale: 1,

    /**
     * Minimum azimuth angle.
     *
     * @public
     * @type {Number}
     */

    minAzimuthAngle: -Infinity,

    /**
     * Maximum azimuth angle.
     *
     * @public
     * @type {Number}
     */

    maxAzimuthAngle: Infinity,

    /**
     * Minimum polar angle.
     *
     * @public
     * @type {Number}
     */

    minPolarAngle: 0,

    /**
     * Maximum polar angle.
     *
     * @public
     * @type {Number}
     */

    maxPolarAngle: Math.PI,

    /**
     * Minimum radius distance.
     *
     * @public
     * @type {Number}
     */

    minDistance: 0,

    /**
     * Maximum radius distance.
     *
     * @public
     * @type {Number}
     */

    maxDistance: Infinity,

    /**
     * Rotation vectors.
     *
     * @public
     * @type {Object}
     */

    rotation: {

      /**
       * Start rotation vector.
       *
       * @public
       * @type {THREE.Vector2}
       */

      start: new three.Vector2(0, 0),

      /**
       * End rotation vector.
       *
       * @public
       * @type {THREE.Vector2}
       */

      end: new three.Vector2(0, 0),

      /**
       * Delta  rotation vector.
       *
       * @public
       * @type {THREE.Vector2}
       */

      delta: new three.Vector2(0, 0)
    },

    /**
     * Controller vectors
     *
     * @public
     * @name state.vectors
     * @type {Object}
     */

    vectors: {

      /**
       * X vector.
       *
       * @public
       * @name state.vectors.x
       * @type {THREE.Vector3}
       */

      x: new three.Vector3(1, 0, 0),

      /**
       * Y vector.
       *
       * @public
       * @name state.vectors.y
       * @type {THREE.Vector3}
       */

      y: new three.Vector3(0, 1, 0),

      /**
       * Z vector.
       *
       * @public
       * @name state.vectors.z
       * @type {THREE.Vector3}
       */

      z: new three.Vector3(0, 0, 1),

      /**
       * Target vector.
       *
       * @public
       * @name state.vectors.target
       * @type {THREE.Vector3}
       */

      target: new three.Vector3(0, 0, 0),

      /**
       * Current offset vector.
       *
       * @public
       * @name state.vectors.offset
       * @type {THREE.Vector3}
       */

      offset: new three.Vector3(0, 0, 0),

      /**
       * Position vector.
       *
       * @public
       * @name state.vectors.position
       * @type {THREE.Vector3}
       */

      position: new three.Vector3(0, 0, 0),

      /**
       * Last known position vector.
       *
       * @public
       * @name state.vectors.lastPosition
       * @type {THREE.Vector3}
       */

      lastPosition: new three.Vector3(0, 0, 0)
    },

    /**
     * Controller quaternions.
     *
     * @public
     * @name state.quaternions
     * @type {Object}
     */

    quaternions: {

      /**
       * X quaternion.
       *
       * @public
       * @name state.quaternions.x
       * @type {THREE.Quaternion}
       */

      x: new three.Quaternion(),

      /**
       * Y quaternion.
       *
       * @public
       * @name state.quaternions.y
       * @type {THREE.Quaternion}
       */

      y: new three.Quaternion(),

      /**
       * Directional quaternion.
       *
       * @public
       * @name state.quaternions.direction
       * @type {THREE.Quaternion}
       */

      direction: new three.Quaternion(),

      /**
       * Last known quaternion state
       *
       * @public
       * @name state.quaternions.last
       */

      last: new three.Quaternion()
    },

    /**
     * Named Euler angles.
     *
     * @public
     * @name state.eulers
     * @type {Object}
     */

    eulers: {

      /**
       * Current device Euler angle.
       *
       * @public
       * @name state.eulers.device
       * @type {THREE.Euler}
       */

      device: new three.Euler()
    }
  }

  /**
   * Controller orientation.
   *
   * @public
   * @name state.orientation
   * @type {Object}
   */

  this.state.orientation = this.scope.orientation || {

    /**
     * X orientation coordinate.
     *
     * @public
     * @name state.orientation.x
     * @type {Number}
     */

    x: 0,

    /**
     * Y orientation coordinate.
     *
     * @public
     * @name state.orientation.y
     * @type {Number}
     */

    y: 0,

    /**
     * Z orientation coordinate.
     *
     * @public
     * @name state.orientation.z
     * @type {Number}
     */

    z: 0
  }

  /**
   * Controllers DOM Element.
   *
   * @public
   * @name domElement
   * @type {Element}
   */

  this.domElement = domElement || scope.domElement

  /**
   * Event delegation for the controller. Event delegation.
   *
   * @public
   * @name events
   * @type {Object}
   */

  this.events = events(this.domElement, this)

  // Update controller before rendering occurs on scope.
  this.onbeforedraw = this.onbeforedraw.bind(this)
  scope.on('beforedraw', this.onbeforedraw)
}

// Inherit `EventEmitter'
Emitter(AxisController.prototype)

/**
 * Handles `before:render' event.
 *
 * @private
 */

AxisController.prototype.onbeforedraw = function () {
  // update only if enabled.
  if (!this.state.forceUpdate &&
      !this.state.isEnabled) {
    return this
  }

  this.update()
}

/**
 * Enables this controller.
 *
 * @public
 * @method
 * @name enable
 * @return {AxisController}
 */

AxisController.prototype.enable = function () {
  this.scope.debug('enable %s', this.constructor.name)
  this.state.isEnabled = true
  return this
}

/**
 * Disables this controller.
 *
 * @public
 * @method
 * @name disable
 * @return {AxisController}
 */

AxisController.prototype.disable = function () {
  this.scope.debug('disable %s', this.constructor.name)
  this.state.isEnabled = false
  return this
}

/**
 * Updates controller state.
 *
 * @public
 * @method
 * @name update
 * @return {AxisController}
 */

AxisController.prototype.update = function () {
  var quaternions = this.state.quaternions
  var orientation = this.state.orientation
  var vectors = this.state.vectors
  var target = this.state.target
  var quat = new three.Quaternion().copy(target.quaternion)
  var interpolationFactor = this.scope.state.interpolationFactor
  var geo = this.scope.geometry()

  // update only if enabled.
  if (!this.state.forceUpdate &&
      !this.state.isEnabled) {
    return this
  }

  if (orientation.x !== orientation.x) {
    orientation.x = 0
  }

  if (orientation.y !== orientation.y) {
    orientation.y = 0
  }

  if (this.scope.projections.current === 'tinyplanet') {
    interpolationFactor = TINY_PLANET_INTERPOLATION_FACTOR
  }

  if (geo === 'cylinder') {
    orientation.x = 0
  } else if (this.scope.state.lockPoles !== false) {
    // normalize x orientation
    orientation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, orientation.x))
  } else {
    interpolationFactor = 1
  }

  // update controller quaternions
  quaternions.y.setFromAxisAngle(vectors.y, orientation.y)
  quaternions.x.setFromAxisAngle(vectors.x, orientation.x * interpolationFactor)

  // update target quaternion
  quat.slerp(quaternions.y, interpolationFactor)

  // avoid NaN
  target.quaternion.set(quat.x || 0,
                        quat.y || 0,
                        quat.z || 0,
                        quat.w || 0)

  quat.multiply(quaternions.x)

  // avoid NaN
  target.quaternion.set(quat.x || 0,
                        quat.y || 0,
                        quat.z || 0,
                        quat.w || 0)

  return this
}

/**
 * Resets controller state. By default this will set
 * all properties on the state object to `null`
 *
 * @public
 * @abstract
 * @method
 * @name reset
 * @return {AxisController}
 */

AxisController.prototype.reset = function () {
  this.state.quaternions.x.set(0, 0, 0, 0)
  this.state.quaternions.y.set(0, 0, 0, 0)
  this.state.vectors.x.set(1, 0, 0)
  this.state.vectors.y.set(0, 1, 0)
  this.state.forceUpdate = false
  return this
}

/**
 * Freezes state object from being modified. Only the
 * properties that exist may have their values changed.
 * Once state is frozen, it cannot be unfrozen.
 *
 * @public
 * @method
 * @name freeze
 * @return {AxisController}
 */

AxisController.prototype.freeze = function () {
  Object.freeze(this.state)
  return this
}

/**
 * Sets target quaternion on instance.
 *
 * @public
 * @method
 * @name target
 * @param {THREE.Object3D} target
 * @return {AxisController}
 */

AxisController.prototype.target = function (target) {
  var up = target.up
  var y = new three.Vector3(0, 1, 0)
  this.state.target = target
  // initialize direction quaternion from targets up vector
  this.state.quaternions.direction.setFromUnitVectors(up, y)
  this.state.quaternions.directionInverse = (
    this.state.quaternions.direction.clone().inverse()
  )
  return this
}

/**
 * Rotate controller target with x and y radian rotations.
 *
 * @public
 * @method
 * @name rotate
 * @param {Object} delta - X and Y deltas in radians.
 * @param {Number} delta.x - X delta value in radians.
 * @param {Number} delta.y - Y delta value in radians.
 * @throws TypeError
 * @return {AxisController}
 */

AxisController.prototype.rotate = function (delta) {
  if (!this.state.isEnabled) { return this }
  if (typeof delta !== 'object') {
    throw new TypeError('Expecting object.')
  }

  var orientation = this.state.orientation
  var friction = this.scope.state.friction

  delta.x = Math.min(delta.x, 1)
  delta.y = Math.min(delta.y, 1)

  // update controller orientation
  if (!this.scope.state.isConstrainedWith('x')) {
    if (this.scope.state.isInverted) {
      orientation.x -= delta.x * friction
    } else {
      orientation.x += delta.x * friction
    }
  }

  if (!this.scope.state.isConstrainedWith('y')) {
    if (this.scope.state.isInverted) {
      orientation.y -= delta.y * friction
    } else {
      orientation.y += delta.y * friction
    }
  }

  return this
}

/**
 * Cleans up controller state, etc.
 *
 * @public
 * @method
 * @name destroy
 * @return {AxisController}
 */

AxisController.prototype.destroy = function () {
  this.reset()
  this.events.unbind()
  this.scope.off('beforedraw', this.onbeforedraw)
  return this
}

/**
 * Returns current camera aspect ratio. If not available
 * 1 is returned.
 *
 * @public
 * @method
 * @name getAspectRatio
 * @return {Number}
 */

AxisController.prototype.getAspectRatio = function () {
  var scope = this.scope
  var camera = scope.camera
  var aspect = camera ? camera.aspect : 1
  return aspect
}
