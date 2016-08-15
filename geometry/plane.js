
/**
 * Module dependencies
 */

var three = require('three')

/**
 * Creates and returns a `PlaneBufferGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function plane (axis) {
  var width = axis.width()
  var height = axis.height()
  var segments = 4
  return new three.PlaneBufferGeometry(width,
                                       height,
                                       segments)
}
