
/**
 * Module dependencies
 */

var three = require('three.js')
  , dom = require('domify')
  , emitter = require('emitter')
  , events = require('events')
  , raf = require('raf')
  , hasWebGL = require('has-webgl')
  , fullscreen = require('fullscreen')
  , keycode = require('keycode')
  , path = require('path')
  , merge = require('merge')

var tpl = require('./template.html')
  , Projection = require('./projection')
  , createCamera = require('./camera')
  , geometries = require('./geometry')
  , State = require('./state')

// uncomment to enable debugging
window.DEBUG = true;

/**
 * Detect if file path is an image
 * based on the file path extension
 *
 * @api private
 * @param {String} file
 */

function isImage (file) {
  var ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.png':
    case '.jpg':
    case '.jpeg':
      return true;
    default: return false;
  }
}

// add three.CanvasRenderer
Axis.THREE = three;
require('three-canvas-renderer')(three);
require('three-vr-effect')(three);
three.OrbitControls = require('three-orbit-controls')(three);

// default field of view
var DEFAULT_FOV = require('./constants').DEFAULT_FOV;

// frame click threshold
var FRAME_CLICK_THRESHOLD = require('./constants').FRAME_CLICK_THRESHOLD;

// min/max wheel distances
var MIN_WHEEL_DISTANCE = require('./constants').MIN_WHEEL_DISTANCE;
var MAX_WHEEL_DISTANCE = require('./constants').MAX_WHEEL_DISTANCE;

// min/max lat/lon values
var MIN_LAT_VALUE = -85;
var MAX_LAT_VALUE = 85;
var MIN_LON_VALUE = 0;
var MAX_LON_VALUE = 360;

// projection types
var PROJECTION_EQUILINEAR = 'equilinear';
var PROJECTION_TINY_PLANET = 'tinyplanet';
var PROJECTION_FISHEYE = 'fisheye';
var PROJECTION_MIRROR_BALL = 'mirrorball';
var PROJECTION_FLAT = 'flat';

// default projection
var DEFAULT_PROJECTION = require('./constants').DEFAULT_PROJECTION;

/**
 * `Axis' constructor
 *
 * @api public
 * @param {Object} parent
 * @param {Object} opts
 */

module.exports = Axis;
function Axis (parent, opts) {
  if (!(this instanceof Axis)) {
    return new Axis(opts);
  } else if (!(parent instanceof Element)) {
    throw new TypeError("Expecting DOM Element");
  }

  var self = this;

  this.opts = (opts = opts || {});

  // DOM event bindings
  this.events = {};

  // parent DOM node
  this.parent = parent;

  // set defualt FOV
  if ('undefined' == typeof opts.fov) {
    opts.fov = opts.fieldOfView || DEFAULT_FOV;
  }

  // init view
  this.el = dom(tpl);
  this.holdframe = this.el.querySelector('.axis.holdframe');
  this.video = this.el.querySelector('video');
  this.video.style.display = 'none';

  function set (p) {
    if (opts[p]) {
      self.video.setAttribute(p, opts[p]);
    }
  }

  // set video options
  set('preload');
  set('autoplay');
  set('crossorigin');
  set('loop');
  set('muted');

  // event delagation
  this.events = {};

  // listen for fullscreen changes
  fullscreen.on('change', this.onfullscreenchange.bind(this));

  // init window events
  this.events.window = events(window, this);
  this.events.window.bind('resize');
  this.events.window.bind('deviceorientation');
  this.events.window.bind('orientationchange');

  // init document events
  this.events.document = events(document, {
    onmousedown: function (e) {
      if (e.target == self.renderer.domElement) {
        self.state.focused = true;
      } else {
        self.state.focused = false;
      }
    },

    onkeydown: function (e) {
      var code = e.which;
      function detect (n) {
        if (code == keycode(n)) {
          e.preventDefault();
          self.state.keys[n] = true;
          self.state.animating = false;
        }
      }

      if (true == self.state.forceFocus || self.state.focused) {
        if (PROJECTION_MIRROR_BALL != self.state.projection) {
          if (PROJECTION_TINY_PLANET != self.state.projection) {
            detect('up');
            detect('down');
          }
          detect('left');
          detect('right');
        }
        self.emit('keydown', e);
      }

    },

    onkeyup: function (e) {
      var code = e.which;
      function detect (n) {
        if (code == keycode(n)) {
          e.preventDefault();
          self.state.keys[n] = false;
        }
      }

      if (true == self.state.forceFocus || self.state.focused) {
        if (PROJECTION_MIRROR_BALL != self.state.projection) {
          if (PROJECTION_TINY_PLANET != self.state.projection) {
            detect('up');
            detect('down');
          }
          detect('left');
          detect('right');
        }
        self.emit('keyup', e);
      }
    }
  });

  this.events.document.bind('mousedown');
  this.events.document.bind('touch', 'onmousedown');
  this.events.document.bind('keydown');
  this.events.document.bind('keyup');

  // init video events
  this.events.video = events(this.video, this);
  this.events.video.bind('canplaythrough');
  this.events.video.bind('play');
  this.events.video.bind('pause');
  this.events.video.bind('playing');
  this.events.video.bind('progress');
  this.events.video.bind('timeupdate');
  this.events.video.bind('loadstart');
  this.events.video.bind('waiting');
  this.events.video.bind('ended');

  // init dom element events
  this.events.element = events(this.el, this);
  this.events.element.bind('click');
  this.events.element.bind('touch', 'onclick');
  this.events.element.bind('mousemove');
  this.events.element.bind('mousewheel');
  this.events.element.bind('mousedown');
  this.events.element.bind('mouseup');
  this.events.element.bind('touchstart');
  this.events.element.bind('touchend');
  this.events.element.bind('touchmove');

  // init scene
  this.scene = null;

  // init camera
  this.camera = null;

  // init renderer
  this.renderer = opts.renderer || (
    hasWebGL ?
    new three.WebGLRenderer({antialias: true}) :
    new three.CanvasRenderer()
  );

  // initialize vreffect
  this.vreffect = new three.VREffect(this.renderer, function (e) {
    self.debug('VREffect:', e);
  });

  // disable vr if `navigator.getVRDevices' isn't defined
  if ('function' != typeof navigator.getVRDevices) {
    opts.vr = false;
  }

  // renderer options
  this.renderer.autoClear = null != opts.autoClear ? opts.autoClear : true;
  this.renderer.setPixelRatio(opts.devicePixelRatio || window.devicePixelRatio);
  this.renderer.setClearColor(opts.clearColor || 0x000, 1);

  // attach renderer to instance node container
  this.el.querySelector('.container').appendChild(this.renderer.domElement);

  this.texture = null;
  this.controls = null;

  // initialize viewport state
  this.state = new State(opts);

  if (opts.muted) {
    this.mute(true);
  }

  var volume = this.opts.volume || 1;
  this.volume(volume);

  // viewport projections
  this.projections = new Projection(this);
  this.projection('flat', require('./projection/flat'));
  this.projection('fisheye', require('./projection/fisheye'));
  this.projection('equilinear', require('./projection/equilinear'));
  this.projection('tinyplanet', require('./projection/tinyplanet'));
  this.projection('mirrorball', require('./projection/mirrorball'));

  // initializeCamera
  createCamera(this);

  // initialize projection
  this.projection(this.state.projection);

  // initialize frame source
  this.src(opts.src);
  this.on('ready', function () {
    this.state.ready = true;
    this.projection('equilinear');
  });
}

// mixin `Emitter'
emitter(Axis.prototype);

/**
 * Handle `onclick' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onclick = function (e) {
  var now = Date.now();
  var ts = this.state.mousedownts;

  if (false == this.state.clickable || (now - ts) > FRAME_CLICK_THRESHOLD) {
    return false;
  } else {
    e.preventDefault();
    e.stopPropagation();
  }

  if (false == this.state.image) {
    if (this.state.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  this.emit('click', e);
};

/**
 * Handle `oncanplaythrough' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.oncanplaythrough = function (e) {
  this.state.time = this.video.currentTime;
  this.state.duration = this.video.duration;

  this.emit('canplaythrough', e);
  this.state.ready = true;

  if (false == this.opts.autoplay) {
    this.state.paused = true;
  }

  setTimeout(function () {
    this.emit('ready');
  }.bind(this));

  if (true == this.opts.autoplay) {
    this.video.play();
  }
};

/**
 * Handle `onplay' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onplay = function (e) {
  raf(function() {
    this.holdframe.style.display = 'none';
    this.state.paused = false;
    this.state.ended = false;
    this.emit('play', e);
  }.bind(this));
};

/**
 * Handle `onpause' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onpause = function (e) {
  this.state.paused = true;
  this.state.playing = false;
  this.emit('pause', e);
};

/**
 * Handle `onplaying' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onplaying = function (e) {
  this.state.playing = true;
  this.state.paused = false;
  this.emit('playing', e);
};

/**
 * Handle `onwaiting' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onwaiting = function (e) {
  this.emit('wait', e);
};

/**
 * Handle `onloadstart' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onloadstart = function (e) {
  this.emit('loadstart', e);
};

/**
 * Handle `onprogress' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onprogress = function (e) {
  var video = this.video;
  var percent = 0;

  try {
    percent = video.buffered.end(0) / video.duration;
  } catch (e) {
    try {
      percent = video.bufferedBytes / video.bytesTotal;
    } catch (e) { }
  }

  e.percent = percent * 100;
  this.state.percentloaded = percent;
  this.emit('progress', e);
};

/**
 * Handle `ontimeupdate' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.ontimeupdate = function (e) {
  e.percent = this.video.currentTime / this.video.duration * 100;
  this.state.time = this.video.currentTime;
  this.state.duration = this.video.duration;
  this.state.played = e.percent;
  this.emit('timeupdate', e);
};

/**
 * Handle `onended' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onended = function (e) {
  this.state.ended = true;
  this.emit('end');
  this.emit('ended');
};

/**
 * Handle `onmousedown' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onmousedown = function (e) {
  this.state.mousedownts = Date.now();
  this.state.animating = false;
  this.state.dragstart.x = e.pageX;
  this.state.dragstart.y = e.pageY;
  this.state.mousedown = true;
  this.emit('mousedown', e);
};

/**
 * Handle `onmouseup' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onmouseup = function (e) {
  this.state.mousedown = false;
  this.emit('mouseup', e);
};

/**
 * Handle `ontouchstart' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.ontouchstart = function (e) {
  this.state.mousedownts = Date.now();
  this.state.dragstart.x = e.touches[0].pageX;
  this.state.dragstart.y = e.touches[0].pageY;
  this.state.mousedown = true;
  this.emit('touchstart', e);
};

/**
 * Handle `ontouchend' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.ontouchend = function(e) {
  this.state.mousedown = false;
  this.emit('touchend', e);
};

/**
 * Handle `onresize' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onresize = function (e) {
  if (this.state.resizable && ! this.state.fullscreen) {
    var containerStyle = getComputedStyle(this.el);
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
 * Handle `onfullscreenchange' event
 *
 * @api private
 * @param {Boolean} fullscreen
 */

Axis.prototype.onfullscreenchange = function(fullscreen) {
  this.state.focused = true;
  this.state.animating = false;
  if (fullscreen) {
    this.emit('enterfullscreen');
  } else {
    if (this.state.vr) {
      // @TODO(werle) - not sure how to fix this bug but the scene
      // needs to be re-rendered
      raf(function () { this.render(); }.bind(this));
    }
    this.size(this.state.lastsize.width, this.state.lastsize.height);
    this.state.fullscreen = false;
    this.state.lastsize.width = null;
    this.state.lastsize.height = null;
    this.emit('exitfullscreen');
  }
};

/**
 * Handle `onmousemove' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onmousemove = function (e) {
  var x = 0;
  var y = 0;

  if (true == this.state.mousedown) {
    x = e.pageX - this.state.dragstart.x;
    y = e.pageY - this.state.dragstart.y;

    this.state.dragstart.x = e.pageX;
    this.state.dragstart.y = e.pageY;

    if (this.state.inverted) {
      this.state.lon -= x;
      if (PROJECTION_TINY_PLANET != this.state.projection) {
        this.state.lat += y;
      }
    } else {
      this.state.lon += x;
      if (PROJECTION_TINY_PLANET != this.state.projection) {
        this.state.lat -= y;
      }
    }

    if (PROJECTION_TINY_PLANET != this.state.projection) {
      this.state.cache.lat = this.state.lat;
      this.state.cache.lon = this.state.lon;
    }
  }

  this.emit('mousemove', e);
};

/**
 * Handle `ontouchmove' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.ontouchmove = function(e) {
  if (e.touches.length) {
    e.preventDefault();

    var x = e.touches[0].pageX - this.state.dragstart.x;
    var y = e.touches[0].pageY - this.state.dragstart.y;

    this.state.dragstart.x = e.touches[0].pageX;
    this.state.dragstart.y = e.touches[0].pageY;

    // @TODO(werle) - Make friction configurable
    y *=.2;
    x *=.255;

    if (this.state.inverted) {
      this.state.lat -= y;
      this.state.lon += x;
    } else {
      this.state.lat += y;
      this.state.lon -= x;
    }

    this.state.touch.lat = this.state.lat;
    this.state.touch.lon = this.state.lon;

    this.refresh();
  }

  this.emit('touchmove', e);
};

/**
 * Handle `onmousewheel' event
 *
 * @api private
 * @param {Event} e
 */

Axis.prototype.onmousewheel = function (e) {
  var min = MIN_WHEEL_DISTANCE;
  var max = MAX_WHEEL_DISTANCE;
  var vel = this.state.scroll; // velocity

  if ('number' != typeof this.state.scroll ||false == this.state.wheel) {
    return false;
  }

  e.preventDefault();

  if (null != e.wheelDeltaY) { // chrome
    this.state.fov -= e.wheelDeltaY * vel;
  } else if (null != e.wheelDelta ) { // ie
    this.state.fov -= event.wheelDelta * vel;
  } else if (null != e.detail) { // firefox
    this.state.fov += e.detail * 1.0;
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
 * Handle `ondeviceorientation' event
 *
 * @api private
 * @param {Object} e
 */

Axis.prototype.ondeviceorientation = function (e) {
  var orientation = this.state.orientation;
  var alpha = e.alpha;
  var beta = e.beta;
  var gamma = e.gamma;
  var lat = 0;
  var lon = 0;

  if (PROJECTION_TINY_PLANET == this.state.projection) {
    return false;
  }

  this.debug('orientation=%s',
             0 == orientation ? 'portrait(0)' :
             90 == orientation ? 'landscape(90)' :
             -90 == orientation ? 'landscape(-90)' :
             'unknown('+ orientation +')');

  if (0 == orientation) {
    lat = beta;
    lon = gamma;
  } else if (90 == orientation) {
    lat = gamma;
    lon = beta;
  } else {
    lat = gamma * -1;
    lon = beta * -1;
  }

  if (this.state.inverted) {
    lat = lat * -1;
    lon = Math.abs(lon);
  }

  if (lat >= MAX_LAT_VALUE || lat <= MIN_LAT_VALUE) {
    return false;
  }

  if (null == this.state.center.lat) {
    this.state.center.lat = lat;
  }

  if (null == this.state.center.lon) {
    this.state.center.lon = lon;
  }

  this.state.deviceorientation.lat = lat;
  this.state.deviceorientation.lon = lon;
};

/**
 * Handle `onorientationchange' event
 *
 * @api private
 * @param {Object} e
 */

Axis.prototype.onorientationchange = function (e) {
  this.state.orientation = window.orientation;
  this.state.center.lat = this.state.deviceorientation.lat;
  this.state.center.lon = this.state.deviceorientation.lon;
};

/**
 * Sets frame size
 *
 * @api public
 * @param {Number} width
 * @param {Number} height
 */

Axis.prototype.size = function (width, height) {
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
 * @api public
 * @param {String} src - optional
 */

Axis.prototype.src = function (src) {
  if (src) {
    this.state.src = src;

    this.state.ready = false;
    if (isImage(src)) {
      this.state.image = true;
      this.state.vr = false;
    } else {
      this.state.image = false;
      this.video.src = src;
      this.video.load();
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
 * @api public
 */

Axis.prototype.play = function () {
  if (false == this.state.image) {
    if (true == this.state.ended) {
      this.seek(0);
    }
    this.video.play();
  }
  return this;
};

/**
 * Pauses video frame
 *
 * @api public
 */

Axis.prototype.pause = function () {
  if (false == this.state.image) {
    this.video.pause();
  }
  return this;
};

/**
 * Takes video to fullscreen
 *
 * @api public
 */

Axis.prototype.fullscreen = function () {
  var opts = null;
  if (! fullscreen.supported) {
    return;
  } else if (this.state.vr) {
    opts = {vrDisplay: this.vreffect._vrHMD};
  } else if (! this.state.fullscreen) {
    var canvasStyle = getComputedStyle(this.renderer.domElement);
    var canvasWidth = parseFloat(canvasStyle.width);
    var canvasHeight = parseFloat(canvasStyle.height);
    var aspectRatio = canvasWidth / canvasHeight;
    var newWidth = null;
    var newHeight = null;

    newWidth = window.screen.width;
    newHeight = window.screen.height;

    this.state.lastsize.width = canvasWidth;
    this.state.lastsize.height = canvasHeight;

    this.size(newWidth, newHeight);
  }

  this.state.fullscreen = true;
  fullscreen(this.renderer.domElement, opts);
};

/**
 * Set or get volume on frame
 *
 * @api public
 * @param {Number} n
 */

Axis.prototype.volume = function (n) {
  if (false == this.state.image) {
    if (null == n) {
      return this.video.volume;
    }
    this.state.lastvolume = this.video.volume;
    this.video.volume = n
    this.emit('volume', n);
  }
  return this;
};

/**
 * Mutes volume
 *
 * @api public
 * @param {Boolean} mute - optional
 */

Axis.prototype.mute = function (mute) {
  if (false == mute) {
    this.video.muted = false;
    this.state.muted = false;
    if (0 == this.volume()) {
      this.volume(this.state.lastvolume);
    }
  } else {
    this.state.muted = true;
    this.video.muted = true;
    this.volume(0);
    this.emit('mute');
  }
  return this;
};

/**
 * Unmute volume
 *
 * @api public
 * @param {Boolean} mute - optional
 */

Axis.prototype.unmute = function (mute) {
  if (false == this.state.image) {
    this.mute(false);
    this.emit('unmute');
  }
  return this;
};

/**
 * Refresh frame
 *
 * @api public
 */

Axis.prototype.refresh = function () {
  var now = Date.now();
  var video = this.video;
  if (false == this.state.image) {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      if (now - this.state.timestamp >= 32) {
        this.state.timestamp = now;
        if ('undefined' != typeof this.texture) {
          this.texture.needsUpdate = true;
        }
      }
    }
  }

  if (PROJECTION_FLAT != this.state.projection) {
    // @TODO(werle) - make this delta configurable
    var delta = 4;
    delta = this.state.inverted ? -delta : delta;

    if (this.state.keys.up) {
      this.state.lat += delta;
    } else if (this.state.keys.down) {
      this.state.lat -= delta;
    }

    if (this.state.keys.left) {
      this.state.lon -= delta;
    } else if (this.state.keys.right) {
      this.state.lon += delta;
    }

    // @TODO(werle) - Fix device orientation
    if (false && false == this.state.mousedown && this.state.deviceorientation.lat) {
      var dlat = this.state.deviceorientation.lat - this.state.center.lat;
      var dlon = this.state.deviceorientation.lon - this.state.center.lon;

      // @TODO(werle) - Make this friction configurable
      dlat *= .4;
      dlon *= .2;

      this.state.lat = dlat + this.state.touch.lat;
      this.state.lon = dlon + this.state.touch.lon;
    }

    if (this.camera) {
      this.camera.fov = this.state.fov;
      this.camera.updateProjectionMatrix();
    }

    this.state.lat = Math.max(MIN_LAT_VALUE, Math.min(MAX_LAT_VALUE, this.state.lat));
    if (this.state.lon > MAX_LON_VALUE) {
      this.state.lon = this.state.lon - MAX_LON_VALUE;
    } else if (this.state.lon < MIN_LON_VALUE) {
      this.state.lon = this.state.lon + MAX_LON_VALUE;
    }

    if (PROJECTION_TINY_PLANET != this.state.projection) {
      this.state.cache.lat = this.state.lat;
      this.state.cache.lon = this.state.lon;
    }

    if ('cylinder' == this.state.geometry) {
      this.state.lat = 0;
    }
  } else {
    this.state.lat = 0;
    this.state.lon = 90;
  }

  this.emit('refresh');
  return this;
};

/**
 * Refresh frame
 *
 * @api public
 */

Axis.prototype.resizable = function(resizable) {
  if (typeof resizable == 'undefined') return this.state.resizable;
  this.state.resizable = resizable;
  return this;
};

/**
 * Seek to time in seconds
 *
 * @api public
 * @param {Number} seconds
 */

Axis.prototype.seek = function (seconds) {
  if (false == this.state.image) {
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
 * @api public
 * @param {Number} seconds
 */

Axis.prototype.foward = function (seconds) {
  if (false == this.state.image) {
    this.seek(this.video.currentTime + seconds);
    this.emit('forward', seconds);
  }
  return this;
};

/**
 * Rewind `n' amount of seconds
 e
 * @api public
 * @param {Number} seconds
 */

Axis.prototype.rewind = function (seconds) {
  if (false == this.state.image) {
    this.seek(this.video.currentTime - seconds);
    this.emit('rewind', seconds);
  }
  return this;
};

/**
 * Use plugin with frame
 *
 * @api public
 * @param {Function} fn
 */

Axis.prototype.use = function (fn) {
  fn(this);
  return this;
};

/**
 * Draws frame
 *
 * @api public
 */

Axis.prototype.draw = function () {
  var renderer = this.renderer;
  var radius = this.state.radius;
  var camera = this.camera;
  var scene = this.scene;
  var sensor = this.vreffect._sensor;
  var dtor = Math.PI / 180; // degree to radian conversion
  var hmd = this.vreffect._vrHMD;

  var lat = this.state.lat;
  var lon = this.state.lon;

  var theta = lon * dtor;
  var phi = (90 - lat) * dtor;

  var x = radius * Math.sin(phi) * Math.cos(theta);
  var y = radius * Math.cos(phi);
  var z = radius * Math.sin(phi) * Math.sin(theta);

  this.lookAt(x, y, z);

  if (this.state.vr) {
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

  if (this.controls && 'function' == typeof this.controls.update) {
    this.controls.update();
  }

  if (this.renderer && this.scene && this.camera) {
    if (this.state.vr) {
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
 * @api public
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */

Axis.prototype.lookAt = function (x, y, z) {
  var vec = new three.Vector3(x, y, z);

  if (this.camera && null == this.controls && true == this.state.allowcontrols) {
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
 * @api public
 */

Axis.prototype.render = function () {
  var self = this;
  var style = getComputedStyle(this.parent);
  var fov = this.state.fov;
  var width = this.state.width || parseFloat(style.width);
  var height = this.state.height || parseFloat(style.height);
  var aspectRatio = 0;

  if (typeof this.state.holdframe == 'string') {
    this.holdframe.style.backgroundImage = 'url(' + this.state.holdframe + ')';
  } else {
    this.holdframe.style.display = 'none';
  }

  // attach dom node to parent
  if (false == this.parent.contains(this.el)) {
    this.parent.appendChild(this.el);
  }

  if (0 == height) {
    height = Math.min(width, window.innerHeight);
    aspectRatio = width / height;
    height = height / aspectRatio;
  }

  // initialize texture
  if (false == this.state.image) {
    this.texture = new three.Texture(this.video);
    //this.texture.format = three.RGBFormat;
    this.texture.minFilter = three.LinearFilter;
    //this.texture.magFilter = three.LinearFilter;
    //this.texture.generateMipmaps = false;
  } else {
    this.texture = three.ImageUtils.loadTexture(this.src(),
                                                null,
                                                this.emit.bind(this, 'ready'));
  }

  // initialize size
  this.size(width, height);

  // initialize projection if camera has not been created
  if (null == this.camera) {
    this.projection(this.state.projection);
  }

  // start refresh loop
  if (null != this.state.rafid) {
    raf.cancel(this.state.rafid);
  }

  this.state.rafid = raf(function loop () {
    if (self.el.parentElement && self.el.parentElement.contains(self.el)) {
      raf(loop);
      self.refresh();
      self.draw();
    }
  });

  this.emit('render');

  return this;
};

/**
 * Sets view offset
 *
 * @api publc
 */

Axis.prototype.offset =
Axis.prototype.setViewOffset = function () {
  // @see http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
  this.camera.setViewOffset.apply(this.camera, arguments);
  return this;
};

/**
 * Set or get height
 *
 * @api public
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
 * @api public
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
 * @api public
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
    if (this.state.ready) {
      if (this.projections.contains(type)) {
        this.controls = null;
        this.state.projectionrequested = type;
        this.projections.apply(type);
        this.state.projection = type;
      }
    } else {
      this.once('ready', function () {
        this.projection(type);
      });
    }

    return this;
  }

  // get
  return this.state.projection;
};

/**
 * Destroys frame
 *
 * @api public
 */

Axis.prototype.destroy = function () {
  this.scene = null;
  this.texture = null;
  this.camera = null;
  this.stop();
  this.state.animating = false;
  this.renderer.resetGLState();
  raf.cancel(this.state.rafid);
  empty(el);
  this.el.parentElement.removeChild(this.el);
  function empty (el) {
    while (el.lastChild) el.removeChild(el);
  }
  return this;
};

/**
 * Stops playback if applicable
 *
 * @api public
 */

Axis.prototype.stop = function () {
  if (true == this.state.image) { return; }
  this.pause();
  this.video.currentTime = 0;
  return this;
};

/**
 * Sets or gets latitude coordinate
 *
 * @api public
 * @param {Number} lat - optional
 */

Axis.prototype.lat = function (lat) {
  if (null == lat) {
    return this.state.lat;
  }
  this.state.lat = lat
  return this;
};

/**
 * Sets or gets longitude coordinate
 *
 * @api public
 * @param {Number} lon - optional
 */

Axis.prototype.lon = function (lon) {
  if (null == lon) {
    return this.state.lon;
  }
  this.state.lon = lon;
  return this;
};

/**
 * Sets or gets lat/lon coordinates
 *
 * @api public
 * @param {Number} lat - optional
 * @param {Number} lon - optional
 */

Axis.prototype.coords = function (lat, lon) {
  if (null == lat && null == lon) {
    return {lat: this.state.lat, lon: this.state.lon}
  }
  if (null != lat) {
    this.state.lat = lat;
  }
  if (null != lon) {
    this.state.lon = lon;
  }
  return this;
};

/**
 * Refreshes and redraws current frame
 *
 * @api public
 */

Axis.prototype.update = function () {
  return this.refresh().draw();
};

/**
 * Sets or updates state cache
 *
 * @api public
 * @param {Object} obj - optinal
 */

Axis.prototype.cache = function (o) {
  if ('object' == typeof o) {
    merge(this.state.cache, o);
  } else {
    return this.state.cache;
  }
  return this;
};

/**
 * Outputs debug info if `window.DEBUG' is
 * defined
 *
 * @api public
 * @param {Mixed} ... - optional
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
 * @api public
 * @param {String} type - optional
 */

Axis.prototype.geometry = function (type) {
  if (null == type) {
    return this.state.geometry;
  } else try {
    var geo = geometries[type](this);
    this.state.geometry = type;
    return geo;
  } catch (e) {
    return null;
  }
};

/**
 * Returns the dimensions of the current
 * texture.
 *
 * @api public
 */

Axis.prototype.dimensions = function () {
  var width = 0;
  var height = 0;
  var ratio = 0;

  if (this.state.image) {
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
 * @api public
 * @param {Number} fov - optional
 */

Axis.prototype.fov = function (fov) {
  if (null == fov) {
    return this.state.fov;
  } else {
    this.state.fov = fov;
  }
  return this;
};
