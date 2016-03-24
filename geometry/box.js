'use strict';

/**
 * Module dependencies
 */

var three = require('three.js')

/**
 * Creates and returns a `BoxGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function box (axis) {
  return new three.BoxGeometry(400, 400, 400);
};
