
/**
 * The default Axis field of view.
 *
 * @api public
 */

exports.DEFAULT_FOV = 40;

/**
 * Animation factor unit applied to changes in
 * field of view, latitude, and longitude values
 * during projection animations.
 *
 * @api public
 */

exports.ANIMATION_FACTOR = 6;

/**
 * Max tiny planet projection camera lens value.
 *
 * @api public
 */

exports.MAX_TINY_PLANET_CAMERA_LENS_VALUE = 7.5;

/**
 * Frame click threshold in milliseconds used
 * to determine an intent to click on the frame
 * or an intent to drag
 *
 * @api public
 */

exports.FRAME_CLICK_THRESHOLD = 250;

/**
 * Minimum wheel distance used to fence scrolling
 * with the intent to zoom
 *
 * @api public
 */

exports.MIN_WHEEL_DISTANCE = 5;

/**
 * Minimum wheel distance used to fence scrolling
 * with the intent to zoom
 *
 * @api public
 */

exports.MAX_WHEEL_DISTANCE = 500;

/**
 * Minimum possible latitude value
 *
 * @api public
 */

exports.MIN_LAT_VALUE = -85;

/**
 * Maximum possible latitude value
 *
 * @api public
 */

exports.MAX_LAT_VALUE = 85;

/**
 * Minimum possible longitude  value
 *
 * @api public
 */

exports.MIN_LON_VALUE = 0;

/**
 * Maximum possible longitude value
 *
 * @api public
 */

exports.MAX_LON_VALUE = 360;

/**
 * Default frame projection
 *
 * @api public
 */

exports.DEFAULT_PROJECTION = 'equilinear';

/**
 * Cylindrical zoom offset for field of view
 *
 * @api public
 */

exports.CYLINDRICAL_ZOOM = -16;
