'use strict'

/**
 * Module dependencies.
 */

import { debug, define } from '../utils'
import { MediaCommand } from '../media'

/**
 * Image constructor.
 * @see Image
 */

export default (...args) => new Image(...args)

/**
 * Image class.
 *
 * @public
 * @class Image
 * @extends MediaCommand
 */

export class Image extends MediaCommand {

  /**
   * Image class constructor.
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
        src: src
      }
    }

    super(ctx, manifest, initialState)

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
     * @return {Image|Mixed}
     */

    const set = (property, value) => {
      if (source) {
        if (undefined === value) {
          return source[property]
        } else {
          debug('Image: set %s=%s', property, value)
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

    this.texture = null

    /**
     * Callback when image has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({image}) => {
      source = image
      this.texture = ctx.regl.texture(image)
      this.emit('load')
    }
  }
}
