'use strict'

/**
 * Module dependencies.
 */

import { MediaCommand } from './media'

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

    this.texture = texture
    this.onloaded = ({image}) => console.log("loaded", image)
    this.onprogress = () => console.log("progress")

    // @TODO(werle) - handle errors better
    this.onerror = (err) => console.error(err)
  }
}
