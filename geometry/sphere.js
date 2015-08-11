
/**
 * Module dependencies
 */

var three = require('three.js')

/**
 * Creates and returns a `SphereGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function sphere (axis) {
  var heightSegments = 50;
  var widthSegments = 80;
  var radius = axis.state.radius;
  var phi = 100;
  if (radius < 400) {
    radius = 400;
  } else if (radius > 600) {
    radius = 600;
  }
  return new three.SphereGeometry(radius,
                                  widthSegments,
                                  heightSegments,
                                  phi);
};
