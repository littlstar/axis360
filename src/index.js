
'use strict'

/**
 * @license
 * Copyright Little Star Media Inc. and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * The Axis module
 *
 * @module axis
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

import three from 'three'
import dom from 'domify'
import EventEmitter from 'component-emitter'
import events from 'component-events'
import raf from 'raf'
import fullscreen from '@littlstar/fullscreen'
import addCanvasRenderer from '@littlstar/three-canvas-renderer'
import addVREffect from '@littlstar/three-vr-effect'
import Debug from 'debug'
import pkg from '../package.json'
import tpl from './template'
import Projection from './projection'
import createCamera from './camera'
import * as geometries from './geometry'
import State from './state'
import {
  FRAME_CLICK_THRESHOLD,
  MIN_WHEEL_DISTANCE,
  MAX_WHEEL_DISTANCE,
  MIN_Y_COORDINATE,
  MAX_Y_COORDINATE,
  MIN_X_COORDINATE,
  MAX_X_COORDINATE,
  DEFAULT_FOV
} from './constants'
import { isImage, getCorrectGeometry, createRenderer, createVideoTexture } from './util'
import equilinear from './projection/equilinear'
import fisheye from './projection/fisheye'
import flat from './projection/flat'
import tinyplanet from './projection/tinyplanet'
import AxisController from './controls/controller'
import MovementController from './controls/movement'
import PointerController from './controls/pointer'
import OrientationController from './controls/orientation'
import KeyboardController from './controls/keyboard'
import TouchController from './controls/touch'
import MouseController from './controls/mouse'
import VRController from './controls/vr'

const debug = new Debug('axis')

addCanvasRenderer(three)
addVREffect(three)

// uncomment to enable debugging
// window.DEBUG = true;

const COMPANY = 'LITTLSTAR - (www.Littlstar.com) [Little Star Media, Inc] '
const YEAR = new Date().getUTCFullYear()
console.info('Axis@v%s\n\tReport bugs to %s (%s)\n\tCopyright %d %s',
            pkg.version,
            pkg.bugs.url,
            pkg.bugs.email,
            YEAR, COMPANY)

/**
 * Create an Axis instance.
 *
 * @param {HTMLElement} parent
 * @param {Object} [opts]
 * @return {Axis}
 * @api public
 */

export function createAxisFrame (el, opts) {
  return new Axis(el, opts)
}

/**
 * Axis constructor
 *
 * @public
 * @default
 * @class Axis
 * @extends EventEmitter
 * @param {Object} parent - Parent DOM Element
 * @param {Object} [opts] - Constructor ptions passed to the axis
 * state instance.
 * @see {@link module:axis/state~State}
 */

export default class Axis extends EventEmitter {
  constructor (parent, opts = {}) {
    super()
    // disable vr if `navigator.getVRDevices' isn't defined
    if (typeof navigator.getVRDevices !== 'function') {
      opts.vr = false
    }

    // ensure instance
    if (!(this instanceof Axis)) {
      return new Axis(parent, opts)
    } else if (!(parent instanceof window.Element)) {
      throw new TypeError('Expecting DOM Element')
    }

    const self = this

    /** Parent DOM node element. */
    this.parent = parent

    /** Instance constainer DOM element. */
    this.domElement = dom(tpl)

    /** Current axis orientation. */
    this.orientation = { x: 0, y: 0 }

    /** Instance video DOM element. */
    this.video = this.domElement.querySelector('video')
    this.video.onerror = console.warn.bind(console)
    this.video.parentElement.removeChild(this.video)

    /** Axis' scene instance. */
    this.scene = null

    /** Axis' renderer instance.*/
    this.renderer = createRenderer(opts)

    if (opts.allowPreviewFrame && !isImage(opts.src)) {
      delete opts.allowPreviewFrame
      opts.isPreviewFrame = true
      this.previewDomElement = document.createElement('div')
      this.previewFrame = new Axis(this.previewDomElement, opts)
      this.previewFrame.once('ready', () => {
        this.previewFrame.video.volume = 0
        this.previewFrame.video.muted = true
        this.previewFrame.video.currentTime = 0
        this.previewFrame.video.pause()
      })
      delete opts.isPreviewFrame
      this.once('render', () => this.previewFrame.render())
    }

  /** Axis' texture instance. */
    this.texture = null

    /** Axis' controllers. */
    this.controls = {}

    /** Axis' state instance. */
    this.state = new State(this, opts)

    /** Axis' projections instance. */
    this.projections = new Projection(this)

    // install viewport projections
    this.projection('flat', flat)
    this.projection('fisheye', fisheye)
    this.projection('equilinear', equilinear)
    this.projection('tinyplanet', tinyplanet)

    /** Axis' camera instance. */
    this.camera = createCamera(this)

    function getRadius () {
      const { ratio, width } = self.dimensions()
      let radius = 0
      if (self.geometry() === 'cylinder' ||
        Math.sqrt(ratio) <= 2) {
        radius = width / 4
        radius = radius / 2
      } else {
        radius = width / 6
      }
      return radius | 0
    }

    // setup default state when ready
    this.once('ready', () => {
      debug('ready')

      if (opts.time || opts.t) {
        this.video.currentTime = parseFloat(opts.time) || parseFloat(opts.t) || 0
      }

      const { fov = DEFAULT_FOV } = opts
      const x = opts.orientation ? opts.orientation.x : 0
      const y = opts.orientation ? opts.orientation.y : Math.PI / 2

      if (typeof x === 'number' && !isNaN(x)) {
        this.orientation.x = x
      } else {
        this.orientation.x = 0
      }

      if (typeof y === 'number' && !isNaN(y)) {
        this.orientation.y = y
      } else {
        this.orientation.y = 0
      }

      this.state.radius = getRadius()
      this.fov(fov)
      this.refreshScene()

      // initialize projection orientation if opts x and y are 0
      if (opts.projection) {
        this.projection(opts.projection)
      }
    })

    this.on('source', () => {
      this.once('load', () => {
        const { fov = DEFAULT_FOV } = opts
        this.state.radius = getRadius()
        this.fov(fov)
        this.refreshScene()
      })
    })

    /**
     * Sets an attribute on the instance's
     * video DOM element from options passed in
     * to the constructor.
     *
     * @private
     * @param {String} property
     */

    function setVideoAttribute (property) {
      if (opts[property]) {
        self.video.setAttribute(property, opts[property])
      }
    }

    // set video options
    setVideoAttribute('preload')
    setVideoAttribute('autoplay')
    setVideoAttribute('crossorigin')
    setVideoAttribute('loop')
    setVideoAttribute('muted')

    // event delegation manager
    const eventDelegation = {}

    // init window events
    eventDelegation.window = events(window, this)
    eventDelegation.window.bind('resize')
    eventDelegation.window.bind('blur')

    // init video events
    eventDelegation.video = events(this.video, this)
    eventDelegation.video.bind('canplaythrough')
    eventDelegation.video.bind('loadeddata')
    eventDelegation.video.bind('play')
    eventDelegation.video.bind('pause')
    eventDelegation.video.bind('playing')
    eventDelegation.video.bind('progress')
    eventDelegation.video.bind('timeupdate')
    eventDelegation.video.bind('loadstart')
    eventDelegation.video.bind('waiting')
    eventDelegation.video.bind('ended')

    // init dom element events
    eventDelegation.element = events(this.domElement, this)
    eventDelegation.element.bind('click')
    eventDelegation.element.bind('touch', 'onclick')
    eventDelegation.element.bind('mousemove')
    eventDelegation.element.bind('mousewheel')
    eventDelegation.element.bind('mousedown')
    eventDelegation.element.bind('mouseleave')
    eventDelegation.element.bind('mouseup')
    eventDelegation.element.bind('touchstart')
    eventDelegation.element.bind('touchend')
    eventDelegation.element.bind('touchmove')

    // renderer options
    try {
      this.renderer.autoClear = opts.autoClear != null ? opts.autoClear : true
      this.renderer.setPixelRatio(opts.devicePixelRatio || window.devicePixelRatio)
      this.renderer.setClearColor(opts.clearColor || 0xfff, 0.5)
    } catch (e) {
      console.warn(e)
    }

    // attach renderer to instance node container
    this.domElement.querySelector('.container').appendChild(this.renderer.domElement)

    // mute if explicitly set
    if (opts.muted) {
      this.mute(true)
    }

    if (!opts.isPreviewFrame) {
      // Initializes controllers

      this.initializeControllers({
        keyboard: true,
        mouse: true,
        ...opts.controls
      })
    }

    // initial volume
    this.volume(opts.volume || 1)

    // initialize frame source
    this.src(opts.src)

    // handle fullscreen changing
    this.on('fullscreenchange', () => {
      debug('fullscreenchange')
      this.state.update('isFocused', true)
      this.state.update('isAnimating', false)

      if (this.state.isFullscreen) {
        // temporary set this
        this.state.tmp.forceFocus = this.state.forceFocus
        this.state.forceFocus = true
        if (this.state.isVREnabled) {
          raf(() => this.size(window.screen.width, window.screen.height))
        }
        this.emit('enterfullscreen')
      } else {
        this.state.forceFocus = this.state.tmp.forceFocus != null
        ? this.state.tmp.forceFocus
        : false

        if (this.state.isVREnabled) {
          // @TODO(werle) - not sure how to fix this bug but the scene
          // needs to be re-rendered
          raf(() => this.render())
        }

        this.size(this.state.lastSize.width, this.state.lastSize.height)
        this.state.update('lastSize', { width: null, height: null })
        this.emit('exitfullscreen')
      }
    })
  }

  /**
   * Handle `onclick' event
   *
   * @private
   * @param {Event} e
   */

  onclick (e) {
    debug('onclick')
    const now = Date.now()
    const { mousedownTimestamp, isClickable, isImage, isPlaying } = this.state
    const delta = (now - mousedownTimestamp)

    if (!isClickable || delta > FRAME_CLICK_THRESHOLD) {
      return false
    }

    e.preventDefault()

    if (!isImage) {
      if (isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    }

  /**
   * Click event.
   *
   * @public
   * @event module:axis~Axis#click
   * @type {Object}
   */

    this.emit('click', e)
  }

  /**
   * Handle `oncanplaythrough' event
   *
   * @private
   * @param {Event} e
   */

  oncanplaythrough (e) {
    const { ratio } = this.dimensions()
    const r2 = Math.sqrt(ratio)
    debug('oncanplaythrough')
    this.state.duration = this.video.duration
    this.emit('canplaythrough', e)
    this.emit('load')
    if (this.texture == null ||
      (this.texture && this.texture.image && this.texture.image.tagName !== 'VIDEO')) {
      if (this.texture && this.texture.dispose) {
        this.texture.dispose()
      }

      this.texture = createVideoTexture(this.video)
      if (this.state.options.box) {
        this.texture.mapping = three.SphericalReflectionMapping
        this.texture.needsUpdate = true
        this.texture.repeat.set(1, 1)
      } else if (r2 <= 2) {
        this.texture.mapping = three.SphericalReflectionMapping
      }
    }
    this.state.ready()
    if (!this.state.shouldAutoplay && !this.state.isPlaying) {
      this.state.update('isPaused', true)
      this.video.pause()
    } else if (!this.state.isStopped) {
      this.video.play()
    }
  }

  /**
   * Handle `onloadeddata' event
   *
   * @private
   * @param {Event} e
   */

  onloadeddata (e) {
    debug('loadeddata')
  }

  /**
   * Handle `onplay' event
   *
   * @private
   * @param {Event} e
   */

  onplay (e) {
    debug('onplay')
    this.state.update('isPaused', false)
    this.state.update('isStopped', false)
    this.state.update('isEnded', false)
    this.state.update('isPlaying', true)
    this.emit('play', e)
  }

  /**
   * Handle `onpause' event
   *
   * @private
   * @param {Event} e
   */

  onpause (e) {
    debug('onpause')
    this.state.update('isPaused', true)
    this.state.update('isPlaying', false)
    this.emit('pause', e)
  }

  /**
   * Handle `onplaying' event
   *
   * @private
   * @param {Event} e
   */

  onplaying (e) {
    debug('onplaying')
    this.state.update('isPaused', false)
    this.state.update('isPlaying', true)
    this.emit('playing', e)
  }

  /**
   * Handle `onwaiting' event
   *
   * @private
   * @param {Event} e
   */

  onwaiting (e) {
    debug('onwaiting')
    this.emit('wait', e)
  }

  /**
   * Handle `onloadstart' event
   *
   * @private
   * @param {Event} e
   */

  onloadstart (e) {
    debug('onloadstart')
    this.emit('loadstart', e)
  }

  /**
   * Handle `onprogress' event
   *
   * @private
   * @param {Event} e
   */

  onprogress (e) {
    const percent = this.getPercentLoaded()
    e.percent = percent
    this.state.update('percentloaded', percent)
    debug('onprogress')
    this.emit('progress', e)
  }

  /**
   * Handle `ontimeupdate' event
   *
   * @private
   * @param {Event} e
   */

  ontimeupdate (e) {
    debug('ontimeupdate')
    const { currentTime, duration } = this.video
    e.percent = currentTime / duration * 1000
    this.state.update('duration', duration)
    this.state.update('currentTime', currentTime)
    this.emit('timeupdate', e)
  }

  /**
   * Handle `onended' event
   *
   * @private
   * @param {Event} e
   */

  onended (e) {
    debug('onended')
    this.state.update('isEnded', true)
    this.state.update('isPlaying', false)
    this.state.update('isPlaying', false)
    this.state.update('isStopped', true)
    this.emit('end')
    this.emit('ended')
  }

  /**
   * Handle `onmousedown' event
   *
   * @private
   * @param {Event} e
   */

  onmousedown (e) {
    debug('onmousedown')
    this.state.update('mousedownTimestamp', Date.now())
    this.state.update('isAnimating', false)
    this.state.update('dragstart', { x: e.pageX, y: e.pageY })
    this.state.update('isMousedown', true)
    this.emit('mousedown', e)
  }

  /**
   * Handle `onmouseup' event
   *
   * @private
   * @param {Event} e
   */

  onmouseup (e) {
    debug('onmouseup')
    this.state.update('isMousedown', false)
    this.emit('mouseup', e)
  }

  /**
   * Handle `onmouseleave' event
   *
   * @private
   * @param {Event} e
   */

  onmouseleave (e) {
    debug('onmouseleave')
    this.state.update('isMousedown', false)
    this.emit('mouseleave', e)
  }

  /**
   * Handle `ontouchstart' event
   *
   * @private
   * @param {Event} e
   */

  ontouchstart (e) {
    const { pageX, pageY } = e.touches[0]
    debug('ontouchstart')
    this.state.update('mousedownTimestamp', Date.now())
    this.state.update('isAnimating', false)
    this.state.update('dragstart', { x: pageX, y: pageY })
    this.state.update('isTouching', true)
    this.emit('touchstart', e)
  }

  /**
   * Handle `ontouchend' event
   *
   * @private
   * @param {Event} e
   */

  ontouchend (e) {
    debug('ontouchend')
    this.state.update('isTouching', false)
    this.emit('touchend', e)
  }

  /**
   * Handle `onresize' event
   *
   * @private
   * @param {Event} e
   */

  onresize (e) {
    debug('onresize')

    const { isResizable, isFullscreen } = this.state
    const containerStyle = window.getComputedStyle(this.domElement)
    const canvasStyle = window.getComputedStyle(this.renderer.domElement)
    const containerWidth = parseFloat(containerStyle.width)
    const containerHeight = parseFloat(containerStyle.width)
    const canvasWidth = parseFloat(canvasStyle.width)
    const canvasHeight = parseFloat(canvasStyle.height)
    const aspectRatio = canvasWidth / canvasHeight
    let resized = false
    let newWidth = 0
    let newHeight = 0

    if (isResizable && !isFullscreen) {
      // adjust for width while accounting for height
      if (canvasWidth > containerWidth ||
        canvasWidth < containerWidth &&
        canvasWidth < this.state.originalsize.width) {
        newWidth = containerWidth
        newHeight = containerWidth / aspectRatio
        resized = true
      } else if (canvasHeight > containerHeight ||
               (canvasHeight > containerHeight &&
                canvasHeight < this.state.originalsize.height)) {
        newHeight = containerHeight
        newWidth = containerHeight * aspectRatio
        resized = true
      } else {
        this.fov(this.state.originalfov)
      }

      if (resized) {
        this.size(newWidth, newHeight)
        this.emit('resize', {
          width: this.state.width,
          height: this.state.height
        })
      }
    }
  }

  /**
   * Handle `window.onblur' event
   *
   * @private
   * @param {Event} e
   */

  onblur () {
    this.state.isMousedown = false
    this.state.isTouching = false
    if (this.controls.mouse) {
      this.controls.mouse.state.isMousedown = false
    }

    if (this.controls.keyboard) {
      this.controls.keyboard.reset()
    }
  }

  /**
   * Handle `onmousemove' event
   *
   * @private
   * @param {Event} e
   */

  onmousemove (e) {
    debug('onmousemove')
    let xOffset = 0
    let yOffset = 0
    let x = this.state.pointerX
    let y = this.state.pointerY

    if (this.state.isMousedown) {
      xOffset = e.pageX - this.state.dragstart.x
      yOffset = e.pageY - this.state.dragstart.y

      this.state.update('dragstart', {
        x: e.pageX,
        y: e.pageY
      })

      if (this.state.isInverted) {
        x -= xOffset
        y += yOffset
      } else {
        x += xOffset
        y -= yOffset
      }

      this.state.update('pointerX', x)
      this.state.update('pointerY', y)
      this.cache({ pointerX: x, pointerY: y })
    }

    this.emit('mousemove', e)
  }

  /**
   * Handle `ontouchmove' event
   *
   * @private
   * @param {Event} e
   */

  ontouchmove (e) {
    debug('ontouchmove')
    const { pageX, pageY } = e.touches[0]
    let xOffset = 0
    let yOffset = 0
    let x = this.state.pointerX
    let y = this.state.pointerY

    if (!this.state.isTouching) { return }
    if (e.touches.length === 1) {
      e.preventDefault()

      xOffset = pageX - this.state.dragstart.x
      yOffset = pageY - this.state.dragstart.y

      this.state.update('dragstart', {x: pageX, y: pageY})

      if (this.state.isInverted) {
        x -= xOffset
        y += yOffset
      } else {
        x += xOffset
        y -= yOffset
      }

      this.state.update('pointerX', x)
      this.state.update('pointerY', y)
      this.cache({ pointerX: x, pointerY: y })
      this.emit('touchmove', e)
    }
  }

  /**
   * Handle `onmousewheel' event
   *
   * @private
   * @param {Event} e
   */

  onmousewheel (e) {
    debug('onmousewheel')
    const { scrollVelocity } = this.state

    if (typeof velocity !== 'number' || !this.state.allowWheel) {
      return false
    }

    e.preventDefault()

    if (e.wheelDeltaY != null) { // chrome
      this.state.fov -= e.wheelDeltaY * scrollVelocity
    } else if (e.wheelDelta != null) { // ie
      this.state.fov -= window.event.wheelDelta * scrollVelocity
    } else if (e.detail != null) { // firefox
      this.state.fov += e.detail * scrollVelocity
    }

    if (this.state.fov < MIN_WHEEL_DISTANCE) {
      this.state.fov = MIN_WHEEL_DISTANCE
    } else if (this.state.fov > MAX_WHEEL_DISTANCE) {
      this.state.fov = MAX_WHEEL_DISTANCE
    }

    this.camera.setFocalLength(this.state.fov)
    this.emit('mousewheel', e)
  }

  /**
   * Sets frame size
   *
   * @public
   * @param {Number} width
   * @param {Number} height
   */

  size (width, height) {
    debug('size', width, height)

    if (width == null) width = this.state.width
    if (height == null) height = this.state.height

    const container = this.domElement.querySelector('.container')
    this.state.width = width
    this.state.height = height

    if (this.camera) {
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    }

    if (this.renderer) {
      this.renderer.setSize(width, height)
    }

    if (this.state.originalsize.width == null) {
      this.state.originalsize.width = width
    }

    if (this.state.originalsize.height == null) {
      this.state.originalsize.height = height
    }

    if (this.previewFrame) {
      this.previewFrame.size(width, height)
    }

    if (container) {
      container.style.width = width + 'px'
      container.style.height = height + 'px'
    }
    this.emit('size', width, height)
    return this
  }

  /**
   * Sets or gets video src
   *
   * @public
   * @param {String} [src] - Source string
   * @param {Boolean} [preservePreviewFrame = false] - Predicate indicate if
   * preview source should be preserved.
   */

  src (src, preservePreviewFrame) {
    const self = this
    function onImageLoaded () {
      self.texture.image.onload = null
      self.state.ready()
      self.emit('load')
      self.texture.needsUpdate = true
      self.fov(DEFAULT_FOV)
      self.refreshScene()
    }

    if (src) {
      debug('src', src)
      this.state.update('src', src)
      this.state.update('isReady', false)
      this.state.update('lastDimensions', this.dimensions())

      if (!isImage(src) || this.state.forceVideo && src !== this.video.src) {
        this.state.update('isImage', false)

        if (typeof this.state.options.loader === 'function') {
          this.state.options.loader(this, src, this.video)
        } else {
          this.video.src = src
          this.video.load()
          this.video.onload = function () {
            this.onload = null
            if (self.texture) {
              self.texture.needsUpdate = true
            }
          }
        }
      } else {
        this.state.update('isImage', true)
        // initialize texture
        if (this.state.isCrossOrigin) {
          three.ImageUtils.crossOrigin = 'anonymous'
        }

        const loader = new three.TextureLoader()
        const crossOrigin = (
          this.state.options.crossOrigin ||
          this.state.options.crossorigin ||
          false
        )

        loader.setCrossOrigin(crossOrigin)
        this.texture = loader.load(src, onImageLoaded)
        this.texture.minFilter = three.LinearFilter
        this.texture.magFilter = three.LinearFilter
        this.texture.generateMipmaps = false
      }

      if (!preservePreviewFrame && this.previewFrame) {
        this.previewFrame.src(src)
      }

      this.emit('source', src)
      return this
    } else {
      return this.state.src
    }
  }

  /**
   * Plays video frame
   *
   * @public
   */

  play () {
    const { video } = this
    if (!this.state.isImage) {
      if (this.state.isEnded) {
        video.currentTime = 0
      }
      debug('play')
      video.play()
    }
    return this
  }

  /**
   * Pauses video frame
   *
   * @public
   */

  pause () {
    if (!this.state.isImage) {
      debug('pause')
      this.state.update('isPlaying', false)
      this.state.update('isPaused', true)
      this.video.pause()
    }
    return this
  }

  /**
   * Takes video to fullscreen
   *
   * @public
   * @param {Element} el
   */

  fullscreen (el) {
    let opts = null
    if (!fullscreen.supported) {
      return
    } else if (typeof el === 'boolean' && el === false) {
      fullscreen.exit()
      return
    } else if (this.state.isVREnabled) {
      opts = { vrDisplay: this.state.vrHMD }
    } else if (!this.state.isFullscreen) {
      const canvasStyle = window.getComputedStyle(this.renderer.domElement)
      this.state.update('lastSize', {
        width: parseFloat(canvasStyle.width),
        height: parseFloat(canvasStyle.height)
      })

      this.size(window.screen.width, window.screen.height)
    }

    debug('fullscreen')
    this.state.update('isFullscreen', true)
    fullscreen(el || this.domElement, opts)
  }

  /**
   * Set or get volume on frame
   *
   * @public
   * @param {Number} volume
   */

  volume (volume) {
    if (!this.state.isImage) {
      if (volume == null) {
        return this.video.volume
      }
      debug('volume', volume)
      this.state.update('lastVolume', this.video.volume)
      this.video.volume = volume
      this.emit('volume', volume)
    }
    return this
  }

  /**
   * Mutes volume
   *
   * @public
   * @param {Boolean} mute - optional
   */

  mute (mute) {
    debug('mute', mute)
    if (!mute) {
      this.video.muted = false
      this.state.update('isMuted', false)
      this.volume(this.state.lastVolume)
    } else {
      this.state.update('isMuted', true)
      this.video.muted = true
      this.volume(0)
      this.emit('mute')
    }
    return this
  }

  /**
   * Unmute volume
   *
   * @public
   * @param {Boolean} mute - optional
   */

  unmute (mute) {
    if (!this.state.isImage) {
      this.mute(false)
      this.emit('unmute')
    }
    return this
  }

  /**
   * Refreshes frame
   *
   * @public
   */

  refresh () {
    const constraints = this.projections.constraints || {}
    const { video } = this
    const now = Date.now()
    let x = this.state.pointerX
    let y = this.state.pointerY

    debug('refresh')

    if (!this.state.isImage) {
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        if (now - this.state.lastRefresh >= 64) {
          this.state.lastRefresh = now
          if (this.texture != null) {
            this.texture.needsUpdate = true
          }
        }
      }
    }

    if (constraints.panoramic) {
      if (this.camera) {
        this.camera.fov = this.state.fov
        this.camera.updateProjectionMatrix()
      }

      // normalize y coordinate
      y = Math.max(MIN_Y_COORDINATE, Math.min(MAX_Y_COORDINATE, y))

      // normalize x coordinate
      if (x > MAX_X_COORDINATE) {
        x = x - MAX_X_COORDINATE
      } else if (x < MIN_X_COORDINATE) {
        x = x + MAX_X_COORDINATE
      }

      this.state.update('pointerX', x)
      this.state.update('pointerY', y)
      this.cache(this.coords())
    } else {
      this.state.update('pointerX', 90)
      this.state.update('pointerY', 0)
    }

    if (this.state.isFullscreen) {
      if (this.state.lastDevicePixelRatio !== window.devicePixelRatio) {
        this.state.lastDevicePixelRatio = window.devicePixelRatio
        this.size(window.screen.width / window.devicePixelRatio,
                  window.screen.height / window.devicePixelRatio)
      }
    }

    this.emit('refresh')
    return this
  }

  /**
   * Refresh frame
   *
   * @public
   */

  resizable (resizable) {
    if (typeof resizable === 'undefined') return this.state.isResizable
    this.state.update('isResizable', resizable)
    return this
  }

  /**
   * Seek to time in seconds
   *
   * @public
   * @param {Number} seconds
   * @param {Boolean} emit
   */

  seek (seconds, emit) {
    if (this.state.isImage) { return this }
    var isReady = this.state.isReady
    var self = this
    var ua = navigator.userAgent.toLowerCase()
    function afterseek () {
      var isPlaying = self.state.isPlaying
      var video = self.video
      seconds = seconds || 0
      video.currentTime = seconds

      if (seconds === 0) {
        self.state.update('isStopped', true)
      } else {
        self.state.update('isStopped', false)
      }

      if (isPlaying) {
        self.play()
      }

      if (emit) self.emit('seek', seconds)

      setTimeout(function () {
        debug('Attempting seeking correction')
        if (video.readyState < video.HAVE_ENOUGH_DATA) {
          debug('Video state does not have enough data.')
          debug('Reloading video...')
          video.load()
          debug('Seeking video to %d...', seconds)
          video.currentTime = seconds
          if (isPlaying) {
            debug('Playing video at %d...', seconds)
            video.play()
          }
        }
      }, 1000)
    }
    if (!this.state.isImage) {
      // firefox emits `oncanplaythrough' when changing the
      // `.currentTime' property on a video tag so we need
      // to listen one time for that event and then seek to
      // prevent errors from occuring.
      if (/firefox/.test(ua) && !isReady) {
        this.video.oncanplaythrough = function () {
          this.oncanplaythrough = function () {}
          afterseek()
        }
      } else if (isReady) {
        afterseek()
      } else {
        this.once('ready', afterseek)
      }
    }
    return this
  }

  /**
   * Fast forward `n' amount of seconds
   *
   * @public
   * @param {Number} seconds
   */

  foward (seconds) {
    if (!this.state.isImage) {
      this.seek(this.video.currentTime + seconds)
      this.emit('forward', seconds)
    }
    return this
  }

  /**
   * Rewind `n' amount of seconds
   *
   * @public
   * @param {Number} seconds
   */

  rewind (seconds) {
    if (!this.state.isImage) {
      this.seek(this.video.currentTime - seconds)
      this.emit('rewind', seconds)
    }
    return this
  }

  /**
   * Use plugin with frame
   *
   * @public
   * @param {Function} fn
   */

  use (fn) {
    fn(this)
    return this
  }

  /**
   * Draws frame
   *
   * @public
   */

  draw () {
    if (this.renderer && this.scene && this.camera) {
      this.emit('beforedraw')
      if (!this.state.isVREnabled) {
        this.renderer.render(this.scene, this.camera)
      }
      this.emit('draw')
    }

    return this
  }

  /**
   * Look at a position in a [x, y, z] vector
   *
   * @public
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   */

  lookAt (x, y, z) {
    if (this.camera) {
      x = this.camera.target.x = x
      y = this.camera.target.y = y
      z = this.camera.target.z = z
      this.camera.lookAt(this.camera.target)
      this.camera.position.copy(this.camera.target).negate()
      this.emit('lookat', { x, y, z })
    }

    return this
  }

  /**
   * Renders the frame
   *
   * @public
   * @param {Boolean} [shoudLoop = true] - Predicate indicating if a render loop shouls start.
   */

  render (shoudLoop) {
    var domElement = this.domElement
    var self = this
    var style = window.getComputedStyle(this.parent)
    var width = this.state.width || parseFloat(style.width)
    var height = this.state.height || parseFloat(style.height)
    var aspectRatio = 0

    if (this.state.isPreviewFrame) {
      if (shoudLoop == null) {
        shoudLoop = false
      }
    }

    // attach dom node to parent
    if (!this.parent.contains(this.domElement)) {
      this.parent.appendChild(this.domElement)
    }

    if (height === 0) {
      height = Math.min(width, window.innerHeight)
      aspectRatio = width / height
      height = height / aspectRatio
    }

    // initialize size
    this.size(width, height)

    // start animation loop
    if (shoudLoop !== false) {
      raf.cancel(this.state.animationFrameID)
      if (!this.state.animationFrameID || this.state.animationFrameID === 0) {
        this.state.animationFrameID = raf(function loop () {
          var parentElement = domElement.parentElement
          if (parentElement && parentElement.contains(domElement)) {
            self.state.animationFrameID = raf(loop)
            self.update()
          }
        })
      }
    }

    this.emit('render')
    return this
  }

  /**
   * Sets view offset
   *
   * @public
   * @see {@link http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera}
   */

  offset () {
    this.camera.setViewOffset.apply(this.camera, arguments)
    return this
  }

  /**
   * Set or get height
   *
   * @public
   * @param {Number} height - optional
   */

  height (height) {
    if (height == null) {
      return this.state.height
    }

    this.size(this.state.width, height)
    this.emit('height', height)
    return this
  }

  /**
   * Set or get width
   *
   * @public
   * @param {Number} width - optional
   */

  width (width) {
    if (width == null) {
      return this.state.width
    }

    this.size(width, this.state.height)
    this.emit('width', width)
    return this
  }

  /**
   * Set or get projection
   *
   * @public
   * @param {String} type - optional
   * @param {Function} fn - optional
   */

  projection (type, fn) {
    // normalize type string
    type = typeof type === 'string'
      ? type.toLowerCase().replace(/\s+/g, '')
      : null

    // define
    if (type && typeof fn === 'function') {
      this.projections.set(type, fn)
      return this
    }

    // apply
    if (type) {
      if (this.state.isReady) {
        if (type !== this.projections.current &&
            this.projections.contains(type)) {
          this.projections.apply(type)
        }
      } else {
        this.once('ready', function () {
          this.projection(type)
        })
      }

      return this
    }

    // get
    return this.projections.current
  }

  /**
   * Destroys frame
   *
   * @public
   */

  destroy () {
    try {
      this.scene = null
      this.texture = null
      this.camera = null
      this.stop()
      raf.cancel(this.state.animationFrameID)
      this.state.animationFrameID = 0
      this.state.reset()
      this.renderer.resetGLState()
      empty(this.domElement)
      this.domElement.parentElement.removeChild(this.domElement)
    } catch (e) { console.warn(e) }
    function empty (el) {
      try {
        while (el.lastChild) el.removeChild(el)
      } catch (e) {}
    }
    return this
  }

  /**
   * Stops playback if applicable
   *
   * @public
   */

  stop () {
    if (this.state.isImage) { return }
    this.video.pause()
    this.video.currentTime = 0
    this.state.update('isStopped', true)
    this.state.update('isPlaying', false)
    this.state.update('isPaused', false)
    this.state.update('isAnimating', false)
    return this
  }

  /**
   * Sets or gets y coordinate
   *
   * @public
   * @param {Number} y - optional
   */

  y (y) {
    if (y == null) {
      return this.state.pointerY
    }
    this.state.update('pointerY', y)
    return this
  }

  /**
   * Sets or gets x coordinate
   *
   * @public
   * @param {Number} x - optional
   */

  x (x) {
    if (x == null) {
      return this.state.pointerX
    }
    this.state.update('pointerX', x)
    return this
  }

  /**
   * Sets or gets x/y coordinates
   *
   * @public
   * @param {Number} [x] - X coordinate
   * @param {Number} [y] - Y coordinate
   */

  coords (x, y) {
    if (y == null && x == null) {
      return {
        pointerY: this.state.pointerY,
        pointerX: this.state.pointerX
      }
    }

    if (y != null) {
      this.state.update('pointerY', y)
    }

    if (x != null) {
      this.state.update('pointerX', x)
    }

    return this
  }

  /**
   * Refreshes and redraws current frame
   *
   * @public
   */

  update () {
    if (!this.state.shouldUpdate) return this
    this.once('refresh', function () { this.draw() })
    this.once('draw', function () { this.emit('update') })
    return this.refresh()
  }

  /**
   * Sets or updates state cache
   *
   * @public
   * @param {Object} obj - optinal
   */

  cache (o) {
    if (this.state.isConstrainedWith('cache')) {
      return this
    }

    if (typeof o === 'object') {
      this.state.cache = {
        ...this.state.cache,
        ...o
      }
      return this
    } else {
      return this.state.cache
    }
  }

  /**
   * Outputs debug info if `window.localStorage.debug`' is
   * defined with a value matching /axis/.
   *
   * @public
   * @deprecated
   * @param {Mixed} ...arguments - optional
   */

  debug () {
    debug.apply(debug, arguments)
    return this
  }

  /**
   * Gets geometry type string or sets geometry
   * type string and returns an instance of a
   * geometry if applicable.
   *
   * @public
   * @param {String} type - optional
   */

  geometry (type) {
    if (type == null) {
      return this.state.geometry
    }
    try {
    // TODO refactor to `switch (type)` so we get import saftey
      var geo = geometries[type](this)
      this.state.update('geometry', type)
      return geo
    } catch (e) {
      return null
    }
  }

  /**
   * Returns the dimensions of the current
   * texture.
   *
   * @public
   */

  dimensions () {
    let width = 0
    let height = 0

    if (this.state.isImage) {
      if (this.texture && this.texture.image) {
        height = this.texture.image.height
        width = this.texture.image.width
      }
    } else {
      height = this.video.videoHeight
      width = this.video.videoWidth
    }

    return { height, width, ratio: (width / height) || 0 }
  }

  /**
   * Sets or gets the current field of view
   *
   * @public
   * @param {Number} fov - optional
   */

  fov (fov) {
    if (fov == null) {
      return this.state.fov
    } else {
      if (!this.state.fov) {
        this.state.update('originalfov', fov)
      }
      this.state.update('fov', fov)
    }
    return this
  }

  /**
   * Enables VR mode.
   *
   * @public
   */

  enableVRMode () {
    this.initializeControllers({vr: true})
    this.state.isVREnabled = true
    this.controls.vr.enable()
    return this
  }

  /**
   * Disables VR mode.
   *
   * @public
   */

  disableVRMode () {
    this.initializeControllers({vr: false})
    this.state.isVREnabled = false
    this.controls.vr.disable()
    return this.render()
  }

  /**
   * Returns percent of media loaded.
   *
   * @public
   * @param {Number} [trackIndex = 0]- Index of track added.
   */

  getPercentLoaded (trackIndex) {
    var video = this.video
    var percent = 0

    if (this.state.isImage) {
      percent = 100
    } else {
      try {
        percent = video.buffered.end(trackIndex || 0) / video.duration
      } catch (e) {
        debug('error', e)
        try {
          percent = video.bufferedBytes / video.bytesTotal
        } catch (e) {
          debug('error', e)
        }
      }

      percent = percent || 0
      percent *= 100
    }

    return Math.max(0, Math.min(percent, 100))
  }

  /**
   * Returns percent of media played if applicable.
   *
   * @public
   * @return {Number}
   */

  getPercentPlayed () {
    return (this.video.currentTime / this.video.duration * 100) || 0
  }

  /**
   * Initializes axis controllers if not created. An
   * optional map can be used to indicate which controllers
   * should be re-initialized if already created.
   *
   * @public
   * @param {Object} [map] - Controllers to re-initialize.
   * @param {Boolean} [force] - Force initialization of all controllers.
   */

  initializeControllers (map, force) {
    const controls = (this.controls = this.controls || {})
    map = map != null && typeof map === 'object' ? map : {}

    if (map.vr || force) {
      if (controls.vr) { controls.vr.destroy() }
      controls.vr = new VRController(this)
        .target(this.camera)
        .enable()
        .update()
    }

    if (map.mouse || force) {
      if (controls.mouse) { controls.mouse.destroy() }
      controls.mouse = new MouseController(this)
        .target(this.camera)
        .enable()
    }

    if (map.touch || force) {
      if (controls.touch) { controls.touch.destroy() }
      controls.touch = new TouchController(this)
        .target(this.camera)
        .enable()
        .update()
    }

    if (map.keyboard || force) {
      if (controls.keyboard) { controls.keyboard.destroy() }
      controls.keyboard = new KeyboardController(this)
        .target(this.camera)
        .enable()
        .update()
    }

    if (map.orientation || force) {
      if (controls.orientation) { controls.orientation.destroy() }
      controls.orientation = new OrientationController(this)
        .target(this.camera)
        .enable()
        .update()
    }

    if (map.pointer || force) {
      if (controls.pointer) { controls.pointer.destroy() }
      controls.pointer = new PointerController(this).target(this.camera)
    }

    if (controls.movement == null || map.movement || force) {
      if (controls.movement) { controls.movement.destroy() }
      controls.movement = new MovementController(this).target(this.camera)
    }

    if (controls.default == null || map.default || force) {
      if (controls.default) { controls.default.destroy() }
      controls.default = new AxisController(this)
        .enable()
        .target(this.camera)
    }

    return this
  }

  /**
   * Returns a captured image at a specific moment in
   * time based on current orientation, field of view,
   * and projection type. If time is omitted then the
   * current time is used. An exisiting optional `Image`
   * object can be used otherwise a new one is created.
   * The `Image` object is returned and its `src`
   * attribute is set when the frame is able to capture
   * a preview. If the current texture is an image then
   * a preview image is generated immediately.
   *
   * @public
   * @name getCaptureImageAt
   * @param {Number} [time] - Optional Time to seek to preview.
   * @param {Image} [out] - Optional Image object to set src to.
   * @param {Function} [cb] - Optional callback called when image
   * source has been set.
   * @return {Image}
   */

  getCaptureImageAt (time, out, cb) {
    const preview = this.previewFrame
    let image = null
    const mime = 'image/jpeg'
    const self = this

    function setCapture () {
      preview.orientation.x = self.orientation.x
      preview.orientation.y = self.orientation.y
      preview.refreshScene()
      preview.fov(self.fov())
      preview.projection(self.projection())
      raf(function check () {
        preview.camera.target.copy(self.camera.target)
        preview.camera.quaternion.copy(self.camera.quaternion)
        if (preview.state.isAnimating) {
          raf(check)
        } else {
          image.src = preview.renderer.domElement.toDataURL(mime)
        }
      })
    }

    function updatePreviewFrameVideo () {
      preview.update()
      preview.video.currentTime = time
      preview.pause()
    }

    if (arguments.length === 0) {
      time = null
      out = null
    } else if (arguments.length === 1) {
      if (typeof time === 'object') {
        out = time
        time = null
      }
    } else if (arguments.length === 2) {
      if (typeof out === 'function') {
        cb = out
        out = null
      }

      if (typeof time === 'object') {
        out = time
        time = null
      }
    }

    cb = typeof cb === 'function' ? cb : function () {}
    image = out || new window.Image()
    image.onload = function () {
      this.onload = null
      cb(null, this)
    }

    image.onerror = function (e) {
      this.onerror = null
      cb(e, this)
    }

    if (preview && !this.state.isImage) {
      raf(function () { preview.update() })
      preview.once('update', setCapture)
      if (preview.video.readyState < 4) {
        preview.video.onload = function () {
          preview.video.onload = null
          updatePreviewFrameVideo()
        }
        preview.video.load()
      } else {
        updatePreviewFrameVideo()
      }
    } else if (this.renderer.domElement) {
      raf(function () {
        image.src = self.renderer.domElement.toDataURL(mime)
      })
    }

    return image
  }

  /**
   * Returns a screenshot of the current rendered frame
   *
   * @public
   * @param {Image} [out] - Optional image to set source to.
   * @param {Function} [cb] - Optional callback when image has loaded
   * @return {Image}
   */

  toImage (out, cb) {
    out = out || new window.Image()
    return this.getCaptureImageAt(out, cb)
  }

  /**
   * Initializes or refreshes current scene
   * for projection.
   *
   * @public
   * @return {Axis}
   */

  refreshScene () {
    let material = null
    const isReady = this.state.isReady
    const texture = this.texture
    const scene = this.scene
    let mesh = null
    let faces = null
    let geo = null

    if (!texture || !isReady) { return this }

    if (!scene) {
      this.scene = new three.Scene()
    }

    // get geometry for content
    geo = getCorrectGeometry(this)
    faces = []

    // skip if geometry is unable to be determined
    if (!geo) { return this }

    if (scene && scene.children.length >= 1) {
      mesh = scene.children[0]
      material = mesh.material
      if (material.map !== texture) {
        material.map = texture
      }
    } else {
      // create material and mesh
      material = new three.MeshBasicMaterial({map: texture})

      // build mesh
      // uv cube mapping faces
      // (0, 1)                      (1, 1)
      //           ---- ---- ----
      //          |    |    |    |
      //          |    |    |    |
      // (0, .5)   ---- ---- ----    (1, .5)
      //          |    |    |    |
      //          |    |    |    |
      //           ---- ---- ----
      // (0, 0)                      (1, 0)
      //
      if (this.state.options.box) {
        const f1 = [
          new three.Vector2(0, 1),
          new three.Vector2(0, 0.5),
          new three.Vector2(1 / 3, 0.5),
          new three.Vector2(1 / 3, 1)
        ]

        const f2 = [
          new three.Vector2(1 / 3, 1),
          new three.Vector2(1 / 3, 0.5),
          new three.Vector2(2 / 3, 0.5),
          new three.Vector2(2 / 3, 1)
        ]

        const f3 = [
          new three.Vector2(2 / 3, 1),
          new three.Vector2(2 / 3, 0.5),
          new three.Vector2(1, 0.5),
          new three.Vector2(1, 1)
        ]

        const f4 = [
          new three.Vector2(0, 0.5),
          new three.Vector2(0, 0),
          new three.Vector2(1 / 3, 0),
          new three.Vector2(1 / 3, 0.5)
        ]

        const f5 = [
          new three.Vector2(1 / 3, 0.5),
          new three.Vector2(1 / 3, 0),
          new three.Vector2(2 / 3, 0.0),
          new three.Vector2(2 / 3, 0.5)
        ]

        const f6 = [
          new three.Vector2(2 / 3, 0.5),
          new three.Vector2(2 / 3, 0),
          new three.Vector2(1, 0),
          new three.Vector2(1, 0.5)
        ]

        faces[0] = [f1[0], f1[1], f1[3]]
        faces[1] = [f1[1], f1[2], f1[3]]

        faces[2] = [f2[0], f2[1], f2[3]]
        faces[3] = [f2[1], f2[2], f2[3]]

        faces[4] = [f3[0], f3[1], f3[3]]
        faces[5] = [f3[1], f3[2], f3[3]]

        faces[6] = [f4[0], f4[1], f4[3]]
        faces[7] = [f4[1], f4[2], f4[3]]

        faces[8] = [f5[0], f5[1], f5[3]]
        faces[9] = [f5[1], f5[2], f5[3]]

        faces[10] = [f6[0], f6[1], f6[3]]
        faces[11] = [f6[1], f6[2], f6[3]]

        geo.faceVertexUvs[0] = faces
      }

      mesh = new three.Mesh(geo, material)
      // set mesh scale
      material.overdraw = 1
      mesh.scale.x = -1
      // add mesh to scene
      this.scene.add(mesh)
    }

    return this
  }

  /**
   * Focuses frame
   *
   * @public
   * @return {Axis}
   */

  focus () {
    this.state.update('isFocused', true)
    return this
  }

  /**
   * Unfocuses frame
   *
   * @public
   * @return {Axis}
   */

  unfocus () {
    this.state.update('isFocused', false)
    return this
  }

  /**
   * Rotate around an axis with timing and
   * increment value
   *
   * @publc
   * @param {String} coord - x or y
   * @param {Object|Boolean} opts - Options to configure the rotation. If
   * the value is `false` then rotations will stop
   * @param {Number} opts.value - Value to increment rotation.
   * @param {Number} opts.every - Interval in milliseconds when to apply value
   * to the rotation around the coordniate axis.
   * @return {Axis}
   */

  rotate (coord, opts) {
    const intervalRotations = this.state.intervalRotations
    let rotation = null
    const self = this

    if (typeof coord !== 'string') {
      throw new TypeError('Expecting coordinate to be a string.')
    }

    rotation = intervalRotations[coord]

    if (typeof opts === 'object' && opts) {
      if (typeof opts.value === 'number') {
        rotation.value = opts.value
      } else {
        throw new TypeError('Expecting .value to be a number')
      }

      if (typeof opts.every === 'number') {
        rotation.every = opts.every
      }

      clearTimeout(rotation.interval)
      rotation.interval = setTimeout(function interval () {
        var isMousedown = self.controls.mouse && self.controls.mouse.state.isMousedown
        var isTouching = self.controls.touch && self.controls.touch.state.isTouching
        var isKeydown = self.controls.keyboard && self.controls.keyboard.state.isKeydown
        clearTimeout(rotation.interval)
        if (rotation.every !== 0 && rotation.value !== 0) {
          setTimeout(interval, rotation.every)
        }

        if (!(isMousedown || isTouching || isKeydown)) {
          self.orientation[coord] += rotation.value
        }
      }, rotation.every)
    } else if (!opts) {
      rotation.value = 0
      rotation.every = 0
      clearTimeout(rotation.interval)
      return this
    }

    return this
  }

  /**
   * Calculates and returns a vertical field of view
   * value in degrees.
   *
   * @public
   * @param {Object} [dimensions] - Optional dimensions overrides.
   * @param {Number} [dimensions.height] - Height dimension.
   * @param {Number} [dimensions.width] - Width dimension.
   * @param {Number} [dimensions.ratio] - Aspect ratio (w/h) dimension.
   * @return {Number}
   */

  getCalculatedFieldOfView (dimensions) {
    console.warn('getCalculatedFieldOfView() is deprecated. ' +
                 'The field of view should be set, otherwise' +
                 ' the value will be ' + DEFAULT_FOV)
    return DEFAULT_FOV
  }
}
