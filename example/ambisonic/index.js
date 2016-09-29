'use strict'

/**
 * Module dependencies.
 */

import AmbisonicAudioController from 'axis3d/controls/ambisonic-audio'
import OrbitCameraController from 'axis3d/controls/orbit-camera'
import WebAudioAnalyser from 'web-audio-analyser'
import { Vector } from 'axis3d/math'
import Keyboard from 'axis3d/input/keyboard'
import Context from 'axis3d/context'
import Camera from 'axis3d/camera'
import Mouse from 'axis3d/input/mouse'
import Audio from 'axis3d/media/audio'
import Frame from 'axis3d/frame'
import Box from 'axis3d/mesh/box'
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

const colors = []
for (let box of boxes) {
  colors.push(new Vector(
    Math.cos(box.id),
    Math.sin(box.id),
    Math.cos(box.id),
    1
  ))
}

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

// orient controllers to "center" of photo/video
raf(() => {
  audio.play()
  ctx.focus()
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
    for (let i = 0; i < boxes.length; ++i) {
      const box = boxes[i]
      const color = colors[i]

      color.set(
        Math.cos(0.5*time*box.id),
        Math.sin(0.5*time*box.id),
        Math.cos(0.5*time*box.id),
        1
      )

      box({color})
    }
  })
})
