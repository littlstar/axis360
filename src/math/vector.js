'use strict'

/**
 * Module dependencies.
 */

import { define } from '../utils'
import coalesce from 'defined'
import vec4 from 'gl-vec4'
import vec3 from 'gl-vec3'
import vec2 from 'gl-vec2'

/**
 * Vector class.
 *
 * @public
 * @class Vector
 */

export class Vector {

  /**
   * Vector class contructor.
   *
   * @param {...Mixed} input
   */

  constructor(...input) {
    if (1 == input.length && 'object' == typeof input[0]) {
      const tmp = input[0]
      input[0] = tmp.x || tmp[0] || undefined
      input[1] = tmp.y || tmp[1] || undefined
      input[2] = tmp.z || tmp[2] || undefined
      input[3] = tmp.w || tmp[3] || undefined
      input = input.filter((x) => undefined !== x)
    }

    this.elements = new Float64Array([...input])

    define(this, '0', {
      get: () => this.elements[0],
      set: (v) => this.elements[0] = v,
    })

    define(this, '1', {
      get: () => this.elements[1],
      set: (v) => this.elements[1] = v,
    })

    define(this, '2', {
      get: () => this.elements[2],
      set: (v) => this.elements[2] = v,
    })

    define(this, '3', {
      get: () => this.elements[3],
      set: (v) => this.elements[3] = v,
    })

    define(this, 'r', {
      get: () => this.elements[0],
      set: (v) => this.elements[0] = v,
    })

    define(this, 'g', {
      get: () => this.elements[1],
      set: (v) => this.elements[1] = v,
    })

    define(this, 'b', {
      get: () => this.elements[2],
      set: (v) => this.elements[2] = v,
    })

    define(this, 'a', {
      get: () => this.elements[3],
      set: (v) => this.elements[3] = v,
    })
  }

  get length() {
    return this.elements.length
  }

  set length(value) {
    void value
  }

  /**
   * Returns a reference to the underlying
   * vector elements.
   *
   * @getter
   * @type {Float64Array}
   */

  get ref() {
    return this.elements
  }

  /**
   * Returns the component count of the vector
   *
   * @getter
   * @type {Number}
   */

  get componentLength() {
    return this.elements.length
  }

  /**
   * x component-wise getter.
   *
   * @getter
   * @type {Number}
   */

  get x() { return this.elements[0] }

  /**
   * x component-wise setter.
   *
   * @setter
   * @type {Number}
   */

  set x(x) { this.elements[0] = x }

  /**
   * y component-wise getter.
   *
   * @getter
   * @type {Number}
   */

  get y() { return this.elements[1] }

  /**
   * y component-wise setter.
   *
   * @setter
   * @type {Number}
   */

  set y(y) { this.elements[1] = y }

  /**
   * z component-wise getter.
   *
   * @getter
   * @type {Number}
   */

  get z() { return this.elements[2] }

  /**
   * z component-wise setter.
   *
   * @setter
   * @type {Number}
   */

  set z(z) { this.elements[2] = z }

  /**
   * w component-wise getter.
   *
   * @getter
   * @type {Number}
   */

  get w() { return this[3] }

  /**
   * w component-wise setter.
   *
   * @setter
   * @type {Number}
   */

  set w(w) { this.elements[3] = w }

  /**
   * Set components-wise values
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @param {Number} w
   * @return {Vector}
   */

  set(x, y, z, w) {
    if (x instanceof Vector) {
      return this.set(x.x, x.y, x.z, x.w)
    }

    switch (arguments.length) {
      case 4: this.elements[3] = coalesce(w, this.elements[3]);
      case 3: this.elements[2] = coalesce(z, this.elements[2]);
      case 2: this.elements[1] = coalesce(y, this.elements[1]);
      case 1: this.elements[0] = coalesce(x, this.elements[0]);
    }
    return this
  }

  /**
   * Converts the vector into
   * a normal Array.
   *
   * @return {Array}
   */

  toArray() {
    return [...this.elements]
  }

  /**
   * Returns a JSON serializable value.
   *
   * @return {Array}
   */

  toJSON() {
    return this.toArray()
  }

  /**
   * Returns the underlying vector
   * array value.
   *
   * @return {Float64Array}
   */

  valueOf() {
    return this.elements
  }

  /**
   * Iterator protocol implementation.
   */

  [Symbol.iterator]() {
    return this.toArray()[Symbol.iterator]()
  }
}

/**
 * Instanced x, y, z vectors
 */

export const XVector3 = new Vector(1, 0, 0)
export const YVector3 = new Vector(0, 1, 0)
export const ZVector3 = new Vector(0, 0, 1)
