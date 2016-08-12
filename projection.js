
'use strict';

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
 * The axis projection manager module.
 * @module axis/projection
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

var raf = require('raf')
  , three = require('three')

var DEFAULT_PROJECTION = require('./constants').DEFAULT_PROJECTION

/**
 * Predicate to determine whether `n' is
 * in fact `NaN'
 *
 * @private
 * @param {Mixed} n
 */

function isNaN (n) {
  return 'number' == typeof n && n !== n
}

/**
 * Projections constructor
 *
 * @public
 * @class Projections
 * @param {Object} [scope] - Scope object to apply state to.
 */

module.exports = Projections;
function Projections (scope) {
  // ensure instance
  if (!(this instanceof Projections)) {
    return new Projections(scope);
  }

  var self = this;

  // projection scope
  this.scope = 'object' == typeof scope ? scope : {};

  // install `.state' object if not defined
  if ('object' != typeof this.scope.state) {
    this.scope.state = {};
  }

  /** Animation frame ID generated from `requestAnimationFrame()`. */
  this.animationFrameID = NaN;

  /** Installed projections. */
  this.projections = {};

  /** Current requested projection. */
  this.requested = null;

  /** Current applied projection. */
  this.current = DEFAULT_PROJECTION;

  /** Current projection constraints. */
  this.constraints = null;
}

/**
 * Cancels current animation for a projection
 *
 * @public
 */

Projections.prototype.cancel = function () {
  if (false == isNaN(this.animationFrameID)) {
    raf.cancel(this.animationFrameID);
    this.scope.state.update('isAnimating', false);
  }
  return this;
};

/**
 * Requests an animation frame for a given
 * function `fn'. Animation frames are mutually
 * exclusive.
 *
 * @public
 * @param {Function} fn
 */

Projections.prototype.animate = function (fn) {
  var self = this;
  if ('function' == typeof fn) {
    this.scope.state.update('isAnimating', true);
    this.animationFrameID = raf(function animate () {
      if (false == self.scope.state.isAnimating) {
        self.cancel();
      } else {
        fn.call(self);
        if (self.scope.state.isAnimating) {
          self.animate(fn);
        }
      }
    });
  }
  return this;
};

/**
 * Installs a projection by name
 *
 * @public
 * @param {String} name
 * @param {Function} projection
 */

Projections.prototype.set = function (name, projection) {
  if ('string' == typeof name && 'function' == typeof projection) {
    this.projections[name] = projection;
  }
  return this;
};

/**
 * Removes a projection by name
 *
 * @public
 * @param {String} name
 */

Projections.prototype.remove = function (name) {
  if ('string' == typeof name && 'function' == typeof this.projections[name]) {
    delete this.projections[name];
  }
  return this;
};

/**
 * Gets a projection by name
 *
 * @public
 * @param {String} name
 */

Projections.prototype.get = function (name) {
  if ('string' == typeof name && 'function' == typeof this.projections[name]) {
    return this.projections[name];
  }
  return null;
};

/**
 * Applies a projection by name
 *
 * @public
 * @param {String} name
 */

Projections.prototype.apply = function (name) {
  // set currently requested
  this.requested = name;
  this.cancel();

  raf(function () {
    var projection = null;
    var dimensions = null;
    var texture = null;
    var previous = this.current;

    if (null == this.scope) { return; }

    projection = this.projections[name];
    if (null == projection) { return; }

    dimensions = this.scope.dimensions();
    if (null == dimensions) { return; }

    texture = this.scope.texture;

    if (null != texture && 'string' == typeof name && 'function' == typeof projection) {
      this.scope.refreshScene();

      // apply constraints
      if ('object' == typeof projection.constraints) {
        this.constraints = projection.constraints;
      } else {
        this.constraints = {};
      }

      // apply projection
      if (false === projection.call(this, this.scope)) {
        this.requested = this.current;
      } else {
        this.scope.emit('projectionchange', {
          current: name,
          previous: previous
        });
      }

      // set current projection
      this.current = name;
    }
  }.bind(this));
  return this;
};

/**
 * Predicate to determine if a projection is defiend
 *
 * @public
 * @param {String} name
 */

Projections.prototype.contains = function (name) {
  return 'function' == typeof this.projections[name];
};

/**
 * Predicate to determine if axis content has
 * correct sizing
 *
 * @public
 * @param {Axis} axis
 */

Projections.prototype.contentHasCorrectSizing = function () {
  var dimensions = this.scope.dimensions();
  var width = dimensions.width;
  var height = dimensions.height;
  return 0 != width && 0 != height;
};

/**
 * Predicate to determine if axis is ready
 *
 * @public
 */

Projections.prototype.isReady = function () {
  var scope = this.scope
  return Boolean(scope.camera && scope.texture && scope.scene);
};

/**
 * Refreshes current projection
 *
 * @public
 */

Projections.prototype.refreshCurrent = function () {
  return this.apply(this.current);
};
