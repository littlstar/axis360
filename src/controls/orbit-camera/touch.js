'use strict'

/**
 * Module dependencies.
 */

import { radians } from '../../utils'
import clamp from 'clamp'

/**
 * Applies touch changes to orbit orbitCamera from
 * touch input
 *
 * @param {OrbitorbitCameraController} orbitCamera
 * @param {TouchCommand} touch
 */

export default (orbitCamera, {touch}) => {
  // update orientation from touch input
  touch && touch(() => {
    const friction = orbitCamera.friction
    const dx = touch.deltaX
    const dy = touch.deltaY
    const c = 0.075

    if (touch.touches && touch.touches.length) {
      orbitCamera.orientation.x -= c*dy*friction
      orbitCamera.orientation.y -= c*dx*friction
    }
  })
}
