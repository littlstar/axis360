'use strict'

/**
 * Module dependencies.
 */

import OrbitCameraController from 'axis3d/controls/orbit-camera'
import Keyboard from 'axis3d/input/keyboard'
import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Sphere from 'axis3d/mesh/sphere'
import Mouse from 'axis3d/input/mouse'
import Image from 'axis3d/media/image'
import Frame from 'axis3d/frame'
import raf from 'raf'

// axis context
const ctx = Context()

// objects
const camera = Camera(ctx)
const frame = Frame(ctx)
const image = Image(ctx, '/govball.jpg', {crossorigin: true})
const sphere = Sphere(ctx, { map: image })

// inputs
const keyboard = Keyboard(ctx)
const mouse = Mouse(ctx, {allowWheel: true})

// orbit controller
const orbitController = OrbitCameraController(ctx, {
  inputs: {mouse, keyboard},
  target: camera,
  invert: true,
})

// orient controllers to "center" of image/video
raf(() => {
  orbitController.orientation.y = Math.PI / 2
  // focus now
  ctx.focus()
})

// axis animation frame loop
frame(({time}) => {
  // update controller states
  orbitController()

  // draw camera scene
  camera(() => { sphere() })
})
