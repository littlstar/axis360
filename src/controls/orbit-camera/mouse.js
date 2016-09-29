'use strict'

/**
 * Module dependencies.
 */

import { radians } from '../../utils'
import clamp from 'clamp'

/**
 * Local friction applied to rotations around
 * the x axis for mouse inputs.
 */

const X_AXIS_MOUSE_FRICTION = 0.0025125

/**
 * Local friction applied to rotations around
 * the y axis for mouse inputs.
 */

const Y_AXIS_MOUSE_FRICTION = 0.003366

/**
 * Applies orientation changes to orbit orbitCamera from
 * mouse input
 *
 * @param {OrbitorbitCameraController} orbitCamera
 * @param {MouseCommand} mouse
 */

export default (orbitCamera, {mouse}, opts = {}) => {
  const friction = orbitCamera.friction
  // update orientation from coordinates
  mouse && mouse(() => {
    const c = 0.0025
    const xf = X_AXIS_MOUSE_FRICTION
    const yf = Y_AXIS_MOUSE_FRICTION
    const dy = mouse.deltaY
    const dx = mouse.deltaX

    // update if a singled button is pressed
    if (1 == mouse.buttons && (dy || dx)) {
      orbitCamera.orientation.x += c + (false == opts.invert ? 1 : -1)*xf*dy*friction
      orbitCamera.orientation.y += c + (false == opts.invert ? 1 : -1)*0.8*yf*dx*friction
    }

    // clamp at north/south poles
    orbitCamera.orientation.x = clamp(orbitCamera.orientation.x, radians(-90), radians(90))
  })

  // update field of view from mouse wheel
  mouse && mouse(() => {
    const c = 0.033
    const dv = c*friction*mouse.wheel.deltaY
    if (!orbitCamera.fov) { orbitCamera.fov = 0 }
    orbitCamera.target.fov += dv
    orbitCamera.target.fov = clamp(orbitCamera.target.fov, radians(0.1) , radians(120))
  })
}
