
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
 * The Axis module
 *
 * @module axis
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

var three = require('three.js')
  , dom = require('domify')
  , emitter = require('emitter')
  , events = require('events')
  , raf = require('raf')
  , hasWebGL = require('has-webgl')
  , fullscreen = require('fullscreen')
  , keycode = require('keycode')
  , merge = require('merge')

/**
 * Local dependencies
 * @private
 */

var tpl = require('./template.html')
  , Projection = require('./projection')
  , createCamera = require('./camera')
  , geometries = require('./geometry')
  , State = require('./state')
  , isImage = require('./util').isImage
  , constants = require('./constants')

// uncomment to enable debugging
//window.DEBUG = true;

// install THREE.js addons
Axis.THREE = three;
require('three-canvas-renderer')(three);
require('three-vr-effect')(three);

// frame click threshold
var FRAME_CLICK_THRESHOLD = constants.FRAME_CLICK_THRESHOLD;

// min/max wheel distances
var MIN_WHEEL_DISTANCE = constants.MIN_WHEEL_DISTANCE;
var MAX_WHEEL_DISTANCE = constants.MAX_WHEEL_DISTANCE;

// min/max x/y coordinates
var MIN_Y_COORDINATE = constants.MIN_Y_COORDINATE;
var MAX_Y_COORDINATE = constants.MAX_Y_COORDINATE;
var MIN_X_COORDINATE = constants.MIN_X_COORDINATE;
var MAX_X_COORDINATE = constants.MAX_X_COORDINATE;

// default projection
var DEFAULT_PROJECTION = constants.DEFAULT_PROJECTION;
var CARTESIAN_CALIBRATION_VALUE = constants.CARTESIAN_CALIBRATION_VALUE;

/**
 * Axis constructor
 *
 * @public
 * @class Axis
 * @extends EventEmitter
 * @param {Object} parent - Parent DOM Element
 * @param {Object} [opts] - Constructor options passed to the axis
 * state instance.
 * @see {@link module:axis/state~State}
 */

module.exports = Axis;
function Axis (parent, opts) {

  // normalize options
  opts = (opts = opts || {});

  // disable vr if `navigator.getVRDevices' isn't defined
  if ('function' != typeof navigator.getVRDevices) {
    opts.vr = false;
  }

  // ensure instance
  if (!(this instanceof Axis)) {
    return new Axis(opts);
  } else if (!(parent instanceof Element)) {
    throw new TypeError("Expecting DOM Element");
  }

  var self = this;

  /** Parent DOM node element. */
  this.parent = parent;

  /** Instance constainer DOM element. */
  this.domElement = dom(tpl);

  /** Instance video DOM element. */
  this.video = this.domElement.querySelector('video');

  this.video.onerror = console.error.bind(console);

  /** Axis' scene instance. */
  this.scene = null;

  /** Axis' renderer instance.*/
  this.renderer = opts.renderer || (
    hasWebGL ?
    new three.WebGLRenderer({antialias: true}) :
    new three.CanvasRenderer()
  );

  /** Axis' VR effect instance. */
  this.vreffect = new three.VREffect(this.renderer, function (e) {
    self.debug('VREffect:', e);
  });

  /** Axis' texture instance. */
  this.texture = null;

  /** Axis' state instance. */
  this.state = new State(this, opts);

  /** Axis' projections instance. */
  this.projections = new Projection(this);

  // install viewport projections
  this.projection('flat', require('./projection/flat'));
  this.projection('fisheye', require('./projection/fisheye'));
  this.projection('equilinear', require('./projection/equilinear'));
  this.projection('tinyplanet', require('./projection/tinyplanet'));

  // initialize projection
  this.projection(this.projections.current);

  /** Axis' camera instance. */
  this.camera = createCamera(this);

  /** Current axis orientation. */
  this.orientation = {x: 0, y: 0, z: 0};

  /** Axis' controls. */
  this.controls = {
    mouse: require('./controls/mouse')(this),
    touch: require('./controls/touch')(this),
    keyboard: require('./controls/keyboard')(this),
    orientation: require('./controls/orientation')(this)
  };

  this.controls.default = (
    require('./controls/controller')(this).enable().target(this.camera)
  );

  /**
   * Sets an attribute on the instance's
   * video DOM element from options passed in
   * to the constructor.
   *
   * @private
   * @param {String} property
   */

  function setVideoAttribute (property) {
    if (opts[property]) {
      self.video.setAttribute(property, opts[property]);
    }
  }

  // set video options
  setVideoAttribute('preload');
  setVideoAttribute('autoplay');
  setVideoAttribute('crossorigin');
  setVideoAttribute('loop');
  setVideoAttribute('muted');

  // event delegation manager
  var eventDelegation = {};

  // init window events
  eventDelegation.window = events(window, this);
  eventDelegation.window.bind('resize');

  // init video events
  eventDelegation.video = events(this.video, this);
  eventDelegation.video.bind('canplaythrough');
  eventDelegation.video.bind('play');
  eventDelegation.video.bind('pause');
  eventDelegation.video.bind('playing');
  eventDelegation.video.bind('progress');
  eventDelegation.video.bind('timeupdate');
  eventDelegation.video.bind('loadstart');
  eventDelegation.video.bind('waiting');
  eventDelegation.video.bind('ended');

  // init dom element events
  eventDelegation.element = events(this.domElement, this);
  eventDelegation.element.bind('click');
  eventDelegation.element.bind('touch', 'onclick');
  eventDelegation.element.bind('mousemove');
  eventDelegation.element.bind('mousewheel');
  eventDelegation.element.bind('mousedown');
  eventDelegation.element.bind('mouseup');
  eventDelegation.element.bind('touchstart');
  eventDelegation.element.bind('touchend');
  eventDelegation.element.bind('touchmove');

  // renderer options
  this.renderer.autoClear = null != opts.autoClear ? opts.autoClear : true;
  this.renderer.setPixelRatio(opts.devicePixelRatio || window.devicePixelRatio);
  this.renderer.setClearColor(opts.clearColor || 0x000, 1);

  // attach renderer to instance node container
  this.domElement.querySelector('.container').appendChild(this.renderer.domElement);

  // mute if explicitly set
  if (opts.muted) {
    this.mute(true);
  }

  // initial volume
  this.volume(opts.volume || 1);

  // initialize frame source
  this.src(opts.src);

  // init when ready
  this.once('ready', function () {
    this.debug('ready');
    this.projection('equilinear');
  });

  this.on('fullscreenchange', function () {
    this.debug('fullscreenchange');
    this.state.update('isFocused', true);
    this.state.update('isAnimating', false);

    if (this.state.isFullscreen) {
      this.emit('enterfullscreen');
    } else {
      if (this.state.isVREnabled) {
        // @TODO(werle) - not sure how to fix this bug but the scene
        // needs to be re-rendered
        raf(function () { this.render(); }.bind(this));
      }

      this.size(this.state.lastSize.width, this.state.lastSize.height);

      this.state.update('lastSize', {width: null, height: null});
      this.emit('exitfullscreen');
    }

  });
}

// mixin `Emitter'
emitter(Axis.prototype);

/**
 * Handle `onclick' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onclick = function (e) {
  this.debug('onclick');
  var now = Date.now();
  var timestamp = this.state.mousedownTimestamp;
  var isClickable = this.state.isClickable;
  var isImage = this.state.isImage;
  var isPlaying = this.state.isPlaying;
  var delta = (now - timestamp);

  if (false == isClickable || delta > FRAME_CLICK_THRESHOLD) {
    return false;
  }

  e.preventDefault();

  if (false == isImage) {
    if (isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Click event.
   *
   * @public
   * @event module:axis~Axis#click
   * @type {Object}
   */

  this.emit('click', e);
};

/**
 * Handle `oncanplaythrough' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.oncanplaythrough = function (e) {
  this.debug('oncanplaythrough');
  this.state.duration = this.video.duration;

  if (null == this.texture) {
    this.texture = new three.Texture(this.video);
    this.texture.format = three.RGBFormat;
    this.texture.minFilter = three.LinearFilter;
    this.texture.magFilter = three.LinearFilter;
    this.texture.generateMipmaps = false;
  }

  this.emit('canplaythrough', e);
  this.state.ready();

  if (false == this.state.shouldAutoplay) {
    this.state.update('isPaused', true);
    this.video.pause();
  } else {
    this.video.play();
  }
};

/**
 * Handle `onplay' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onplay = function (e) {
  raf(function() {
    this.debug('onplay');
    this.state.update('isPaused', false);
    this.state.update('isEnded', false);
    this.emit('play', e);
  }.bind(this));
};

/**
 * Handle `onpause' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onpause = function (e) {
  this.debug('onpause');
  this.state.update('isPaused', true);
  this.state.update('isPlaying', false);
  this.emit('pause', e);
};

/**
 * Handle `onplaying' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onplaying = function (e) {
  this.debug('onplaying');
  this.state.update('isPaused', false);
  this.state.update('isPlaying', true);
  this.emit('playing', e);
};

/**
 * Handle `onwaiting' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onwaiting = function (e) {
  this.debug('onwaiting', e);
  this.emit('wait', e);
};

/**
 * Handle `onloadstart' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onloadstart = function (e) {
  this.debug('onloadstart');
  this.emit('loadstart', e);
};

/**
 * Handle `onprogress' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onprogress = function (e) {
  var video = this.video;
  var percent = 0;
  this.debug('onprogress');

  try {
    percent = video.buffered.end(0) / video.duration;
  } catch (e) {
    this.debug('error', e);
    try {
      percent = video.bufferedBytes / video.bytesTotal;
    } catch (e) {
      this.debug('error', e);
    }
  }

  e.percent = percent * 100;
  this.state.update('percentplayed', percent);
  this.emit('progress', e);
};

/**
 * Handle `ontimeupdate' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.ontimeupdate = function (e) {
  this.debug('ontimeupdate');
  e.percent = this.video.currentTime / this.video.duration * 100;
  this.state.update('duration', this.video.duration);
  this.state.update('currentTime', this.video.currentTime);
  this.emit('timeupdate', e);
};

/**
 * Handle `onended' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onended = function (e) {
  this.debug('onended');
  this.state.update('isEnded', true);
  this.emit('end');
  this.emit('ended');
};

/**
 * Handle `onmousedown' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onmousedown = function (e) {
  this.debug('onmousedown');
  this.state.update('mousedownTimestamp', Date.now());
  this.state.update('isAnimating', false);
  this.state.update('dragstart', {x: e.pageX, y: e.pageY});
  this.state.update('isMousedown', true);
  this.emit('mousedown', e);
};

/**
 * Handle `onmouseup' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onmouseup = function (e) {
  this.debug('onmouseup');
  this.state.update('isMousedown', false);
  this.emit('mouseup', e);
};

/**
 * Handle `ontouchstart' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.ontouchstart = function (e) {
  var touch = e.touches[0];
  this.debug('ontouchstart');
  this.state.update('mousedownTimestamp', Date.now());
  this.state.update('isAnimating', false);
  this.state.update('dragstart', {x: touch.pageX, y: touch.pageY});
  this.state.update('isTouching', true);
  this.emit('touchstart', e);
};

/**
 * Handle `ontouchend' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.ontouchend = function(e) {
  this.debug('ontouchend');
  this.state.update('isTouching', false);
  this.emit('touchend', e);
};

/**
 * Handle `onresize' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onresize = function (e) {
  this.debug('onresize');
  var isResizable = this.state.isResizable;
  var isFullscreen = this.state.isFullscreen;

  if (isResizable && ! isFullscreen) {
    var containerStyle = getComputedStyle(this.domElement);
    var canvasStyle = getComputedStyle(this.renderer.domElement);
    var containerWidth = parseFloat(containerStyle.width);
    var containerHeight = parseFloat(containerStyle.width);
    var canvasWidth = parseFloat(canvasStyle.width);
    var canvasHeight = parseFloat(canvasStyle.height);
    var aspectRatio = canvasWidth / canvasHeight;
    var resized = false;
    var newWidth = 0;
    var newHeight = 0;

    // adjust for width while accounting for height
    if (canvasWidth > containerWidth ||
        canvasWidth < containerWidth &&
        canvasWidth < this.state.originalsize.width) {
      newWidth = containerWidth;
      newHeight = containerWidth / aspectRatio;
      resized = true;
    } else if (canvasHeight > containerHeight ||
               (canvasHeight > containerHeight &&
                canvasHeight < this.state.originalsize.height)) {
      newHeight = containerHeight;
      newWidth = containerHeight * aspectRatio;
      resized = true;
    }

    if (resized) {
      this.size(newWidth, newHeight);
      this.emit('resize', {
        width: this.state.width,
        height: this.state.height
      });
    }
  }
};

/**
 * Handle `onmousemove' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onmousemove = function (e) {
  this.debug('onmousemove');
  var constraints = this.projections.constraints;
  var xOffset = 0;
  var yOffset = 0;
  var x = this.state.pointerX;
  var y = this.state.pointerY;

  if (true == this.state.isMousedown) {
    xOffset = e.pageX - this.state.dragstart.x;
    yOffset = e.pageY - this.state.dragstart.y;

    this.state.update('dragstart', {
      x: e.pageX,
      y: e.pageY
    });

    if (this.state.isInverted) {
      x -= xOffset
      y += yOffset;
    } else {
      x += xOffset
      y -= yOffset;
    }

    this.state.update('pointerX', x);
    this.state.update('pointerY', y);
    this.cache({pointerX: x, pointerY: y});
    this.emit('mousemove', e);
  }
};

/**
 * Handle `ontouchmove' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.ontouchmove = function(e) {
  this.debug('ontouchmove');
  var constraints = this.projections.constraints;
  var xOffset = 0;
  var yOffset = 0;
  var touch = e.touches[0];
  var x = this.state.pointerX;
  var y = this.state.pointerY;

  if (false == this.state.isTouching) {
    return;
  }

  if (1 == e.touches.length) {
    e.preventDefault();

    xOffset = touch.pageX - this.state.dragstart.x;
    yOffset = touch.pageY - this.state.dragstart.y;

    this.state.update('dragstart', {x: touch.pageX, y: touch.pageY});

    if (this.state.isInverted) {
      x -= xOffset
      y += yOffset;
    } else {
      x += xOffset
      y -= yOffset;
    }

    this.state.update('pointerX', x);
    this.state.update('pointerY', y);
    this.cache({pointerX: x, pointerY: y});
    this.emit('touchmove', e);
    this.refresh();
  }
};

/**
 * Handle `onmousewheel' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onmousewheel = function (e) {
  this.debug('onmousewheel');
  var velocity = this.state.scrollVelocity;
  var min = MIN_WHEEL_DISTANCE;
  var max = MAX_WHEEL_DISTANCE;

  if ('number' != typeof velocity || false == this.state.allowWheel) {
    return false;
  }

  e.preventDefault();

  if (null != e.wheelDeltaY) { // chrome
    this.state.fov -= e.wheelDeltaY * velocity;
  } else if (null != e.wheelDelta ) { // ie
    this.state.fov -= event.wheelDelta * velocity;
  } else if (null != e.detail) { // firefox
    this.state.fov += e.detail * velocity;
  }

  if (this.state.fov < min) {
    this.state.fov = min;
  } else if (this.fov > max) {
    this.state.fov = max;
  }

  this.camera.setLens(this.state.fov);

  this.emit('mousewheel', e);
};

/**
 * Sets frame size
 *
 * @public
 * @param {Number} width
 * @param {Number} height
 */

Axis.prototype.size = function (width, height) {
  this.debug('size', width, height);
  this.state.width = width;
  this.state.height = height;

  if (this.camera) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  if (this.renderer) {
    this.renderer.setSize(width, height);
  }

  if (this.state.originalsize.width == null) {
    this.state.originalsize.width = width;
  }

  if (this.state.originalsize.height == null) {
    this.state.originalsize.height = height;
  }

  this.emit('size', width, height);
  return this;
};

/**
 * Sets or gets video src
 *
 * @public
 * @param {String} src - optional
 */

Axis.prototype.src = function (src) {
  if (src) {
    this.debug('src', src);
    this.state.update('src', src);

    if (!isImage(src)) {
      this.video.src = src;
      this.video.load();
    } else {
      this.state.isImage = true;
    }

    this.emit('source', src);
    return this;
  } else {
    return this.state.src;
  }
};

/**
 * Plays video frame
 *
 * @public
 */

Axis.prototype.play = function () {
  if (false == this.state.isImage) {
    if (true == this.state.isEnded) {
      this.seek(0);
    }
    this.debug('play');
    this.video.play();
  }
  return this;
};

/**
 * Pauses video frame
 *
 * @public
 */

Axis.prototype.pause = function () {
  if (false == this.state.isImage) {
    this.debug('pause');
    this.video.pause();
  }
  return this;
};

/**
 * Takes video to fullscreen
 *
 * @public
 * @param {Element} el
 */

Axis.prototype.fullscreen = function (el) {
  var opts = null;
  if (! fullscreen.supported) {
    return;
  } else if (typeof el == 'boolean' && el == false) {
    fullscreen.exit();
    return;
  } else if (this.state.isVREnabled) {
    opts = {vrDisplay: this.vreffect._vrHMD};
  } else if (! this.state.isFullscreen) {
    var canvasStyle = getComputedStyle(this.renderer.domElement);
    this.state.update('lastSize', {
      width: parseFloat(canvasStyle.width),
      height: parseFloat(canvasStyle.height)
    });

    this.size(window.screen.width, window.screen.height);
  }

  this.debug('fullscreen');
  this.state.update('isFullscreen', true);
  fullscreen(el || this.domElement, opts);
};

/**
 * Set or get volume on frame
 *
 * @public
 * @param {Number} volume
 */

Axis.prototype.volume = function (volume) {
  if (false == this.state.isImage) {
    if (null == volume) {
      return this.video.volume;
    }
    this.debug('volume', volume);
    this.state.update('lastVolume', this.video.volume);
    this.video.volume = volume
    this.emit('volume', volume);
  }
  return this;
};

/**
 * Mutes volume
 *
 * @public
 * @param {Boolean} mute - optional
 */

Axis.prototype.mute = function (mute) {
  this.debug('mute', mute);
  if (false == mute) {
    this.video.muted = false;
    this.state.update('isMuted', false);
    if (0 == this.volume()) {
      this.volume(this.state.lastvolume);
    }
  } else {
    this.state.update('isMuted', true);
    this.video.muted = true;
    this.volume(0);
    this.emit('mute');
  }
  return this;
};

/**
 * Unmute volume
 *
 * @public
 * @param {Boolean} mute - optional
 */

Axis.prototype.unmute = function (mute) {
  if (false == this.state.isImage) {
    this.mute(false);
    this.emit('unmute');
  }
  return this;
};

/**
 * Refreshes frame
 *
 * @public
 */

Axis.prototype.refresh = function () {
  var constraints = this.projections.constraints;
  var video = this.video;
  var delta = 4;
  var now = Date.now();
  var x = this.state.pointerX;
  var y = this.state.pointerY;

  this.debug('refresh');

  if (false == this.state.isImage) {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      if (now - this.state.lastRefresh >= 32) {
        this.state.lastRefresh = now;
        if (null != this.texture) {
          this.texture.needsUpdate = true;
        }
      }
    }
  }

  if (null == constraints || false != constraints.panoramic) {
    // @TODO(werle) - make this delta configurable
    delta = this.state.isInverted ? -delta : delta;

    if (this.state.keys.up) {
      y += delta;
    } else if (this.state.keys.down) {
      y -= delta;
    }

    if (this.state.keys.left) {
      x -= delta;
    } else if (this.state.keys.right) {
      x += delta;
    }

    if (this.camera) {
      this.camera.fov = this.state.fov;
      this.camera.updateProjectionMatrix();
    }

    // normalize y coordinate
    y = Math.max(MIN_Y_COORDINATE, Math.min(MAX_Y_COORDINATE, y));

    // normalize x coordinate
    if (x > MAX_X_COORDINATE) {
      x = x - MAX_X_COORDINATE;
    } else if (x < MIN_X_COORDINATE) {
      x = x + MAX_X_COORDINATE;
    }

    this.state.update('pointerX', x);
    this.state.update('pointerY', y);
    this.cache(this.coords());
  } else {
    this.state.update('pointerX', 90);
    this.state.update('pointerY', 0);
  }

  this.emit('refresh');
  return this;
};

/**
 * Refresh frame
 *
 * @public
 */

Axis.prototype.resizable = function (resizable) {
  if (typeof resizable == 'undefined') return this.state.isResizable;
  this.state.update('isResizable', resizable);
  return this;
};

/**
 * Seek to time in seconds
 *
 * @public
 * @param {Number} seconds
 */

Axis.prototype.seek = function (seconds) {
  if (false == this.state.isImage) {
    if (seconds >= 0 && seconds <= this.video.duration) {
      this.video.currentTime = seconds;
      this.emit('seek', seconds);
    }
  }
  return this;
};

/**
 * Fast forward `n' amount of seconds
 *
 * @public
 * @param {Number} seconds
 */

Axis.prototype.foward = function (seconds) {
  if (false == this.state.isImage) {
    this.seek(this.video.currentTime + seconds);
    this.emit('forward', seconds);
  }
  return this;
};

/**
 * Rewind `n' amount of seconds
 e
 * @public
 * @param {Number} seconds
 */

Axis.prototype.rewind = function (seconds) {
  if (false == this.state.isImage) {
    this.seek(this.video.currentTime - seconds);
    this.emit('rewind', seconds);
  }
  return this;
};

/**
 * Use plugin with frame
 *
 * @public
 * @param {Function} fn
 */

Axis.prototype.use = function (fn) {
  fn(this);
  return this;
};

/**
 * Draws frame
 *
 * @public
 */

Axis.prototype.draw = function () {
  var renderer = this.renderer;
  var radius = this.state.radius;
  var camera = this.camera;
  var scene = this.scene;
  var sensor = this.state.vrPositionSensor;;
  var hmd = this.state.vrHMD;

  if (this.state.isVREnabled) {
    if (hmd) {
      // get state
      var vrstate = sensor.getImmediateState();
      // get orientation
      var orientation = vrstate.orientation;
      // get position
      var position = vrstate.position;
      // create quat
      var quat = new three.Quaternion(orientation.x,
                                      orientation.y,
                                      orientation.z,
                                      orientation.w);
     if (this.camera) {
       this.camera.quaternion.copy(quat);
       if (position) {
         this.camera.position.applyQuaternion(position).multiplyScalar(1);
       }

       this.camera.updateProjectionMatrix();
     }
    }
  }

  if (this.orientation && 'function' == typeof this.orientation.update) {
    this.orientation.update();
  }

  this.emit('before:render');

  if (this.renderer && this.scene && this.camera) {
    if (this.state.isVREnabled) {
      this.vreffect.render(this.scene, this.camera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  this.emit('draw');

  return this;
};

/**
 * Look at a position in a [x, y, z] vector
 *
 * @public
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */

Axis.prototype.lookAt = function (x, y, z) {
  if (this.camera) {
    x = this.camera.target.x = x;
    y = this.camera.target.y = y;
    z = this.camera.target.z = z;
    this.camera.lookAt(this.camera.target);
    this.camera.position.copy(this.camera.target).negate();
    this.emit('lookat', {x: x, y: y, z: z});
  }

  return this;
};

/**
 * Renders the frame
 *
 * @public
 */

Axis.prototype.render = function () {
  var domElement = this.domElement;
  var self = this;
  var style = getComputedStyle(this.parent);
  var fov = this.state.fov;
  var width = this.state.width || parseFloat(style.width);
  var height = this.state.height || parseFloat(style.height);
  var aspectRatio = 0;

  // attach dom node to parent
  if (false == this.parent.contains(this.domElement)) {
    this.parent.appendChild(this.domElement);
  }

  if (0 == height) {
    height = Math.min(width, window.innerHeight);
    aspectRatio = width / height;
    height = height / aspectRatio;
  }

  // initialize texture
  if (this.state.isImage) {
    this.texture = three.ImageUtils.loadTexture(this.src(), null, function () {
      self.state.ready();
    });
  }

  // initialize size
  this.size(width, height);

  // initialize projection if camera has not been created
  if (null == this.camera) {
    this.projection(this.projections.current);
  }

  // start animation loop
  raf.cancel(this.state.animationFrameID);
  this.state.animationFrameID  = raf(function loop () {
    var parentElement = domElement.parentElement;
    if (parentElement && parentElement.contains(domElement)) {
      raf(loop);
      self.update();
    }
  });

  this.emit('render');

  return this;
};

/**
 * Sets view offset
 *
 * @public
 * @see {@link http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera}
 */

Axis.prototype.offset = function () {
  this.camera.setViewOffset.apply(this.camera, arguments);
  return this;
};

/**
 * Set or get height
 *
 * @public
 * @param {Number} height - optional
 */

Axis.prototype.height = function (height) {
  if (null == height) {
    return this.state.height;
  }

  this.size(this.state.width, height);
  this.emit('height', height);
  return this;
};

/**
 * Set or get width
 *
 * @public
 * @param {Number} width - optional
 */

Axis.prototype.width = function (width) {
  if (null == width) {
    return this.state.width;
  }

  this.size(width, this.state.height);
  this.emit('width', width);
  return this;
};

/**
 * Set or get projection
 *
 * @public
 * @param {String} type - optional
 * @param {Function} fn - optional
 */

Axis.prototype.projection = function (type, fn) {
  // normalize type string
  type = (
    'string' == typeof type ?
    type.toLowerCase().replace(/\s+/g, '') :
    null
  );

  // define
  if (type && 'function' == typeof fn) {
    this.projections.set(type, fn);
    return this;
  }

  // apply
  if (type) {
    if (this.state.isReady) {
      if (type != this.projections.current &&
          this.projections.contains(type)) {
        this.projections.apply(type);
      }
    } else {
      this.once('ready', function () {
        this.projection(type);
      });
    }

    return this;
  }

  // get
  return this.projections.current;
};

/**
 * Destroys frame
 *
 * @public
 */

Axis.prototype.destroy = function () {
  this.scene = null;
  this.texture = null;
  this.camera = null;
  this.stop();
  this.state.update('isAnimating', false);
  this.state.update('isReady', false);
  this.renderer.resetGLState();
  raf.cancel(this.state.animationFrameID);
  empty(this.domElement);
  this.domElement.parentElement.removeChild(this.domElement);
  function empty (el) {
    while (el.lastChild) el.removeChild(el);
  }
  return this;
};

/**
 * Stops playback if applicable
 *
 * @public
 */

Axis.prototype.stop = function () {
  if (true == this.state.isImage) { return; }
  this.pause();
  this.video.currentTime = 0;
  return this;
};

/**
 * Sets or gets y coordinate
 *
 * @public
 * @param {Number} y - optional
 */

Axis.prototype.y = function (y) {
  if (null == y) {
    return this.state.pointerY;
  }
  this.state.update('pointerY', y);
  return this;
};

/**
 * Sets or gets x coordinate
 *
 * @public
 * @param {Number} x - optional
 */

Axis.prototype.x = function (x) {
  if (null == x) {
    return this.state.pointerX;
  }
  this.state.update('pointerX', x);
  return this;
};

/**
 * Sets or gets x/y coordinates
 *
 * @public
 * @param {Number} [x] - X coordinate
 * @param {Number} [y] - Y coordinate
 */

Axis.prototype.coords = function (x, y) {
  if (null == y && null == x) {
    return {
      pointerY: this.state.pointerY,
      pointerX: this.state.pointerX
    };
  }

  if (null != y) {
    this.state.update('pointerY', y);
  }

  if (null != x) {
    this.state.update('pointerX', x);
  }

  return this;
};

/**
 * Refreshes and redraws current frame
 *
 * @public
 */

Axis.prototype.update = function () {
  return this.refresh().draw();
};

/**
 * Sets or updates state cache
 *
 * @public
 * @param {Object} obj - optinal
 */

Axis.prototype.cache = function (o) {
  if (this.state.isConstrainedWith('cache')) {
    return this;
  }

  if ('object' == typeof o) {
    merge(this.state.cache, o);
    return this;
  } else {
    return this.state.cache;
  }
};

/**
 * Outputs debug info if `window.DEBUG' is
 * defined
 *
 * @public
 * @param {Mixed} ...arguments - optional
 */

Axis.prototype.debug = function debug () {
  if (window.DEBUG) {
    console.debug.apply(console, arguments);
  }
  return this;
}

/**
 * Gets geometry type string or sets geometry
 * type string and returns an instance of a
 * geometry if applicable.
 *
 * @public
 * @param {String} type - optional
 */

Axis.prototype.geometry = function (type) {
  if (null == type) {
    return this.state.geometry;
  } else try {
    var geo = geometries[type](this);
    this.state.update('geometry', type);
    return geo;
  } catch (e) {
    return null;
  }
};

/**
 * Returns the dimensions of the current
 * texture.
 *
 * @public
 */

Axis.prototype.dimensions = function () {
  var width = 0;
  var height = 0;
  var ratio = 0;

  if (this.state.isImage) {
    height = this.texture.image.height;
    width = this.texture.image.width;
  } else {
    height = this.video.videoHeight;
    width = this.video.videoWidth;
  }

  return {height: height, width: width, ratio: (width / height)};
};

/**
 * Sets or gets the current field of view
 *
 * @public
 * @param {Number} fov - optional
 */

Axis.prototype.fov = function (fov) {
  if (null == fov) {
    return this.state.fov;
  } else {
    this.state.update('fov', fov);
  }
  return this;
};
