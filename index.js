
/**
 * Module dependencies
 */

var three = require('three.js')
  , tpl = require('./template.html')
  , dom = require('domify')
  , emitter = require('emitter')
  , events = require('events')
  , raf = require('raf')
  , hasWebGL = require('has-webgl')

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
  this.events = {};

  if ('undefined' == typeof opts.pov) {
    opts.fov = opts.fieldOfView || 36;
  }

  // init view
  this.el = dom(tpl);
  this.video = this.el.querySelector('video');
  this.video.style.display = 'none';

  function set (p) {
    if (opts[p]) {
      this.video[p] = opts[p];
    }
  }

  set('preload');
  set('autoplay');
  set('crossorigin');
  set('loop');
  set('muted');

  this.src(opts.src);
  this.parent = parent;

  parent.appendChild(this.el);

  // event delagation
  this.events = {};

  // init video events
  this.events.video = events(this.video, this);
  this.events.video.bind('canplaythrough');
  this.events.video.bind('progress');
  this.events.video.bind('timeupdate');
  this.events.video.bind('ended');

  // init dom element events
  this.events.element = events(this.el, this);
  this.events.element.bind('mousemove');
  this.events.element.bind('mousewheel');
  this.events.element.bind('mousedown');
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

  this.renderer.autoClear = opts.autoClear || false;
  this.renderer.setClearColor(opts.clearColor || 0x000, 1);

  // init video texture
  this.texture = new three.Texture(this.video);
  this.texture.format = three.RGBFormat;
  this.texture.minFilter = three.LinearFilter;
  this.texture.magFilter = three.LinearFilter;
  this.texture.generateMipmaps = false;

  this.geo = new three.SphereGeometry(500, 80, 50);
  this.material = new three.MeshBasicMaterial({map: this.texture});
  this.mesh = new three.Mesh(this.geo, this.material);
  this.mesh.scale.x = -1; // mesh

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
    dragpos: [],
    played: 0,
    height: opts.height,
    width: opts.width,
    muted: Boolean(opts.muted),
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

  // add mesh to scene
  this.scene.add(this.mesh);

}

// mixin `Emitter'
emitter(Frame.prototype);

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
  this.video.play();
  this.emit('play');
  return this;
};

/**
 * Pauses video frame
 *
 * @api public
 */

Frame.prototype.pause = function () {
  this.video.pause();
  this.emit('pause');
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
  return this.mute(false);
};

/**
 * Refresh frame
 *
 * @api public
 */

Frame.prototype.refresh = function () {
  var now = Date.now();
  if (now - this.state.timestamp >= 32) {
    this.state.timestamp = now;
    this.texture.needsUpdate = true;
  }
  this.emit('refresh');
  this.emit('state', this.state);
  return this.draw();
};

/**
 * Seek to time
 *
 * @api public
 * @param {Number} time
 */

Frame.prototype.seek = function (value) {
  if (value >= 0 && value <= this.video.duration) {
    this.video.currentTime = value;
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
  return this.seek(this.video.currentTime + seconds);
};

/**
 * Rewind `n' amount of seconds
 *
 * @api public
 * @param {Number} seconds
 */

Frame.prototype.rewind = function (seconds) {
  return this.seek(this.video.currentTime - seconds);
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

  this.size(width, height);

  // init camera
  this.camera = new three.PerspectiveCamera(
    fov, (width / height) | 0, 0.1, 1000);

  // attach renderer to instance node container
  this.el.querySelector('.container').appendChild(this.renderer.domElement);


  raf(function loop () {
    self.refresh();
    raf(loop);
  });
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
  return this;
};
