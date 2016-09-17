'use strict'

/**
 * Module dependencies.
 */

import { radians } from '../../utils'
import clamp from 'clamp'

/**
 * Applies orientation changes to orbit camera from
 * orientation input
 *
 * @param {OrbitCameraController} camera
 * @param {OrientationCommand} orientation
 */

export default (camera, orientation) => {
  // update orientation from orientation input
  orientation && orientation(() => {
    const friction = camera.friction
    camera.orientation.x -= friction*radians(orientation.deltaBeta)
    camera.orientation.y -= friction*radians(orientation.deltaGamma)
    camera.orientation.z -= friction*radians(orientation.deltaAlpha)
  })
}
