'use strict'

/**
 * Module dependencies.
 */

import { Command } from './command'
import { define } from '../utils'
import keycode from 'keycode'
import events from 'dom-events'

/**
 * Keyboard function.
 *
 * @see KeyboardCommand
 */

export default (...args) => new KeyboardCommand(...args)

/**
 * KeyboardCommand class
 *
 * @public
 * @class KeyboardCommand
 * @extends Command
 */

export class KeyboardCommand extends Command {

  /**
   * KeyboardCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?) opts
   */

  constructor(ctx, opts = {}) {
    super((_, block) => {
      if ('function' == typeof block) {
        block(this)
      }
    })

    /**
     * Keyboard state.
     *
     * @private
     * @type {Object}
     */

    const state = {
      keycodes: {},
      keys: {}
    }

    /**
     * Key codes map getter.
     *
     * @getter
     * @type {Object}
     */

    define(this, 'keycodes', { get: () => ({ ...state.keycodes }) })

    /**
     * Key names map getter.
     *
     * @getter
     * @type {Object}
     */

    define(this, 'keys', { get: () => ({ ...state.keys }) })

    /**
     * Resets keyboard state by setting all keycodes
     * and keys to `false'.
     *
     * @public
     * @return {KeyboardCommand}
     */

    this.reset = () => {
      for (let code in state.keycodes) {
        state.keycodes[code] = false
      }

      for (let key in state.keys) {
        state.keys[key] = false
      }
      return this
    }

    // update keydown states
    events.on(document, 'keydown', (e) => {
      if (false == ctx.hasFocus) return
      const code = e.which || e.keyCode || e.charCode
      if (null != code) {
        // set key code
        state.keycodes[code] = true
        // set key name
        state.keys[keycode(code)] = true
      }
    }, false)

    // update keyup states
    events.on(document, 'keyup', (e) => {
      if (false == ctx.hasFocus) return
      const code = e.which || e.keyCode || e.charCode
      if (null != code) {
        // set key code
        state.keycodes[code] = false
        // set key name
        state.keys[keycode(code)] = false
      }
    })
  }
}
