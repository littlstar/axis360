
/**
 * Module dependencies
 */

var three = require('three.js')

// max camera lens value
var MAX_TINY_PLANET_CAMERA_LENS_VALUE = (
  require('../constants').MAX_TINY_PLANET_CAMERA_LENS_VALUE
);

// animation factor
var ANIMATION_FACTOR = require('../constants').ANIMATION_FACTOR;

// min/max lat/lon values
var MIN_LAT_VALUE = require('../constants').MIN_LAT_VALUE;

/**
 * Applies a tinyplanet projection to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function tinyplanet (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;

  // bail if camera not initialized
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if geometry is a cylinder because tiny planet
  // projection is only supported in a spherical geometry
  if ('cylinder' == axis.geometry()) { return; }

  // cancel current projection animations
  this.cancel();

  // apply equilinear if current projection is a mirror ball
  if ('mirrorball' == axis.projection()) {
    this.apply('equilinear');
  }

  // cache coordinates if current projection is not
  // already tiny planet
  if ('tinyplanet' != axis.projection()) {
    // cache current coordinates
    axis.cache(axis.coords());
  }

  // set camera lens
  camera.setLens(MAX_TINY_PLANET_CAMERA_LENS_VALUE);

  // update axis field of view
  axis.fov(camera.fov);

  // begin animation
  axis.debug("animate: TINY_PLANET begin");
  this.animate(function () {
    var lat = axis.lat();
    axis.debug("animate: TINY_PLANET lat=%d", lat);
    if (lat > MIN_LAT_VALUE) {

      if (lat > MIN_LAT_VALUE) {
        axis.lat(lat -ANIMATION_FACTOR);
      } else {
        axis.lat(MIN_LAT_VALUE);
      }
    } else {
      axis.debug("animate: TINY_PLANET end");
      this.cancel();
    }
  });
};
