
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
 * The pointer controls module.
 *
 * @module axis/controls/pointer
 * @type {Function}
 */

void module.exports

/**
 * Module dependencies.
 * @private
 */

import lock from 'pointer-lock'

/**
 * Local dependencies.
 * @private
 */

import MouseController from './mouse'
import { DEFAULT_MOUSE_MOVEMENT_FRICTION } from '../constants'

/**
 * PointerController constructor
 *
 * @public
 * @constructor
 * @class PointerController
 * @extends MouseController
 * @see {@link module:axis/controls/controller~MouseController}
 * @param {Axis} scope - The axis instance
 */

export default class PointerController extends MouseController {
  constructor (scope) {
    super(scope)

    /**
     * Pointer lock on scopes DOM Element
     *
     * @public
     * @name state.lock
     * @type {EventEmitter}
     */

    this.state.lock = null
  }

  /**
   * Enables mouse pointer lock
   *
   * @public
   * @method
   * @name enable
   * @return {PointerController}
   */

  enable () {
    // init lock if not created
    if (this.state.lock == null) {
      this.state.lock = lock(this.scope.domElement)
    }

    return super.enable()
  }

  // /**
  //  * Disables mouse pointer lock
  //  *
  //  * @public
  //  * @method
  //  * @name disable
  //  * @return {PointerController}
  //  */
  //
  // disable () {
  //   // init lock if not created
  //   if (this.state.lock != null) {
  //     this.state.isMousedown = false
  //     this.state.lock.destroy()
  //   }
  //   return super.disable()
  // }

  /**
   * Request mouse pointer lock.
   *
   * @private
   * @method
   * @name request
   * @return {PointerController}
   */

  request () {
    const friction = this.scope.state.mouseFriction || DEFAULT_MOUSE_MOVEMENT_FRICTION
    const self = this

    // request lock from user
    this.state.lock.request()

    // handle updates when attained
    this.state.lock.on('attain', function () {
      const movements = self.state.movements
      self.state.isMousedown = true
      // update movements when lock has been attained
      self.state.lock.on('data', function (e) {
        self.state.isMousedown = true
        movements.x += e.x
        movements.y += e.y
        // apply friction
        movements.y *= (friction / 4)
        movements.x *= (friction / 4)
      })

      // reset state when released
      self.state.lock.on('release', function () {
        self.state.isMousedown = false
        if (self.state.lock) {
          self.state.lock.destroy()
        }
      })
    })

    return this
  }

  /**
   * Overloads MouseController#update() method.
   *
   * @public
   * @method
   * @name update
   * @return {PointerController}
   */

  update () {
    super.update()
    return this
  }

  /**
   * Overloads MouseController#disable() method.
   *
   * @public
   * @method
   * @name disable
   * @return {PointerController}
   */

  disable () {
    super.disable.call(this)
    if (this.state.lock != null) {
      this.state.lock.release()
      this.state.lock.destroy()
    }
    this.state.lock = null
    return this
  }
}
