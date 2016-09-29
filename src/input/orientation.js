'use strict'

/**
 * Module dependencies.
 */

import { define, radians, getScreenOrientation } from '../utils'
import { Quaternion } from '../math'
import { Command } from '../command'
import events from 'dom-events'
import quat from 'gl-quat'
import raf from 'raf'

/**
 * Global orientation state object.
 *
 * @private
 */

const globalState = {
  hasDeviceOrientation: false,
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

  if (alpha && beta && gamma) {
    global.hasDeviceOrientation = true
  }

  if (false == global.hasDeviceOrientation) {
    return
  }

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
      Object.assign(state, { ...globalState }, {
        rotation: (() => {
          // borrowed from https://github.com/hawksley/eleVR-Web-Player/blob/master/js/phonevr.js
          const {currentAlpha, currentBeta, currentGamma} = globalState
          const z = radians(currentAlpha)/2.0
          const x = radians(currentBeta)/2.0
          const y = radians(currentGamma)/2.0
          const cX = Math.cos(x)
          const cY = Math.cos(y)
          const cZ = Math.cos(z)
          const sX = Math.sin(x)
          const sY = Math.sin(y)
          const sZ = Math.sin(z)

          const deviceOrientation = new Quaternion(
            (cX * cY * cZ - sX * sY * sZ),
            (sX * cY * cZ - cX * sY * sZ),
            (cX * sY * cZ + sX * cY * sZ),
            (cX * cY * sZ + sX * sY * cZ)
          )

          const screenOrientation = radians(getScreenOrientation())/2.0
          const screenTransform = new Quaternion(
            0,
            0,
            -Math.sin(screenTransform),
            Math.cos(screenTransform)
          )

          const deviceRotation = new Quaternion()
          quat.multiply(deviceRotation, deviceOrientation, screenTransform)

          // @see https://github.com/hawksley/eleVR-Web-Player/blob/master/js/phonevr.js#L53
          const r22 = Math.sqrt(0.5);
          quat.multiply(deviceRotation, quat.fromValues(-r22, 0, 0, r22), deviceRotation);

          return deviceRotation
        })()
      })

      if ('function' == typeof block) {
        block(this)
      }
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
