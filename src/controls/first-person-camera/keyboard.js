'use strict'

/**
 * Module dependencies.
 */

import { mappings } from '../../commands/keyboard'
import { radians } from '../../utils'
import { Vector } from '../../math'
import clamp from 'clamp'
import vec3 from 'gl-vec3'

/**
 * Applies orientation changes to first person camera from
 * keyboard input
 *
 * @param {FirstPersonCameraController} camera
 * @param {KeyboardCommand} keyboard
 */

export default (camera, keyboard) => {
  const { mouse } = camera.inputs
  const position = camera.target.position
  const front = new Vector(0, 0, -1)
  const up = new Vector(0, 1, 0)

  keyboard && keyboard(() => {
    if (false == keyboard.isKeydown) { return }
    if (mouse && mouse.buttons) { return }

    const lastPosition = vec3.copy([], position)
    const friction = camera.friction
    const step = 0.07*friction
    const keys = keyboard.keys

    // @TODO(werle) - should we reset keyboard state ?
    if (mappings.value('control', keys)) {
      return
    }

    if (mappings.value('up', keys)) {
      const scaled = vec3.scale([], front, step)
      vec3.add(position, position, scaled)
      mappings.off('down', keys)
    } else if (mappings.value('down', keys)) {
      const scaled = vec3.scale([], front, step)
      vec3.subtract(position, position, scaled)
      mappings.off('up', keys)
    }

    if (mappings.value('left', keys)) {
      const c = vec3.cross([], front, up)
      const n = vec3.normalize([], c)
      const scaled = vec3.scale([], n, step)
      vec3.subtract(position, position, scaled)
      mappings.off('right', keys)
    } else if (mappings.value('right', keys)) {
      const c = vec3.cross([], front, up)
      const n = vec3.normalize([], c)
      const scaled = vec3.scale([], n, step)
      vec3.add(position, position, scaled)
      mappings.off('left', keys)
    }

    camera.target.lookAt(vec3.add([], position, front))
  })
}
