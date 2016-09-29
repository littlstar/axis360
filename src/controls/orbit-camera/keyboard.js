'use strict'

/**
 * Module dependencies.
 */

import { radians } from '../../utils'
import clamp from 'clamp'

/**
 * Applies orientation changes to orbit orbitCamera from
 * keyboard input
 *
 * @param {OrbitorbitCameraController} orbitCamera
 * @param {KeyboardCommand} keyboard
 */

export default (orbitCamera, {keyboard}, opts = {}, {dx = 0, dy = 0} = {}) => {
  keyboard && keyboard(() => {
    const friction = orbitCamera.friction
    let c = 0.07
    const step = c*friction
    const keys = keyboard.keys

    // @TODO(werle) - should we reset keyboard state ?
    if (keyboard.aliasMappings.value('control', keys)) {
      return
    }

    if (keyboard.aliasMappings.value('up', keys)) {
      dx = dx + step
      orbitCamera.orientation.x -= step
      keyboard.aliasMappings.off('down', keys)
    } else if (keyboard.aliasMappings.value('down', keys)) {
      dx = dx - step
      orbitCamera.orientation.x += step
      keyboard.aliasMappings.off('up', keys)
    }

    if (keyboard.aliasMappings.value('left', keys)) {
      dy = dy + step
      orbitCamera.orientation.y -= step
      keyboard.aliasMappings.off('right', keys)
    } else if (keyboard.aliasMappings.value('right', keys)) {
      dy = dy - step
      orbitCamera.orientation.y += step
      keyboard.aliasMappings.off('left', keys)
    }

    c = 0.075
    if (dx) { orbitCamera.orientation.x += c*dx}
    if (dy) { orbitCamera.orientation.y += c*dy}

  })
}
