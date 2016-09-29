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
 * Applies orientation changes to orbit fpCamera from
 * mouse input
 *
 * @param {OrbitfpCameraController} fpCamera
 * @param {MouseCommand} mouse
 */

export default (fpCamera, {mouse}, opts = {}) => {
  const friction = fpCamera.friction
  // update orientation from coordinates
  mouse && mouse(() => {
    const c = 0.0025
    const xf = X_AXIS_MOUSE_FRICTION
    const yf = Y_AXIS_MOUSE_FRICTION
    const dy = mouse.deltaY
    const dx = mouse.deltaX

    // update if a singled button is pressed
    if (1 == mouse.buttons && (dy || dx)) {
      fpCamera.orientation.x += (false == opts.invert ? 1 : -1)*xf*dy*friction + (c*Math.random())
      fpCamera.orientation.y += (false == opts.invert ? 1 : -1)*0.8*yf*dx*friction + (c*Math.random())
    }

    // clamp at north/south poles
    fpCamera.orientation.x = clamp(fpCamera.orientation.x, radians(-90), radians(90))
  })

  // update field of view from mouse wheel
  mouse && mouse(() => {
    const c = 0.033
    const dv = c*friction*mouse.wheel.deltaY
    fpCamera.fov += dv
    fpCamera.fov = clamp(fpCamera.fov, radians(0.1) , radians(180))
  })
}
