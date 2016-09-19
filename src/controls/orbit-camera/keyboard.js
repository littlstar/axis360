'use strict'

/**
 * Module dependencies.
 */

import { mappings } from '../../commands/keyboard'
import { radians } from '../../utils'
import clamp from 'clamp'

/**
 * Applies orientation changes to orbit camera from
 * keyboard input
 *
 * @param {OrbitCameraController} camera
 * @param {KeyboardCommand} keyboard
 */

export default (camera, keyboard, {dx = 0, dy = 0} = {}) => {
  keyboard && keyboard(() => {
    const friction = camera.friction
    let c = 0.07
    const step = c*friction
    const keys = keyboard.keys

    // @TODO(werle) - should we reset keyboard state ?
    if (mappings.value('control', keys)) {
      return
    }

    if (mappings.value('up', keys)) {
      dx = dx - step
      camera.orientation.x -= step
      mappings.off('down', keys)
    } else if (mappings.value('down', keys)) {
      dx = dx + step
      camera.orientation.x += step
      mappings.off('up', keys)
    }

    if (mappings.value('left', keys)) {
      dy = dy - step
      camera.orientation.y -= step
      mappings.off('right', keys)
    } else if (mappings.value('right', keys)) {
      dy = dy + step
      camera.orientation.y += step
      mappings.off('left', keys)
    }

    c = 0.075
    if (dx) { camera.orientation.x += c*dx}
    if (dy) { camera.orientation.y += c*dy}
  })
}
