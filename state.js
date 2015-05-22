
// default projection type
var DEFAULT_PROJECTION = require('./constants').DEFAULT_PROJECTION;

/**
 * `State' constructor
 *
 * @api public
 * @param {Object} opts
 */

module.exports = State;
function State (opts) {
  if (!(this instanceof State)) {
    return new State(opts);
  }

  this.maintainaspectratio = opts.maintainaspectratio ? true : false;
  this.projectionrequested = opts.projection || DEFAULT_PROJECTION;
  this.deviceorientation = {lat: 0, lon: 0};
  this.percentloaded = 0;
  this.allowcontrols = null == opts.allowcontrols ? true : opts.allowcontrols;
  this.originalsize = {width: null, height: null};
  this.orientation = window.orientation || 0;
  this.forceFocus = true == opts.forceFocus ? true : false;
  this.projection = opts.projection || DEFAULT_PROJECTION;
  this.lastvolume = 0;
  this.fullscreen = false;
  this.timestamp = Date.now();
  this.resizable = opts.resizable ? true : false;
  this.mousedown = false;
  this.dragstart = {x:0, y:0};
  this.animating = false;
  this.clickable = false == opts.clickable ? false : true;
  this.holdframe = opts.holdframe;
  this.geometry = null;
  this.inverted = (opts.inverted || opts.invertMouse) ? true : false;
  this.keyboard = false !== opts.keyboard ? true : false;
  this.duration = 0;
  this.lastsize = {width: null, height: null};
  this.dragloop = null;
  this.focused = false;
  this.keydown = false;
  this.playing = false;
  this.dragpos = [];
  this.radius = opts.radius || 400;
  this.paused = false;
  this.center = {lat: null, lon: null};
  this.played = 0;
  this.height = opts.height;
  this.touch = {lat: 0, lon: 0};
  this.ready = false;
  this.width = opts.width;
  this.muted = Boolean(opts.muted);
  this.ended = false;
  this.wheel = Boolean(opts.wheel);
  this.cache = {};
  this.event = null;
  this.image = opts.image ? true : false;
  this.scroll = null == opts.scroll ? 0.09 : opts.scroll;
  this.rafid = null;
  this.time = 0;
  this.keys = {up: false, down: false, left: false, right: false};
  this.lat = 0;
  this.lon = 0;
  this.fov = opts.fov;
  this.src = null;
  this.vr = opts.vr || false;
}
