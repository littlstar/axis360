
'use strict'

/**
 * @license
 * Copyright Little Star Media Inc. and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Utility module
 *
 * @private
 * @module axis/util
 * @type {Object}
 */

/**
 * Module dependencies
 * @private
 */

import { extname } from 'path'
import { parse } from 'url'
import hasWebGL from 'has-webgl'
import { WebGLRenderer, CanvasRenderer, Texture, RGBFormat, LinearFilter } from 'three'

/**
 * Detect if file path is an image
 * based on the file path extension
 *
 * @public
 * @param {String} file
 */

export function isImage (file) {
  const ext = extname(parse(file).pathname).toLowerCase()
  switch (ext) {
    case '.png':
    case '.jpg':
    case '.jpeg':
      return true
    default: return false
  }
}

/**
 * Predicate to determine if WebVR is possible
 * in the current browser.
 *
 * @public
 * @return {Boolean}
 */

export function isVRPossible () {
  const fn = navigator.getVRDevices || navigator.mozGetVRDevices
  return typeof fn === 'function'
}

/**
 * Gets VR enabled devices if available
 *
 * @public
 * @param {Function} fn - Callback function
 * @return {Promise}
 */

export function getVRDevices (fn) {
  if (isVRPossible()) {
    return (
      navigator.getVRDevices || navigator.mozGetVRDevices
    ).call(navigator, fn)
  }
}

/**
 * Normalizes properties in an Event object and
 * sets them on the output object
 *
 * @public
 * @param {Event} e - Event object containing movement properties.
 * @param {Object} o - Output object
 * @return {Object}
 */

export function normalizeMovements (e, o) {
  o.x = (
    e.movementX ||
    e.oMovementX ||
    e.msMovementX ||
    e.mozMovementX ||
    e.webkitMovementX ||
    o.x ||
    0
  )

  o.y = (
    e.movementY ||
    e.oMovementY ||
    e.msMovementY ||
    e.mozMovementY ||
    e.webkitMovementY ||
    o.y ||
    0
  )

  return o
}

/**
 * Creates the correct geometry for
 * the current content in axis
 *
 * @private
 * @param {Axis} axis
 * @param {String} override
 */

export function getCorrectGeometry (axis, override) {
  const dimensions = axis.dimensions()
  const ratio = dimensions.ratio
  let geo = null
  const m = Math.sqrt(ratio)

  if (override) {
    geo = axis.geometry(override)
  } else if (axis.state.options.box) {
    geo = axis.geometry('box')
  } else if (axis.state.projectionrequested === 'flat') {
    geo = axis.geometry('plane')
  } else if (m <= 2) {
    geo = axis.geometry('sphere')
  } else if (!isNaN(ratio)) {
    geo = axis.geometry('cylinder')
  }

  return geo
}

/**
 * Creates a renderer based on options
 *
 * @private
 * @param {Object} opts
 * @return {Object}
 */

export function createRenderer (opts = {}) {
  const useWebgl = !opts.webgl && hasWebGL

  if (typeof opts.renderer === 'object') {
    return opts.renderer
  }

  if (useWebgl) {
    return new WebGLRenderer({
      // antialias: true,
    })
  } else {
    return new CanvasRenderer()
  }
}

/**
 * Creates a texture from a video DOM Element
 *
 * @private
 * @param {Element} video
 * @return {THREE.Texture}
 */

export function createVideoTexture (video) {
  let texture = null
  video.width = video.videoWidth
  video.height = video.videoHeight
  texture = new Texture(video)

  texture.format = RGBFormat
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.image.width = video.videoWidth
  texture.image.height = video.videoHeight

  return texture
}
