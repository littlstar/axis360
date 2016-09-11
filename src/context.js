'use strict'

/**
 * Module dependencies.
 */

import { EventEmitter } from 'events'
import glsl from 'glslify'
import regl from 'regl'

/**
 * `current' command symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const $current = Symbol('current')

/**
 * `previous' command symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const $previous = Symbol('previous')

/**
 * `element' symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const $domElement = Symbol('element')

/**
 * gl context symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const $gl = Symbol('gl')

/**
 * `hasFocus' boolean symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const $hasFocus = Symbol('hasFocus')

/**
 * Context class defaults.
 *
 * @public
 * @const
 * @type {Object}
 */

export const defaults = {
  clear: {
    color: [17/255, 17/255, 17/255, 1],
    depth: 1,
  },
}

/**
 * Creates a new Context instance with
 * sane defaults.
 *
 * @param {Object} opts
 */

export function Context(opts) {
  return new CommandContext(Object.assign(defaults, opts || {}))
}

/**
 * CommandContext class.
 *
 * @public
 * @class CommandContext
 * @extends EventEmitter
 */

export class CommandContext extends EventEmitter {

  /**
   * CommandContext class constructor.
   *
   * @param {(Object)?} initialState
   * @param {(Object)?} opts
   */

  constructor(initialState = {}, opts = {}) {
    super()
    const reglOptions = { ...opts.regl }
    if (opts.element && 'CANVAS' == opts.element.nodeName) {
      reglOptions.canvas = opts.element
    } else if (opts.element && opts.element.nodeName) {
      reglOptions.container = opts.element
    }

    this.setMaxListeners(Infinity)
    this.regl = regl(opts.regl)
    this.state = initialState
    this.stack = []

    this[$gl] = this.regl._gl
    this[$current] = null
    this[$previous] = null
    this[$hasFocus] = false
    this[$domElement] = this.regl._gl.canvas
  }

  /**
   * Current command getter.
   *
   * @getter
   * @type {Command}
   */

  get current() {
    return this[$current]
  }

  /**
   * Previous command getter.
   *
   * @getter
   * @type {Command}
   */

  get previous() {
    return this[$previous]
  }

  /**
   * Current stack depth.
   *
   * @type {Number}
   */

  get depth() {
    return this.stack.length - 1
  }

  /**
   * DOM element associated with this
   * command context.
   *
   * @getter
   * @type {Element}
   */

  get domElement() {
    return this[$domElement]
  }

  /**
   * Boolean indicating if context has
   * focus.
   *
   * @getter
   * @type {Boolean}
   */

  get hasFocus() {
    return this[$hasFocus]
  }

  /**
   * Focuses context.
   *
   * @return {CommandContext}
   */

  focus() {
    this[$hasFocus] = true
    return this
  }

  /**
   * Blurs context.
   *
   * @return {CommandContext}
   */

  blur() {
    this[$hasFocus] = false
  }

  /**
   * Pushes command to context stack.
   *
   * @param {Command} command
   * @return {CommandContext}
   */

  push(command) {
    if ('function' == typeof command) {
      this.stack.push(command)
      this[$previous] = this[$current]
      this[$current] = command
    }
    return this
  }

  /**
   * Pops tail of context command stack.
   *
   * @return {CommandContext}
   */

  pop() {
    let command = this.stack.pop()
    this[$current] = this[$previous]
    this[$previous] = this.stack[this.stack.length - 1]
    return command
  }

  /**
   * Updates command context state and
   * class clear on regl instance.
   *
   * @param {Function|Block}
   * @return {CommandContext}
   */

  update(block) {
    let fn = () => void 0

    if ('function' == typeof block) {
      fn = block
    } else if (block && 'object' == typeof block) {
      Object.assign(this.state, block)
    }

    this.regl.clear(this.state.clear)
    fn()
    return this
  }
}

