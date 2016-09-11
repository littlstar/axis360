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
  Video,
  Frame,
  Object as AxisObject,
  Box,
} from '../src'

import { OrbitCameraController } from '../src/controls'
import { Quaternion, Vector, } from '../src/math'
import { Geometry } from '../src/geometry'

import normals from 'angle-normals'
import Bunny from 'bunny'
import quat from 'gl-quat'
import raf from 'raf'

const ctx = Context()
const camera = Camera(ctx)
const frame = Frame(ctx)
const photo = Photo(ctx, '/starwars-4k.jpg')
const video = Video(ctx, 'http://360.littlstar.com/production/0f87492e-647e-4862-adb2-73e70160f5ea/vr.mp4')
const keyboard = Keyboard(ctx)
const mouse = Mouse(ctx)
const sphere = Sphere(ctx, {map: video})

const controller = OrbitCameraController(ctx, {
  target: camera,
  inputs: {mouse, keyboard},
})

window.camera = camera
window.video = video

raf(() => controller.orientation.y = Math.PI / (Math.PI * 0.5))
frame(() => {
  camera(() => {
    controller(() => {
      sphere()
    })
  })
})
