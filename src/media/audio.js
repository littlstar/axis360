'use strict'

/**
 * Module dependencies.
 */

import { debug, define } from '../utils'
import { MediaCommand } from '../media'
import events from 'dom-events'

/**
 * AudioCommand constructor.
 * @see AudioCommand
 */

export default (...args) => new AudioCommand(...args)

/**
 * AudioCommand class.
 *
 * @public
 * @extends MediaCommand
 */

export class AudioCommand extends MediaCommand {

  /**
   * AudioCommand class constructor.
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
      audio: {
        stream: true,
        type: 'audio',
        src: src
      }
    }

    /**
     * Calls internal audio source method
     * with arguments. This function is used
     * to proxy a class method to a audio
     * element method.
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {AudioCommand}
     */

    const call = (method, ...args) => {
      if (source) {
        debug('AudioCommand: call %s(%j)', method, args)
        source[method](...args)
      } else {
        this.once('load', () => this[method](...args))
      }
      return this
    }

    /**
     * Sets an internal audio source property
     * value. This function is used
     * to proxy a class method to a audio
     * element property
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {AudioCommand|Mixed}
     */

    const set = (property, value) => {
      if (source) {
        if (undefined === value) {
          return source[property]
        } else {
          debug('AudioCommand: set %s=%s', property, value)
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
     * @return {AudioCommand}
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

    // set initial audio state
    this.once('load', () => {
      // set initial set on source
      Object.assign(source, initialState)

      const proxy = (event, override) => {
        events.on(source, event, (...args) => {
          emit(override || event, ...args)
        })
      }

      // proxy source events
      for (let key in HTMLAudioElement.prototype) {
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
          (this.manifest && this.manifest.audio) ?
            this.manifest.audio.src :
            null
      },

      set: (value) => {
        if (source && 'string' == typeof value) {
          source.src = value
          if (this.manifest && this.manifest.audio) {
            this.manifest.audio.src = value
            this.reset()
            this.load()
          }
        }
      }
    })

    // proxy all configurable audio properties that serve
    // some kind of real purpose
    // @TODO(werle) - support text tracks
    ;[
      'currentTime',
      'crossOrigin',
      'currentSrc',
      'duration',
      'seekable',
      'volume',
      'paused',
      'played',
      'prefix',
      'muted',
      'loop',
    ].map((property) => define(this, property, {
      get: () => source[property],
      set: (value) => { source[property] = value }
    }))

    // expose DOM element
    define(this, 'domElement', { get: () => source })

    /**
     * Plays the audio.
     *
     * @return {AudioCommand}
     */

    this.play = () => call('play')

    /**
     * Pauses the audio.
     *
     * @return {AudioCommand}
     */

    this.pause = () => call('pause')

    /**
     * Mutes the audio
     *
     * @return {AudioCommand}
     */

    this.mute = () => set('muted', true) && emit('mute')

    /**
     * Unutes the audio
     *
     * @return {AudioCommand}
     */

    this.unmute = () => set('muted', false) && emit('unmute')

    /**
     * Callback when audio has loaded.
     *
     * @type {Function}
     */

    this.onloaded = ({audio}) => {
      source = audio
    }
  }
}
