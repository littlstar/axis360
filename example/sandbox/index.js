'use strict'

/**
 * Module dependencies.
 */

import FirstPersonCameraController from 'axis/controls/first-person-camera'
import AmbisonicAudioController from 'axis/controls/ambisonic-audio'
import OrbitCameraController from 'axis/controls/orbit-camera'
import Orientation from 'axis/inputs/orientation'
import Keyboard from 'axis/inputs/keyboard'
import Context from 'axis/context'
import Sphere from 'axis/meshes/sphere'
import Camera from 'axis/camera'
import Mouse from 'axis/inputs/mouse'
import Video from 'axis/media/video'
import Image from 'axis/media/image'
import Frame from 'axis/frame'
import Box from 'axis/meshes/box'

import { Quaternion, Vector } from 'axis/math'
import { Geometry } from 'axis/geometry/geometry'

import normals from 'angle-normals'
import Bunny from 'bunny'
import debug from 'debug'
import quat from 'gl-quat'
import raf from 'raf'

// axis context
const ctx = Context()

// objects
const camera = Camera(ctx)
const frame = Frame(ctx)
const image = Image(ctx, '/starwars-4k.jpg', {preload: false})
const video = Video(ctx,
                    //'http://360.littlstar.com/production/a0a5746e-87ac-4f20-9724-ecba40429e54/mobile.mp4', {
                    //'http://360.littlstar.com/production/0f87492e-647e-4862-adb2-73e70160f5ea/vr.mp4',
                    'https://videos.littlstar.com/ee10e9b6-559f-4e6c-ae10-40d1f482ebdc/web.mp4',
{
  //preload: false,
  //muted: true
})

// inputs
const orientation = Orientation(ctx)
const keyboard = Keyboard(ctx)
const mouse = Mouse(ctx)

// shapes
const sphere = Sphere(ctx, {
  map: video
  //map: image
})

const boxes = Array(10).fill(0).map((_, i) => Box(ctx, {
  position: new Vector(
    2*i*Math.random(),
    Math.sin(i*Math.random()),
    2*i*Math.random()
  ),

}))

//raf(() => video.play())

// orbit controller
const orbitController = OrbitCameraController(ctx, {
  inputs: {mouse, orientation},
  target: camera,
  invert: false,
  //rotate: false,
})

// first person controller
const fpController = FirstPersonCameraController(ctx, {
  inputs: {keyboard},
  target: camera,
})
const ambisonicAudioController = AmbisonicAudioController(ctx, {
  //target: audio,
  target: video,
  source: camera,
  ambisonic: true,
})

// for fun in the console
Object.assign(window, {
  keyboard,
  sphere,
  camera,
  video,
  image,
  mouse,
  debug,
  boxes,
  ctx,
})

// focus now
ctx.focus()

// orient controllers to "center" of image/video
raf(() => {
  const y = Math.PI / (Math.PI * 0.5)
  orbitController.orientation.y = y
})

// axis animation frame loop
frame(({time}) => {

  // update controller states
  fpController()
  orbitController()
  ambisonicAudioController()

  // draw camera scene
  camera(() => {
    for (let box of boxes) {
      const color = new Vector(
        Math.cos(box.id*time),
        Math.sin(box.id*time),
        Math.cos(box.id*time),
        1
      )

      box({color})
    }
  })
})
