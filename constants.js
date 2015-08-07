
'use strict';

/**
 * @license
 * Copyright Little Star Media Inc. and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Axis constants
 * @public
 * @module axis/constants
 * @type {Object}
 */

void module.exports;

/**
 * The default Axis field of view.
 *
 * @public
 * @const
 * @name DEFAULT_FOV
 * @type {Number}
 */

exports.DEFAULT_FOV = 100;

/**
 * Default interpolation factor.
 *
 * @public
 * @const
 * @name DEFAULT_INTERPOLATION_FACTOR
 * @type {Number}
 */

exports.DEFAULT_INTERPOLATION_FACTOR = 0.06;

/**
 * Default frame projection
 *
 * @public
 * @const
 * @name DEFAULT_PROJECTION
 * @type {String}
 */

exports.DEFAULT_PROJECTION = 'equilinear';

/**
 * Default scroll velocity
 *
 * @public
 * @const
 * @name DEFAULT_SCROLL_VELOCITY
 * @type {Number}
 */

exports.DEFAULT_SCROLL_VELOCITY = 0.09;

/**
 * Default geometry radius
 *
 * @public
 * @const
 * @name DEFAULT_GEOMETRY_RADIUS
 * @type {Number}
 */

exports.DEFAULT_GEOMETRY_RADIUS = 400;

/**
 * Default friction to apply to x and y
 * coordinates.
 *
 * @public
 * @const
 * @name DEFAULT_FRICTION
 * @type {Number}
 */

exports.DEFAULT_FRICTION = 0.001755;

/**
 * Default key pan speed in pixels
 *
 * @public
 * @const
 * @name DEFAULT_KEY_PAN_SPEED
 * @type {Number}
 */

exports.DEFAULT_KEY_PAN_SPEED = 5;

/**
 * Default controller update timeout.
 *
 * @public
 * @const
 * @name DEFAULT_CONTROLLER_UPDATE_TIMEOUT
 * @type {Number}
 */

exports.DEFAULT_CONTROLLER_UPDATE_TIMEOUT = 600;

/**
 * Default mouse movement friction factor.
 *
 * @public
 * @const
 * @name DEFAULT_MOUSE_MOVEMENT_FRICTION
 * @type {Number}
 */

exports.DEFAULT_MOUSE_MOVEMENT_FRICTION = 0.45;

/**
 * Animation factor unit applied to changes in
 * field of view and coordinates during projection
 * animations.
 *
 * @public
 * @const
 * @name ANIMATION_FACTOR
 * @type {Number}
 */

exports.ANIMATION_FACTOR = 24;

/**
 * Max tiny planet projection camera lens value.
 *
 * @public
 * @const
 * @name TINY_PLANET_CAMERA_LENS_VALUE
 * @type {Number}
 */

exports.TINY_PLANET_CAMERA_LENS_VALUE = 7.5;

/**
 * Frame click threshold in milliseconds used
 * to determine an intent to click on the frame
 * or an intent to drag
 *
 * @public
 * @const
 * @name FRAME_CLICK_THRESHOLD
 * @type {Number}
 */

exports.FRAME_CLICK_THRESHOLD = 50;

/**
 * Minimum wheel distance used to fence scrolling
 * with the intent to zoom
 *
 * @public
 * @const
 * @name MIN_WHEEL_DISTANCE
 * @type {Number}
 */

exports.MIN_WHEEL_DISTANCE = 20;

/**
 * Minimum wheel distance used to fence scrolling
 * with the intent to zoom
 *
 * @public
 * @const
 * @name MAX_WHEEL_DISTANCE
 * @type {Number}
 */

exports.MAX_WHEEL_DISTANCE = 150;

/**
 * Minimum possible y coordinate
 *
 * @public
 * @const
 * @name MIN_Y_COORDINATE
 * @type {Number}
 */

exports.MIN_Y_COORDINATE = -85;

/**
 * Maximum possible y coordinate
 *
 * @public
 * @const
 * @name MAX_Y_COORDINATE
 * @type {Number}
 */

exports.MAX_Y_COORDINATE = 85;

/**
 * Minimum possible x coordinate
 *
 * @public
 * @const
 * @name MIN_X_COORDINATE
 * @type {Number}
 */

exports.MIN_X_COORDINATE = 0;

/**
 * Maximum possible x coordinate
 *
 * @public
 * @const
 * @name MAX_X_COORDINATE
 * @type {Number}
 */

exports.MAX_X_COORDINATE = 360;

/**
 * VR device poll timeout
 *
 * @public
 * @const
 * @name VR_POLL_TIMEOUT
 * @type {Number}
 */

exports.VR_POLL_TIMEOUT = 3000;

/**
 * Maximum friction value.
 *
 * @public
 * @const
 * @name MAX_FRICTION_VALUE
 * @type {Number}
 */

exports.MAX_FRICTION_VALUE = 0.99;

/**
 * Minimum friction value.
 *
 * @public
 * @const
 * @name MIN_FRICTION_VALUE
 * @type {Number}
 */

exports.MIN_FRICTION_VALUE = 0;

/**
 * Maximum friction tolerance.
 *
 * @public
 * @const
 * @name MAX_FRICTION_TOLERANCE
 * @type {Number}
 */

exports.MAX_FRICTION_TOLERANCE = 20;

/**
 * Cartesian calibration value.
 *
 * @public
 * @const
 * @name CARTESIAN_CALIBRATION_VALUE
 * @type {Number}
 */

exports.CARTESIAN_CALIBRATION_VALUE = 1.9996;

/**
 * Axis epsilon value
 *
 * @public
 * @const
 * @name EPSILON_VALUE
 * @type {Number}
 */

exports.EPSILON_VALUE = 0.000001;
