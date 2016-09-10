'use strict'

/**
 * Module constants.
 */

export const AXIS_TYPE_VIDEO = 0x01
export const AXIS_TYPE_PHOTO = 0x02

/**
 * Module dependencies.
 */

export { Command } from './commands'
export { Context } from './context'
export * as Utils from './utils'
export * as Math from './math'

/**
 * Axis command API.
 */

export Triangle from './commands/triangle'
export Object from './commands/object'
export Sphere from './commands/sphere'
export Camera from './commands/camera'
export Frame from './commands/frame'
export Media from './commands/media'
export Photo from './commands/photo'
export Video from './commands/video'
export Box from './commands/box'

