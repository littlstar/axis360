'use strict'

/**
 * Module dependencies.
 */

import { debug, define } from '../utils'
import { MediaCommand } from '../media'
import isPowerOfTwo from 'is-power-of-two'
import raf from 'raf'

/**
 * ImageCommand constructor.
 * @see ImageCommand
 */

export default (...args) => new ImageCommand(...args)

/**
 * ImageCommand class.
 *
 * @public
 * @class ImageCommand
 * @extends MediaCommand
 */

export class ImageCommand extends MediaCommand {

  /**
   * ImageCommand class constructor.
   *
   * @constructor
   * @param {Context} ctx
   * @param {String} src
   * @param {(Object)?} initialState
   */

  constructor(ctx, src, initialState = {}) {
    let source = null

    const manifest = {
      image: {
        stream: true,
        type: 'image',
        src: 'string' == typeof src ? src : undefined
      },

      regl: {
        blend: {
          enable: true,
          func: {src: 'src alpha', dst: 'one minus src alpha'},
        },
      }
    }

    const textureState = Object.assign({
      wrap: ['clamp', 'clamp'],
      mag: 'linear',
      min: 'linear',
    }, initialState.texture)

    // sanitize initialState object
    for (let key in initialState) {
      if (undefined === initialState[key]) {
        delete initialState[key]
      }
    }

    super(ctx, manifest, initialState)

    this.on('load', () => {
      const needsMipmaps = (
        isPowerOfTwo(source.height) &&
        isPowerOfTwo(source.width)
      )

      if (needsMipmaps) {
        textureState.mipmap = needsMipmaps
        textureState.min = 'linear mipmap nearest'
      }
    })

    this.once('load', () => {
      if (source instanceof Image) {
        // set initial set on source
        Object.assign(source, initialState)
      }
    })

    // dimensions
    define(this, 'width', { get: () => source.width || source.shape[0] || 0})
    define(this, 'height', { get: () => source.height || source.shape[1] || 0})
    define(this, 'aspectRatio', { get: () => this.width/this.height || 1 })

    // expose DOM element when available
    define(this, 'domElement', {
      get: () => source instanceof Node ? source : null
    })

    this.type = 'image'

    /**
     * Sets an internal image source property
     * value. This function is used
     * to proxy a class method to a image
     * element property
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {ImageCommand|Mixed}
     */

    const set = (property, value) => {
      if (source) {
        if (undefined === value) {
          return source[property]
        } else {
          debug('ImageCommand: set %s=%s', property, value)
          source[property] = value
        }
      } else {
        this.once('load', () => { this[property] = value })
      }
      return this
    }

    /**
     * Source attribute accessor.
     *
     * @type {String}
     */

    define(this, 'src', {
      get: () => {
        return (source && source.src) ?
          source.src :
          (this.manifest && this.manifest.image) ?
            this.manifest.image.src :
            null
      },

      set: (value) => {
        if (source && 'string' == typeof value) {
          source.src = value
          if (this.manifest && this.manifest.image) {
            this.manifest.image.src = value
            this.reset()
            this.load()
          }
        }
      }
    })

    /**
     * Image texture target.
     *
     * @type {REGLTexture}
     */

    this.texture = initialState && initialState.texture ?
      initialState.texture :
        ctx.regl.texture({ ...textureState })

    if ('object' == typeof src) {
      source = src
      Object.assign(textureState, src)
      this.texture({ ...textureState })
      raf(() => this.emit('load'))
    }

    /**
     * Callback when image has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({image}) => {
      source = image
      textureState.data = source
      this.texture({ ...textureState })
      this.emit('load')
    }
  }
}
