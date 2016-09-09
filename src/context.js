'use strict'

/**
 * Module dependencies.
 */

import { EventEmitter } from 'events'
import { Camera } from './camera'
import glsl from 'glslify'
import regl from 'regl'

/**
 * Context class defaults.
 *
 * @public
 * @const
 * @type {Object}
 */

export const defaults = {
  clear: {
    color: [0, 0, 0, 1],
    depth: 1,
  },

  camera: {
    center: [0, 0, 0]
  }
}

/**
 * Creates a new Context instance with
 * sane defaults.
 */

export function Context(opts) {
  return new CommandContext(Object.assign(defaults, opts || {}))
}

/**
 * CommandContext class.
 *
 * @public
 */

export class CommandContext extends EventEmitter {

  /**
   * CommandContext class constructor.
   *
   * @param {(Object?} initialState
   * @param {(Object)?} opts
   */

  constructor(initialState = {}, opts = {}) {
    super()
    this.setMaxListeners(Infinity)
    this.regl = regl(opts.regl)
    this.state = initialState
    this.camera = Camera(this, this.state.camera)
  }

  update(scope) {
    let fn = () => void 0

    if ('function' == typeof scope) {
      fn = scope
    } else if (scope && 'object' == typeof scope) {
      Object.assign(this.state, scope)
    }

    this.regl.clear(this.state.clear)
    Object.assign(this.camera, this.state.camera)
    this.camera(fn)
  }
}

