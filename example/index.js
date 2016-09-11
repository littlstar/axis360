'use strict'

/**
 * Module dependencies.
 */

import {
  Triangle,
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

import {
  Quaternion,
  Vector,
} from '../src/math'

import { Geometry, } from '../src/geometry'

import normals from 'angle-normals'
import Bunny from 'bunny'
import quat from 'gl-quat'

const ctx = Context()
const camera = Camera(ctx, {fov: 60 * Math.PI / 180, position: [0, 0, 0]})
const frame = Frame(ctx)
const photo = Photo(ctx, '/starwars-4k.jpg')
const video = Video(ctx, 'http://360.littlstar.com/production/0f87492e-647e-4862-adb2-73e70160f5ea/vr.mp4')
const mouse = Mouse(ctx)
const sphere = Sphere(ctx, {
  radius: 10,
  segments: 150,
  //map: photo
  map: video
})

const RotateCamera = (({
  rotation = new Quaternion(),
  factor = 0.1,
  x = new Quaternion(),
  y = new Quaternion()
} = {}) => function (orientation) {
  quat.setAxisAngle(x, new Vector(1, 0, 0), orientation.x)
  quat.setAxisAngle(y, new Vector(0, 1, 0), orientation.y)
  quat.slerp(rotation, rotation, quat.multiply([], x, y), factor)
  quat.copy(camera.rotation, rotation)
})()

let orientation = new Vector(mouse.deltaX, mouse.deltaY)
let friction = 0.5

window.video = video

frame(() => camera(() => {
  if (mouse.buttons) {
    orientation.x += -0.0033 * mouse.deltaY * friction + (Math.random() * 0.0025)
    orientation.y += -0.0046 * mouse.deltaX * friction + (Math.random() * 0.0025)
  }
  camera.fov += 0.01 * mouse.wheel.dy
  RotateCamera({x: orientation.x, y: orientation.y})
  sphere()
}))
