
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
  , tpl = require('./src/template.html')
  , keycode = require('keycode')
  , path = require('path')

// uncomment to enable debugging
//window.DEBUG = true;

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

/**
 * Outputs debug info if `window.DEBUG' is
 * defined
 *
 * @api private
 */

function debug () {
  if (window.DEBUG) {
    console.debug.apply(console, arguments);
  }
}

// add three.CanvasRenderer
Frame.THREE = three;
require('three-canvas-renderer')(three);

// default field of view
var DEFAULT_FOV = 30;

// frame click threshold
var FRAME_CLICK_THRESHOLD = 250;

// min/max wheel distances
var MIN_WHEEL_DISTANCE = 5;
var MAX_WHEEL_DISTANCE = 500;

// max little planet projection camera lens value
var MAX_LITTLE_PLANET_CAMERA_LENS_VALUE = 7.5;

// min/max lat/lon values
var MIN_LAT_VALUE = -90;
var MAX_LAT_VALUE = 90;

// projection types
var PROJECTION_NORMAL = 'normal';
var PROJECTION_LITTLE_PLANET = 'littleplanet';
var PROJECTION_FISHEYE = 'fisheye';

// default projection
var DEFAULT_PROJECTION = PROJECTION_NORMAL;

/**
 * `Frame' constructor
 *
 * @api public
 * @param {Object} parent
 * @param {Object} opts
 */

module.exports = Frame;
function Frame (parent, opts) {
  if (!(this instanceof Frame)) {
    return new Frame(opts);
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
  this.holdframe = this.el.querySelector('.slant.holdframe');
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
        }
      }

      if (self.state.focused) {
        detect('up');
        detect('down');
        detect('left');
        detect('right');
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

      if (self.state.focused) {
        e.preventDefault();
        detect('up');
        detect('down');
        detect('left');
        detect('right');
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
  this.scene = new three.Scene();

  // init camera
  this.camera = null;

  // init renderer
  this.renderer = opts.renderer || (
    hasWebGL ?
    new three.WebGLRenderer() :
    new three.CanvasRenderer()
  );

  // renderer options
  this.renderer.autoClear = opts.autoClear || false;
  this.renderer.setClearColor(opts.clearColor || 0x000, 1);

  // attach renderer to instance node container
  this.el.querySelector('.container').appendChild(this.renderer.domElement);

  this.material = null;
  this.texture = null;

  if (opts.muted) {
    this.mute(true);
  }

  // viewport state
  this.state = {
    maintainaspectratio: opts.maintainaspectratio ? true : false,
    deviceorientation: {lat: 0, lon: 0},
    percentloaded: 0,
    originalsize: {width: null, height: null},
    orientation: window.orientation || 0,
    projection: 'normal',
    lastvolume: this.video.volume,
    fullscreen: false,
    timestamp: Date.now(),
    resizable: opts.resizable ? true : false,
    mousedown: false,
    dragstart: {x:0, y:0},
    animating: false,
    holdframe: opts.holdframe,
    inverted: (opts.inverted || opts.invertMouse) ? true : false,
    keyboard: false !== opts.keyboard ? true : false,
    duration: 0,
    lastsize: {width: null, height: null},
    dragloop: null,
    focused: false,
    keydown: false,
    playing: false,
    dragpos: [],
    paused: false,
    center: {lat: null, lon: null},
    played: 0,
    height: opts.height,
    touch: {lat: 0, lon: 0},
    ready: false,
    width: opts.width,
    muted: Boolean(opts.muted),
    ended: false,
    wheel: Boolean(opts.wheel),
    cache: {},
    event: null,
    image: opts.image ? true : false,
    scroll: null == opts.scroll ? 0.09 : opts.scroll,
    rafid: null,
    time: 0,
    keys: {up: false, down: false, left: false, right: false},
    lat: 0,
    lon: 0,
    fov: opts.fov,
    src: null
  };

  // viewport projections
  this.projections = {};
  this.projections[PROJECTION_NORMAL] = function normal (_, cb) {
    var geo = new three.SphereGeometry(500, 80, 50);
    var material = new three.MeshBasicMaterial({map: self.texture});
    var mesh = new three.Mesh(geo, material);
    var width = self.width();
    var height = self.height();
    var fov = self.state.fov;
    var projection = self.state.projection;

    //self.state.fov = DEFAULT_FOV;
    mesh.scale.x = -1;

    // init camera
    if (null == self.camera) {
      self.camera = new three.PerspectiveCamera(DEFAULT_FOV,
                                                (width / height),
                                                0.1, 1100);
    }

    // add mesh to scene
    self.scene = new three.Scene();
    self.scene.add(mesh);

    self.state.animating = true;
    raf(function animate () {
      if (PROJECTION_LITTLE_PLANET == projection) {
        self.state.lon = self.state.cache.lon;
        self.state.lat = self.state.cache.lat;
      }
      var factor = 6;
      if (false == self.state.animating) { return; }
      debug("animate: NORMAL");
      if (DEFAULT_FOV == self.state.fov && 0 == self.state.lon && 0 == self.state.lat) {
        self.state.animating = false;
        self.refresh().draw();
        if ('function' == typeof cb) { cb(); }
        return;
      }

      if (fov > DEFAULT_FOV) {
        fov -= factor;
        fov = Math.max(fov, DEFAULT_FOV);
      } else if (fov < DEFAULT_FOV) {
        fov += factor;
        fov = Math.min(fov, DEFAULT_FOV);
      } else {
        fov = DEFAULT_FOV;
      }

      self.state.fov = fov;

      if (PROJECTION_LITTLE_PLANET == projection) {
        if (self.state.lon > 0) {
          self.state.lon -= factor;
          self.state.lon = Math.max(0, self.state.lon);
        } else if (self.state.lon < 0) {
          self.state.lon += factor;
          self.state.lon = Math.min(0, self.state.lon);
        }

        if (self.state.lat > 0) {
          self.state.lat -= factor;
          self.state.lat = Math.max(0, self.state.lat);
        } else if (self.state.lat < 0) {
          self.state.lat += factor;
          self.state.lat = Math.min(0, self.state.lat);
        }
      }

      self.refresh().draw();
      raf(animate);

    });
  };

  this.projections[PROJECTION_LITTLE_PLANET] = function littleplanet (_, cb) {
    if (PROJECTION_LITTLE_PLANET != self.state.projection) {
      self.state.cache.lon = self.state.lon;
      self.state.cache.lat = self.state.lat;
    }
    self.state.animating = true;
    raf(function animate () {
      var factor = 6;
      if (false == self.state.animating) { return; }
      debug("animate: LITTLE_PLANET");
      if (self.state.lat > MIN_LAT_VALUE || self.state.lon != 0) {
        self.state.animating = true;

        if (self.state.lat > MIN_LAT_VALUE) {
          self.state.lat -= factor;
        } else {
          self.state.lat = MIN_LAT_VALUE;
        }

        if (self.state.lon > 0) {
          self.state.lon -= factor;
          self.state.lon = Math.max(0, self.state.lon);
        } else if (self.state.lon < 0) {
          self.state.lon += factor;
          self.state.lon = Math.min(0, self.state.lon);
        }

        self.camera.setLens(MAX_LITTLE_PLANET_CAMERA_LENS_VALUE);
        self.state.fov = self.camera.fov;
        raf(animate);
      } else {
        self.state.animating = false;
        self.refresh().draw();
        if ('function' == typeof cb) { cb(); }
      }
    });
  };

  this.projections[PROJECTION_FISHEYE] = function () {
    var z = (self.height() / 100)|0;
    var f = 6;
    var fov = 75;

    self.state.lon = self.state.cache.lon;
    self.state.lat = self.state.cache.lat;

    self.state.animating = true;

    raf(function animate () {
      if (false == self.state.animating) { return; }
      debug("animate: FISHEYE");
      if (fov == self.state.fov) {
        self.state.animating = false;
        self.refresh();
        if ('function' == typeof cb) { cb(); }
        return;
      }

      if (self.state.fov < fov) {
        self.state.fov += f;
        self.state.fov = Math.min(fov, self.state.fov);
      } else if (self.state.fov > fov) {
        self.state.fov -= f;
        self.state.fov = Math.max(fov, self.state.fov);
      }

      if (self.camera.position.z < z) {
        self.camera.position.z++;
        self.camera.position.z = Math.min(z, self.camera.position.z);
      } else if (self.camera.position.z > z) {
        self.camera.position.z--;
        self.camera.position.z = Math.max(z, self.camera.position.z);
      }

      self.refresh().draw();
      raf(animate);
    });
  };

  // set projection
 this.projection(DEFAULT_PROJECTION);

 // initialize frame source
 this.src(opts.src);
}

// mixin `Emitter'
emitter(Frame.prototype);

/**
 * Handle `onclick' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onclick = function (e) {
  var now = Date.now();
  var ts = this.state.mousedownts;

  if ((now - ts) > FRAME_CLICK_THRESHOLD) {
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

Frame.prototype.oncanplaythrough = function (e) {
  this.state.time = this.video.currentTime;
  this.state.duration = this.video.duration;

  this.emit('canplaythrough', e);
  this.emit('ready');
  this.state.ready = true;

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

Frame.prototype.onplay = function (e) {
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

Frame.prototype.onpause = function (e) {
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

Frame.prototype.onplaying = function (e) {
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

Frame.prototype.onwaiting = function (e) {
  this.emit('wait', e);
};

/**
 * Handle `onloadstart' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onloadstart = function (e) {
  this.emit('loadstart', e);
};

/**
 * Handle `onprogress' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onprogress = function (e) {
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
  this.emit('state', this.state);
};

/**
 * Handle `ontimeupdate' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.ontimeupdate = function (e) {
  e.percent = this.video.currentTime / this.video.duration * 100;
  this.state.time = this.video.currentTime;
  this.state.duration = this.video.duration;
  this.state.played = e.percent;
  this.emit('timeupdate', e);
  this.emit('state', this.state);
};

/**
 * Handle `onended' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onended = function (e) {
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

Frame.prototype.onmousedown = function (e) {
  this.state.mousedownts = Date.now();
  this.state.dragstart.x = e.pageX;
  this.state.dragstart.y = e.pageY;
  this.state.mousedown = true;
  this.emit('mousedown', e);
  this.emit('state', this.state);
};

/**
 * Handle `onmouseup' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onmouseup = function (e) {
  this.state.mousedown = false;
  this.emit('mouseup', e);
  this.emit('state', this.state);
};

/**
 * Handle `ontouchstart' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.ontouchstart = function (e) {
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

Frame.prototype.ontouchend = function(e) {
  this.state.mousedown = false;
  this.emit('touchend', e);
};

/**
 * Handle `onresize' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onresize = function (e) {
  if (this.state.resizable) {
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

Frame.prototype.onfullscreenchange = function(fullscreen) {
  this.state.focused = true;
  if (fullscreen) {
    this.state.fullscreen = true;
    this.emit('enterfullscreen');
  } else {
    this.size(this.state.lastsize.width, this.state.lastsize.height);
    this.emit('resize', {
      width: this.state.lastsize.width,
      height: this.state.lastsize.height
    });
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

Frame.prototype.onmousemove = function (e) {
  var x = 0;
  var y = 0;

  if (true == this.state.mousedown) {
    x = e.pageX - this.state.dragstart.x;
    y = e.pageY - this.state.dragstart.y;

    this.state.dragstart.x = e.pageX;
    this.state.dragstart.y = e.pageY;

    if (this.state.inverted) {
      this.state.lon -= x;
      this.state.lat += y;
    } else {
      this.state.lon += x;
      this.state.lat -= y;
    }

    if (PROJECTION_LITTLE_PLANET != this.state.projection) {
      this.state.cache.lat = this.state.lat;
      this.state.cache.lon = this.state.lon;
    }
  }

  this.emit('mousemove', e);
  this.emit('state', this.state);
};

/**
 * Handle `ontouchmove' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.ontouchmove = function(e) {
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

Frame.prototype.onmousewheel = function (e) {
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
  this.emit('state', this.state);
};

/**
 * Handle `ondeviceorientation' event
 *
 * @api private
 * @param {Object} e
 */

Frame.prototype.ondeviceorientation = function (e) {
  var orientation = this.state.orientation;
  var alpha = e.alpha;
  var beta = e.beta;
  var gamma = e.gamma;
  var lat = 0;
  var lon = 0;

  if (PROJECTION_LITTLE_PLANET == this.state.projection) {
    return false;
  }

  debug('orientation=%s',
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

Frame.prototype.onorientationchange = function (e) {
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

Frame.prototype.size = function (width, height) {
  this.emit('size', width, height);
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(
    (this.state.width = width),
    (this.state.height = height));
    if (this.state.originalsize.width == null) {
      this.state.originalsize.width = width;
    }
    if (this.state.originalsize.height == null) {
      this.state.originalsize.height = height;
    }
  return this;
};

/**
 * Sets or gets video src
 *
 * @api public
 * @param {String} src - optional
 */

Frame.prototype.src = function (src) {
  if (src) {
    this.state.src = src;

    if (isImage(src)) {
      this.state.image = true;
    } else {
      this.state.image = false;
      this.video.src = src;
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

Frame.prototype.play = function () {
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

Frame.prototype.pause = function () {
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

Frame.prototype.fullscreen = function () {
  if (! fullscreen.supported) return;
  if (! this.state.fullscreen) {
    var canvasStyle = getComputedStyle(this.renderer.domElement);
    var canvasWidth = parseFloat(canvasStyle.width);
    var canvasHeight = parseFloat(canvasStyle.height);
    var aspectRatio = canvasWidth / canvasHeight;
    var newWidth = null;
    var newHeight = null;

    if (this.state.maintainaspectratio) {
      newWidth = window.innerWidth;
      newHeight = newWidth / aspectRatio;
    } else {
      newWidth = window.screen.width;
      newHeight = window.screen.height;
    }

    this.state.lastsize.width = canvasWidth;
    this.state.lastsize.height = canvasHeight;

    this.size(newWidth, newHeight);
    this.emit('resize', {
      width: newWidth,
      height: newHeight
    });

    fullscreen(this.renderer.domElement);
  }
};

/**
 * Set or get volume on frame
 *
 * @api public
 * @param {Number} n
 */

Frame.prototype.volume = function (n) {
  if (false == this.state.image) {
    if (null == n) {
      return this.video.volume;
    }
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

Frame.prototype.mute = function (mute) {
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

Frame.prototype.unmute = function (mute) {
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

Frame.prototype.refresh = function () {
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

  if (false == this.state.mousedown && this.state.deviceorientation.lat) {
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

  if (PROJECTION_LITTLE_PLANET != this.state.projection) {
    this.state.cache.lat = this.state.lat;
    this.state.cache.lon = this.state.lon;
  }

  this.emit('refresh');
  this.emit('state', this.state);
  return this;
};

/**
 * Refresh frame
 *
 * @api public
 */

Frame.prototype.resizable = function(resizable) {
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

Frame.prototype.seek = function (seconds) {
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

Frame.prototype.foward = function (seconds) {
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

Frame.prototype.rewind = function (seconds) {
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

Frame.prototype.use = function (fn) {
  fn(this);
  return this;
};

/**
 * Draws frame
 *
 * @api public
 */

Frame.prototype.draw = function () {
  var renderer = this.renderer;
  var camera = this.camera;
  var scene = this.scene;
  var dtor = Math.PI / 180; // degree to radian conversion

  var lat = this.state.lat;
  var lon = this.state.lon;

  lat = Math.max(MIN_LAT_VALUE, Math.min(MAX_LAT_VALUE, lat));

  var theta = lon * dtor;
  var phi = (90 - lat) * dtor;

  var x = 500 * Math.sin(phi) * Math.cos(theta);
  var y = 500 * Math.cos(phi);
  var z = 500 * Math.sin(phi) * Math.sin(theta);

  this.lookAt(x, y, z);
  this.emit('draw');
  this.emit('state', this.state);

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

Frame.prototype.lookAt = function (x, y, z) {
  var vec = new three.Vector3(x, y, z);

  this.camera.lookAt(vec);
  this.camera.position.x = -x;
  this.camera.position.y = -y;
  this.camera.position.z = -z;

  this.renderer.clear();
  this.renderer.render(this.scene, this.camera);

  this.emit('lookat',
            {x: this.camera.position.x,
             y: this.camera.position.y,
             z: this.camera.position.z});

  return this;
};

/**
 * Renders the frame
 *
 * @api public
 */

Frame.prototype.render = function () {
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
    this.texture.format = three.RGBFormat;
    this.texture.minFilter = three.LinearFilter;
    this.texture.magFilter = three.LinearFilter;
    this.texture.generateMipmaps = false;
  } else {
    this.texture = three.ImageUtils.loadTexture(this.src());
  }

  // initialize size
  this.size(width, height);

  // initialize projection
  this.projection(this.state.projection);

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

Frame.prototype.offset =
Frame.prototype.setViewOffset = function () {
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

Frame.prototype.height = function (height) {
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

Frame.prototype.width = function (width) {
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
 * @param {Function} cb - optional
 */

Frame.prototype.projection = function (type, cb) {
  type = type ? type.replace(/\s+/g, '') : null;
  var fn = this.projections[type];
  if (type && 'function' == typeof fn) {
    fn(this, cb);
    this.state.projection = type;
    return this;
  } else {
    return this.state.projection;
  }
};

/**
 * Destroys frame
 *
 * @api public
 */

Frame.prototype.destroy = function () {
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
