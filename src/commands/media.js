'use strict'

/**
 * Module dependencies.
 */

import { Command } from './command'
import { define } from '../utils'
import resl from 'resl'
import raf from 'raf'

/**
 * No-op to return undefined
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

export class MediaCommand extends Command {

  /**
   * MediaCommand class constructor that loads
   * resources from a given manifest using resl
   *
   * @param {Object} ctx
   * @param {Object} manifest
   */

  constructor(ctx, manifest) {
    let hasProgress = false
    let isLoading = false
    let hasError = false
    let isDoneLoading = false

    super(() => { this.load() })
    raf(() => this.load())

    /**
     * Manifest object getter.
     *
     * @type {Object}
     */

    Object.defineProperty(this, 'manifest', { get: () => manifest })

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
     * Begins loading of resources described in
     * the manifest object.
     *
     * @return {Boolean}
     */

    this.load = () => {
      if (isLoading || hasProgress || hasError || isDoneLoading) {
        return false
      }

      isLoading = true
      raf(() => resl({
        manifest: manifest,

        onDone: (...args) => {
          isDoneLoading = true
          void (this.onloaded || noop)(...args)
        },

        onError: (...args) => {
          hasError = true
          isDoneLoading = true
          void (this.onerror || noop)(...args)
        },

        onProgress: (...args) => {
          hasProgress = true
          isDoneLoading = false
          void (this.onprogress || noop)(...args)
        },
      }))

      return true
    }

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
     * Resets state and loads resources.
     *
     * @return {MediaCommand}
     */

    this.retry = () => {
      this.reset()
      this.laod()
      return this
    }

    /**
     * Resets state.
     *
     * @return {MediaCommand}
     */

    this.reset = () => {
      isDoneLoading = false
      hasProgress = false
      isLoading = false
      hasError = false
      return this
    }
  }
}
