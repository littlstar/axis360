'use strict'

/**
 * Module dependencies.
 */

import {
  Context, Frame, Photo, Sphere, Triangle
} from '../src'

const ctx = Context()
const frame = Frame(ctx)
const photo = Photo(ctx, '/starwars-4k.jpg')
const sphere = Sphere(ctx, {
  image: photo,
  geometry: {
    radius: 12,
    segments: 64
  }
})
const triangle = Triangle(ctx)

frame((_, {time}) => {
  sphere()
})
