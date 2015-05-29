
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

var EventEmitter = require('emitter')
  , fullscreen = require('fullscreen')
  , keycode = require('keycode')
  , events = require('events')
  , merge = require('merge')
  , path = require('path')

/**
 * Local dependencies
 * @private
 */

var getVRDevices = require('./util').getVRDevices
  , isVREnabled = require('./util').isVREnabled
  , constants = require('./constants')
  , isImage = require('./util').isImage

var VR_POLL_TIMEOUT = constants.VR_POLL_TIMEOUT;
var MAX_FRICTION_VALUE = constants.MAX_FRICTION_VALUE;
var MIN_FRICTION_VALUE = constants.MIN_FRICTION_VALUE;
var MAX_FRICTION_TOLERANCE = constants.MAX_FRICTION_TOLERANCE;

// defaults
var DEFAULT_FOV = constants.DEFAULT_FOV;
var DEFAULT_FRICTION = constants.DEFAULT_FRICTION;
var DEFAULT_PROJECTION = constants.DEFAULT_PROJECTION;
var DEFAULT_SCROLL_VELOCITY = constants.DEFAULT_SCROLL_VELOCITY;
var DEFAULT_GEOMETRY_RADIUS = constants.DEFAULT_GEOMETRY_RADIUS;

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
 * @param {Boolean} [opts.isResizable = false] - Allow the axis frame to be
 * resizable.
 * @param {Boolean} [opts.isClickable = true] - Allow the axis frame to be
 * clickable.
 * @param {Boolean} [opts.isInverted = false] - Inverts directional controls.
 * @param {Number} [opts.radius = 400] = Geometry radius.
 * @param {Number} [opts.height] - Frame height.
 * @param {Number} [opts.width] - Frame width.
 * @param {Boolean} [opts.muted = false] - Initial vieo muted state.
 * @param {Boolean} [opts.allowWheel = false] - Use mouse wheel for zooming.
 * @param {Number} [opts.scrollVelocity = DEFAULT_SCROLL_VELOCITY] - Scroll velocity.
 * @param {Boolean} [opts.autoplay = false] - Indicates whether a video should
 * autoplay after loading.
 * @param {Number} [opts.fov = DEFAULT_FOV] - Field of view.
 * @param {Boolean} [opts.isImage = false] - Force rendering of image instead of
 * a video.
 * @param {Number} [opts.friction = DEFAULT_FRICTION] - Friction to
 * apply to x and y coordinates.
 */

module.exports = State;
function State (scope, opts) {
  // ensure instance
  if (!(this instanceof State)) {
    return new State(scope, opts);
  } else if ('object' != typeof scope) {
    throw new TypeError("State expects scope to be an object.");
  }

  // event delegation
  var windowEvents = events(window, this);
  var documentEvents = events(document, this);

  // initialize window events
  windowEvents.bind('deviceorientation');
  windowEvents.bind('orientationchange');

  // initialize document events
  documentEvents.bind('touch', 'onmousedown');
  documentEvents.bind('mousedown');
  documentEvents.bind('keydown');
  documentEvents.bind('keyup');

  // ensure options can't be overloaded
  opts = Object.freeze(opts);
  this.__defineGetter__('options', function () {
    return opts;
  });

  /** Current scope for the instance. */
  this.scope = scope;

  /** VR polling ID. */
  this.vrPollID = 0;

  /**
   * State variables.
   */

  /** Current device orientation in geographic coordinates. */
  this.deviceorientation = {alpha: 0, beta: 0, gamma: 0};

  /** Percent of content loaded. */
  this.percentplayed = 0;

  /** Original content size. */
  this.originalsize = {width: null, height: null};

  /** Current device orientation. */
  this.orientation = 0;

  /** Current projection type. */
  this.projection = DEFAULT_PROJECTION;

  /** Last known volume level. */
  this.lastVolume = 0;

  /** Last known refresh. */
  this.lastRefresh = Date.now();

  /** Points representing a drag offset. */
  this.dragstart = {x:0, y:0};

  /** Last known mousedown interaction. */
  this.mousedownTimestamp = 0;

  /** Current geometry type. */
  this.geometry = null;

  /** Inverted state. */
  this.isInverted = false;

  /** Total duration in seconds for video. */
  this.duration = 0;

  /** Last known size. */
  this.lastSize = {width: null, height: null};

  /** Current geometry radius. */
  this.radius = DEFAULT_GEOMETRY_RADIUS;

  /** Known center for frame of reference. */
  this.center = {x: null, y: null, z:null};

  /** Known frame height. */
  this.height = 0;

  /** Known touch coordinates. */
  this.touch = {x: 0, y: 0};

  /** Known frame width. */
  this.width = 0;

  /** State cache. */
  this.cache = {};

  /** Scroll velocity. */
  this.scrollVelocity = DEFAULT_SCROLL_VELOCITY;

  /** Animation frame ID. */
  this.animationFrameID = null;

  /** Currently played video time. */
  this.currentTime = 0;

  /** Currently active control keys. */
  this.keys = {up: false, down: false, left: false, right: false};

  /** Friction to apply to x and y coordinates. */
  this.friction = DEFAULT_FRICTION;

  /** Y coordinate. */
  this.y = 0;

  /** X coordinate. */
  this.x = 0;

  /** Z coordinate. */
  this.z = 0;

  /** Current field of view. */
  this.fov = DEFAULT_FOV;

  /** Current frame source. */
  this.src = null;

  /** Currently connected VR HMD if applicable. */
  this.vrHMD = null;

  /** Currently connected position sensor vr device. */
  this.vrPositionSensor = null;

  /**
   * State predicates.
   */

  /** Predicate indicating if Axis is ready. */
  this.isReady = false;

  /** Predicate indicating if video is muted. */
  this.isMuted = false;

  /** Predicate indicating if video has ended. */
  this.isEnded = false;

  /** Predicate indicating the use of the mouse wheel. */
  this.allowWheel = false;

  /** Predicate indicating if Axis is focused. */
  this.isFocused = false;

  /** Predicate indicating if key is down. */
  this.isKeydown = false;

  /** Predicate indicating if video is playing. */
  this.isPlaying = false;

  /** Predicate indicating is video is paused. */
  this.isPaused = false;

  /** Predicate to indicating if Axis is clickable.*/
  this.isClickable = true;

  /** Predicate indicating an animation is occuring. */
  this.isAnimating = false;

  /** Predicate indicating fullscreen is active. */
  this.isFullscreen = false;

  /** Predicate indicating if frame is an image. */
  this.isImage = false;

  /** Predicate indicating focus should be forced. */
  this.forceFocus = false;

  /** Predicate indicating control are allowed. */
  this.allowControls = true;

  /** Predicate indicating VR support. */
  this.isVREnabled = false;

  /** Predicate indicating if an HMD device is connected. */
  this.isHMDAvailable = false;

  /** Predicate indicating if an HMD device sensor is connected. */
  this.isHMDPositionSensorAvailable = false;

  /** Predicate indicating axis is resizable. */
  this.isResizable = false;

  /** Predicate indicating the mouse is down. */
  this.isMousedown = false;

  /** Predicate indicating if touching. */
  this.isTouching = false;

  /** Predicate indicating if a video should autoplay. */
  this.shouldAutoplay = false;

  // listen for fullscreen changes
  fullscreen.on('change', this.onfullscreenchange.bind(this));

  // handle updates
  this.on('update', function (e) {
    switch (e.key) {
      case 'src':
        this.isReady = false;
        if (isImage(e.value)) {
          this.isImage = true;
        } else {
          this.isImage = false;
        }
        break;

      case 'x':
      case 'y':
      case 'z':
        if (false == this.isMousedown &&
            false == this.isKeydown &&
            false == this.isTouching){ break; }

        // (cof) coefficient of friction (0 >= mu >= 0.99)
        var mu = this.friction = Math.max(MIN_FRICTION_VALUE,
                                          Math.min(MAX_FRICTION_VALUE,
                                                   this.friction));
        // delta
        var d = e.previous - e.value;
        // value
        var v = e.value;
        // weight
        var w = d * mu;
        // tolerance
        var t = Math.abs(d);

        if (t < MAX_FRICTION_TOLERANCE) {
          v += w;
        }

        // apply friction to x, y, z coordinates
        this[e.key] = v;
        break;
    }
  });

  // init
  this.reset();
}

// mixin `EventEmitter'
EventEmitter(State.prototype);

/**
 * Resets state values
 *
 * @public
 * @param {Object} [overrides] - Optionals overrides
 * @return {Object}
 */

State.prototype.reset = function (overrides) {
  var opts = merge(merge({}, this.options), overrides || {});

  // prevent additions to the object
  Object.seal(this);

  // start polling for a connected VR device
  this.pollForVRDevice();

  /**
   * Configurable variables.
   */

  this.projection = opts.projection || DEFAULT_PROJECTION;
  this.radius = opts.radius || DEFAULT_GEOMETRY_RADIUS;
  this.height = opts.height || 0;
  this.width = opts.width || 0;
  this.scrollVelocity = opts.scrollVelocity || DEFAULT_SCROLL_VELOCITY;
  this.fov = opts.fov || DEFAULT_FOV;
  this.src = opts.src || null;
  this.isImage = opts.isImage || false;
  this.isClickable = null != opts.isClickable ? opts.isClickable : true;
  this.isInverted = opts.isInverted || false;
  this.forceFocus = opts.forceFocus || false;
  this.allowControls = null != opts.allowControls ? opts.allowControls : true;
  this.isResizable = opts.resizable || false;
  this.shouldAutoplay = null != opts.autoplay ? opts.autoplay : false;
  this.allowWheel = null == opts.allowWheel ? false : opts.allowWheel;
  this.friction = opts.friction || DEFAULT_FRICTION;

  /**
   * State variables.
   */

  this.deviceorientation = {alpha: 0, beta: 0, gamma: 0};
  this.percentplayed = 0;
  this.originalsize = {width: null, height: null};
  this.orientation = window.orientation || 0;
  this.lastVolume = 0;
  this.lastRefresh = Date.now();
  this.dragstart = {x:0, y:0};
  this.mousedownTimestamp = 0;
  this.geometry = null;
  this.duration = 0;
  this.lastSize = {width: null, height: null};
  this.center = {x: null, y: null, z:null};
  this.touch = {x: 0, y: 0};
  this.cache = {};
  this.animationFrameID = null;
  this.currentTime = 0;
  this.keys = {up: false, down: false, left: false, right: false};
  this.y = 0;
  this.x = 0;
  this.z = 0;

  /**
   * State predicates.
   */

  this.isReady = false;
  this.isMuted = false;
  this.isEnded = false;
  this.allowWheel = false;
  this.isFocused = false;
  this.isKeydown = false;
  this.isPlaying = false;
  this.isPaused = false;
  this.isAnimating = false;
  this.isFullscreen = false;
  this.isMousedown = false;
  this.isTouching = false;
  this.isVREnabled = isVREnabled();
  this.isHMDAvailable = false;
  this.isHMDPositionSensorAvailable = false;

  return this;
};

/**
 * Updates state value by key
 *
 * @public
 * @fires module:axis/state~State#update
 * @param {String} key - State key to update.
 * @param {Mixed} value - State value to update for key.
 */

State.prototype.update = function (key, value) {
  var constraints = this.scope.projections.constraints;
  var previous = null;
  var tmp = null;

  if (this.isConstrainedWith(key)) {
    return this;
  }

  if ('undefined' != typeof key && 'undefined' != typeof value) {
    previous = this[key];

    if (null != previous && 'object' == typeof previous) {
      this[key] = merge(this[key], value);
    } else if (this[key] != value) {
      this[key] = value;
    } else {
      return this;
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

    this.emit('update', {
      key: key,
      value: value,
      previous: previous
    });
  }

  return this;
};

/**
 * Predicate to determine if state is constrained by key.
 *
 * @public
 * @param {String} key - Key path to determine if there is a constraint.
 * @return {Boolean}
 */

State.prototype.isConstrainedWith = function (key) {
  var constraints = this.scope.projections.constraints;

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
    var keys = k.split('.');
    if ('object' == typeof o[keys[0]]) {
      return isConstrained(o[keys.shift()], keys.join(','));
    } else { return true == o[keys[0]]; }
  }

  // no constraint if `constraints' is `null'
  return null == constraints ? false : isConstrained(constraints, key);
};


/**
 * Sets a ready state.
 *
 * @public
 * @fires module:axis~Axis#ready
 * @fires module:axis/state~State#ready
 */

State.prototype.ready = function () {
  if (false == this.isReady) {
    this.update('isReady', true);

    /**
     * Ready  event.
     *
     * @public
     * @event module:axis/state~State#ready
     */

    this.emit('ready');

    /**
     * Ready  event.
     *
     * @public
     * @event module:axis~Axis#ready
     */

    this.scope.emit('ready');
  }
  return this;
};

/**
 * Polls for a connected HMD
 *
 * @public
 * @fires module:axis~Axis#vrhmdavailable
 * @return {Boolean}
 */

State.prototype.pollForVRDevice = function () {
  var self = this;

  // poll if VR is enabled.
  if (isVREnabled()) {
    this.isVREnabled = true;

    // kill current poll
    clearInterval(this.vrPollID);

    // begin new poll for HMD and sensor
    this.vrPollID = setInterval(function () {
      getVRDevices().then(onVRDevices);
    }, VR_POLL_TIMEOUT);

    return true;
  } else {
    return false;
  }

  /**
   * Callback for `getVRDevices()'.
   *
   * @private
   * @param {Array} devices - An array of connected VR devices.
   */

  function onVRDevices (devices) {
    var device = null;
    var sensor = null;
    var hmd = null;

    // if HMD is connected bail
    if (self.isHMDAvailable && self.isHMDPositionSensorAvailable) {
      // if device has been unplugged
      if (0 == devices.length) {
        self.isHMDAvailable = false;
        self.isHMDPositionSensorAvailable = false;
        self.vrHMD = null;
        self.vrPositionSensor = null;
        return;
      }
    }

    // detect first HMDVRDevice
    for (var i = 0; i < devices.length; ++i) {
      device = devices[i];
      if (device instanceof HMDVRDevice) {
        hmd = device;
        self.isHMDAvailable = true;
        break;
      }
    }

    if (hmd) {
      // detect first associated PositionSensorVRDevice instance
      for (var i = 0; i < devices.length; ++i) {
        device = devices[i];
        if (device instanceof PositionSensorVRDevice &&
            device.hardwareUnitId == hmd.hardwareUnitId) {
          sensor = device;
        self.isHMDPositionSensorAvailable = true;
        break;
        }
      }
    }

    if (hmd && sensor) {
      if (self.vrHMD && self.vrHMD != hmd.hardwareUnitId) {
        self.vrHMD = hmd;
        self.vrPositionSensor = sensor;

        /**
         * VR HMD available event.
         *
         * @public
         * @event module:axis~Axis#vrhmdavailable
         * @type {Object}
         * @property {HMDVRDevice} hmd - Connected HMDVRDevice instance.
         * @property {PositionSensorVRDevice} sensor - Associated position sensor.
         */

        self.scope.emit('vrhmdavailable', {hmd: hmd, sensor: sensor});
      }
    }
  }
};

/**
 * Handles `onmousedown' events on the windows document.
 *
 * @private
 * @param {Event} e
 */

State.prototype.onmousedown = function (e) {
  var scope = this.scope;
  if (e.target == scope.renderer.domElement) {
    this.update('isFocused', true);
  } else {
    this.update('isFocused', false);
  }
};

/**
 * Handles `onkeydown' events on the windows document.
 *
 * @private
 * @param {Event} e
 * @fires module:axis~Axis#keydown
 */

State.prototype.onkeydown = function (e) {
  var constraints = this.scope.projections.constraints;
  var focused = this.forceFocus || this.isFocused;
  var scope = this.scope;
  var code = e.which;
  var self = this;

  /**
   * Detects keydown event with respect to
   * the current projection constraints.
   *
   * @private
   * @param {String} name
   */

  function detect (name) {
    var tmp = {};
    if (code == keycode(name)) {
      if (null == constraints ||
          null == constraints.keys ||
          true != constraints.keys[name]) {
        e.preventDefault();
        tmp[name] = true;
        self.update('keys', tmp);
        self.update('isKeydown', true);
        self.update('isAnimating', false);
      }
    }
  }

  if (focused) {
    detect('up');
    detect('down');
    detect('left');
    detect('right');

    /**
     * Key down event.
     *
     * @public
     * @event module:axis~Axis#keydown
     * @type {Event}
     */

    this.scope.emit('keydown', e);
  }
};

/**
 * Handles `onkeyup' events on the windows document.
 *
 * @private
 * @param {Event} e
 * @fires module:axis~Axis#keyup
 */

State.prototype.onkeyup = function (e) {
  var constraints = this.scope.projections.constraints;
  var focused = this.forceFocus || this.isFocused;
  var scope = this.scope;
  var code = e.which;
  var self = this;

  /**
   * Detects keyup event with respect to
   * the current projection constraints.
   *
   * @private
   * @param {String} name
   */

  function detect (n) {
    var tmp = {};
    if (code == keycode(n)) {
      if (null == constraints ||
          null == constraints.keys ||
          true != constraints.keys[n]) {
        e.preventDefault();
        tmp[n] = false;
        self.update('isKeydown', false);
        self.update('keys', tmp);
      }
    }
  }

  if (focused) {
    detect('up');
    detect('down');
    detect('left');
    detect('right');

    /**
     * Key up event.
     *
     * @public
     * @event module:axis~Axis#keyup
     * @type {Event}
     */

    this.scope.emit('keyup', e);
  }
};

/**
 * Handles `ondeviceorientation' events on the window.
 *
 * @private
 * @param {Event} e
 * @fires module:axis~Axis#deviceorientation
 */

State.prototype.ondeviceorientation = function (e) {
  this.update('deviceorientation', {
    alpha: e.alpha,
    beta: e.beta,
    gamma: e.gamma
  });

  /**
   * Device orientation event.
   *
   * @public
   * @event module:axis~Axis#deviceorientation
   * @type {Event}
   */

  this.scope.emit('deviceorientation', e);
};

/**
 * Handles `orientationchange' events on the window.
 *
 * @private
 * @param {Event} e
 * @fires module:axis~Axis#orientationchange
 */

State.prototype.onorientationchange = function (e) {
  this.update('orientation', window.orientation);

  /**
   * Orientation change event.
   *
   * @public
   * @event module:axis~Axis#orientationchange
   * @type {Event}
   */

  self.emit('orientationchange', e);
};

/**
 * Handles `onfullscreenchange' events on window.
 *
 * @private
 * @param {Event} e
 * @fires module:axis~Axis#fullscreenchange
 */

State.prototype.onfullscreenchange = function (e) {
  this.update('isFocused', true);
  this.update('isAnimating', false);
  this.update('isFullscreen', e);

  /**
   * Fullscreen change event.
   *
   * @public
   * @event module:axis~Axis#fullscreenchange
   * @type {Event}
   */

  this.scope.emit('fullscreenchange', e);
};
