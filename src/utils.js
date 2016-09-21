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

export const radians = (n) => n == n ? (n*Math.PI/180.0) : 0

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

/**
 * Predicate function to determine if a given DOM
 * element is in the window's viewport.
 *
 * @public
 * @param {Element} domElement
 * @return {Boolean}
 */

export const isDOMElementInViewport = (domElement) => {
  const {clientWidth, clientHeight} = document.documentElement
  const {top, left, bottom, right} = domElement.getBoundingClientRect()
  const {innerWidth, innerHeight} = window
  const height = innerHeight || clientHeight
  const width = innerWidth || clientWidth
  return bottom > 0 && right > 0 && left < width && top < height
}

/**
 * Returns the screen orientation angle.
 * Borrowed from https://github.com/hawksley/eleVR-Web-Player/blob/master/lib/util.js
 *
 * @return {Number}
 */

export const getScreenOrientation = () => {
  switch (window.screen.orientation || window.screen.mozOrientation) {
    case 'landscape-primary': return 90
    case 'landscape-secondary': return -90
    case 'portrait-secondary': return 180
    case 'portrait-primary': return 0
  }

  return window.orientation || 0
}
