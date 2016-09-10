'use strict'

/**
 * Define property helper.
 *
 * @public
 * @param {Object} a
 * @param {String} b
 * @param {Object} c
 */

export const define = (a, b, c) => Object.defineProperty(a, b, { ...c })
