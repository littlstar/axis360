'use strict'

/**
 * Module dependencies.
 */

import { Quaternion, Vector } from './math'
import getBoundingBox from 'bound-points'
import injectDefines from 'glsl-inject-defines'
import { Command } from './command'
import { define } from './utils'
import glslify from 'glslify'
import mat4 from 'gl-mat4'
import vec4 from 'gl-vec4'
import vec3 from 'gl-vec3'
import vec2 from 'gl-vec2'
import quat from 'gl-quat'

/**
 * Default vertex shader for a mesh.
 *
 * @public
 * @const
 * @type {String}
 */

export const DEFAULT_VERTEX_SHADER = glslify('./glsl/mesh/vert.glsl')

/**
 * Default fragment shader for a mesh.
 *
 * @public
 * @const
 * @type {String}
 */

export const DEFAULT_FRAGMENT_SHADER = glslify('./glsl/mesh/frag.glsl')

/**
 * Current mesh command counter.
 *
 * @type {Number}
 */

let MESH_COMMAND_COUNTER = 0

/**
 * MeshCommand constructor.
 * @see MeshCommand
 */

export default (...args) => new MeshCommand(...args)

/**
 * MeshCommand class.
 *
 * @public
 * @class MeshCommand
 * @extends Command
 */

export class MeshCommand extends Command {

  /**
   * Returns the next mesh D
   *
   * @public
   * @static
   * @return {Number}
   */

  static id() {
    return MESH_COMMAND_COUNTER ++
  }

  /**
   * MeshCommand class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}) {
    const reglOptions = { ...opts.regl }
    const defaults = { ...opts.defaults }
    const model = mat4.identity([])

    let boundingBox = null
    let blending = null
    let render = null
    let envmap = null
    let draw = opts.draw || null
    let map = opts.map || null

    /**
     * Updates state and internal matrices.
     *
     * @private
     * @param {(Object)?} state
     */

    const update = (state) => {
      if ('scale' in state) {
        vec3.copy(this.scale, state.scale)
      }

      if ('position' in state) {
        vec3.copy(this.position, state.position)
      }

      if ('rotation' in state) {
        quat.copy(this.rotation, state.rotation)
      }

      if ('color' in state) {
        vec4.copy(this.color, state.color)
      }

      if ('wireframe' in state) {
        this.wireframe = Boolean(state.wireframe)
      }

      if ('map' in state && map != state.map) {
        map = state.map
        configure()
      } else if ('envmap' in state && envmap != state.envmap) {
        this.envmap = state.map
      }

      // update uniform model matrix
      mat4.identity(model)
      mat4.multiply(model, model, mat4.fromQuat([], this.rotation))
      mat4.translate(model, model, this.position)
      mat4.scale(model, model, this.scale)

      // apply and set contextual transform
      if (ctx.previous && ctx.previous.id != this.id) {
        mat4.copy(this.transform, mat4.multiply([], ctx.previous.transform, model))
      } else {
        mat4.copy(this.transform, model)
      }

      // copy transform to uniform model matrix
      mat4.copy(model, this.transform)
    }

    /**
     * Configures mesh state. This function
     * may create a new render function from regl
     *
     * @private
     */

    const configure = () => {
      // reset draw function
      if (!opts.draw) { draw = null }
      // use regl draw command if draw() function
      // was not provided
      if (!draw) {
        const geometry = opts.geometry || null
        const elements = geometry ? geometry.primitive.cells : undefined
        const attributes = {...opts.attributes}
        const shaderDefines = {}

        const uniforms = {
          ...opts.uniforms,
          color: () => this.color.elements,
          model: () => model
        }

        defaults.count = opts.count || undefined
        defaults.elements = opts.elements || elements || undefined
        defaults.primitive = opts.primitive || 'triangles'

        if (geometry) {
          if (this) {
            this.geometry = geometry
          }

          if (geometry.primitive.positions) {
            shaderDefines.HAS_POSITIONS = ''
            attributes.position = geometry.primitive.positions
          }

          if (geometry.primitive.normals) {
            shaderDefines.HAS_NORMALS = ''
            attributes.normal = geometry.primitive.normals
          }

          if (geometry.primitive.uvs) {
            shaderDefines.HAS_UVS = ''
            attributes.uv = geometry.primitive.uvs
          }
        }

        if (map && map.texture) {
          uniforms.map = () => {
            if (map && map.texture) {
              if ('function' == typeof map) { map() }
              return map.texture
            }

            return null
          }
        } else if (map) {
          map.once('load', () => configure())
        }

        if (!opts.primitive && opts.wireframe) {
          opts.primitive = 'lines'
        }

        Object.assign(reglOptions, {
          uniforms, attributes,
          vert: undefined !== opts.vert ? opts.vert : DEFAULT_VERTEX_SHADER,
          frag: undefined !== opts.frag ? opts.frag : DEFAULT_FRAGMENT_SHADER,
          count: null == opts.count ? undefined : ctx.regl.prop('count'),
          blend: blending ? blending : false,
          elements: null == elements ? undefined : ctx.regl.prop('elements'),
          primitive: () => {
            if (this.wireframe) { return 'line loop' }
            else { return defaults.primitive }
          }
        })

        if (uniforms.map) {
          shaderDefines.HAS_MAP = ''
        }

        reglOptions.frag = injectDefines(reglOptions.frag, shaderDefines)
        reglOptions.vert = injectDefines(reglOptions.vert, shaderDefines)

        for (let key in reglOptions) {
          if (undefined === reglOptions[key]) {
            delete reglOptions[key]
          }
        }

        draw = ctx.regl(reglOptions)
      }

      // configure render command
      render = opts.render || ((_, state, next = () => void 0) => {
        let args = null

        ctx.push(this)

        if ('function' == typeof state) {
          args = [{...defaults}]
          next = state
        } else if (Array.isArray(state)) {
          args = [state.map((o) => Object.assign({...defaults}, o))]
        } else {
          args = [{...defaults, ...state}]
        }

        if (opts.before) {
          opts.before(...args)
        }

        update(...args)
        draw(...args)
        next(...args)

        if (opts.after) {
          opts.after(...args)
        }

        ctx.pop()
      })
    }

    // calls current target  render function
    super((...args) => render(...args))

    // initial configuration
    configure()

    /**
     * Mesh ID.
     *
     * @type {Number}
     */

    this.id = opts.id || MeshCommand.id()

    /**
     * Mesh type name.
     *
     * @type {String}
     */

    this.type = opts.type || 'object'

    /**
     * Mesh scale vector.
     *
     * @type {Vector}
     */

    this.scale = opts.scale ?
      new Vector(...opts.scale) :
      new Vector(1, 1, 1)

    /**
     * Mesh scale vector.
     *
     * @type {Vector}
     */

    this.position = opts.position ?
      new Vector(...opts.position) :
      new Vector(0, 0, 0)

    /**
     * Mesh rotation quaternion
     *
     * @type {Quaternion}
     */

    this.rotation = opts.rotation ?
      new Quaternion(...opts.rotation) :
      new Quaternion()

    /**
     * Mesh transform matrix
     *
     * @type {Array}
     */

    this.transform = mat4.identity([])

    /**
     * Boolean to indicate if mesh should be drawn
     * with a line primitive.
     *
     * @type {Boolean}
     */

    this.wireframe = false

    /**
     * Mesh color property.
     *
     * @type {Vector}
     */

    this.color = opts.color ?
      new Vector(...opts.color) :
      new Vector(197/255, 148/255, 149/255, 1.0)

    /**
     * Computed bounding
     *
     * @type {Array<Vector>}
     */

    define(this, 'boundingBox', {
      get() {
        if (null == this.geometry) {
          return null
        } else if (boundingBox) {
          return boundingBox
        }

        boundingBox =
          getBoundingBox(this.geometry.positions).map((p) => new Vector(...p))
        return boundingBox
      }
    })

    /**
     * Computed size.
     *
     * @type {Vector}
     */

    define(this, 'size', {
      get() {
        // trigger compute with getter
        if (null == this.boundingBox) {
          return null
        }

        const min = boundingBox[0]
        const max = boundingBox[1]
        const dimension = boundingBox[0].length

        switch (dimension) {
          case 3: return vec3.subtract(new Vector(0, 0, 0), max, min)
          case 2: return vec2.subtract(new Vector(0, 0, 0), max, min)
          default: return null
        }
      }
    })

    /**
     * Mesh texture map if given.
     *
     * @type {Media}
     */

    define(this, 'map', {
      get: () => map,
      set: (value) => {
        if (value) {
          if (value.texture && (value != map || value.texture != map)) {
            map = value
            configure()
          } else if (value && value != map) {
            map = value
            configure()
          }
        } else if (null == value && null != map) {
          map = null
          configure()
        }
      }
    })

    /**
     * Mesh texture environment map if given.
     *
     * @type {Media}
     */

    define(this, 'envmap', {
      get: () => envmap,
      set: (value) => {
        if (null == value) {
          envmap = null
        } else if (value != envmap) {
          envmap = value
          this.map = value
          this.scale.x = -1

          // @TODO(werle) flipY should be exposed from texture constructor
          if (envmap.texture && envmap.texture && envmap.texture._texture.flipY) {
            this.scale.y = -1
          }
        }
      }
    })

    this.envmap = opts.envmap

    /**
     * Toggles blending.
     *
     * @type {Boolean}
     */

    define(this, 'blending', {
      get: () => blending,
      set: (value) => {
        blending = value
        configure()
      }
    })
  }
}
