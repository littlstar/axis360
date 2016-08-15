
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
 * The state module representing an interface for managing
 * state in axis
 *
 * @public
 * @module axis/state
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

import EventEmitter from 'component-emitter'
import fullscreen from '@littlstar/fullscreen'
import hasWebGL from 'has-webgl'
import events from 'component-events'
import { Quaternion, Vector3, Euler } from 'three'
import { getVRDevices, isVRPossible } from './util'
import {
  VR_POLL_TIMEOUT,
  DEFAULT_FRICTION,
  DEFAULT_PROJECTION,
  DEFAULT_SCROLL_VELOCITY,
  DEFAULT_GEOMETRY_RADIUS,
  DEFAULT_INTERPOLATION_FACTOR,
  DEFAULT_MOUSE_MOVEMENT_FRICTION,
  DEFAULT_CONTROLLER_UPDATE_TIMEOUT
} from './constants'

/**
 * State constructor
 *
 * @public
 * @class State
 * @extends EventEmitter
 * @param {Object} scope
 * @param {Object} [opts] - Initial state options
 * @param {String} [opts.projection = DEFAULT_PROJECTION] - Initial projection
 * type.
 * @param {Boolean} [opts.allowControls = true] - Allow special controls to be
 * user.
 * @param {Boolean} [opts.forceFocus = false] - Force focus to axis frame. This
 * will hijack mouse and key events.
 * @param {Boolean} [opts.resizable = false] - Allow the axis frame to be
 * resizable.
 * @param {Boolean} [opts.isClickable = true] - Allow the axis frame to be
 * clickable.
 * @param {Boolean} [opts.inverted = false] - Inverts directional controls.
 * @param {Number} [opts.radius = 400] = Geometry radius.
 * @param {Number} [opts.height] - Frame height.
 * @param {Number} [opts.width] - Frame width.
 * @param {Boolean} [opts.muted = false] - Initial vieo muted state.
 * @param {Boolean} [opts.allowWheel = false] - Use mouse wheel for zooming.
 * @param {Number} [opts.scrollVelocity = DEFAULT_SCROLL_VELOCITY] - Scroll velocity.
 * @param {Boolean} [opts.autoplay = false] - Indicates whether a video should
 * autoplay after loading.
 * @param {Number} [opts.fov] - Field of view.
 * @param {Boolean} [opts.isImage = false] - Force rendering of image instead of
 * a video.
 * @param {Number} [opts.friction = DEFAULT_FRICTION] - Friction to
 * apply to x and y coordinates.
 * @param {Number} [opts.mouseFriction = DEFAULT_MOUSE_MOVEMENT_FRICTION] -
 * Friction fractor to apply to mouse movements.
 * @param {Number} [opts.interpolationFactor = DEFAULT_INTERPOLATION_FACTOR] -
 * Interpolation factor to apply to quaternion rotations.
 * @param {Number} [opts.updateTimeout = DEFAULT_CONTROLLER_UPDATE_TIMEOUT] -
 * View controller update timeout.
 * @param {Boolean} [opts.webgl = true] - Use WebGL rendering.
 * @param {Boolean} [opts.isPreviewFrame = false] - Indicates frame is a
 * preview frame preventing a refresh loop from occurring unless explicitly
 * called.
 * @param {Boolean} [opts.lockPoles = true] - Locks orientation at north and
 * south poles (-PI/2, PI/2).
 */

export default class State extends EventEmitter {
  constructor (scope, opts) {
    super()

    if (typeof scope !== 'object') {
      throw new TypeError('State expects scope to be an object.')
    }

    // event delegation
    const documentEvents = events(document, this)

    // initialize document events
    documentEvents.bind('touch', 'onmousedown')
    documentEvents.bind('mousedown')

    // ensure options can't be overloaded
    opts = Object.freeze({ ...opts })
    this.__defineGetter__('options', function () {
      return opts
    })

    /** Current scope for the instance. */
    this.scope = scope

    /** VR polling ID. */
    this.vrPollID = 0

    /**
     * Temporary values.
     */

    this.tmp = {}

    /**
     * State variables.
     */

    /** Original fov value. */
    this.originalfov = 0

    /** Percent of content loaded. */
    this.percentloaded = 0

    /** Original content size. */
    this.originalsize = {width: null, height: null}

    /** Current device orientation. */
    this.orientation = 0

    /** Current projection type. */
    this.projection = DEFAULT_PROJECTION

    /** Last known volume level. */
    this.lastVolume = 0

    /** Last known refresh. */
    this.lastRefresh = Date.now()

    /** Points representing a drag offset. */
    this.dragstart = {x: 0, y: 0}

    /** Last known mousedown interaction. */
    this.mousedownTimestamp = 0

    /** Current geometry type. */
    this.geometry = null

    /** Inverted state. */
    this.isInverted = false

    /** Preview frame state predicate.. */
    this.isPreviewFrame = false

    /** Total duration in seconds for video. */
    this.duration = 0

    /** Last known size. */
    this.lastSize = {width: null, height: null}

    /** Last known dimensions. */
    this.lastDimensions = {width: 0, height: 0, ratio: 0}

    /** Current geometry radius. */
    this.radius = DEFAULT_GEOMETRY_RADIUS

    /** Known center for frame of reference. */
    this.center = {x: null, y: null, z: null}

    /** Known frame height. */
    this.height = 0

    /** Known touch coordinates. */
    this.touch = {x: 0, y: 0}

    /** Known frame width. */
    this.width = 0

    /** State cache. */
    this.cache = {}

    /** Interval rotations. */
    this.intervalRotations = {
      x: {value: 0, every: 0, interval: 0},
      y: {value: 0, every: 0, invteral: 0}
    }

    /** Scroll velocity. */
    this.scrollVelocity = DEFAULT_SCROLL_VELOCITY

    /** Animation frame ID. */
    this.animationFrameID = 0

    /** Currently played video time. */
    this.currentTime = 0

    /** Friction to apply to x and y coordinates. */
    this.friction = DEFAULT_FRICTION

    /** Friction to apply to mouse movements. */
    this.mouseFriction = DEFAULT_MOUSE_MOVEMENT_FRICTION

    /** Zee quaternion. */
    this.zee = null

    /** Current euler rotation angles. */
    this.euler = null

    /** Original quaternion. */
    this.orientationQuaternion = null

    /** X axis center. */
    this.xAxisCenter = null

    /** Y coordinate. */
    this.pointerY = 0

    /** X coordinate. */
    this.pointerX = 0

    /** Current field of view. */
    this.fov = 0

    /** Current frame source. */
    this.src = null

    /** Currently connected VR HMD if applicable. */
    this.vrHMD = null

    /** Currently connected position sensor vr device. */
    this.vrPositionSensor = null

    /** Interpolation factor to apply to quaternion rotations. */
    this.interpolationFactor = DEFAULT_INTERPOLATION_FACTOR

    /** Controller update timeout value. */
    this.controllerUpdateTimeout = DEFAULT_CONTROLLER_UPDATE_TIMEOUT

    /** Last known device pixel ratio. */
    this.lastDevicePixelRatio = window.devicePixelRatio

    /** Vim mode ;) */
    this.vim = false

    /**
     * State predicates.
     */

    /** Allow for updates to be skippped. */
    this.shouldUpdate = true

    /** Predicate indicating if Axis is ready. */
    this.isReady = false

    /** Predicate indicating if video is muted. */
    this.isMuted = false

    /** Predicate indicating if video has ended. */
    this.isEnded = false

    /** Predicate indicating the use of the mouse wheel. */
    this.allowWheel = false

    /** Predicate indicating if Axis is focused. */
    this.isFocused = false

    /** Predicate indicating if key is down. */
    this.isKeydown = false

    /** Predicate indicating if video is playing. */
    this.isPlaying = false

    /** Predicate indicating is video is paused. */
    this.isPaused = false

    /** Predicate indicating if video was stopped. */
    this.isStopped = false

    /** Predicate to indicating if Axis is clickable.*/
    this.isClickable = true

    /** Predicate indicating an animation is occuring. */
    this.isAnimating = false

    /** Predicate indicating fullscreen is active. */
    this.isFullscreen = false

    /** Predicate indicating if frame is an image. */
    this.isImage = false

    /** Predicate indicating if video rendering should be forced. */
    this.forceVideo = false

    /** Predicate indicating focus should be forced. */
    this.forceFocus = false

    /** Predicate indicating control are allowed. */
    this.allowControls = true

    /** Predicate indicating VR support. */
    this.isVREnabled = false

    /** Predicate indicating if an HMD device is connected. */
    this.isHMDAvailable = false

    /** Predicate indicating if an HMD device sensor is connected. */
    this.isHMDPositionSensorAvailable = false

    /** Predicate indicating axis is resizable. */
    this.isResizable = false

    /** Predicate indicating the mouse is down. */
    this.isMousedown = false

    /** Predicate indicating if touching. */
    this.isTouching = false

    /** Predicate indicating if WebGL is being used. */
    this.useWebGL = true

    /** Predicate indicating if a video should autoplay. */
    this.shouldAutoplay = false

    /** Predicate indicating if VR display is possible. */
    this.isVRPossible = isVRPossible()

    /** Predicate indicating if media resource is cross origin. */
    this.isCrossOrigin = false

    /** Predicate indicating if north/south pole orientation should be locked. */
    this.lockPoles = true

    // listen for fullscreen changes
    fullscreen.on('change', this.onfullscreenchange.bind(this))

    // handle updates
    this.on('update', function (e) { })

    // init
    this.reset()
  }

  /**
   * Resets state values
   *
   * @public
   * @param {Object} [overrides] - Optionals overrides
   * @return {Object}
   */

  reset (overrides = {}) {
    const opts = {
      ...this.options,
      ...overrides
    }

    // prevent additions to the object
    Object.seal(this)

    // start polling for a connected VR device
    this.pollForVRDevice()

    /**
     * Configurable variables.
     */

    this.projection = opts.projection || DEFAULT_PROJECTION
    this.radius = opts.radius || DEFAULT_GEOMETRY_RADIUS
    this.height = opts.height || 0
    this.width = opts.width || 0
    this.scrollVelocity = opts.scrollVelocity || DEFAULT_SCROLL_VELOCITY
    this.fov = Number(opts.fov || this.fov)
    this.src = opts.src || null
    this.isImage = opts.isImage == null ? false : opts.isImage
    this.forceVideo = opts.forceVideo == null ? false : opts.forceVideo
    this.isClickable = opts.isClickable != null ? opts.isClickable : true
    this.isInverted = opts.inverted || false
    this.isPreviewFrame = opts.isPreviewFrame || false
    this.isCrossOrigin = opts.crossorigin || false
    this.forceFocus = opts.forceFocus || false
    this.allowControls = opts.allowControls != null ? opts.allowControls : true
    this.isResizable = opts.resizable || false
    this.shouldAutoplay = opts.autoplay != null ? opts.autoplay : false
    this.allowWheel = opts.allowWheel == null ? false : opts.allowWheel
    this.friction = opts.friction || DEFAULT_FRICTION
    this.mouseFriction = opts.mouseFriction || DEFAULT_MOUSE_MOVEMENT_FRICTION
    this.useWebGL = opts.webgl && hasWebGL
    this.interpolationFactor = (
      opts.interpolationFactor || DEFAULT_INTERPOLATION_FACTOR
    )
    this.lockPoles = Boolean(opts.lockPoles != null ? opts.lockPoles : true)

    this.controllerUpdateTimeout = (
      opts.updateTimeout || DEFAULT_CONTROLLER_UPDATE_TIMEOUT
    )

    this.vim = opts.vim == null ? false : opts.vim

    /**
     * State variables.
     */

    this.originalfov = this.fov || 0
    this.percentloaded = 0
    this.originalsize = {width: null, height: null}
    this.orientation = window.orientation || 0
    this.lastVolume = 0
    this.lastRefresh = Date.now()
    this.dragstart = {x: 0, y: 0}
    this.mousedownTimestamp = 0
    this.geometry = null
    this.duration = 0
    this.lastSize = {width: null, height: null}
    this.center = {x: null, y: null, z: null}
    this.touch = {x: 0, y: 0}
    this.cache = {}
    this.animationFrameID = null
    this.currentTime = 0
    this.pointerX = 0
    this.pointerY = 0
    this.orientationQuaternion = new Quaternion()
    this.xAxisCenter = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5))
    this.zee = new Vector3(0, 0, 1)
    this.euler = new Euler()
    this.lastDevicePixelRatio = window.devicePixelRatio

    /**
     * State predicates.
     */

    this.useWebGL = hasWebGL
    this.isReady = false
    this.isMuted = false
    this.isEnded = false
    this.isFocused = false
    this.isKeydown = false
    this.isPlaying = false
    this.isPaused = false
    this.isStopped = false
    this.isTouching = false
    this.isAnimating = false
    this.isFullscreen = false
    this.isMousedown = false
    this.isVREnabled = false
    this.isVRPossible = isVRPossible()
    this.isHMDAvailable = false
    this.isHMDPositionSensorAvailable = false

    return this
  }

  /**
   * Updates state value by key
   *
   * @public
   * @fires module:axis/state~State#update
   * @param {String} key - State key to update.
   * @param {Mixed} value - State value to update for key.
   */

  update (key, value) {
    let previous = null

    if (this.isConstrainedWith(key)) {
      return this
    }

    if (typeof key !== 'undefined' && typeof value !== 'undefined') {
      previous = this[key]

      if (previous != null && typeof previous === 'object') {
        this[key] = { ...this[key], ...value }
      } else if (this[key] !== value) {
        this[key] = value
      } else {
        return this
      }

      /**
       * Update event.
       *
       * @public
       * @event module:axis/state~State#update
       * @type {Object}
       * @property {String} key - Updated property key
       * @property {Mixed} value - Updated property value
       * @property {Mixed} previous - Previous value before update.
       */

      this.emit('update', { key, value, previous })
    }

    return this
  }

  /**
   * Predicate to determine if state is constrained by key.
   *
   * @public
   * @param {String} key - Key path to determine if there is a constraint.
   * @return {Boolean}
   */

  isConstrainedWith (key) {
    const constraints = this.scope.projections.constraints

    /**
     * Recursively checks if key part `k[i]' is in object `o'
     * and its value is `true'.
     *
     * @private
     * @param {Object} o - Object to check
     * @param {String} k - Key path string dilimited by `.'
     * @return {Boolean}
     */

    function isConstrained (o, k) {
      const keys = k.split('.')
      if (typeof o[keys[0]] === 'object') {
        return isConstrained(o[keys.shift()], keys.join(','))
      }
      return o[keys[0]] === true
    }

    // no constraint if `constraints' is `null'
    return constraints == null ? false : isConstrained(constraints, key)
  }

  /**
   * Sets a ready state.
   *
   * @public
   * @fires module:axis~Axis#ready
   * @fires module:axis/state~State#ready
   */

  ready () {
    if (!this.isReady) {
      this.isReady = true

      /**
       * Ready  event.
       *
       * @public
       * @event module:axis/state~State#ready
       */

      this.emit('ready')

      /**
       * Ready  event.
       *
       * @public
       * @event module:axis~Axis#ready
       */

      this.scope.emit('ready')
    }
    return this
  }

  /**
   * Polls for a connected HMD
   *
   * @public
   * @fires module:axis~Axis#vrhmdavailable
   * @return {Boolean}
   */

  pollForVRDevice () {
    const self = this

    // poll if VR is enabled.
    if (isVRPossible()) {
      this.isVREnabled = false

      // kill current poll
      clearInterval(this.vrPollID)

      // begin new poll for HMD and sensor
      this.vrPollID = setInterval(function () {
        getVRDevices().then(onVRDevices)
      }, VR_POLL_TIMEOUT)

      return true
    }

    return false

    /**
     * Callback for `getVRDevices()'.
     *
     * @private
     * @param {Array} devices - An array of connected VR devices.
     */

    function onVRDevices (devices) {
      let sensor = null
      let hmd = null

      // if HMD is connected bail
      if (self.isHMDAvailable && self.isHMDPositionSensorAvailable) {
        // if device has been unplugged
        if (devices.length === 0) {
          self.isHMDAvailable = false
          self.isHMDPositionSensorAvailable = false
          self.vrHMD = null
          self.vrPositionSensor = null
          self.scope.emit('vrhmdunavailable')
          return
        }
      }

      // detect first HMDVRDevice
      for (let i = 0; i < devices.length; ++i) {
        let device = devices[i]
        if (device instanceof window.HMDVRDevice) {
          hmd = device
          self.isHMDAvailable = true
          break
        }
      }

      if (hmd) {
        // detect first associated PositionSensorVRDevice instance
        for (let i = 0; i < devices.length; ++i) {
          let device = devices[i]
          if (device instanceof window.PositionSensorVRDevice &&
              device.hardwareUnitId === hmd.hardwareUnitId) {
            sensor = device
            self.isHMDPositionSensorAvailable = true
            break
          }
        }
      }

      if (hmd && sensor) {
        if (self.vrHMD == null ||
            (self.vrHMD && self.vrHMD.hardwareUnitId !== hmd.hardwareUnitId)) {
          self.vrHMD = hmd
          self.vrPositionSensor = sensor

          /**
           * VR HMD available event.
           *
           * @public
           * @event module:axis~Axis#vrhmdavailable
           * @type {Object}
           * @property {HMDVRDevice} hmd - Connected HMDVRDevice instance.
           * @property {PositionSensorVRDevice} sensor - Associated position sensor.
           */

          self.scope.emit('vrhmdavailable', {hmd: hmd, sensor: sensor})
        }
      }
    }
  }

  /**
   * Handles `onmousedown' events on the windows document.
   *
   * @private
   * @param {Event} e
   */

  onmousedown (e) {
    const scope = this.scope
    if (e.target === scope.renderer.domElement) {
      this.update('isFocused', true)
    } else {
      this.update('isFocused', false)
    }
  }

  /**
   * Handles `onfullscreenchange' events on window.
   *
   * @private
   * @param {Event} e
   * @fires module:axis~Axis#fullscreenchange
   */

  onfullscreenchange (e) {
    this.update('isFocused', true)
    this.update('isAnimating', false)
    this.update('isFullscreen', e)

    /**
     * Fullscreen change event.
     *
     * @public
     * @event module:axis~Axis#fullscreenchange
     * @type {Event}
     */

    this.scope.emit('fullscreenchange', e)
  }

  /**
   * Converts state to a JSON serializable object.
   *
   * @public
   * @return {Object}
   */

  toJSON () {
    return {
      /** State variables. */
      interpolationFactor: this.interpolationFactor,
      scrollVelocity: this.scrollVelocity,
      percentloaded: this.percentloaded,
      mouseFriction: this.mouseFriction,
      originalsize: this.originalsize,
      currentTime: this.currentTime,
      orientation: this.orientation,
      projection: this.projection,
      lastVolume: this.lastVolume,
      lastRefresh: this.lastRefresh,
      pointerX: this.pointerX,
      pointerY: this.pointerY,
      duration: this.duration,
      friction: this.friction,
      radius: this.radius,
      center: this.center,
      height: this.height,
      width: this.width,
      touch: this.touch,
      keys: this.keys,
      fov: this.fov,
      src: this.src,

      /** State predicate. */
      isReady: this.isReady,
      isMuted: this.isMuted,
      isEnded: this.isEnded,
      allowWheel: this.allowWheel,
      isFocused: this.isFocused,
      isKeydown: this.isKeydown,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isStopped: this.isStopped,
      isAnimating: this.isAnimating,
      isFullscreen: this.isFullscreen,
      isImage: this.isImage,
      isVREnabled: this.isVREnabled,
      isHMDAvailable: this.isHMDAvailable,
      isHMDPositionSensorAvailable: this.isHMDPositionSensorAvailable,
      isResizable: this.isResizable,
      isMousedown: this.isMousedown,
      isTouching: this.isTouchingj,
      isVRPossible: this.isVRPossible,
      isCrossOrigin: this.isCrossOrigin
    }
  }
}
