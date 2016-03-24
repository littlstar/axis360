'use strict';

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
  var heightSegments = 32;
  var widthSegments = 32;
  var radius = axis.state.radius;
  var phi = Math.PI * 2;

  if (radius < 400) {
    radius = 200;
  } else if (radius > 600) {
    radius = 400;
  }

  return new three.SphereGeometry(radius,
                                  widthSegments,
                                  heightSegments,
                                  phi);
};
