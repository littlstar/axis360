'use strict'

/**
 * Module dependencies.
 */

import AmbisonicAudioController from 'axis/controls/ambisonic-audio'
import OrbitCameraController from 'axis/controls/orbit-camera'
import WebAudioAnalyser from 'web-audio-analyser'
import { Vector } from 'axis/math'
import Keyboard from 'axis/inputs/keyboard'
import Context from 'axis/context'
import Camera from 'axis/camera'
import Mouse from 'axis/inputs/mouse'
import Audio from 'axis/media/audio'
import Frame from 'axis/frame'
import Box from 'axis/meshes/box'
import raf from 'raf'

// axis context
const ctx = Context()

// objects
const camera = Camera(ctx)
const frame = Frame(ctx)
const audio = Audio(ctx, '//360.littlstar.com/videos/tests/magnificat.wav')

// inputs
const keyboard = Keyboard(ctx)
const mouse = Mouse(ctx)

const boxes = Array(100).fill(0).map((_, i) => Box(ctx, {
  position: new Vector(
    2.0*(i + 1)*Math.random(),
    4.0*(i + 1)*Math.sin(Math.random()),
    2.0*(i + 1)*Math.random()
  )
}))

// orbit controller
const orbitController = OrbitCameraController(ctx, {
  inputs: {mouse, keyboard},
  target: camera,
})

const ambisonicAudioController = AmbisonicAudioController(ctx, {
  target: audio,
  source: camera,
})

// initialize analyser when loaded
let analyser = null
audio.on('load', (domElement) => {
  const audioContext = ambisonicAudioController.audioContext
  const source = ambisonicAudioController.foaDecoder._audioElementSource
  analyser = WebAudioAnalyser(source, audioContext)
})

// for fun in the console
Object.assign(window, {
  ambisonicAudioController,
  keyboard,
  camera,
  audio,
  mouse,
  boxes,
  ctx,
})

// focus now
ctx.focus()

// orient controllers to "center" of photo/video
raf(() => {
  const y = Math.PI / (Math.PI * 0.5)
  orbitController.orientation.y = y
  audio.play()
})

// axis animation frame loop
frame(({time}) => {

  // update controller states
  orbitController()
  ambisonicAudioController()

  if (!analyser) { return }
  // @TODO(werle) visualize with analyser

  // draw camera scene
  camera(() => {
    const coef = 1
    for (let box of boxes) {
      const color = new Vector(
        Math.cos(0.5*time*box.id),
        Math.sin(0.5*time*box.id),
        Math.cos(0.5*time*box.id),
        1
      )

      box({color})
    }
  })
})
