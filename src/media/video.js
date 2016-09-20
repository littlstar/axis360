'use strict'

/**
 * Module dependencies.
 */

import { debug, define } from '../utils'
import { MediaCommand } from '../media'
import events from 'dom-events'
import clamp from 'clamp'
import raf from 'raf'

/**
 * Video constructor.
 * @see Video
 */

export default (...args) => new Video(...args)

/**
 * Video class.
 *
 * @public
 * @extends MediaCommand
 */

export class Video extends MediaCommand {

  /**
   * Video class constructor.
   *
   * @constructor
   * @param {Context} ctx
   * @param {String} src
   * @param {(Object)?} initialState
   */

  constructor(ctx, src, initialState = {}) {
    let source = null
    let volume = 0
    let isMuted = false
    let isPaused = true
    let isPlaying = false

    const manifest = {
      video: {
        stream: true,
        type: 'video',
        src: src
      }
    }

    /**
     * Calls internal video source method
     * with arguments. This function is used
     * to proxy a class method to a video
     * element method.
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {Video}
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
     * @return {Video|Mixed}
     */

    const set = (property, value) => {
      if (source) {
        if (undefined === value) {
          return source[property]
        } else {
          debug('Video: set %s=%s', property, value)
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
     * @return {Video}
     */

    const emit = (event, ...args) => {
      this.emit(event, ...args)
      return this
    }

    super(ctx, manifest, initialState)

    this.type = 'video'

    // set initial video state
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
      isPlaying = source.paused
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
    this.on('mute', () => {
      isMuted = true
    })

    this.on('unmute', () => {
      isMuted = false
    })

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
      'poster',
      'title',
      'muted',
      'loop',
    ].map((property) => define(this, property, {
      get: () => source[property],
      set: (value) => { source[property] = value }
    }))

    // proxy dimensions
    define(this, 'width', { get: () => source.videoWidth })
    define(this, 'height', { get: () => source.videoHeight })
    define(this, 'aspectRatio', {
      get: () => source.videoWidth / source.videoHeight
    })

    // expose DOM element
    define(this, 'domElement', { get: () => source })

    /**
     * Video texture target.
     *
     * @type {REGLTexture}
     */

    this.texture = null

    /**
     * Plays the video.
     *
     * @return {Video}
     */

    this.play = () => call('play')

    /**
     * Pauses the video.
     *
     * @return {Video}
     */

    this.pause = () => call('pause')

    /**
     * Mutes the video
     *
     * @return {Video}
     */

    this.mute = () => set('muted', true) && emit('mute')

    /**
     * Unutes the video
     *
     * @return {Video}
     */

    this.unmute = () => set('muted', false) && emit('unmute')

    /**
     * Callback when video  has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({video}) => {
      source = video
      this.texture = ctx.regl.texture({
        mag: 'linear',
        min: 'linear',
        wrap: ['clamp', 'clamp'],
        data: video,
      })

      this.emit('load')

      let lastRead = 0
      this._read = () => {
        const now = Date.now()
        if (isPlaying && (now - lastRead >= 64) && this.isDoneLoading && video.readyState >= video.HAVE_ENOUGH_DATA) {
          lastRead = now
          debug('Video: read')
          this.texture(video)
        }
      }
    }
  }
}
