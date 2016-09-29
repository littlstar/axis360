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
import Video from 'axis3d/media/video'
import Frame from 'axis3d/frame'
import raf from 'raf'

// axis context
const ctx = Context()

// objects
const camera = Camera(ctx)
const frame = Frame(ctx)
//const video = Video(ctx, '/paramotor.mp4')
const video = Video(ctx, 'https://videos.littlstar.com/03bc68e1-ffbb-4b12-b13f-cb34351a2b20/web.mp4')
const sphere = Sphere(ctx, {
  envmap: video,
  //invertMapS: true
})

// inputs
const keyboard = Keyboard(ctx)
const mouse = Mouse(ctx)

// orbit controller
const orbitController = OrbitCameraController(ctx, {
  inputs: {mouse, keyboard},
  target: camera,
  invert: true,
})


// orient controllers to "center" of video/video
raf(() => {
  orbitController.orientation.y = 3 * Math.PI / 2

  // play next frame
  video.play()
  video.mute()

  // focus now
  ctx.focus()
})

// expose useful things to window
Object.assign(window, {camera, sphere, video})

// axis animation frame loop
frame(({time}) => {
  // update controller states
  orbitController()

  // draw camera scene
  camera({fov: 66*Math.PI/180}, () => {
    sphere()
  })
})
