/**
 * Module dependencies.
 */

import { Omnitone as omnitone } from 'omnitone'
import { AbstractController } from '../controller'
import defaultAudioContext from 'audio-context'
import { radians } from '../../utils'
import clamp from 'clamp'
import quat from 'gl-quat'
import vec3 from 'gl-vec3'
import mat3 from 'gl-mat3'
import raf from 'raf'

import {
  Quaternion,
  Vector,
} from '../../math'

import {
  XVector3,
  YVector3,
  ZVector3,
} from '../../math/vector'

/**
 * AmbisonicAudioController function.
 *
 * @see AmbisonicAudioController
 */

export default (...args) => new AmbisonicAudioController(...args)

/**
 * AmbisonicAudioController class
 *
 * @public
 * @class AmbisonicAudioController
 * @extends AbstractController
 */

export class AmbisonicAudioController extends AbstractController {

  /**
   * AmbisonicAudioController class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  constructor(ctx, opts = {}) {
    let foaDecoder = null
    let audioContext = null
    let isFoaDecoderInitialized = false

    super(ctx, { ...opts }, (_, updates = {}, target) => { })

    if (opts) {
      if (opts.audioContext instanceof window.AudioContext) {
        audioContext = opts.audioContext
      } else {
        audioContext = defaultAudioContext
      }

      this.target.on('load', () => {
        const target = this.target
        const source = this.source

        if (!target || !source) {
          // @TODO(werle) - log error
          return
        } else if (null != foaDecoder) {
          // @TODO(werle) - log error
          return
        }

        foaDecoder = omnitone.createFOADecoder(
          audioContext,
          target.domElement,
          Object.assign({ channelMap: [0, 1, 2, 3] }, opts)
        )

        foaDecoder.initialize()
        .then(() => isFoaDecoderInitialized = true)
        .catch((err) => emit('error', err))

        let foaDecoderLoopFrame = null
        let foaDecoderLoop = () => {
          if (foaDecoderLoopFrame) {
            foaDecoderLoopFrame = raf(foaDecoderLoop)
          }

          const mat = []
          mat3.fromQuat(mat, source.rotation)
          mat3.translate(mat, mat, vec3.negate([], target.position))
          foaDecoder.setRotationMatrix(mat)
        }

        target.on('playing', () => {
          if (foaDecoderLoopFrame) {
            raf.cancel(foaDecoderLoopFrame)
            foaDecoderLoopFrame = null
          }

          foaDecoderLoopFrame = raf(foaDecoderLoop)
        })

        target.on('pause', () => {
          if (foaDecoderLoopFrame) {
            raf.cancel(foaDecoderLoopFrame)
            foaDecoderLoopFrame = null
          }
        })
      })
    }
  }
}
