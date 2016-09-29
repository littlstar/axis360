'use strict'

/**
 * Module dependencies.
 */

import { debug, define } from './utils'
import { EventEmitter } from 'events'
import { MeshCommand } from './mesh'
import resl from 'resl'
import raf from 'raf'

/**
 * reload timeout in milliseconds.
 *
 * @private
 * @type {Number}
 */

const RELOAD_TIMEOUT = 1000

/**
 * No-op to return undefined
 *
 * @private
 * @type {Function}
 */

const noop = () => void 0

/**
 * MediaCommand constructor.
 * @see MediaCommand
 */

export default (...args) => new MediaCommand(...args)

/**
 * MediaCommand class.
 *
 * @public
 * @class MediaCommand
 * @extends Command
 */

export class MediaCommand extends MeshCommand {

  /**
   * MediaCommand class constructor that loads
   * resources from a given manifest using resl
   *
   * @constructor
   * @param {Object} ctx
   * @param {Object} manifest
   * @param {(Object)?} initialState
   */

  constructor(ctx, manifest, initialState = {}) {
    let timeout = RELOAD_TIMEOUT
    let hasProgress = false
    let isLoading = false
    let hasError = false
    let isDoneLoading = false

    // load when called as a function
    super(ctx, {
      type: 'media',
      render: (_, state, next) => this.read(next),
      draw: () => this.read(),
    })

    // mixin and initialize EventEmitter
    EventEmitter.call(this)
    Object.assign(this, EventEmitter.prototype)
    this.setMaxListeners(Infinity)

    // preload unless otherwise specified
    if (initialState && false !== initialState.preload) {
      raf(() => this.load())
    }

    /**
     * Manifest object getter.
     *
     * @type {Object}
     */

    define(this, 'manifest', { get: () => manifest })

    /**
     * Boolean predicate to indicate if media has
     * completed loaded enough data. All data may not be
     * loaded if media is a streaming source.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    define(this, 'isDoneLoading', { get: () => isDoneLoading })

    /**
     * Boolean predicate to indicate if media has
     * load progress.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    define(this, 'hasProgress', { get: () => hasProgress })

    /**
     * Boolean predicate to indicate if media has
     * begun loading.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    define(this, 'isLoading', { get: () => isLoading })

    /**
     * Boolean predicate to indicate if media loading
     * encountered an error.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    define(this, 'hasError', { get: () => hasError })

    /**
     * Boolean predicate to indicate if media has
     * has data to read from.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    define(this, 'hasData', {
      get: () => !hasError && (isDoneLoading || hasProgress)
    })

    /**
     * Updates media state with
     * new manifest object. This function
     * merges an input manifest with the existing.
     *
     * @param {Object} newManifest
     * @return {MediaCommand}
     */

    this.update = (newManifest) => {
      Object.assign(manifest, newManifest)
      return this
    }

    /**
     * Calls an abstract _read() method.
     *
     * @return {MediaCommand}
     */

    this.read = (done = () => void 0) => {
      this._read(done)
      return this
    }

    /**
     * Abstract reader method.
     *
     * @return {MediaCommand}
     */

    this._read = (done = () => void 0) => {
      done()
      return this
    }

    /**
     * Begins loading of resources described in
     * the manifest object.
     *
     * @public
     * @return {Boolean}
     */

    this.load = () => {
      const requested = {}

      if (isLoading || hasProgress || hasError || isDoneLoading) {
        return false
      }

      for (let key in manifest) {
        if ('object' == typeof manifest[key]) {
          if ('string' == typeof manifest[key].src) {
            requested[key] = manifest[key]
          }
        }
      }

      if (0 == Object.keys(requested).length) {
        return false
      }

      // retry timeout
      setTimeout(() => {
        if (hasError || ((hasProgress || isLoading) && !isDoneLoading)) {
          debug('retrying....')
          this.reload()
        }
      }, RELOAD_TIMEOUT)

      isLoading = true
      raf(() => resl({
        manifest: requested,

        onDone: (...args) => {
          isDoneLoading = true
          void (this.onloaded || noop)(...args)
          this.emit('load', ...args)
        },

        onError: (...args) => {
          hasError = true
          isDoneLoading = true
          void (this.onerror || noop)(...args)
          this.emit('error', ...args)
        },

        onProgress: (...args) => {
          hasProgress = true
          isDoneLoading = false
          void (this.onprogress || noop)(...args)
          this.emit('progress', ...args)
        },
      }))

      return true
    }

    /**
     * Resets state and reloads resources.
     *
     * @public
     * @return {MediaCommand}
     */

    this.reload = () => {
      this.reset()
      this.load()
      return this
    }

    /**
     * Resets state.
     *
     * @public
     * @return {MediaCommand}
     */

    this.reset = () => {
      isDoneLoading = false
      hasProgress = false
      isLoading = false
      hasError = false
      return this
    }

    /**
     * Sets the timeout for loading of the media.
     *
     * @public
     * @param {Number} timeout
     * @return {MediaCommand}
     */

    this.setTimeout = (value) => {
      timeout = value
      return this
    }
  }
}
