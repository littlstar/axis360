'use strict'

/**
 * Module dependencies.
 */

import { debug, define } from '../utils'
import { MediaCommand } from './media'
import events from 'dom-events'
import raf from 'raf'

/**
 * VideoCommand constructor.
 * @see VideoCommand
 */

export default (...args) => new VideoCommand(...args)

/**
 * VideoCommand class.
 *
 * @public
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
    let isPaused = true
    let isPlaying = false

    super(ctx, {
      video: {
        stream: true,
        type: 'video',
        src: src
      }
    })

    // set initial video state
    this.once('load', () => {
      Object.assign(source, initialState)
      //events.on(source, '
    })

    // set to playing state
    this.once('playing', () => {
      isPlaying = true
      isPaused = false
    })

    // set to paused state
    this.once('pause', () => {
      isPlaying = false
      isPaused = true
    })

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
        debug('VideoCommand: call %s(%j)', method, args)
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

    /**
     * Video texture target.
     *
     * @type {REGLTexture}
     */

    this.texture = null

    /**
     * Plays the video.
     *
     * @return {VideoCommand}
     */

    this.play = () => call('play') && emit('play')

    /**
     * Pauses the video.
     *
     * @return {VideoCommand}
     */

    this.pause = () => call('pause') && emit('pause')

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
     * Sets video volume.
     *
     * @return {VideoCommand}
     */

    this.volume = (volume) => set('volume', volume) && emit('volume', volume)

    /**
     * Callback when photo has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({video}) => {
      source = video
      this.emit('load')
      this.texture = ctx.regl.texture(video)
      const loop = () => {
        debug('VideoCommand: loop')
        raf(loop)
        if (this.isDoneLoading) {
          this.texture = this.texture.subimage(video)
        } else {
          console.log('noooo')
        }

      }
      raf(loop)
    }
  }
}
