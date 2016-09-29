'use strict'

/**
 * Module dependencies.
 */

import { radians } from '../../utils'
import clamp from 'clamp'

/**
 * Applies orientation changes to orbit orbitCamera from
 * orientation input
 *
 * @param {OrbitorbitCameraController} orbitCamera
 * @param {OrientationCommand} orientation
 */

export default (orbitCamera, {orientation}) => {
  // update orientation from orientation input
  orientation && orientation(() => {
    const friction = orbitCamera.friction
    orbitCamera.orientation.x -= friction*radians(orientation.deltaBeta)
    orbitCamera.orientation.y -= friction*radians(orientation.deltaGamma)
    orbitCamera.orientation.z -= friction*radians(orientation.deltaAlpha)
  })
}
