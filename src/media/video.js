'use strict'

/**
 * Module dependencies.
 */
import { debug, define } from '../utils'
import { MediaCommand } from '../media'
import { ImageCommand } from './image'
import isPowerOfTwo from 'is-power-of-two'
import events from 'dom-events'
import clamp from 'clamp'
import raf from 'raf'

/**
 * VideoCommand constructor.
 * @see Video
 */

export default (...args) => new VideoCommand(...args)

/**
 * VideoCommand class.
 *
 * @public
 * @class VideoCommand
 * @extends MediaCommand
 */

export class VideoCommand extends MediaCommand {

  /**
   * VideoCommand class constructor.
   *
   * @constructor
   * @param {Context} ctx
   * @param {String} src
   * @param {(Object)?} initialState
   */

  constructor(ctx, src, initialState = {}) {
    let source = null
    let poster = null
    let volume = 0
    let texture = null
    let isMuted = false
    let isPaused = true
    let isPlaying = false

    /**
     * Texture state used for regl texture updates.
     *
     * @private
     */

    const textureState = Object.assign({
      format: 'rgba',
      wrap: ['clamp', 'clamp'],
      mag: 'linear',
      min: 'linear',
    }, initialState.texture)

    delete initialState.texture

    /**
     * Video manifest for resl.
     *
     * @private
     */

    const manifest = {
      video: Object.assign({
        stream: true,
        type: 'video',
        src: src
      }, initialState.manifest)
    }

    delete initialState.manifest

    /**
     * Calls internal video source method
     * with arguments. This function is used
     * to proxy a class method to a video
     * element method.
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {VideoCommand}
     */

    const call = (method, ...args) => {
      if (source) {
        debug('Video: call %s(%j)', method, args)
        source[method](...args)
      } else {
        this.once('load', () => this[method](...args))
      }
      return this
    }

    /**
     * Sets an internal video source property
     * value. This function is used
     * to proxy a class method to a video
     * element property
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {VideoCommand|Mixed}
     */

    const set = (property, value) => {
      if (source) {
        if (undefined === value) {
          return source[property]
        } else {
          debug('VideoCommand: set %s=%s', property, value)
          source[property] = value
        }
      } else {
        this.once('load', () => { this[property] = value })
      }
      return this
    }

    /**
     * Emits an event on the instance.
     *
     * @private
     * @param {String} event
     * @param {...Mixed} args
     * @return {VideoCommand}
     */

    const emit = (event, ...args) => {
      this.emit(event, ...args)
      return this
    }

    // sanitize initialState object
    for (let key in initialState) {
      if (undefined === initialState[key]) {
        delete initialState[key]
      }
    }

    super(ctx, manifest, initialState)

    // set mesh type
    this.type = 'video'

    this.on('load', () => {
      const needsMipmaps = (
        isPowerOfTwo(source.videoHeight) &&
        isPowerOfTwo(source.videoWidth)
      )

      if (needsMipmaps) {
        textureState.mipmap = needsMipmaps
        textureState.min = 'linear mipmap nearest'
      }
    })

    this.once('load', () => {
      // set initial set on source
      Object.assign(source, initialState)

      const proxy = (event, override) => {
        events.on(source, event, (...args) => {
          emit(override || event, ...args)
        })
      }

      // proxy source events
      for (let key in HTMLVideoElement.prototype) {
        if (key.match(/^on[a-z]/)) {
          proxy(key.replace(/^on/, ''))
          define(this, key, {
            get: () => source[key],
            set: (value) => source[key] = value
          })
        }
      }

      volume = source.volume
      isMuted = source.muted
      isPaused = source.paused
      isPlaying = !isPaused
    })

    // set to playing state
    this.on('playing', () => {
      isPlaying = true
      isPaused = false
    })

    // set to paused state
    this.on('pause', () => {
      isPlaying = false
      isPaused = true
    })

    // set volume mute state
    this.on('mute', () => { isMuted = true })
    this.on('unmute', () => { isMuted = false })

    /**
     * Source attribute accessor.
     *
     * @type {String}
     */

    define(this, 'src', {
      get: () => {
        return (source && source.src) ?
          source.src :
          (this.manifest && this.manifest.video) ?
            this.manifest.video.src :
            null
      },

      set: (value) => {
        if (source && 'string' == typeof value) {
          source.src = value
          if (this.manifest && this.manifest.video) {
            this.manifest.video.src = value
            this.reset()
            this.load()
          }
        }
      }
    })

    // proxy all configurable video properties that serve
    // some kind of real purpose
    // @TODO(werle) - support text tracks
    ;[
      'playbackRate',
      'currentTime',
      'crossOrigin',
      'currentSrc',
      'duration',
      'seekable',
      'volume',
      'paused',
      'played',
      'prefix',
      'title',
      'muted',
      'loop',
    ].map((property) => define(this, property, {
      get: () => source ? source[property] : null,
      set: (value) => {
        if (source) {
          source[property] = value
        } else {
          this.once('load', () => { source[property] = value })
        }
      }
    }))

    // proxy dimensions
    define(this, 'width', { get: () => source ? source.videoWidth : 0})
    define(this, 'height', { get: () => source ? source.videoHeight : 0})
    define(this, 'aspectRatio', {
      get: () => {
        if (source) {
          return source.videoWidth/source.videoHeight
        } else if (poster) {
          return poster.aspectRatio
        }

        return 1
      }
    })

    // expose DOM element
    define(this, 'domElement', { get: () => source })

    /**
     * Plays the video.
     *
     * @return {VideoCommand}
     */

    this.play = () => call('play')

    /**
     * Pauses the video.
     *
     * @return {VideoCommand}
     */

    this.pause = () => call('pause')

    /**
     * Mutes the video
     *
     * @return {VideoCommand}
     */

    this.mute = () => set('muted', true) && emit('mute')

    /**
     * Unutes the video
     *
     * @return {VideoCommand}
     */

    this.unmute = () => set('muted', false) && emit('unmute')

    /**
     * Callback when video  has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({video}) => {
      source = video

      this.emit('load')

      if (null == poster) {
        textureState.data = video
        texture({ ...textureState })
      }

      let lastRead = 0
      this._read = (done) => {
        const now = Date.now()
        if (isPlaying && (now - lastRead >= 64) && this.isDoneLoading && video.readyState >= video.HAVE_ENOUGH_DATA) {
          lastRead = now
          debug('VideoCommand: read')
          textureState.data = source
          texture({ ...textureState })
          done()
        }
      }
    }

    /**
     * Image texture target.
     *
     * @type {REGLTexture}
     */

    define(this, 'texture', {
      get: () => texture,
      set: (value) => {
        if (texture && null === value) {
          texture.destroy()
          texture = ctx.regl.texture({ ...textureState })
        } else {
          texture = ctx.regl.texture({ ...textureState })
        }

        if (value && texture) {
          texture.destroy()
          texture = value
        }
      }
    })

    /**
     * Video poster image.
     *
     * @type {ImageCommand|String}
     */

    define(this, 'poster', {
      get: () => source ? source.poster : null,
      set: (value) => {
        if (value) {
          if (source) {
            source.poster = value.src || value
          } else {
            this.once('load', () => { source.poster = value.src || value })
          }

          if (null == poster) {
            if (value) {
              poster = new ImageCommand(ctx, value.src || value, {texture})
            }
          }
        }
      },
    })

    this.texture = initialState && initialState.texture ?
      initialState.texture :
        ctx.regl.texture({ ...textureState })

    // set poster if applicable
    if (initialState && initialState.poster) {
      this.poster = initialState.poster
    }
  }
}
