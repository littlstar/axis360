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
const sphere = Sphere(ctx, {image: photo})
const triangle = Triangle(ctx)

console.log(ctx.camera)
frame((_, {time}) => {
  //sphere.rotation.y += 0.0001
  //triangle({
    //color: [
      //Math.cos(time * 0.1),
      //Math.sin(time * 0.0008),
      //Math.cos(time * .03),
      //1
    //]
  //})

  sphere()
})
