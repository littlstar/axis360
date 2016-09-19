'use strict'

/**
 * Module dependencies.
 */

import { version } from './package'
import createDebug from 'debug'

/**
 * Define property helper.
 *
 * @public
 * @param {Object} a
 * @param {String} b
 * @param {Object} c
 */

export const define = (a, b, c) => Object.defineProperty(a, b, { ...c })

/**
 * Converts input degrees to radians
 *
 * @public
 * @param {Number} n
 * @return {Number}
 */

export const radians = (n) => n == n ? (n * Math.PI / 180.0) : 0

/**
 * Utility debug output
 *
 * @public
 * @param {String} fmt
 * @param {...Mixed} args
 */

export const debug = createDebug(`[axis@${version}]`)

/**
 * Simple linear inerpolation function.
 *
 * @public
 * @param {Number} v0
 * @param {Number} v1
 * @param {Number} t
 * @return {Number}
 */

export const lerp = (v0, v1, t) => v0*(1 - t) + v1*t
