'use strict'

/**
 * Module dependencies.
 */

import { radians } from '../../utils'
import { Vector } from '../../math'
import clamp from 'clamp'
import vec3 from 'gl-vec3'

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

/**
 * Applies orientation changes to first person camera from
 * keyboard input
 *
 * @param {FirstPersonCameraController} camera
 * @param {KeyboardCommand} keyboard
 */

export default (camera, keyboard, {dx = 0, dy = 0, dz = 0} = {}) => {
  const position = camera.target.position
  const front = new Vector(0, 0, -1)
  const up = new Vector(0, 1, 0)

  keyboard && keyboard(() => {
    if (!keyboard.keys) { return }
    let c = 0.07
    const lastPosition = vec3.copy([], position)
    const friction = camera.friction
    const step = c*friction
    const keys = keyboard.keys

    const on = (which) => states[which].map((key) => keys[key] = true)
    const off = (which) => states[which].map((key) => keys[key] = false)
    const value = (which) => states[which].some((key) => Boolean(keys[key]))

    // @TODO(werle) - should we reset keyboard state ?
    if (value('control')) { return }

    if (value('up')) {
      const scaled = vec3.scale([], front, dx + step)
      vec3.add(position, position, scaled)
      off('down')
    } else if (value('down')) {
      const scaled = vec3.scale([], front, dx + step)
      vec3.subtract(position, position, scaled)
      off('up')
    }

    if (value('left')) {
      const c = vec3.cross([], front, up)
      const n = vec3.normalize([], c)
      const scaled = vec3.scale([], n, dy - step)
      vec3.add(position, position, scaled)
      off('right')
    } else if (value('right')) {
      const c = vec3.cross([], front, up)
      const n = vec3.normalize([], c)
      const scaled = vec3.scale([], n, dy - step)
      vec3.subtract(position, position, scaled)
      off('left')
    }

    const target = vec3.add([], position, front)
    camera.target.lookAt(vec3.lerp([], lastPosition, target, 0.7))
  })
}
