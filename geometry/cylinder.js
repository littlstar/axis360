
/**
 * Module dependencies
 */

var three = require('three.js')

/**
 * Creates and returns a `CylinderGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function sphere (axis) {
  var radiusSegments = 64;
  var heightSegments = 1;
  var openEnded = true;
  var radius = axis.state.radius;
  var height = axis.dimensions().height;
  return new three.CylinderGeometry(radius,
                                    radius,
                                    height,
                                    radiusSegments,
                                    heightSegments,
                                    openEnded);
};
