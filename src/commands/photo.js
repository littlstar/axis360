'use strict'

/**
 * Module dependencies.
 */

import { debug, define } from '../utils'
import { MediaCommand } from './media'

/**
 * PhotoCommand constructor.
 * @see PhotoCommand
 */

export default (...args) => new PhotoCommand(...args)

/**
 * PhotoCommand class.
 *
 * @public
 * @class PhotoCommand
 * @extends MediaCommand
 */

export class PhotoCommand extends MediaCommand {

  /**
   * PhotoCommand class constructor.
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

    /**
     * Sets an internal photo source property
     * value. This function is used
     * to proxy a class method to a photo
     * element property
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {PhotoCommand|Mixed}
     */

    const set = (property, value) => {
      if (source) {
        if (undefined === value) {
          return source[property]
        } else {
          debug('PhotoCommand: set %s=%s', property, value)
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
     * Photo texture target.
     *
     * @type {REGLTexture}
     */

    this.texture = null

    /**
     * Callback when photo  has loaded.
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
