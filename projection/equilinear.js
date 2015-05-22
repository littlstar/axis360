
/**
 * Module dependencies
 */

var raf = require('raf')
  , three = require('three.js')
  , createCamera = require('../camera')
  , createPlane = require('../geometry/plane')
  , createSphere = require('../geometry/sphere')
  , createCylinder = require('../geometry/cylinder')

// default field of view
var DEFAULT_FOV = require('../constants').DEFAULT_FOV;

// animation factor
var ANIMATION_FACTOR = require('../constants').ANIMATION_FACTOR;

// cylinder zoom offet
var CYLINDRICAL_ZOOM = require('../constants').CYLINDRICAL_ZOOM;

/**
 * Applies an equilinear projection to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function equilinear (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;

  // bail if camera not present
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if content sizing is incorrect
  if (false == this.contentHasCorrectSizing()) { return; }

  // initializes scene
  this.initializeScene();

  // initialize camera
  createCamera(axis);

  // cancel current projection animations
  this.cancel();

  // max FOV for animating
  var maxFov = DEFAULT_FOV;

  // current fov
  var fov = axis.fov();

  // zoom offset where applicable
  var zoom = CYLINDRICAL_ZOOM;

  // apply zoom to cylinder geometry type
  if ('cylinder' == axis.geometry()) {
    maxFov += zoom;
    axis.fov(fov += zoom);
  }

  if ('tinyplanet' == axis.projection() || this.isMirrorBall()) {
    axis.coords(0, 0);
  }

  // bail if projection is mirror ball
  if (this.isMirrorBall()) {
    return;
  }

  // animate
  axis.debug("animate: EQUILINEAR begin");
  this.animate(function () {
    axis.debug("animate: EQUILINEAR maxFov=%d fov=%d lat=%d",
               maxFov, axis.fov(), axis.lat());

    // cancel animation if max fov reached and
    // latitude has reached equator
    if (maxFov == axis.fov() && 0 == axis.lat()) {
      axis.debug("animate: EQUILINEAR end");
      return this.cancel();
    }

    // normalize field of view value
    if (fov > maxFov) {
      fov = Math.max(fov - ANIMATION_FACTOR, maxFov);
    } else if (fov < maxFov) {
      fov = Math.min(fov + ANIMATION_FACTOR, maxFov);
    } else {
      fov = maxFov;
    }

    // prevent negative field of view
    if (fov < 0) { fov = 0; }

    // update field of view
    axis.fov(fov);

    // normalize latitude
    if (axis.state.lat > 0) {
      axis.lat(Math.max(0, axis.state.lat - ANIMATION_FACTOR));
    } else if (axis.state.lat < 0) {
      axis.lat(Math.min(0, axis.state.lat + ANIMATION_FACTOR));
    }
  });
};

