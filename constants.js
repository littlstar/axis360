
/**
 * Axis constants
 * @public
 * @module axis/constants
 * @type {Object}
 */

/**
 * The default Axis field of view.
 *
 * @public
 * @const
 * @type {Number}
 */

exports.DEFAULT_FOV = 40;

/**
 * Animation factor unit applied to changes in
 * field of view and coordinates during projection
 * animations.
 *
 * @public
 * @const
 * @type {Number}
 */

exports.ANIMATION_FACTOR = 12;

/**
 * Max tiny planet projection camera lens value.
 *
 * @public
 * @const
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
 * @type {Number}
 */

exports.FRAME_CLICK_THRESHOLD = 250;

/**
 * Minimum wheel distance used to fence scrolling
 * with the intent to zoom
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MIN_WHEEL_DISTANCE = 5;

/**
 * Minimum wheel distance used to fence scrolling
 * with the intent to zoom
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MAX_WHEEL_DISTANCE = 500;

/**
 * Minimum possible y coordinate
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MIN_Y_COORDINATE = -85;

/**
 * Maximum possible y coordinate
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MAX_Y_COORDINATE = 85;

/**
 * Minimum possible x coordinate
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MIN_X_COORDINATE = 0;

/**
 * Maximum possible x coordinate
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MAX_X_COORDINATE = 360;

/**
 * Default frame projection
 *
 * @public
 * @const
 * @type {String}
 */

exports.DEFAULT_PROJECTION = 'equilinear';

/**
 * Cylindrical zoom offset for field of view
 *
 * @public
 * @const
 * @type {Number}
 */

exports.CYLINDRICAL_ZOOM = -16;

/**
 * Default scroll velocity
 *
 * @public
 * @const
 * @type {Number}
 */

exports.DEFAULT_SCROLL_VELOCITY = 0.09;

/**
 * Default geometry radius
 *
 * @public
 * @const
 * @type {Number}
 */

exports.DEFAULT_GEOMETRY_RADIUS = 400;

/**
 * VR device poll timeout
 *
 * @public
 * @const
 * @type {Number}
 */

exports.VR_POLL_TIMEOUT = 3000;

/**
 * Default friction to apply to x and y
 * coordinates.
 *
 * @public
 * @const
 * @type {Number}
 */

exports.DEFAULT_FRICTION = 0.5;

/**
 * Maximum friction value.
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MAX_FRICTION_VALUE = 0.99;

/**
 * Minimum friction value.
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MIN_FRICTION_VALUE = 0;

/**
 * Maximum friction tolerance.
 *
 * @public
 * @const
 * @type {Number}
 */

exports.MAX_FRICTION_TOLERANCE = 20;

/**
 * Cartesian calibration value.
 *
 * @public
 * @const
 * @type {Number}
 */

exports.CARTESIAN_CALIBRATION_VALUE = 1.9996;
