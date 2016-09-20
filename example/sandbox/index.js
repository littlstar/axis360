'use strict'

/**
 * Module dependencies.
 */

import {
  Orientation,
  Keyboard,
  Context,
  Camera,
  Sphere,
  Mouse,
  Touch,
  Photo,
  Video,
  Audio,
  Frame,
  Box,
} from '../../src'

import {
  FirstPersonCameraController,
  AmbisonicAudioController,
  OrbitCameraController,
} from '../../src/controls'

import { Quaternion, Vector, } from '../../src/math'
import { Geometry } from '../../src/geometry'

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
const photo = Photo(ctx, '/starwars-4k.jpg', {preload: false})
const audio = Audio(ctx, '/magnificat.wav')
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
const touch = Touch(ctx)
const mouse = Mouse(ctx)

// shapes
const sphere = Sphere(ctx, {
  map: video
  //map: photo
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
  inputs: {touch, mouse, orientation},
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
  audio,
  video,
  touch,
  photo,
  mouse,
  debug,
  boxes,
  ctx,
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

  // handle sphere map changes
  //toggleSphereMap()

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

/**
 * Toggles sphere map bassed on key input.
 *
 * @key v - Toggle video
 * @key p - Toggle photo
 * @key n - Show nothing
 */

function toggleSphereMap() {
  if (keyboard.keys.v && sphere.map != video) {
    sphere.map = video
  } else if (keyboard.keys.p && sphere.map != photo) {
    sphere.map = photo
  } else if (keyboard.keys.n) {
    sphere.map = null
  }
}
