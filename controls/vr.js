
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
 * The vr controls module.
 *
 * @module axis/controls/vr
 * @type {Function}
 */

void module.exports

/**
 * Module dependencies.
 * @private
 */

var three = require('three')
var inherits = require('inherits')
var createCamera = require('../camera')

/**
 * Local dependencies.
 * @private
 */

var AxisController = require('./controller')

/**
 * Converts a field of view tangent object with
 * up, down, left, and right values in degrees
 * to X and Y scales and offsets.
 *
 * @private
 * @param {Object} tangent - Field of view tangent object.
 * @param {Number} tangent.up - Field of view up tangent.
 * @param {Number} tangent.right - Field of view right tangent.
 * @param {Number} tangent.down - Field of view down tangent.
 * @param {Number} tangent.left - Field of view left tangent.
 * @return {Object}
 */

function fieldOfViewTangentToScaleAndOffset (tangent) {
  var scale = {x: 0, y: 0}
  var offset = {x: 0, y: 0}

  // build scale
  scale.x = 2 / (tangent.left + tangent.right)
  scale.y = 2 / (tangent.up + tangent.down)

  // build offset
  offset.x = (tangent.left - tangent.right) * scale.x * 0.5
  offset.y = (tangent.up - tangent.down) * scale.y * 0.5

  return {scale: scale, offset: offset}
}

/**
 * Creates a projection matrix from an eye translation
 * object containing directional values in degrees.
 *
 * @private
 * @param {EyeTranslation} eye - Eye translation
 * @param {Number} near - Current camera near frustum plane value.
 * @param {Number} far - Current camera far frustum plane value.
 * @return {THREE.Matrix4}
 */

function eyeTranslationToProjection (eye, near, far) {
  var dtor = Math.PI / 180.0
  var scale = -1
  var matrix = new three.Matrix4()
  var m = matrix.elements
  var tangent = {}
  var scaleAndOffset = null

  tangent.up = Math.tan(eye.upDegrees * dtor)
  tangent.down = Math.tan(eye.downDegrees * dtor)
  tangent.left = Math.tan(eye.leftDegrees * dtor)
  tangent.right = Math.tan(eye.rightDegrees * dtor)

  scaleAndOffset = fieldOfViewTangentToScaleAndOffset(tangent)

  near = near == null ? 0.01 : near
  far = far == null ? 10000 : far

  // X result, map clip edges to [-w,+w]
  m[0 * 4 + 0] = scaleAndOffset.scale.x
  m[0 * 4 + 1] = 0
  m[0 * 4 + 2] = scaleAndOffset.offset.x * scale
  m[0 * 4 + 3] = 0

  // Y result, map clip edges to [-w,+w]
  // Y offset is negated because this proj matrix transforms from world coords with Y=up,
  // but the NDC scaling has Y=down (thanks D3D?)
  m[1 * 4 + 0] = 0
  m[1 * 4 + 1] = scaleAndOffset.scale.y
  m[1 * 4 + 2] = -scaleAndOffset.offset.y * scale
  m[1 * 4 + 3] = 0

  // Z result (up to the app)
  m[2 * 4 + 0] = 0
  m[2 * 4 + 1] = 0
  m[2 * 4 + 2] = far / (near - far) * -scale
  m[2 * 4 + 3] = (far * near) / (near - far)

  // W result (= Z in)
  m[3 * 4 + 0] = 0
  m[3 * 4 + 1] = 0
  m[3 * 4 + 2] = scale
  m[3 * 4 + 3] = 0

  matrix.transpose()

  return matrix
}

/**
 * EyeFieldOfView constructor
 *
 * @private
 * @class EyeFieldOfView
 * @constructor
 * @param {Number} up - Up degrees offset.
 * @param {Number} right - Right degrees offset.
 * @param {Number} down - Down degrees offset.
 * @param {Number} left - Left degrees offset.
 */

function EyeFieldOfView (up, right, down, left) {
  if (!(this instanceof EyeFieldOfView)) {
    return new EyeFieldOfView(up, right, down, left)
  }
  this.set(up, right, down, left)
}

/**
 * Set degrees for eye field of view.
 *
 * @public
 * @param {Number} up - Up degrees offset.
 * @param {Number} right - Right degrees offset.
 * @param {Number} down - Down degrees offset.
 * @param {Number} left - Left degrees offset.
 */

EyeFieldOfView.prototype.set = function (up, right, down, left) {
  this.upDegrees = up || 0
  this.rightDegrees = right || 0
  this.downDegrees = down || 0
  this.leftDegrees = left || 0
  return this
}

/**
 * EyeTranslation constructor
 *
 * @private
 * @class EyeTranslation
 * @constructor
 * @extends THREE.Quaternion
 * @param {Number} x - X coordinate.
 * @param {Number} y - Y coordinate.
 * @param {Number} z - Z coordinate.
 * @param {Number} w - W coordinate.
 */

inherits(EyeTranslation, three.Quaternion)
function EyeTranslation (x, y, z, w) {
  if (!(this instanceof EyeTranslation)) {
    return new EyeTranslation(x, y, z, w)
  }
  three.Quaternion.call(this, x, y, z, w)
}

/**
 * Initialize vr controls on Axis.
 *
 * @public
 * @param {Axis} scope - The axis instance
 * @return {VRController}
 */

module.exports = function vr (axis) {
  return VRController(axis)
  .target(axis.camera)
  .enable()
  .update()
}

/**
 * VRController constructor
 *
 * @public
 * @constructor
 * @class VRController
 * @extends AxisController
 * @see {@link module:axis/controls/controller~AxisController}
 * @param {Axis} scope - The axis instance
 */

module.exports.VRController = VRController
inherits(VRController, AxisController)
function VRController (scope) {
  // ensure instance
  if (!(this instanceof VRController)) {
    return new VRController(scope)
  }

  // inherit from `AxisController'
  AxisController.call(this, scope)

  /**
   * Reference to this instance.
   *
   * @private
   * @type {VRController}
   */

  var self = this

  /**
   * Current connected HMD.
   *
   * @public
   * @type {HMDVRDevice}
   * @name state.hmd
   */

  this.state.hmd = null

  /**
   * Current connected HMD position sensor.
   *
   * @public
   * @type {PositionSensorVRDevice}
   * @name state.sensor
   */

  this.state.sensor = null

  /**
   * Translation scale factor
   *
   * @public
   * @type {Number}
   * @name state.scale
   */

  this.state.scale = 1

  /**
   * VR cameras.
   *
   * @public
   * @type {Object}
   * @name state.cameras
   */
  this.state.cameras = {
    left: new three.PerspectiveCamera(),
    right: new three.PerspectiveCamera()
  }

  /**
   * VR Scenes.
   *
   * @public
   * @type {Object}
   * @name state.scenes
   */

  this.state.scenes = {

    /**
     * Left VR scene.
     *
     * @public
     * @type {THREE.Scene}
     * @name state.scenes.left
     */

    left_: null,
    get left () { return this.left_ || self.scope.scene },
    set left (scene) { this.left_ = scene },

    /**
     * Right VR scene.
     *
     * @public
     * @type {THREE.Scene}
     * @name state.scenes.right
     */

    right_: null,
    get right () { return this.right_ || self.scope.scene },
    set right (scene) { this.right_ = scene }
  }

  /**
   * Eye states.
   *
   * @public
   * @type {Object}
   * @name state.eyes
   */

  this.state.eyes = {

    /**
     * Eye field of view states.
     *
     * @public
     * @type {Object}
     * @name state.eyes.fov
     */

    fov: {

      /**
       * Right field of view state.
       *
       * @public
       * @type {EyeFieldOfView}
       * @name state.eyes.fov.right
       */

      right: new EyeFieldOfView(),

      /**
       * Leftfield of view state.
       *
       * @public
       * @type {EyeFieldOfView}
       * @name state.eyes.fov.left
       */

      left: new EyeFieldOfView()
    },

    /**
     * Current eye translation states.
     *
     * @public
     * @type {Object}
     * @name state.eyes.translations
     */

    translation: {

      /**
       * Left eye translation state.
       *
       * @public
       * @type {EyeTranslation}
       * @name state.eyes.translation.left
       */

      left: new EyeTranslation(),

      /**
       * Right eye translation state.
       *
       * @public
       * @type {EyeTranslation}
       * @name state.eyes.translation.right
       */

      right: new EyeTranslation()
    }
  }
}

/**
 * Update vr controller state.
 *
 * @public
 */

VRController.prototype.update = function () {
  var renderer = this.scope.renderer
  var camera = this.scope.camera
  var sensor = this.scope.state.vrPositionSensor
  var height = renderer.domElement.height
  var width = renderer.domElement.width / 2
  var right = this.state.scenes.right
  var left = this.state.scenes.left
  var eyes = this.state.eyes
  var near = camera.near
  var far = camera.far
  var hmd = this.scope.state.vrHMD

  if (!this.scope.state.isVREnabled) {
    this.target(createCamera(this.scope))
    return this
  }

  renderer.enableScissorTest(true)
  renderer.clear()

  if (camera.parent == null) {
    camera.updateMatrixWorld()
  }

  function setHMDEyeParamaters (which) {
    var eyeParams = null
    var eyeTranslation = null
    var eyeFov = null

    if (typeof hmd.getEyeParameters === 'function') {
      eyeParams = hmd.getEyeParameters(which)
      eyeTranslation = eyeParams.eyeTranslation
      eyeFov = eyeParams.recommendedFieldOfView
    } else {
      eyeTranslation = hmd.getEyeTranslation(which)
      eyeFov = hmd.getRecommendedEyeFieldOfView(which)
    }

    eyes.translation[which].set(eyeTranslation.x,
                                eyeTranslation.y,
                                eyeTranslation.z,
                                eyeTranslation.w)

    eyes.fov[which].set(eyeFov.upDegrees,
                        eyeFov.rightDegrees,
                        eyeFov.downDegrees,
                        eyeFov.leftDegrees)
  }

  if (hmd != null && sensor != null) {
    // set eye translations and field of views
    setHMDEyeParamaters('left')
    setHMDEyeParamaters('right')

    this.state.cameras.left.projectionMatrix = (
      eyeTranslationToProjection(eyes.fov.left, near, far)
    )

    this.state.cameras.right.projectionMatrix = (
      eyeTranslationToProjection(eyes.fov.right, near, far)
    )

    this.state.cameras.left.translateX(
      eyes.translation.left.x * this.state.scale)

    this.state.cameras.right.translateX(
      eyes.translation.right.x * this.state.scale)
  }

  // decompose left camera into current camera matrix
  camera.matrixWorld.decompose(this.state.cameras.left.position,
                               this.state.cameras.left.quaternion,
                               this.state.cameras.left.scale)

  // decompose right camera into current camera matrix
  camera.matrixWorld.decompose(this.state.cameras.right.position,
                               this.state.cameras.right.quaternion,
                               this.state.cameras.right.scale)

  // left eye
  renderer.setViewport(0, 0, width, height)
  renderer.setScissor(0, 0, width, height)
  renderer.render(left, this.state.cameras.left)

  // right eye
  renderer.setViewport(width, 0, width, height)
  renderer.setScissor(width, 0, width, height)
  renderer.render(right, this.state.cameras.right)

  renderer.enableScissorTest(false)

  return this
}
