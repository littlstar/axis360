'use strict'

/**
 * Module dependencies.
 */

import { EventEmitter } from 'events'
import { Camera } from './camera'
import glsl from 'glslify'
import regl from 'regl'

/**
 * Current command symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const $current = Symbol('current')

/**
 * Previous command symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const $previous = Symbol('previous')

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
    this.stack = []
    this.camera = Camera(this, this.state.camera)
    this[$current] = null
    this[$previous] = null
  }

  get current() {
    return this[$current]
  }

  get previous() {
    return this[$previous]
  }

  get depth() {
    return this.stack.length - 1
  }

  push(command) {
    if ('function' == typeof command) {
      this.stack.push(command)
      this[$previous] = this[$current]
      this[$current] = command
    }
  }

  pop() {
    let command = this.stack.pop()
    this[$current] = this[$previous]
    this[$previous] = this.stack[this.stack.length - 1]
    return command
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

