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
  Photo,
  Video,
  Frame,
} from '../src'

import { OrbitCameraController } from '../src/controls'
import { Quaternion, Vector, } from '../src/math'
import { Geometry } from '../src/geometry'

import normals from 'angle-normals'
import Bunny from 'bunny'
import quat from 'gl-quat'
import raf from 'raf'

// axis context
const ctx = Context()

// objects
const camera = Camera(ctx)
const frame = Frame(ctx)
const photo = Photo(ctx, '/starwars-4k.jpg')
const video = Video(ctx, 'http://360.littlstar.com/production/0f87492e-647e-4862-adb2-73e70160f5ea/vr.mp4')

// inputs
const orientation = Orientation(ctx)
const keyboard = Keyboard(ctx)
const mouse = Mouse(ctx)

// shapes
const sphere = Sphere(ctx)

// controller
const controller = OrbitCameraController(ctx, {
  target: camera,
  inputs: {mouse, keyboard},
})

// for fun in the console
window.keyboard = keyboard
window.sphere = sphere
window.camera = camera
window.video = video
window.photo = photo
window.mouse = mouse

// focus now
ctx.focus()

// orient controller to "center" of photo/video
raf(() => controller.orientation.y = Math.PI / (Math.PI * 0.5))

// axis animation frame loop
frame(() => {

  // handle sphere map changes
  toggleSphereMap()

  // update controller state
  controller()

  // draw camera scene
  camera(() => {
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
