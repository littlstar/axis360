
/**
 * Module dependencies
 */

import three from 'three'
import { DEFAULT_FOV } from './constants'

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

export default function createCamera (scope, force) {
  const height = scope.height()
  const width = scope.width()
  const ratio = width / height
  const camera = scope.camera
  const state = scope.state
  let vector = null
  let target = null
  const fov = state.opts ? state.opts.fov || DEFAULT_FOV : DEFAULT_FOV
  if (scope.camera == null || force) {
    vector = new three.Vector3(0, 0, 0)
    target = camera && camera.target ? camera.target : vector
    scope.camera = new three.PerspectiveCamera(fov, ratio, 0.01, 1000)
    scope.camera.target = target
    scope.camera.rotation.reorder('YXZ')
  }
  return scope.camera
}
