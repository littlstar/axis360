'use strict'

/**
 * Module dependencies.
 */

import { radians } from '../../utils'
import clamp from 'clamp'

/**
 * Applies touch changes to orbit camera from
 * touch input
 *
 * @param {OrbitCameraController} camera
 * @param {TouchCommand} touch
 */

export default (camera, touch) => {
  // update orientation from touch input
  touch && touch(() => {
    const friction = camera.friction
    const dx = touch.deltaX
    const dy = touch.deltaY
    const c = 0.075

    if (touch.touches && touch.touches.length) {
      camera.orientation.x -= c*dy*friction
      camera.orientation.y -= c*dx*friction
    }
  })
}
