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

const X_AXIS_MOUSE_FRICTION = 0.0033

/**
 * Local friction applied to rotations around
 * the y axis for mouse inputs.
 */

const Y_AXIS_MOUSE_FRICTION = 0.0046

/**
 * Applies orientation changes to orbit camera from
 * mouse input
 *
 * @param {OrbitCameraController} camera
 * @param {MouseCommand} mouse
 */

export default (camera, mouse) => {
  const friction = camera.friction
  // update orientation from coordinates
  mouse && mouse(() => {
    const c = 0.0025
    const xf = X_AXIS_MOUSE_FRICTION
    const yf = Y_AXIS_MOUSE_FRICTION
    const dy = mouse.deltaY
    const dx = mouse.deltaX

    // update if a singled button is pressed
    if (1 == mouse.buttons && (dy || dx)) {
      camera.orientation.x += -1*xf*dy*friction + (c*Math.random())
      camera.orientation.y += -0.8*yf*dx*friction + (c*Math.random())
    }

    // clamp at north/south poles
    camera.orientation.x = clamp(camera.orientation.x, radians(-90), radians(90))
  })

  // update field of view from mouse wheel
  mouse && mouse(() => {
    const c = 0.033
    const dv = c*friction*mouse.wheel.deltaY
    camera.fov += dv
    camera.fov = clamp(camera.fov, radians(0.1) , radians(180))
  })
}
