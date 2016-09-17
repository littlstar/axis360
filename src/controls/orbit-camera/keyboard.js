'use strict'

/**
 * Module dependencies.
 */

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
    const on = (which) => states[which].map((key) => keys[key] = true)
    const off = (which) => states[which].map((key) => keys[key] = false)
    const value = (which) => states[which].some((key) => Boolean(keys[key]))
    const states = {
      up: ['up', 'w', 'k'],
      down: ['down', 's', 'j'],
      left: ['left', 'a', 'h'],
      right: ['right', 'd', 'l'],
      control: [
        'control',
        'right command', 'left command',
        'right control', 'left control',
        'super', 'ctrl', 'alt', 'fn',
      ]
    }

    // @TODO(werle) - should we reset keyboard state ?
    if (value('control')) { return }

    if (value('up')) {
      dx = dx - step
      camera.orientation.x -= step
      off('down')
    } else if (value('down')) {
      dx = dx + step
      camera.orientation.x += step
      off('up')
    }

    if (value('left')) {
      dy = dy - step
      camera.orientation.y -= step
      off('right')
    } else if (value('right')) {
      dy = dy + step
      camera.orientation.y += step
      off('left')
    }

    c = 0.075
    if (dx) { camera.orientation.x += c*dx}
    if (dy) { camera.orientation.y += c*dy}
  })
}
