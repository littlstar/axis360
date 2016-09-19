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
  Photo,
  Frame,
} from '../../src'

import { OrbitCameraController } from '../../src/controls'
import raf from 'raf'

// axis context
const ctx = Context()

// objects
const camera = Camera(ctx)
const frame = Frame(ctx)
const photo = Photo(ctx, '/govball.jpg', {crossorigin: true})
const sphere = Sphere(ctx, { map: photo })

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

// orient controllers to "center" of photo/video
raf(() => {
  const y = Math.PI / (Math.PI * 0.5)
  orbitController.orientation.y = y
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
