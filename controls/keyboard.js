
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
 * The keyboard controls module.
 *
 * @module axis/controls/keyboard
 * @type {Function}
 */

void module.exports;

/**
 * Module dependencies.
 * @private
 */

var keycode = require('keycode')
  , inherits = require('inherits')

/**
 * Local dependencies.
 * @private
 */

var AxisController = require('./controller')
  , constants = require('../constants')

// default key panning speed in pixels
var DEFAULT_KEY_PAN_SPEED = constants.DEFAULT_KEY_PAN_SPEED;

// our epsilon value
var EPSILON_VALUE = constants.EPSILON_VALUE;

/**
 * Initialize keyboard controls on Axis.
 *
 * @public
 * @param {Axis} scope - The axis instance
 * @return {KeyboardController}
 */

module.exports = function keyboard (axis) {
  return KeyboardController(axis)
  .target(axis.camera)
  .enable()
  .update();
};

/**
 * Key code map
 *
 * @public
 * @type {Object}
 */

var keycodes = module.exports.keycodes = {
  'esc': 27,
  'space': 32,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'k': keycode('k'), // up
  'j': keycode('j'), // down
  'h': keycode('h'), // left
  'l': keycode('l'), // right
};

/**
 * Derive keyname from keycode
 *
 * @private
 * @param {Number} code
 * @return {String}
 */

function keyname (code) {
  for (var name in keycodes) {
    if (code == keycodes[name]) { return name; }
  }
  return null;
}

/**
 * KeyboardController constructor
 *
 * @public
 * @constructor
 * @class KeyboardController
 * @extends AxisController
 * @see {@link module:axis/controls/controller~AxisController}
 * @param {Axis} scope - The axis instance
 */

module.exports.KeyboardController = KeyboardController;
inherits(KeyboardController, AxisController);
function KeyboardController (scope) {

  // ensure instance
  if (!(this instanceof KeyboardController)) {
    return new KeyboardController(scope);
  }

  // inherit from `AxisController'
  AxisController.call(this, scope, document);

  /**
   * Reference to this instance.
   *
   * @private
   * @type {KeyboardController}
   */

  var self = this;

  /**
   * Function handles for key presses.
   *
   * @public
   * @name state.handlers
   * @type {Object}
   */

  this.state.handlers = {};

  /**
   * Supported keys names.
   *
   * @public
   * @name state.keynames
   * @type {Array}
   */

  this.state.keynames = Object.keys(module.exports.keycodes);

  /**
   * Supported keys codes.
   *
   * @public
   * @name state.supported
   * @type {Array}
   */

  this.state.define('supported', function () {
    return self.state.keynames.map(keycode);
  });

  /**
   * Key state.
   *
   * @public
   * @name keycode
   * @type {Array}
   */

  this.state.define('keycodes', function () {
    return self.state.keynames.map(keycode);
  });

  /**
   * Key state map
   *
   * @public
   * @name keystate
   * @type {Object}
   */

  this.state.keystate = {};

  /**
   * Predicate indicating if a key is down
   *
   * @public
   * @name state.isKeydown
   * @type {Boolean}
   * @default false
   */

  this.state.define('isKeydown', function () {
    return Object.keys(self.state.keystate).some(function (code) {
      return true == self.state.keystate[code];
    });
  });

  /**
   * Key panning speed in pixels
   *
   * @public
   * @name state.panSpeed
   * @type {Number}
   * @default DEFAULT_KEY_PAN_SPEED
   */

  this.state.define('panSpeed', function () {
    var d = self.scope.dimensions();
    var r = d.ratio;
    var h = d.height;
    var w = d.width
    return {
      x: Math.min((Math.sqrt(h) / (r * r)), 20),
      y: Math.min((Math.sqrt(w) / (r * r)) / 4, 10),
    };
  });

  // initialize event delegation
  this.events.bind('mousedown');
  this.events.bind('keydown');
  this.events.bind('keyup');

  // reset state
  this.reset();

  this.use('up', up);
  this.use('down', down);
  this.use('left', left);
  this.use('right', right);

  if (this.scope.state.vim) {
    this.use('k', up);
    this.use('j', down);
    this.use('h', left);
    this.use('l', right);
  }

  function up (data) {
    this.pan({x: 0, y: this.state.panSpeed.y});
  }

  function down (data) {
    this.pan({x: 0, y: -this.state.panSpeed.y});
  }

  function left (data) {
    this.pan({x: this.state.panSpeed.x, y: 0});
  }

 function right (data) {
    this.pan({x: -this.state.panSpeed.x, y: 0});
  }
}

/**
 * Resets controller state.
 *
 * @public
 * @method
 * @name reset
 * @return {KeyboardController}
 */

KeyboardController.prototype.reset = function () {
  clearTimeout(this.state.keyupTimeout);
  AxisController.prototype.reset.call(this);
  Object.keys(this.state.keystate).forEach(function (code) {
    this.state.keystate[code] = false;
  }, this);
  return this;
};

/**
 * Updates controller state.
 *
 * @public
 * @method
 * @name update
 * @return {KeyboardController}
 */

KeyboardController.prototype.update = function () {
  var lastQuaternion = this.state.quaternions.last;
  var lastPosition = this.state.vectors.lastPosition;
  var isKeydown = this.state.isKeydown;
  var isFocused = this.scope.state.isFocused;
  var keystate = this.state.keystate;
  var handlers = this.state.handlers;
  var position = this.state.target.position;
  var offset = this.state.vectors.offset;

  if (false == isKeydown || false == isFocused) { return this; }
  // call registered keycode handlers
  this.state.keycodes.forEach(function (code) {
    if (null == handlers[code]) { return; }
    handlers[code].forEach(function (handle) {
      var name = keyname(code);
      if (this.state.keystate[code]) {
        if ('function' == typeof handle) {
          handle.call(this, {name: name, code: code});
        }
      }
    }, this);
  }, this);

  return AxisController.prototype.update.call(this);
};

/**
 * Installs a key handle by name.
 *
 * @public
 * @method
 * @name use
 * @param {String|Number} key - Key by name or key code
 * @param {Function} fn - Function handler
 * @throws TypeError
 * @return {KeyboardController}
 */

KeyboardController.prototype.use = function (key, fn) {
  var handlers = this.state.handlers;
  key = 'string' == typeof key ? keycode(key) : key;
  if ('number' != typeof key) {
    throw new TypeError("Expecting string or number.");
  }
  if (null == handlers[key]) { handlers[key] = []; }
  handlers[key].push(fn);
  return this;
};


/**
 * Detects if key name or key code is supported and
 * not constrained.
 *
 * @public
 * @method
 * @name isKeySupported
 * @param {String|Number} key - Key name or key code.
 * @return {Boolean}
 */

KeyboardController.prototype.isKeySupported = function (key) {
  var constraints = this.scope.projections.constraints;

  // normalize key into keycode
  key = 'string' == typeof key ? keycode(key) : key;

  // only keycode numbers are supported
  if ('number' != typeof key) { return false; }

  // false if there are any implicit constraints
  // despite explicit support
  if (constraints && constraints.keys) {
    if (true == constraints.keys[key]) {
      return false;
    }
  }

  // check if key is in supported array
  if (-1 == this.state.supported.indexOf(key)) {
    return false;
  }

  return true;
};

/**
 * Handle 'onkeydown' events.
 *
 * @private
 * @name onkeydown
 * @param {Event} - Event object.
 */

KeyboardController.prototype.onkeydown = function (e) {
  var constraints = this.scope.projections.constraints;
  var isFocused = this.scope.state.forceFocus || this.scope.state.isFocused;
  var handlers = this.state.handlers;
  var ctrlKey = e.ctrlKey;
  var metaKey = e.metaKey;
  var altKey = e.altKey;
  var scope = this.scope;
  var code = e.which;
  var self = this;

  /**
   * Key down event.
   *
   * @public
   * @event module:axis~Axis#keydown
   * @type {Event}
   */

  this.scope.emit('keydown', e);

  // ignore control keys
  if (ctrlKey || metaKey || altKey) { return; }

  if (false == this.state.isEnabled) {
    return;
  }

  if (isFocused) {
    // only supported keys
    if (false == this.isKeySupported(code)) {
      return;
    }

    this.state.keystate[code] = true;

    // prevent default actions
    e.preventDefault();
  }
};

/**
 * Handle 'onkeyup' events.
 *
 * @private
 * @name onkeyup
 * @param {Event} - Event object.
 */

KeyboardController.prototype.onkeyup = function (e) {
  var isFocused = this.scope.state.forceFocus || this.scope.state.isFocused;
  var code = e.which;
  this.state.keystate[code] = false;
  this.scope.emit('keyup', e);
  if (isFocused) {
    e.preventDefault();
    this.state.forceUpdate = true;
    clearTimeout(this.state.keyupTimeout);
    this.state.keyupTimeout = setTimeout(function () {
      this.state.forceUpdate = false;
    }.bind(this), this.scope.state.controllerUpdateTimeout);
  }

};

/**
 * Handle `onmousedown' events.
 *
 * @private
 * @name onmousedown
 * @param {Event} - Event object.
 */

KeyboardController.prototype.onmousedown = function (e) {
  if (e.target == this.scope.domElement ||
      this.scope.domElement.contains(e.target)) {
    this.scope.state.update('isFocused', true);
  } else {
    this.scope.state.update('isFocused', false);
  }
}
