'use strict'

/**
 * Module dependencies.
 */

import {
  Keyboard,
  Context,
  Camera,
  Sphere,
  Mouse,
  Video,
  Frame,
} from '../../src'

import { OrbitCameraController } from '../../src/controls'
import raf from 'raf'

// axis context
const ctx = Context()

// objects
const camera = Camera(ctx)
const frame = Frame(ctx)
const video = Video(ctx, '/paramotor.mp4')
const sphere = Sphere(ctx, { map: video })

// inputs
const keyboard = Keyboard(ctx)
const mouse = Mouse(ctx)

// orbit controller
const orbitController = OrbitCameraController(ctx, {
  inputs: {mouse, keyboard},
  target: camera,
})

// focus now
ctx.focus()

// orient controllers to "center" of video/video
raf(() => {
  const y = Math.PI / (Math.PI * 0.5)
  orbitController.orientation.y = y

  // play next frame
  video.play()
})

// axis animation frame loop
frame(({time}) => {
  // update controller states
  orbitController()

  // draw camera scene
  camera(() => {
    sphere()
  })
})
