
/**
 * Applies a flat projection to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = function flat (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;

  // bail if camera not initialized
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if geometry is a cylinder because a flat
  // projection is only supported in a spherical geometry
  if ('cylinder' == axis.geometry()) { return; }

  // cancel current projection animations
  this.cancel();

  // apply equilinear projection
  this.apply('equilinear');

  // update camera lens
  camera.setLens(80);

  // update current fov
  axis.fov(camera.fov);

  // position in center (90) around equator (0)
  axis.coords(0, 90);
};
