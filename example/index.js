'use strict'

/**
 * Module dependencies.
 */

import {
  Triangle,
  Context,
  Camera,
  Sphere,
  Photo,
  Frame,
  Box,
} from '../src'

import {
  Quaternion,
  Vector,
} from '../src/math'

import quat from 'gl-quat'

const ctx = Context()
const box = Box(ctx)
const frame = Frame(ctx)
const photo = Photo(ctx, '/starwars-4k.jpg')
const camera = Camera(ctx, {position: [0, 0, -10]})
const sphere = Sphere(ctx, {
  //image: photo,
  geometry: {
    radius: 1,
    segments: 24
  }
})

const orientation = new Vector(0, 0)
const triangle = Triangle(ctx)
const target = new Vector(0, 0, 0)

window.camera = camera

const RotateCamera = (({
  rotation = new Quaternion(),
  factor = 0.07,
  x = new Quaternion(),
  y = new Quaternion()
} = {}) => function (orientation) {
  quat.setAxisAngle(x, new Vector(1, 0, 0), orientation.x)
  quat.setAxisAngle(y, new Vector(0, 1, 0), orientation.y)
  quat.slerp(rotation, rotation, quat.multiply([], x, y), factor)
  quat.copy(camera.rotation, rotation)
})()

box.position.x = -2
frame((_, {time}) => {
  //sphere.position.x = Math.cos(time)
  orientation.x += 0.01
  RotateCamera(orientation)
  camera(() => {
    sphere.wireframe = true
    sphere(() => {
      triangle.position.z = -Math.cos(time)
      triangle()
      triangle.position.z = Math.cos(time)
      triangle.wireframe = true
      triangle()
      box({color: [Math.cos(time), Math.sin(time), Math.cos(time), 1]})
    })
  })
})
