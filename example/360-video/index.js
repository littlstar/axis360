'use strict'

/**
 * Module dependencies.
 */

import OrbitCameraController from 'axis-3d/controls/orbit-camera'
import Keyboard from 'axis-3d/input/keyboard'
import Context from 'axis-3d/context'
import Camera from 'axis-3d/camera'
import Sphere from 'axis-3d/mesh/sphere'
import Mouse from 'axis-3d/input/mouse'
import Video from 'axis-3d/media/video'
import Frame from 'axis-3d/frame'
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
  invert: true,
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
