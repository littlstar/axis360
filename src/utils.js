'use strict'

const PI = Math.PI

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

export const radians = (n) => n * Math.PI / 180.0
