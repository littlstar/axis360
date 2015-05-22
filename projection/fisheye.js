
/**
 * Module dependencies
 */

var three = require('three.js')

// animation factor
var ANIMATION_FACTOR = require('../constants').ANIMATION_FACTOR;

/**
 * Applies a fisheye projection to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function fisheye (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;

  // bail if camera not initialized
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if geometry is a cylinder because fisheye
  // projection is only supported in a spherical geometry
  if ('cylinder' == axis.geometry()) { return; }

  if ('mirrorball' == axis.projection()) {
    this.apply('equilinear');
  }

  // max Z and FOV
  var maxZ = (axis.height() / 100) | 0;
  var maxFov = 75;

  // apply cached longitude
  axis.lon(axis.cache().lon);

  if ('mirrorball' == axis.projection() || 'tinyplanet' == axis.projection()) {
    // position latitude at equator
    axis.lat(0);
  } else {
    // apply cached latitude
    axis.lat(axis.cache().lat);
  }

  // begin animation
  axis.debug("animate: FISHEYE begin");
  this.animate(function () {
    var fov = axis.fov();

    axis.debug("animate: FISHEYE maxFov=%d maxZ=%d fov=%d",
               maxFov, maxZ, fov);

    // cancel when we've reached max field of view
    if (maxFov == axis.fov()) {
      axis.debug("animate: FISHEYE end");
      return this.cancel();
    }

    // normalize field of view
    if (fov < maxFov) {
      axis.fov(Math.min(maxFov, axis.fov() + ANIMATION_FACTOR));
    } else if (fov > maxFov) {
      axis.fov(Math.min(maxFov, axis.fov() - ANIMATION_FACTOR));
    }

    // normalize z coordinate
    if (camera.position.z < maxZ) {
      camera.position.z++;
      camera.position.z = Math.min(maxZ, camera.position.z);
    } else if (camera.position.z > maxZ) {
      camera.position.z--;
      camera.position.z = Math.max(maxZ, camera.position.z);
    }
  });
};
