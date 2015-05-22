
/**
 * Module dependencies
 */

var three = require('three.js')

// default field of view
var DEFAULT_FOV = require('./constants').DEFAULT_FOV;

/**
 * Creates a `PerspectiveCamera' instance
 * and assigns it to `Axis' instance if
 * `.camera' is `null'. It will override the
 * camera if 'mirrorball' is the current
 * projection.
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function (axis) {
  var height = axis.height();
  var width = axis.width();
  var ratio = width / height;
  if (null == axis.camera || 'mirrorball' == axis.projection()) {
    axis.camera = new three.PerspectiveCamera(DEFAULT_FOV, ratio, 0.01, 1000);
    axis.camera.target = new three.Vector3(0, 0, 0);
  }
  return axis.camera;
};
