
/**
 * Module dependencies
 */

var three = require('three.js')
  , dom = require('domify')
  , emitter = require('emitter')
  , events = require('events')
  , raf = require('raf')
  , hasWebGL = require('has-webgl')
  , tpl = require('./template.html')

// default field of view
var DEFAULT_FOV = 35;

// frame click threshold
var FRAME_CLICK_THRESHOLD = 250;

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
  if ('undefined' == typeof opts.pov) {
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
  this.mesh = null;
  this.geo = null;

  if (opts.muted) {
    this.mute(true);
  }

  // viewport state
  this.state = {
    percentloaded: 0,
    lastvolume: this.video.volume,
    timestamp: Date.now(),
    dragstart: {},
    duration: 0,
    dragloop: null,
    playing: false,
    paused: false,
    dragpos: [],
    played: 0,
    height: opts.height,
    width: opts.width,
    muted: Boolean(opts.muted),
    ended: false,
    wheel: false,
    event: null,
    theta: 0,
    scroll: null == opts.scroll ? 0.09 : opts.scroll,
    time: 0,
    phi: 0,
    lat: 0,
    lon: 0,
    fov: opts.fov
  };
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

    this.state.lon += x;
    this.state.lat -= y;
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
  var min = 3;
  var max = 100;
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
  this.renderer.setSize(
    (this.state.width = width),
    (this.state.height = height));
  return this;
};

/**
 * Sets or gets video src
 *
 * @api public
 * @param {String} src - optional
 */

Frame.prototype.src = function (src) {
  this.emit('source', src);
  return (src ?
    ((this.video.src = src), this) :
    this.video.src);
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
  this.emit('refresh');
  this.emit('state', this.state);
  return this.draw();
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
  var lat = this.state.lat = Math.max(-85, Math.min(85, this.state.lat));
  var phi = this.state.phi = (90 - this.state.lat) * Math.PI / 180;

  var x = 500 * Math.sin(this.state.phi) * Math.cos(this.state.theta);
  var y = 500 * Math.cos(this.state.phi);
  var z = 500 * Math.sin(this.state.phi) * Math.sin(this.state.theta);

  var vec = new three.Vector3(x, y, z);
  camera.lookAt(vec);
  camera.position.x = -x;
  camera.position.y = -y;
  camera.position.z = -z;

  renderer.clear();
  renderer.render(scene, camera);

  this.emit('draw');
  this.emit('state', this.state);
  return this;
};

/**
 *
 * @api public
 */

Frame.prototype.render = function () {
  var self = this;
  var style = getComputedStyle(this.parent).width;
  var fov = this.state.fov;
  var height = this.state.height || parseFloat(style.height);
  var width = this.state.width || parseFloat(style.width);

  // attach dom node to parent
  this.parent.appendChild(this.el);

  this.texture = new three.Texture(this.video);
  this.texture.format = three.RGBFormat;
  this.texture.minFilter = three.LinearFilter;
  this.texture.magFilter = three.LinearFilter;
  this.texture.generateMipmaps = false;

  this.geo = new three.SphereGeometry(500, 80, 50);
  this.material = new three.MeshBasicMaterial({map: this.texture});
  this.mesh = new three.Mesh(this.geo, this.material);
  this.mesh.scale.x = -1; // mesh

  this.size(width, height);

  // init camera
  this.camera = new three.PerspectiveCamera(
    fov, (width / height) | 0, 0.1, 1000);

  // add mesh to scene
  this.scene.add(this.mesh);

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
