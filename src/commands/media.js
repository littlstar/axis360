'use strict'

/**
 * Module dependencies.
 */

import { Command } from './command'
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
    let isDone = false

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
      if (isLoading || hasProgress || hasError || isDone) {
        return false
      }

      isLoading = true
      raf(() => resl({
        manifest: manifest,

        onDone: (...args) => {
          isDone = true
          void (this.onloaded || noop)(...args)
        },

        onError: (...args) => {
          hasError = true
          isDone = true
          void (this.onerror || noop)(...args)
        },

        onProgress: (...args) => {
          hasProgress = true
          isDone = false
          void (this.onprogress || noop)(...args)
        },
      }))

      return true
    }

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
      hasProgress = false
      isLoading = false
      hasError = false
      isDone = false
      return this
    }
  }
}
