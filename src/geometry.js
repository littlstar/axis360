
import { BoxGeometry, CylinderGeometry, PlaneBufferGeometry, SphereGeometry } from 'three'

/**
 * Creates and returns a `BoxGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

export function box (axis) {
  return new BoxGeometry(400, 400, 400)
}

/**
 * Creates and returns a `CylinderGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

export function cylinder (axis) {
  const radiusSegments = 64
  const heightSegments = 4
  const openEnded = true
  const radius = axis.state.radius
  const height = axis.dimensions().height
  return new CylinderGeometry(radius, radius, height, radiusSegments, heightSegments, openEnded)
}

/**
 * Creates and returns a `PlaneBufferGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

export function plane (axis) {
  const width = axis.width()
  const height = axis.height()
  const segments = 4
  return new PlaneBufferGeometry(width, height, segments)
}

/**
 * Creates and returns a `SphereGeometry'
 * geometry instance.
 *
 * @api public
 * @param {Axis} axis
 */

export function sphere (axis) {
  const heightSegments = 8 << 5
  const widthSegments = 8 << 5
  let radius = axis.state.radius
  const phi = Math.PI * 2

  if (radius < 400) {
    radius = 200
  } else if (radius > 600) {
    radius = 400
  }

  return new SphereGeometry(radius, widthSegments, heightSegments, phi)
}
