'use strict'

/**
 * Module dependencies.
 */

import injectDefines from 'glsl-inject-defines'
import { Command } from './command'
import glsl from 'glslify'
import mat4 from 'gl-mat4'
import vec4 from 'gl-vec4'
import vec3 from 'gl-vec3'
import quat from 'gl-quat'

/**
 * Define property helper.
 *
 * @param {Object} a
 * @param {String} b
 * @param {Object} c
 */

const define = (a, b, c) => Object.defineProperty(a, b, { ...c })

const vert = `
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 vposition;
varying vec3 vnormal;
varying vec2 vuv;

void main() {
  gl_Position = projection * view * model * vec4(position, 1.0);
  vposition = position;
  vnormal = normal;
  vuv = uv;
}
`

const frag = `
precision mediump float;
uniform vec4 color;
varying vec2 vuv;

#ifdef HAS_IMAGE
uniform sampler2D image;
#endif

void main() {
#ifdef HAS_IMAGE
  gl_FragColor = vec4(texture2D(image, vuv).rgb, 1.0);
#else
  gl_FragColor = color;
#endif
}
`

class VectorWrap {
  constructor(...input) {
    this.elements = new Float64Array([...input])
    define(this, '0', {
      get: () => this.elements[0],
      set: (v) => this.elements[0] = v,
    })

    define(this, '1', {
      get: () => this.elements[1],
      set: (v) => this.elements[1] = v,
    })

    define(this, '2', {
      get: () => this.elements[2],
      set: (v) => this.elements[2] = v,
    })

    define(this, '3', {
      get: () => this.elements[3],
      set: (v) => this.elements[3] = v,
    })
  }

  get x() { return this.elements[0] }
  set x(x) { this.elements[0] = x }

  get y() { return this.elements[1] }
  set y(y) { this.elements[1] = y }

  get z() { return this.elements[2] }
  set z(z) { this.elements[2] = z }

  get w() { return this[3] }
  set w(w) { this.elements[3] = w }

  toArray() {
    return [...this.elements]
  }
}

/**
 * Current object command counter.
 *
 * @type {Number}
 */

let OBJECT_COMMAND_COUNTER = 0

/**
 * ObjectCommand class.
 *
 * @public
 * @class ObjectCommand
 * @extends Command
 */

export class ObjectCommand extends Command {

  /**
   * Returns the next object ID
   *
   * @public
   * @static
   * @return {Number}
   */

  static id() {
    return OBJECT_COMMAND_COUNTER ++
  }

  /**
   * ObjectCommand class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts) {
    const model = mat4.identity([])
    const defaults = {...opts.defaults}
    let draw = opts.draw

    if (!draw) {
      const geometry = opts.geometry || null
      const elements = geometry ? geometry.primitive.cells : undefined
      const uniforms = {...opts.uniforms, model: () => model }
      const attributes = {...opts.attributes}

      if (geometry) {
        if (geometry.primitive.positions) {
          attributes.position = geometry.primitive.positions
        }

        if (geometry.primitive.normals) {
          attributes.normal = geometry.primitive.normals
        }

        if (geometry.primitive.uvs) {
          attributes.uv = geometry.primitive.uvs
        }
      }

      if (opts.image && opts.image.texture) {
        uniforms.image = opts.image.texture
      } else if (opts.image) {
        uniforms.image = opts.image
      }

      const reglOptions = {
        ...opts.regl,
        uniforms,
        attributes,
        vert: opts.vert || vert,
        frag: opts.frag || frag,
        count: opts.count || undefined,
        elements: opts.elements || elements || undefined,
      }

      if (uniforms.image) {
        reglOptions.frag = injectDefines(reglOptions.frag, {
          HAS_IMAGE: ''
        })
      }

      for (let key in reglOptions) {
        if (undefined == reglOptions[key]) {
          delete reglOptions[key]
        }
      }

      draw = ctx.regl(reglOptions)
    }

    const update = (state) => {
      if ('scale' in state) {
        Object.assign(this.scale, state.scale)
      }

      if ('position' in state) {
        Object.assign(this.position, state.position)
      }

      if ('rotation' in state) {
        Object.assign(this.rotation, state.rotation)
      }

      mat4.identity(model)
      mat4.translate(model, model, this.position)
      mat4.scale(model, model, this.scale)
      mat4.multiply(model, model, mat4.fromQuat([], this.rotation))

      if (ctx.previous && ctx.previous.id != this.id) {
        console.log(ctx.previous.type, this.type)
        mat4.copy(this.transform, mat4.multiply([], ctx.previous.transform, model))
      } else {
        mat4.copy(this.transform, model)
      }

      mat4.copy(model, this.transform)
      return true
    }

    const render = opts.render || ((_, state, extra) => {
      let args = null
      let next = () => void 0

      ctx.push(this)

      if ('function' == typeof state) {
        args = [{...defaults}]
        next = state
      } else {
        args = [{...defaults, ...state}]
      }

      if (opts.before) {
        opts.before(...args)
      }

      if (update(...args)) {
        draw(...args)
        next(...args)
      }

      if (opts.after) {
        opts.after(...args)
      }

      ctx.pop()
    })

    super(render)

    this.id = opts.id || ObjectCommand.id()
    this.type = opts.type || 'object'
    this.scale = new VectorWrap(1, 1, 1)
    this.position = new VectorWrap(0, 0, 0)
    this.rotation = new VectorWrap(0, 0, 0, 1)
    this.transform = mat4.identity([])
  }
}
