
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
  , pkg = require('./package.json')

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

// install THREE.js addons
Axis.THREE = three;
require('three-canvas-renderer')(three);
require('three-vr-effect')(three);

// uncomment to enable debugging
//window.DEBUG = true;

var COMPANY = "Littlstar (littlstar.com)";
var YEAR = (new Date).getUTCFullYear();
console.info("Axis@v%s\n\tReport bugs to %s (%s)\n\tCopyright %d %s",
            pkg.version,
            pkg.bugs.url,
            pkg.bugs.email,
            YEAR, COMPANY);

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

var CYLINDRICAL_FOV = constants.CYLINDRICAL_FOV

// default projection
var DEFAULT_PROJECTION = constants.DEFAULT_PROJECTION;
var CARTESIAN_CALIBRATION_VALUE = constants.CARTESIAN_CALIBRATION_VALUE;

// expose util
Axis.util = require('./util');

/**
 * Creates the correct geometry for
 * the current content in axis
 *
 * @private
 * @param {Axis} axis
 */

function getCorrectGeometry (axis) {
  var dimensions = axis.dimensions();
  var ratio = dimensions.ratio;
  var geo = null;

  if ('flat' == axis.state.projectionrequested) {
    geo = axis.geometry('plane')
  } else if (ratio == ratio && 2 == ratio) {
    geo = axis.geometry('sphere');
  } else if (ratio == ratio) {
    axis.fov(CYLINDRICAL_FOV);
    geo = axis.geometry('cylinder');
  }

  return geo;
}


/**
 * Creates a renderer based on options
 *
 * @private
 * @param {Object} opts
 * @return {Object}
 */

function createRenderer (opts) {
  opts = opts || {};
  var useWebgl = false != opts.webgl && hasWebGL;

  if ('object' == typeof opts.renderer) {
    return opts.renderer;
  }

  if (useWebgl) {
    return new three.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
  } else {
    return new three.CanvasRenderer();
  }
}

/**
 * Creates a texture from a video DOM Element
 *
 * @private
 * @param {Element} video
 * @return {THREE.Texture}
 */

function createVideoTexture (video) {
  var texture = null;
  video.width = video.videoWidth;
  video.height = video.videoHeight;
  texture = new three.Texture(video);
  texture.format = three.RGBFormat;
  texture.minFilter = three.LinearFilter;
  texture.magFilter = three.LinearFilter;
  texture.generateMipmaps = false;
  texture.image.width = video.videoWidth;
  texture.image.height = video.videoHeight;
  return texture;
}

/**
 * Axis constructor
 *
 * @public
 * @default
 * @class Axis
 * @extends EventEmitter
 * @param {Object} parent - Parent DOM Element
 * @param {Object} [opts] - Constructor ptions passed to the axis
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
    return new Axis(parent, opts);
  } else if (!(parent instanceof Element)) {
    throw new TypeError("Expecting DOM Element");
  }

  var self = this;

  /** Parent DOM node element. */
  this.parent = parent;

  /** Instance constainer DOM element. */
  this.domElement = dom(tpl);

  /** Current axis orientation. */
  this.orientation = {x: 0, y: 0};

  /** Instance video DOM element. */
  this.video = this.domElement.querySelector('video');

  this.video.onerror = console.error.bind(console);

  if (opts.time || opts.t) {
    this.video.currentTime = parseFloat(opts.time) || parseFloat(opts.t) || 0;
  }

  /** Axis' scene instance. */
  this.scene = null;

  /** Axis' renderer instance.*/
  this.renderer = createRenderer(opts);

  if (true == opts.allowPreviewFrame && !isImage(opts.src)) {
    delete opts.allowPreviewFrame;
    opts.isPreviewFrame = true;
    this.previewDomElement = document.createElement('div');
    this.previewFrame = new Axis(this.previewDomElement, opts);
    this.previewFrame.video.volume = 0;
    this.previewFrame.video.muted = true;
    this.previewFrame.video.currentTime = 0;
    this.previewFrame.video.pause();
    delete opts.isPreviewFrame;
    this.once('render', function () {
      this.previewFrame.render();
    });
  }

  /** Axis' texture instance. */
  this.texture = null;

  /** Axis' controllers. */
  this.controls = {};

  /** Axis' state instance. */
  this.state = new State(this, opts);

  /** Axis' projections instance. */
  this.projections = new Projection(this);

  // install viewport projections
  this.projection('flat', require('./projection/flat'));
  this.projection('fisheye', require('./projection/fisheye'));
  this.projection('equilinear', require('./projection/equilinear'));
  this.projection('tinyplanet', require('./projection/tinyplanet'));


  /** Axis' camera instance. */
  this.camera = createCamera(this);

  // setup default state when ready
  this.once('ready', function () {
    this.debug('ready');

    var dimensions = this.dimensions();
    var aspect = this.camera.aspect || 1;
    var h = dimensions.height/2;
    var w = dimensions.width/2;
    var x = opts && opts.orientation ? opts.orientation.x : 0;
    var y = opts && opts.orientation ? opts.orientation.y : (w/h) + (aspect * 0.1);

    if ('number' == typeof x && x == x) {
      this.orientation.x = x;
    } else {
      this.orientation.x = 0;
    }

    if ('number' == typeof y && y == y) {
      this.orientation.y = y;
    }

    // initialize projection
    this.projection(opts.projection || 'equilinear');
  });

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
  eventDelegation.window.bind('blur');

  // init video events
  eventDelegation.video = events(this.video, this);
  eventDelegation.video.bind('canplaythrough');
  eventDelegation.video.bind('loadeddata');
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
  eventDelegation.element.bind('mouseleave');
  eventDelegation.element.bind('mouseup');
  eventDelegation.element.bind('touchstart');
  eventDelegation.element.bind('touchend');
  eventDelegation.element.bind('touchmove');

  // renderer options
  try {
    this.renderer.autoClear = null != opts.autoClear ? opts.autoClear : true;
    this.renderer.setPixelRatio(opts.devicePixelRatio || window.devicePixelRatio);
    this.renderer.setClearColor(opts.clearColor || 0x000, 1);
  } catch (e) {
    console.warn(e);
  }

  // attach renderer to instance node container
  this.domElement.querySelector('.container').appendChild(this.renderer.domElement);

  // mute if explicitly set
  if (opts.muted) {
    this.mute(true);
  }

  // Initializes controllers
  this.initializeControllers();

  // initial volume
  this.volume(opts.volume || 1);

  // initialize frame source
  this.src(opts.src);

  // handle fullscreen changing
  this.on('fullscreenchange', function () {
    this.debug('fullscreenchange');
    this.state.update('isFocused', true);
    this.state.update('isAnimating', false);

    if (this.state.isFullscreen) {
      // temporary set this;
      this.state.tmp.forceFocus = this.state.forceFocus;
      this.state.forceFocus = true;
      if (this.state.isVREnabled) {
        raf(function () { this.size(screen.width, screen.height); }.bind(this));
      }
      this.emit('enterfullscreen');
    } else {
      this.state.forceFocus = (
        null != this.state.tmp.forceFocus ?
        this.state.tmp.forceFocus : false
      );

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
  this.emit('canplaythrough', e);
  this.emit('load');
  if (null == this.texture ||
      (this.texture && this.texture.image && 'VIDEO' != this.texture.image.tagName)) {
    if (this.texture && this.texture.dispose) {
      this.texture.dispose();
    }

    this.texture = createVideoTexture(this.video);
  }
  this.state.ready();
  if (false == this.state.shouldAutoplay && false == this.state.isPlaying) {
    this.state.update('isPaused', true);
    this.video.pause();
  } else if (false == this.state.isStopped) {
    this.video.play();
  }
};

/**
 * Handle `onloadeddata' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onloadeddata = function (e) {
  var percent = 0;
  var video = this.video;
  this.debug('loadeddata');
};

/**
 * Handle `onplay' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onplay = function (e) {
  this.debug('onplay');
  this.state.update('isPaused', false);
  this.state.update('isStopped', false);
  this.state.update('isEnded', false);
  this.state.update('isPlaying', true);
  this.emit('play', e);
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
  this.debug('onwaiting');
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
  var percent = this.getPercentLoaded();
  e.percent = percent;
  this.state.update('percentloaded', percent);
  this.debug('onprogress');
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
  this.state.update('isPlaying', false);
  this.state.update('isPlaying', false);
  this.state.update('isStopped', true);
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
 * Handle `onmouseleave' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onmouseleave = function (e) {
  this.debug('onmouseleave');
  this.state.update('isFocused', false);
  this.state.update('isMousedown', false);
  this.emit('mouseleave', e);
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

  if (isResizable && ! isFullscreen) {
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
 * Handle `window.onblur' event
 *
 * @private
 * @param {Event} e
 */

Axis.prototype.onblur = function () {
  this.state.isMousedown = false;
  this.state.isTouching = false;
  this.controls.mouse.state.isMousedown = false;
  this.controls.keyboard.reset();
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
  }

  this.emit('mousemove', e);
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

  if (false == this.state.isTouching) { return; }
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

  if (this.previewFrame) {
    this.previewFrame.size(width, height);
  }

  this.emit('size', width, height);
  return this;
};

/**
 * Sets or gets video src
 *
 * @public
 * @param {String} [src] - Source string
 * @param {Boolean} [preservePreviewFrame = false] - Predicate indicate if
 * preview source should be preserved.
 */

Axis.prototype.src = function (src, preservePreviewFrame) {
  var self = this;
  if (src) {
    this.debug('src', src);
    this.state.update('src', src);
    this.state.update('isReady', false);

    if (!isImage(src) || this.state.forceVideo && src != this.video.src) {
      this.state.update('isImage', false);
      this.video.src = src;
      this.video.load();
      if (this.texture) {
        if (this.video.readyState >= 4) {
          this.texture.needsUpdate = true;
        } else {
          this.texture.needsUpdate = false;
        }
      }
    } else {
      this.state.update('isImage', true);
      // initialize texture
      if (this.state.isCrossOrigin) {
        three.ImageUtils.crossOrigin = 'anonymous';
      }

      if (this.texture && this.texture.image) {
        this.texture.image.onload = function () {
          self.texture.image.onload = null;
          self.state.ready();
          self.emit('load');
          self.texture.needsUpdate = true;
        };
        this.texture.image.src = src;
      } else {
        this.texture = three.ImageUtils.loadTexture(src, null, function () {
          self.state.ready();
          self.emit('load');
        });
      }

      this.texture.minFilter = three.LinearFilter;
    }

    if (true != preservePreviewFrame && this.previewFrame) {
      this.previewFrame.src(src);
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
  var video = this.video;
  if (false == this.state.isImage) {
    if (true == this.state.isEnded) {
      video.currentTime = 0;
    }
    this.debug('play');
    video.play();
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
    this.state.update('isPlaying', false);
    this.state.update('isPaused', true);
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
    opts = {vrDisplay: this.state.vrHMD};
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
    this.volume(this.state.lastVolume);
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
  var now = Date.now();
  var x = this.state.pointerX;
  var y = this.state.pointerY;

  this.debug('refresh');

  if (false == this.state.isImage) {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      if (now - this.state.lastRefresh >= 64) {
        this.state.lastRefresh = now;
        if (null != this.texture) {
          this.texture.needsUpdate = true;
        }
      }
    }
  }

  if (null == constraints || false != constraints.panoramic) {
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

  if (this.state.isFullscreen) {
    if (this.state.lastDevicePixelRatio != window.devicePixelRatio) {
      this.state.lastDevicePixelRatio = window.devicePixelRatio;
      this.size(window.screen.width/window.devicePixelRatio,
                window.screen.height/window.devicePixelRatio);
    }
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
  if (this.state.isImage) { return this; }
  var isReady = this.state.isReady;
  var self = this;
  var ua = navigator.userAgent.toLowerCase();
  function afterseek () {
    var currentTime = self.video.currentTime;
    var isPlaying = self.state.isPlaying;
    var video = self.video;
    seconds = seconds || 0;
    video.currentTime = seconds;

    if (0 == seconds) {
      self.state.update('isStopped', true);
    } else {
      self.state.update('isStopped', false);
    }

    if (isPlaying) {
      self.play();
    }

    self.emit('seek', seconds);
    setTimeout(function () {
      self.debug('Attempting seeking correction');
      if (video.readyState < video.HAVE_ENOUGH_DATA) {
        self.debug('Video state does not have enough data.');
        self.debug('Reloading video...');
        video.load();
        self.debug('Seeking video to %d...', seconds);
        video.currentTime = seconds;
        if (isPlaying) {
          self.debug('Playing video at %d...', seconds);
          video.play();
        }
      }
    }, 1000);
  }
  if (false == this.state.isImage) {
    // firefox emits `oncanplaythrough' when changing the
    // `.currentTime' property on a video tag so we need
    // to listen one time for that event and then seek to
    // prevent errors from occuring.
    if (/firefox/.test(ua) && !isReady) {
      this.video.oncanplaythrough = function () {
        this.oncanplaythrough = function () {};
        afterseek();
      };
    } else if (isReady) {
      afterseek();
    } else {
      this.once('ready', afterseek);
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

  this.emit('beforedraw');

  if (this.renderer && this.scene && this.camera) {
    if (false == this.state.isVREnabled) {
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
 * @param {Boolean} [shoudLoop = true] - Predicate indicating if a render loop shouls start.
 */

Axis.prototype.render = function (shoudLoop) {
  var domElement = this.domElement;
  var self = this;
  var style = getComputedStyle(this.parent);
  var fov = this.state.fov;
  var width = this.state.width || parseFloat(style.width);
  var height = this.state.height || parseFloat(style.height);
  var aspectRatio = 0;

  if (this.state.isPreviewFrame) {
    if (null == shoudLoop) {
      shoudLoop = false;
    }
  }

  // attach dom node to parent
  if (false == this.parent.contains(this.domElement)) {
    this.parent.appendChild(this.domElement);
  }

  if (0 == height) {
    height = Math.min(width, window.innerHeight);
    aspectRatio = width / height;
    height = height / aspectRatio;
  }

  // initialize size
  this.size(width, height);

  // start animation loop
  if (false !== shoudLoop) {
    raf.cancel(this.state.animationFrameID);
    this.state.animationFrameID  = raf(function loop () {
      raf(loop);
      var parentElement = domElement.parentElement;
      if (parentElement && parentElement.contains(domElement)) {
        self.update();
      }
    });
  }

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
  try {
    this.scene = null;
    this.texture = null;
    this.camera = null;
    this.stop();
    raf.cancel(this.state.animationFrameID);
    this.state.reset();
    this.renderer.resetGLState();
    empty(this.domElement);
    this.domElement.parentElement.removeChild(this.domElement);
  } catch (e) { console.warn(e); }
  function empty (el) {
    try { while (el.lastChild) el.removeChild(el); }
    catch (e) {}
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
  this.video.pause();
  this.video.currentTime = 0;
  this.state.update('isStopped', true);
  this.state.update('isPlaying', false);
  this.state.update('isPaused', false);
  this.state.update('isAnimating', false);
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
  this.refresh().once('refresh', function () {
    this.draw().once('draw', function () {
      this.emit('update');
    });
  });
  return this;
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
    if (this.texture && this.texture.image) {
      height = this.texture.image.height;
      width = this.texture.image.width;
    }
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

/**
 * Enables VR mode.
 *
 * @public
 */

Axis.prototype.enableVRMode = function () {
  this.initializeControllers(null, true);
  this.state.isVREnabled = true;
  this.controls.vr.enable();
  return this;
};

/**
 * Disables VR mode.
 *
 * @public
 */

Axis.prototype.disableVRMode = function () {
  this.initializeControllers(null, true);
  this.state.isVREnabled = false;
  this.controls.vr.disable();
  return this.render();
};

/**
 * Returns percent of media loaded.
 *
 * @public
 * @param {Number} [trackIndex = 0]- Index of track added.
 */

Axis.prototype.getPercentLoaded = function (trackIndex) {
  var video = this.video;
  var percent = 0;

  if (this.state.isImage) {
    percent = 100;
  } else {
    try {
      percent = video.buffered.end(trackIndex || 0) / video.duration;
    } catch (e) {
      this.debug('error', e);
      try {
        percent = video.bufferedBytes / video.bytesTotal;
      } catch (e) {
        this.debug('error', e);
      }
    }

    percent = percent || 0;
    percent *= 100;
  }

  return Math.max(0, Math.min(percent, 100));
};

/**
 * Returns percent of media played if applicable.
 *
 * @public
 * @return {Number}
 */

Axis.prototype.getPercentPlayed = function () {
  return (this.video.currentTime / this.video.duration * 100) || 0;
};

/**
 * Initializes axis controllers if not created. An
 * optional map can be used to indicate which controllers
 * should be re-initialized if already created.
 *
 * @public
 * @param {Object} [map] - Controllers to re-initialize.
 * @param {Boolean} [force] - Force initialization of all controllers.
 */

Axis.prototype.initializeControllers = function (map, force) {
  var controls = (this.controls = this.controls || {});
  map = null != map && 'object' == typeof map ? map : {};

  if (null == controls.vr || true == map.vr || true == force) {
    if (controls.vr) { controls.vr.destroy(); }
    controls.vr = require('./controls/vr')(this);
  }

  if (null == controls.mouse || true == map.mouse || true == force) {
    if (controls.mouse) { controls.mouse.destroy(); }
    controls.mouse = require('./controls/mouse')(this);
  }

  if (null == controls.touch || true == map.touch || true == force) {
    if (controls.touch) { controls.touch.destroy(); }
    controls.touch = require('./controls/touch')(this);
  }

  if (null == controls.keyboard || true == map.keyboard || true == force) {
    if (controls.keyboard) { controls.keyboard.destroy(); }
    controls.keyboard = require('./controls/keyboard')(this);
  }

  if (null == controls.orientation || true == map.orientation || true == force) {
    if (controls.orientation) { controls.orientation.destroy(); }
    controls.orientation = require('./controls/orientation')(this);
  }

  if (null == controls.default || true == map.default || true == force) {
    if (controls.default) { controls.default.destroy(); }
    controls.default = (
      require('./controls/controller')(this).enable().target(this.camera)
    );
  }

  return this;
};

/**
 * Returns a captured image at a specific moment in
 * time based on current orientation, field of view,
 * and projection type. If time is omitted then the
 * current time is used. An exisiting optional `Image`
 * object can be used otherwise a new one is created.
 * The `Image` object is returned and its `src`
 * attribute is set when the frame is able to capture
 * a preview. If the current texture is an image then
 * a preview image is generated immediately.
 *
 * @public
 * @name getCaptureImageAt
 * @param {Number} [time] - Optional Time to seek to preview.
 * @param {Image} [out] - Optional Image object to set src to.
 * @return {Image}
 */

Axis.prototype.getCaptureImageAt = function (time, out) {
  var preview = this.previewFrame;
  var image = null;
  var timer = null;
  var mime = 'image/jpeg';
  var self = this;

  function setCapture () {
    preview.orientation.x = self.orientation.x;
    preview.orientation.y = self.orientation.y;
    preview.refreshScene();
    preview.fov(self.fov());
    preview.projection(self.projection());
    raf(function check () {
      preview.camera.target.copy(self.camera.target);
      preview.camera.quaternion.copy(self.camera.quaternion);
      if (preview.state.isAnimating) {
        raf(check);
      } else {
        image.src = preview.renderer.domElement.toDataURL(mime);
      }
    });
  }

  if (0 == arguments.length) {
    time = null;
    out = null;
  } else if (1 == arguments.length) {
    if ('object' == typeof time) {
      out = time;
      time = null;
    }
  }

  image = out || new Image();

  if (null != preview && false == this.state.isImage) {
    raf(function () { preview.update(); });
    preview.once('update', setCapture);
    if (preview.video.readyState < 4) {
      preview.video.onload = function () {
        preview.video.onload = null;
        preview.update();
      };
      preview.video.load();
    } else {
      preview.update();
    }
    preview.video.currentTime = time;
    preview.pause();
  } else if (this.state.isImage) {
    image.src = this.renderer.domElement.toDataURL(mime);
  }

  return image;
};

/**
 * Initializes or refreshes current scene
 * for projection.
 *
 * @public
 */

Axis.prototype.refreshScene = function () {
  var material = null;
  var isReady = this.state.isReady;
  var texture = this.texture;
  var scene = this.scene;
  var mesh = null;
  var geo = null;

  if (null == texture || !isReady) { return this; }

  if (null == scene) {
    this.scene = new three.Scene();
  }

  // get geometry for content
  geo = getCorrectGeometry(this);

  // skip if geometry is unable to be determined
  if (null == geo) { return this; }

  if (scene && scene.children.length >= 1) {
    mesh = scene.children[0];
    material = mesh.material;
    if (material.map != texture) {
      material.map = texture;
    }
  } else {
    // create material and mesh
    material = new three.MeshBasicMaterial({map: texture});
    // build mesh
    mesh = new three.Mesh(geo, material);
    // set mesh scale
    mesh.scale.x = -1;
    material.overdraw = 0.5
    // add mesh to scene
    this.scene.add(mesh);
  }

  return this;
};
