'use strict'

/**
 * Module dependencies.
 */

import { Command } from '../command'
import { define } from '../utils'
import events from 'dom-events'
import raf from 'raf'

/**
 * Global orientation state object.
 *
 * @private
 */

const globalState = {
  absolute: null,

  currentAlpha: 0, // z
  currentBeta: 0, // x
  currentGamma: 0, // y

  deltaAlpha: 0,
  deltaBeta: 0,
  deltaGamma: 0,

  prevAlpha: 0,
  prevBeta: 0,
  prevGamma: 0,
}

// update global device orientation state
events.on(window, 'deviceorientation', (e) => {
  // ZXY
  const { alpha, beta, gamma, absolute } = e

  Object.assign(globalState, {
    absolute,

    currentAlpha: alpha,
    currentBeta: beta,
    currentGamma: gamma,

    deltaAlpha: alpha - globalState.currentAlpha,
    deltaBeta: beta - globalState.currentBeta,
    deltaGamma: gamma - globalState.currentGamma,

    prevAlpha: globalState.currentAlpha,
    prevBeta: globalState.currentBeta,
    prevGamma: globalState.currentGamma,
  })

  raf(() => Object.assign(globalState, {
    deltaAlpha: 0,
    deltaBeta: 0,
    deltaGamma: 0,
  }))
})

/**
 * Orientation function.
 *
 * @see OrientationCommand
 */

export default (...args) => new OrientationCommand(...args)

/**
 * OrientationCommand class
 *
 * @public
 * @class OrientationCommand
 * @extends Command
 */

export class OrientationCommand extends Command {

  /**
   * OrientationCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?) opts
   */

  constructor(ctx, opts = {}) {

    /**
     * Orientation state.
     *
     * @private
     * @type {Object}
     */

    const state = {
      absolute: null,

      currentAlpha: 0, // z
      currentBeta: 0, // x
      currentGamma: 0, // y

      deltaAlpha: 0,
      deltaBeta: 0,
      deltaGamma: 0,

      prevAlpha: 0,
      prevBeta: 0,
      prevGamma: 0,
    }

    super((_, block) => {
      Object.assign(state, globalState)
      if ('function' == typeof block) { block(this) }
    })

    for (let prop in state) {
      define(this, prop, { get: () => state[prop] })
    }

    /**
     * Resets current state
     *
     * @public
     * @return {OrientationCommand}
     */

    this.reset = () => {
      for (let prop in state) {
        if ('number' == typeof state[prop]) {
          state[prop] = 0
        } else {
          state[prop] = null
        }
      }
      return this
    }
  }
}
