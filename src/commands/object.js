'use strict'

/**
 * Module dependencies.
 */

import injectDefines from 'glsl-inject-defines'
import { Quaternion, Vector } from '../math'
import { Command } from './command'
import { define } from '../utils'
import glsl from 'glslify'
import mat4 from 'gl-mat4'
import vec4 from 'gl-vec4'
import vec3 from 'gl-vec3'
import quat from 'gl-quat'

const vert = glsl(__dirname + '/../glsl/object/vert.glsl')
const frag = glsl(__dirname + '/../glsl/object/frag.glsl')

/**
 * Current object command counter.
 *
 * @type {Number}
 */

let OBJECT_COMMAND_COUNTER = 0

/**
 * ObjectCommand constructor.
 * @see ObjectCommand
 */

export default (...args) => new ObjectCommand(...args)

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

  constructor(ctx, opts = {}) {
    let draw = opts.draw
    const model = mat4.identity([])
    const defaults = {
      ...opts.defaults,
      color: [197/255, 148/255, 149/255, 1.0],
    }

    // use regl draw command if draw() function
    // was not provided
    if (!draw) {
      const geometry = opts.geometry || null
      const elements = geometry ? geometry.primitive.cells : undefined
      const attributes = {...opts.attributes}

      const uniforms = {
        ...opts.uniforms,
        color: ctx.regl.prop('color'),
        model: () => model
      }

      defaults.count = opts.count || undefined
      defaults.elements = opts.elements || elements || undefined
      defaults.primitive = opts.primitive || 'triangles'

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

      if (!opts.primitive && opts.wireframe) {
        opts.primitive = 'lines'
      }

      const reglOptions = {
        ...opts.regl,
        uniforms,
        attributes,
        vert: opts.vert || vert,
        frag: opts.frag || frag,
        count: null == opts.count ? undefined : ctx.regl.prop('count'),
        elements: null == elements ? undefined : ctx.regl.prop('elements'),
        primitive: () => {
          if (this.wireframe) { return 'line loop' }
          else { return defaults.primitive }
        }
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

    // update state and internal matrices
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
        mat4.copy(this.transform, mat4.multiply([], ctx.previous.transform, model))
      } else {
        mat4.copy(this.transform, model)
      }

      mat4.copy(model, this.transform)
      return true
    }

    // render command state
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

    /**
     * Object ID.
     *
     * @type {Number}
     */

    this.id = opts.id || ObjectCommand.id()

    /**
     * Object type name.
     *
     * @type {String}
     */

    this.type = opts.type || 'object'

    /**
     * Object scale vector.
     *
     * @type {Vector}
     */

    this.scale = opts.scale ? new Vector(...opts.scale) : new Vector(1, 1, 1)

    /**
     * Object scale vector.
     *
     * @type {Vector}
     */

    this.position = opts.position ? new Vector(...opts.position) : new Vector(0, 0, 0)

    /**
     * Object rotation quaternion
     *
     * @type {Quaternion}
     */

    this.rotation = opts.rotation ? new Quaternion(...opts.rotation) : new Quaternion()

    /**
     * Object transform matrix
     *
     * @type {Array}
     */

    this.transform = mat4.identity([])

    /**
     */

    this.wireframe = false
  }
}
