
/**
 * Module dependencies
 */

var three = require('three')

// default field of view
var DEFAULT_FOV = require('./constants').DEFAULT_FOV

/**
 * Creates an instance of THREE.PerspectiveCamera
 * and assigns it to a scope object if not null.
 *
 * @public
 * @name createCamera
 * @param {Object} scope - Scope object to assign camera to.
 * @param {Boolean} force - Force creation and assignment.
 * @return {THREE.PerspectiveCamera}
 */

module.exports = function createCamera (scope, force) {
  var height = scope.height()
  var width = scope.width()
  var ratio = width / height
  var camera = scope.camera
  var state = scope.state
  var vector = null
  var target = null
  var fov = state.opts ? state.opts.fov || DEFAULT_FOV : DEFAULT_FOV
  if (scope.camera == null || force) {
    vector = new three.Vector3(0, 0, 0)
    target = camera && camera.target ? camera.target : vector
    scope.camera = new three.PerspectiveCamera(fov, ratio, 0.01, 1000)
    scope.camera.target = target
    scope.camera.rotation.reorder('YXZ')
  }
  return scope.camera
}
