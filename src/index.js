
/**
 * Module dependencies
 */

var three = require('three.js')
  , dom = require('domify')
  , emitter = require('emitter')
  , events = require('events')
  , raf = require('raf')
  , hasWebGL = require('has-webgl')
  , tpl = require('./src/template.html')
  , keycode = require('keycode')
  , offset = require('offset')

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
var MIN_LAT_VALUE = -85;
var MAX_LAT_VALUE = 85;

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

  // window object (used for resizing)
  this.window = window;

  // set defualt FOV
  if ('undefined' == typeof opts.fov) {
    opts.fov = opts.fieldOfView || DEFAULT_FOV;
  }

  // init view
  this.el = dom(tpl);
  this.video = this.el.querySelector('video');
  this.video.style.display = 'none';

  function set (p) {
    if (opts[p]) {
      self.video[p] = opts[p];
    }
  }

  // set video options
  set('preload');
  set('autoplay');
  set('crossorigin');
  set('loop');
  set('muted');

  // initialize video source
  this.src(opts.src);

  // event delagation
  this.events = {};

  // init window events
  this.events.window = events(this.window, this);
  this.events.window.bind('resize');

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
  this.events.element.bind('touchstart', 'onmousedown');
  this.events.element.bind('mouseup');

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
    percentloaded: 0,
    originalSize: {
      width: null,
      height: null
    },
    projection: 'normal',
    lastvolume: this.video.volume,
    timestamp: Date.now(),
    resizable: opts.resizable ? true : false,
    dragstart: {},
    animating: false,
    inverted: (opts.inverted || opts.invertMouse) ? true : false,
    keyboard: false !== opts.keyboard ? true : false,
    duration: 0,
    dragloop: null,
    focused: false,
    keydown: false,
    playing: false,
    paused: false,
    dragpos: [],
    played: 0,
    height: opts.height,
    width: opts.width,
    muted: Boolean(opts.muted),
    ended: false,
    wheel: Boolean(opts.wheel),
    cache: {},
    event: null,
    theta: 0,
    scroll: null == opts.scroll ? 0.09 : opts.scroll,
    time: 0,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false
    },
    phi: 0,
    lat: 0,
    lon: 0,
    fov: opts.fov
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
    self.camera = new three.PerspectiveCamera(DEFAULT_FOV,
                                              (width / height),
                                              0.1, 1100);

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
        self.refresh();
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

      self.refresh();
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
        self.refresh();
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

      self.refresh();
      raf(animate);
    });
  };

  // set projection
 this.projection(DEFAULT_PROJECTION);
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

  if (this.state.playing) {
    this.pause();
  } else {
    this.play();
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
  this.state.paused = false;
  this.state.ended = false;
  this.emit('play', e);
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

    // adjust for width (then check for height)
    if (canvasWidth > containerWidth ||
        canvasWidth < containerWidth &&
        canvasWidth < this.state.originalSize.width) {
      newWidth = containerWidth;
      newHeight = containerWidth / aspectRatio;
      resized = true;
    } else if (canvasHeight > containerHeight ||
        (canvasHeight > containerHeight &&
        canvasHeight < this.state.originalSize.height)) {
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

    if (PROJECTION_LITTLE_PLANET != this.state.projection) {
      this.state.cache.lat = this.state.lat;
      this.state.cache.lon = this.state.lon;
    }

    if (this.state.inverted) {
      this.state.lon -= x;
      this.state.lat += y;
    } else {
      this.state.lon += x;
      this.state.lat -= y;
    }
  }

  this.emit('mousemove', e);
  this.emit('state', this.state);
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
    if (this.state.originalSize.width == null) {
      this.state.originalSize.width = width;
    }
    if (this.state.originalSize.height == null) {
      this.state.originalSize.height = height;
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
    this.video.src = src;
    this.emit('source', src);
    return this;
  } else {
    return this.video.src;
  }
};

/**
 * Plays video frame
 *
 * @api public
 */

Frame.prototype.play = function () {
  if (true == this.state.ended) {
    this.seek(0);
  }
  this.video.play();
  return this;
};

/**
 * Pauses video frame
 *
 * @api public
 */

Frame.prototype.pause = function () {
  this.video.pause();
  return this;
};

/**
 * Set or get volume on frame
 *
 * @api public
 * @param {Number} n
 */

Frame.prototype.volume = function (n) {
  if (null == n) {
    return this.video.volume;
  }
  this.video.volume = n
  this.emit('volume', n);
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
    if (0 == this.volume()) {
      this.volume(this.state.lastvolume);
    }
  } else {
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
  this.mute(false);
  this.emit('unmute');
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
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    if (now - this.state.timestamp >= 32) {
      this.state.timestamp = now;
      if ('undefined' != typeof this.texture) {
        this.texture.needsUpdate = true;
      }
    }
  }

  // @TODO(werle) - make this delta configurable
  var delta = 6;
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
  return this.draw();
};

/**
 * Refresh frame
 *
 * @api public
 */

Frame.prototype.resizable = function(resizable) {
  if (typeof resizable === 'undefined') return this.state.resizable;
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
  if (seconds >= 0 && seconds <= this.video.duration) {
    this.video.currentTime = seconds;
    this.emit('seek', seconds);
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
  this.seek(this.video.currentTime + seconds);
  this.emit('forward', seconds);
  return this;
};

/**
 * Rewind `n' amount of seconds
 *
 * @api public
 * @param {Number} seconds
 */

Frame.prototype.rewind = function (seconds) {
  this.seek(this.video.currentTime - seconds);
  this.emit('rewind', seconds);
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
 * Draws video frame
 *
 * @api public
 */

Frame.prototype.draw = function () {
  var camera = this.camera;
  var scene = this.scene;
  var renderer = this.renderer;

  var theta = this.state.theta = this.state.lon * Math.PI / 180;
  var lat = this.state.lat = Math.max(MIN_LAT_VALUE, Math.min(85, this.state.lat));
  var phi = this.state.phi = (90 - this.state.lat) * Math.PI / 180;

  var x = 500 * Math.sin(this.state.phi) * Math.cos(this.state.theta);
  var y = 500 * Math.cos(this.state.phi);
  var z = 500 * Math.sin(this.state.phi) * Math.sin(this.state.theta);

  this.lookAt(x, y, z);

  this.emit('draw');
  this.emit('state', this.state);
  return this;
};

/**
 * Look at a position in a [x, y, z) vector
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

  // attach dom node to parent
  this.parent.appendChild(this.el);

  if (0 == height) {
    height = Math.min(width, window.innerHeight);
    aspectRatio = width / height;
    height = height / aspectRatio;
  }

  // initialize texture
  this.texture = new three.Texture(this.video);
  this.texture.format = three.RGBFormat;
  this.texture.minFilter = three.LinearFilter;
  this.texture.magFilter = three.LinearFilter;
  this.texture.generateMipmaps = false;

  // initialize size
  this.size(width, height);

  // initialize projection
  this.projection(this.state.projection);

  // start refresh loop
  raf(function loop () {
    self.refresh();
    raf(loop);
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

  this.state.height = height;
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

  this.state.width = width;
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
