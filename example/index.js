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
} from '../src'

import {
  FirstPersonCameraController,
  SpatialAudioController,
  OrbitCameraController,
} from '../src/controls'

import { Quaternion, Vector, } from '../src/math'
import { Geometry } from '../src/geometry'

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

const box = Box(ctx)

//raf(() => video.play())

// orbit controller
const orbitController = OrbitCameraController(ctx, {
  inputs: {touch, mouse, orientation},
  target: camera,
  invert: false,
  transform: true,
})

// first person controller
const fpController = FirstPersonCameraController(ctx, {
  inputs: {keyboard},
  target: camera,
})
const spatialAudioController = SpatialAudioController(ctx, {
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
  box,
  ctx,
})

// focus now
ctx.focus()

box.position.x = -5
box.position.y = -5
box.position.z = -5

// orient controllers to "center" of photo/video
raf(() => {
  const y = Math.PI / (Math.PI * 0.5)
  orbitController.orientation.y = y
})

// axis animation frame loop
frame(() => {

  // handle sphere map changes
  //toggleSphereMap()

  // update controller states
  fpController()
  orbitController()
  spatialAudioController()

  // draw camera scene
  camera(() => {
    box()
    sphere()
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
