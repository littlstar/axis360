'use strict'

/**
 * Module dependencies.
 */

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
 * @extends MediaCommand
 */

export class PhotoCommand extends MediaCommand {
  constructor(ctx, src) {
    const texture = ctx.regl.texture()

    super(ctx, {
      image: {
        stream: true,
        parser: texture,
        type: 'image',
        src: src
      }
    })

    /**
     * Photo texture target.
     *
     * @type {REGLTexture}
     */

    this.texture = texture

    /**
     * Callback when photo has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({image}) => void 0

    /**
     * Callback when photo has load progress.
     *
     * @type {Function}
     */

    this.onprogress = () => void 0

    /**
     * Callback when photo has loading has
     * encountered an error.
     *
     * @type {Function}
     */

    // @TODO(werle) - handle errors better
    this.onerror = (err) => console.error(err)
  }
}
