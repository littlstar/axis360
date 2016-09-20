(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Axis = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioCommand = undefined;

var _utils = require('../utils');

var _media = require('./media');

var _domEvents = require('dom-events');

var _domEvents2 = _interopRequireDefault(_domEvents);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * AudioCommand constructor.
 * @see AudioCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(AudioCommand, [null].concat(args)))();
};

/**
 * AudioCommand class.
 *
 * @public
 * @extends MediaCommand
 */

var AudioCommand = exports.AudioCommand = function (_MediaCommand) {
  _inherits(AudioCommand, _MediaCommand);

  /**
   * AudioCommand class constructor.
   *
   * @constructor
   * @param {Context} ctx
   * @param {String} src
   * @param {(Object)?} initialState
   */

  function AudioCommand(ctx, src) {
    var initialState = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, AudioCommand);

    var source = null;
    var volume = 0;
    var isMuted = false;
    var isPaused = true;
    var isPlaying = false;

    var manifest = {
      audio: {
        stream: true,
        type: 'audio',
        src: src
      }
    };

    /**
     * Calls internal audio source method
     * with arguments. This function is used
     * to proxy a class method to a audio
     * element method.
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {AudioCommand}
     */

    var call = function call(method) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (source) {
        var _source;

        (0, _utils.debug)('AudioCommand: call %s(%j)', method, args);
        (_source = source)[method].apply(_source, args);
      } else {
        _this.once('load', function () {
          return _this[method].apply(_this, args);
        });
      }
      return _this;
    };

    /**
     * Sets an internal audio source property
     * value. This function is used
     * to proxy a class method to a audio
     * element property
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {AudioCommand|Mixed}
     */

    var set = function set(property, value) {
      if (source) {
        if (undefined === value) {
          return source[property];
        } else {
          (0, _utils.debug)('AudioCommand: set %s=%s', property, value);
          source[property] = value;
        }
      } else {
        _this.once('load', function () {
          _this[property] = value;
        });
      }
      return _this;
    };

    /**
     * Emits an event on the instance.
     *
     * @private
     * @param {String} event
     * @param {...Mixed} args
     * @return {AudioCommand}
     */

    var emit = function emit(event) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      _this.emit.apply(_this, [event].concat(args));
      return _this;
    };

    // set initial audio state
    var _this = _possibleConstructorReturn(this, (AudioCommand.__proto__ || Object.getPrototypeOf(AudioCommand)).call(this, ctx, manifest, initialState));

    _this.once('load', function () {
      // set initial set on source
      Object.assign(source, initialState);

      var proxy = function proxy(event, override) {
        _domEvents2.default.on(source, event, function () {
          for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          emit.apply(undefined, [override || event].concat(args));
        });
      };

      // proxy source events

      var _loop = function _loop(key) {
        if (key.match(/^on[a-z]/)) {
          proxy(key.replace(/^on/, ''));
          (0, _utils.define)(_this, key, {
            get: function get() {
              return source[key];
            },
            set: function set(value) {
              return source[key] = value;
            }
          });
        }
      };

      for (var key in HTMLAudioElement.prototype) {
        _loop(key);
      }

      volume = source.volume;
      isMuted = source.muted;
      isPlaying = source.paused;
    });

    // set to playing state
    _this.on('playing', function () {
      isPlaying = true;
      isPaused = false;
    });

    // set to paused state
    _this.on('pause', function () {
      isPlaying = false;
      isPaused = true;
    });

    // set volume mute state
    _this.on('mute', function () {
      isMuted = true;
    });

    _this.on('unmute', function () {
      isMuted = false;
    });

    /**
     * Source attribute accessor.
     *
     * @type {String}
     */

    (0, _utils.define)(_this, 'src', {
      get: function get() {
        return source && source.src ? source.src : _this.manifest && _this.manifest.audio ? _this.manifest.audio.src : null;
      },

      set: function set(value) {
        if (source && 'string' == typeof value) {
          source.src = value;
          if (_this.manifest && _this.manifest.audio) {
            _this.manifest.audio.src = value;
            _this.reset();
            _this.load();
          }
        }
      }
    })

    // proxy all configurable audio properties that serve
    // some kind of real purpose
    // @TODO(werle) - support text tracks
    ;['currentTime', 'crossOrigin', 'currentSrc', 'duration', 'seekable', 'volume', 'paused', 'played', 'prefix', 'muted', 'loop'].map(function (property) {
      return (0, _utils.define)(_this, property, {
        get: function get() {
          return source[property];
        },
        set: function set(value) {
          source[property] = value;
        }
      });
    });

    // expose DOM element
    (0, _utils.define)(_this, 'domElement', { get: function get() {
        return source;
      } });

    /**
     * Plays the audio.
     *
     * @return {AudioCommand}
     */

    _this.play = function () {
      return call('play');
    };

    /**
     * Pauses the audio.
     *
     * @return {AudioCommand}
     */

    _this.pause = function () {
      return call('pause');
    };

    /**
     * Mutes the audio
     *
     * @return {AudioCommand}
     */

    _this.mute = function () {
      return set('muted', true) && emit('mute');
    };

    /**
     * Unutes the audio
     *
     * @return {AudioCommand}
     */

    _this.unmute = function () {
      return set('muted', false) && emit('unmute');
    };

    /**
     * Callback when audio has loaded.
     *
     * @type {Function}
     */

    _this.onloaded = function (_ref) {
      var audio = _ref.audio;

      source = audio;
    };
    return _this;
  }

  return AudioCommand;
}(_media.MediaCommand);

},{"../utils":28,"./media":8,"dom-events":34}],2:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoxCommand = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _box = require('../geometry/box');

var _object = require('./object');

var _glMat = require('gl-mat4');

var _glMat2 = _interopRequireDefault(_glMat);

var _glslify = require('glslify');

var _glslify2 = _interopRequireDefault(_glslify);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Box function.
 *
 * @see BoxCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(BoxCommand, [null].concat(args)))();
};

/**
 * BoxCommand class.
 *
 * @public
 * @class BoxCommand
 * @extends ObjectCommand
 */

var BoxCommand = exports.BoxCommand = function (_ObjectCommand) {
  _inherits(BoxCommand, _ObjectCommand);

  function BoxCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, BoxCommand);

    var geometry = new _box.BoxGeometry(opts.geometry);
    var uniforms = {};
    return _possibleConstructorReturn(this, (BoxCommand.__proto__ || Object.getPrototypeOf(BoxCommand)).call(this, ctx, _extends({}, opts, {
      type: 'box',
      uniforms: uniforms,
      geometry: geometry
    })));
  }

  return BoxCommand;
}(_object.ObjectCommand);

},{"../geometry/box":18,"./object":10,"gl-mat4":47,"glslify":187}],3:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CameraCommand = exports.DEFAULT_CAMERA_FAR = exports.DEFAULT_CAMERA_NEAR = exports.DEFAULT_CAMERA_FIELD_OF_VIEW = exports.DEFAULT_CAMERA_ORIENTATION_ORIGIN = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _utils = require('../utils');

var _object = require('./object');

var _math = require('../math');

var _defined = require('defined');

var _defined2 = _interopRequireDefault(_defined);

var _glMat = require('gl-mat4');

var _glMat2 = _interopRequireDefault(_glMat);

var _glVec = require('gl-vec3');

var _glVec2 = _interopRequireDefault(_glVec);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * CameraCommand constructor.
 * @see CameraCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(CameraCommand, [null].concat(args)))();
};

/**
 * Scratch matrix
 *
 * @private
 * @const
 * @type {mat4}
 */

var scratch = _glMat2.default.identity([]);

/**
 * Euler angle of the origin camera orientation
 * express in radians.
 *
 * @public
 * @const
 * @type {Vector}
 */

var DEFAULT_CAMERA_ORIENTATION_ORIGIN =
// pitch, yaw, roll
exports.DEFAULT_CAMERA_ORIENTATION_ORIGIN = new _math.Vector((0, _utils.radians)(90), 0, 0);

/**
 * Default field of view frustrum angle for the
 * persective camera projection. This value is
 * expressed in radians.
 *
 * @public
 * @const
 * @type {Number}
 */

var DEFAULT_CAMERA_FIELD_OF_VIEW = exports.DEFAULT_CAMERA_FIELD_OF_VIEW = (0, _utils.radians)(60);

/**
 * Default near value for the persective camera
 * projection.
 *
 * @public
 * @const
 * @type {Number}
 */

var DEFAULT_CAMERA_NEAR = exports.DEFAULT_CAMERA_NEAR = 0.01;

/**
 * Default far value for the persective camera
 * projection.
 *
 * @public
 * @const
 * @type {Number}
 */

var DEFAULT_CAMERA_FAR = exports.DEFAULT_CAMERA_FAR = 1000.0;

/**
 * CameraCommand class.
 *
 * @public
 * @class CameraCommand
 * @extends Command
 */

var CameraCommand = exports.CameraCommand = function (_ObjectCommand) {
  _inherits(CameraCommand, _ObjectCommand);

  /**
   * Camera class constructor.
   *
   * @param {Context} ctx
   * @param {Object} opts
   */

  function CameraCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, CameraCommand);

    var worldUp = new _math.Vector(0, 1, 0);
    var target = new _math.Vector(0, 0, 0);
    var front = new _math.Vector(0, 0, -1);
    var right = new _math.Vector(1, 0, 0);
    var eye = new _math.Vector(0, 0, 0);
    var up = new _math.Vector(0, 0, 0);

    var _projection = _glMat2.default.identity([]);
    var _view = _glMat2.default.identity([]);

    var orientation = Object.assign(DEFAULT_CAMERA_ORIENTATION_ORIGIN, {});

    var state = {
      viewportHeight: (0, _defined2.default)(opts.viewportHeight, 1),
      viewportWidth: (0, _defined2.default)(opts.viewportWidth, 1),
      near: (0, _defined2.default)(opts.near, DEFAULT_CAMERA_NEAR),
      far: (0, _defined2.default)(opts.far, DEFAULT_CAMERA_FAR),
      fov: (0, _defined2.default)(opts.fov, opts.fieldOfView, DEFAULT_CAMERA_FIELD_OF_VIEW)
    };

    var context = {
      projection: function projection(_ref) {
        var viewportWidth = _ref.viewportWidth;
        var viewportHeight = _ref.viewportHeight;

        update({ viewportWidth: viewportWidth, viewportHeight: viewportHeight });
        return _projection;
      },

      view: function view(_ref2) {
        var viewportWidth = _ref2.viewportWidth;
        var viewportHeight = _ref2.viewportHeight;

        update({ viewportWidth: viewportWidth, viewportHeight: viewportHeight });
        return _view;
      }
    };

    var uniforms = _extends({}, context);
    var _render = ctx.regl({ context: context, uniforms: uniforms });

    var update = function update(updates) {
      var sync = function sync(prop) {
        if (prop in updates) {
          state[prop] = updates[prop];
        }
      };

      // sycn properties
      sync('fov');
      sync('far');
      sync('near');
      sync('viewportWidth');
      sync('viewportHeight');

      var position = _this.position;
      var aspect = state.viewportWidth / state.viewportHeight;
      var vector = new _math.Vector(0, 0, 0);
      var near = state.near;
      var far = state.far;
      var fov = state.fov;

      // update camera direction vectors
      _glVec2.default.set(front, Math.cos(orientation.x) * Math.cos(orientation.y), Math.sin(orientation.y), Math.sin(orientation.x) * Math.sin(orientation.y));

      _glVec2.default.normalize(front, front);
      _glVec2.default.copy(right, _glVec2.default.normalize([], _glVec2.default.cross([], front, worldUp)));
      _glVec2.default.copy(up, _glVec2.default.normalize([], _glVec2.default.cross([], right, front)));

      // set projection
      _glMat2.default.perspective(_projection, fov, aspect, near, far);

      // update transform from context if present
      if (ctx.previous && ctx.previous.id != _this.id) {
        _glMat2.default.copy(_this.transform, _glMat2.default.multiply([], ctx.previous.transform, _view));
      } else {
        _glMat2.default.copy(_this.transform, _view);
      }

      // update view matrix
      _glMat2.default.copy(_view, _this.transform);
      _glMat2.default.lookAt(_view, position, target, up);
      _glMat2.default.multiply(_view, _view, _glMat2.default.fromQuat([], _this.rotation));

      // set eye vector
      _glMat2.default.invert(scratch, _view);
      _glVec2.default.set(eye, scratch[12], scratch[13], scratch[14]);
      return _this;
    };

    /**
     * Camera field of view value.
     *
     * @type {Number}
     */

    var _this = _possibleConstructorReturn(this, (CameraCommand.__proto__ || Object.getPrototypeOf(CameraCommand)).call(this, ctx, _extends({}, opts, { render: function render(_) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        return _render.apply(undefined, args);
      } })));

    (0, _utils.define)(_this, 'fov', {
      get: function get() {
        return state.fov;
      },
      set: function set(fov) {
        return update({ fov: fov });
      }
    });

    /**
     * Camera far value.
     *
     * @type {Number}
     */

    (0, _utils.define)(_this, 'far', {
      get: function get() {
        return state.far;
      },
      set: function set(far) {
        return update({ far: far });
      }
    });

    /**
     * Camera near value.
     *
     * @type {Number}
     */

    (0, _utils.define)(_this, 'near', {
      get: function get() {
        return state.near;
      },
      set: function set(near) {
        return update({ near: near });
      }
    });

    /**
     * Camera projection value.
     *
     * @type {Number}
     */

    (0, _utils.define)(_this, 'projection', { get: function get() {
        return _projection;
      } });

    /**
     * Camera view matrix value.
     *
     * @type {Number}
     */

    (0, _utils.define)(_this, 'view', { get: function get() {
        return _view;
      } });

    /**
     * Camera world up vector.
     *
     * @type {Vector}
     */

    (0, _utils.define)(_this, 'worldUp', { get: function get() {
        return worldUp;
      } });

    /**
     * Camera front vector.
     *
     * @type {Vector}
     */

    (0, _utils.define)(_this, 'front', { get: function get() {
        return front;
      } });

    /**
     * Camera right vector.
     *
     * @type {Vector}
     */

    (0, _utils.define)(_this, 'right', { get: function get() {
        return right;
      } });

    /**
     * Camera eye vector.
     *
     * @type {Vector}
     */

    (0, _utils.define)(_this, 'eye', { get: function get() {
        return eye;
      } });

    /**
     * Camera up vector.
     *
     * @type {Vector}
     */

    (0, _utils.define)(_this, 'up', { get: function get() {
        return up;
      } });

    /**
     * Camera lookAt target vector.
     *
     * @type {Vector}
     */

    (0, _utils.define)(_this, 'target', { get: function get() {
        return target;
      } });

    /**
     * Camera orientation vector.
     *
     * @type {Vector}
     */

    (0, _utils.define)(_this, 'orientation', { get: function get() {
        return orientation;
      } });

    /**
     * Looks at a target vector.
     *
     * @type {Number}
     */

    (0, _utils.define)(_this, 'lookAt', {
      value: function value(vector) {
        _glVec2.default.copy(target, vector);
        return this;
      }
    });
    return _this;
  }

  return CameraCommand;
}(_object.ObjectCommand);

},{"../math":23,"../utils":28,"./object":10,"defined":33,"gl-mat4":47,"gl-vec3":129}],4:[function(require,module,exports){
'use strict';

/**
 * No-op to return this only
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandContext = exports.Command = exports.encode = undefined;

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _symbols = require('../symbols');

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var noop = function noop() {
  return undefined;
};

/**
 * Module symbols.
 */

/**
 * Encode a function for execution within a
 * Command instance context.
 *
 * @public
 * @param {Function} fn
 * @return {String}
 */

var encode = exports.encode = function encode(fn) {
  return '(' + String(fn) + ')';
};

/**
 * Command class.
 *
 * @public
 */

var Command = exports.Command = function (_Function) {
  _inherits(Command, _Function);

  _createClass(Command, null, [{
    key: 'codegen',

    /**
     * Generates code executed in an
     * isolated context.
     *
     * @static
     * @param {Function} fn
     * @return {String}
     */

    value: function codegen(fn) {
      return '\n    var fn = ' + encode(fn) + ';\n    fn.apply(this, arguments);\n    return this;';
    }

    /**
     * Command class constructor.
     * Assigns a command runner and returns
     * a command function.
     *
     * @constructor
     * @param {Function} run
     */

  }]);

  function Command(run) {
    var _ret;

    _classCallCheck(this, Command);

    var _this = _possibleConstructorReturn(this, (Command.__proto__ || Object.getPrototypeOf(Command)).call(this, Command.codegen(commandRunnerWrap)));

    run = 'function' == typeof run ? run : noop;
    var state = _defineProperty({}, _symbols.$run, run);
    var ctx = _this[_symbols.$ctx] = new CommandContext(_this, state);
    var exec = function exec() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _this.apply(undefined, [ctx, run].concat(args));
    };
    var self = _this;
    return _ret = function _ret() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return exec.call.apply(exec, [self].concat(args));
    }, _possibleConstructorReturn(_this, _ret);
  }

  return Command;
}(Function);

/**
 * CommandContext class.
 *
 * @public
 */

var CommandContext = exports.CommandContext = function () {

  /**
   * CommandContext class constructor.
   *
   * @param {Command} cmd
   * @param {(Object)?} state
   */

  function CommandContext(cmd, state) {
    _classCallCheck(this, CommandContext);

    this[_symbols.$ref] = cmd;
    Object.assign(this, state || {});
  }

  /**
   * Returns a reference to the command.
   * This is used in the commandRunnerWrap
   * function.
   *
   * @getter
   * @private
   */

  _createClass(CommandContext, [{
    key: 'ref',
    get: function get() {
      return this[_symbols.$ref];
    }
  }]);

  return CommandContext;
}();

/**
 * Command runner wrap that calls a
 * commands internal run ($run) function.
 *
 * @private
 * @param {CommandContext} ctx
 * @param {Function} fn
 * @param {...Mixed} args
 * @return {Mixed}
 */

function commandRunnerWrap(ctx, run) {
  if (this && 'function' == typeof run) {
    for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      args[_key3 - 2] = arguments[_key3];
    }

    run.apply(run, [ctx].concat(args));
  }
  return this;
}

},{"../symbols":27}],5:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FrameCommand = undefined;

var _command = require('./command');

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * FrameCommand constructor.
 * @see FrameCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(FrameCommand, [null].concat(args)))();
};

/**
 * FrameCommand class.
 *
 * @public
 * @class FrameCommand
 * @extends Command
 */

var FrameCommand = exports.FrameCommand = function (_Command) {
  _inherits(FrameCommand, _Command);

  /**
   * FrameCommand class constructor.
   *
   * @param {Context} ctx
   */

  function FrameCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, FrameCommand);

    // @TODO(werle) - use framebuffer

    var tick = null;
    var isRunning = false;
    var reglContext = null;

    var queue = [];

    /**
     * Starts the frame loop.
     *
     * @return {FrameCommand}
     */

    var _this = _possibleConstructorReturn(this, (FrameCommand.__proto__ || Object.getPrototypeOf(FrameCommand)).call(this, function (_, refresh) {
      _this.start();
      queue.push(refresh);
    }));

    _this.start = function () {
      if (isRunning) {
        return _this;
      }
      tick = ctx.regl.frame(function (_) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        reglContext = _;

        ctx.clear();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = queue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var refresh = _step.value;

            if ('function' == typeof refresh) {
              refresh.apply(undefined, [reglContext].concat(args));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
      return _this;
    };
    return _this;
  }

  return FrameCommand;
}(_command.Command);

},{"../utils":28,"./command":4}],6:[function(require,module,exports){
'use strict';

/**
 * Module exports.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _orientation = require('./orientation');

Object.defineProperty(exports, 'OrientationCommand', {
  enumerable: true,
  get: function get() {
    return _orientation.OrientationCommand;
  }
});

var _triangle = require('./triangle');

Object.defineProperty(exports, 'TriangleCommand', {
  enumerable: true,
  get: function get() {
    return _triangle.TriangleCommand;
  }
});

var _keyboard = require('./keyboard');

Object.defineProperty(exports, 'KeyboardCommand', {
  enumerable: true,
  get: function get() {
    return _keyboard.KeyboardCommand;
  }
});

var _sphere = require('./sphere');

Object.defineProperty(exports, 'SphereCommand', {
  enumerable: true,
  get: function get() {
    return _sphere.SphereCommand;
  }
});

var _camera = require('./camera');

Object.defineProperty(exports, 'CameraCommand', {
  enumerable: true,
  get: function get() {
    return _camera.CameraCommand;
  }
});

var _object = require('./object');

Object.defineProperty(exports, 'ObjectCommand', {
  enumerable: true,
  get: function get() {
    return _object.ObjectCommand;
  }
});

var _mouse = require('./mouse');

Object.defineProperty(exports, 'MouseCommand', {
  enumerable: true,
  get: function get() {
    return _mouse.MouseCommand;
  }
});

var _touch = require('./touch');

Object.defineProperty(exports, 'TouchCommand', {
  enumerable: true,
  get: function get() {
    return _touch.TouchCommand;
  }
});

var _media = require('./media');

Object.defineProperty(exports, 'MediaCommand', {
  enumerable: true,
  get: function get() {
    return _media.MediaCommand;
  }
});

var _frame = require('./frame');

Object.defineProperty(exports, 'FrameCommand', {
  enumerable: true,
  get: function get() {
    return _frame.FrameCommand;
  }
});

var _photo = require('./photo');

Object.defineProperty(exports, 'PhotoCommand', {
  enumerable: true,
  get: function get() {
    return _photo.PhotoCommand;
  }
});

var _video = require('./video');

Object.defineProperty(exports, 'VideoCommand', {
  enumerable: true,
  get: function get() {
    return _video.VideoCommand;
  }
});

var _audio = require('./audio');

Object.defineProperty(exports, 'AudioCommand', {
  enumerable: true,
  get: function get() {
    return _audio.AudioCommand;
  }
});

var _command = require('./command');

Object.defineProperty(exports, 'Command', {
  enumerable: true,
  get: function get() {
    return _command.Command;
  }
});

},{"./audio":1,"./camera":3,"./command":4,"./frame":5,"./keyboard":7,"./media":8,"./mouse":9,"./object":10,"./orientation":11,"./photo":12,"./sphere":13,"./touch":14,"./triangle":15,"./video":16}],7:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyboardCommand = exports.mappings = undefined;

var _command = require('./command');

var _utils = require('../utils');

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _domEvents = require('dom-events');

var _domEvents2 = _interopRequireDefault(_domEvents);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Keyboard function.
 *
 * @see KeyboardCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(KeyboardCommand, [null].concat(args)))();
};

/**
 * Alias key mappings.
 *
 * @public
 * @const
 * @type {Object}
 */

var mappings = exports.mappings = {
  up: ['up', 'w', 'k'],
  down: ['down', 's', 'j'],
  left: ['left', 'a', 'h'],
  right: ['right', 'd', 'l'],
  control: ['control', 'right command', 'left command', 'right control', 'left control', 'super', 'ctrl', 'alt', 'fn'],

  on: function on(which, keys) {
    return this[which].map(function (key) {
      return keys[key] = true;
    });
  },
  off: function off(which, keys) {
    return this[which].map(function (key) {
      return keys[key] = false;
    });
  },
  value: function value(which, keys) {
    return this[which].some(function (key) {
      return Boolean(keys[key]);
    });
  }
};

/**
 * KeyboardCommand class
 *
 * @public
 * @class KeyboardCommand
 * @extends Command
 */

var KeyboardCommand = exports.KeyboardCommand = function (_Command) {
  _inherits(KeyboardCommand, _Command);

  /**
   * KeyboardCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?) opts
   */

  function KeyboardCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, KeyboardCommand);

    var _this = _possibleConstructorReturn(this, (KeyboardCommand.__proto__ || Object.getPrototypeOf(KeyboardCommand)).call(this, function (_, block) {
      if ('function' == typeof block) {
        block(_this);
      }
    }));

    ctx.on('blur', function () {
      (0, _raf2.default)(function () {
        return _this.reset();
      });
    });

    /**
     * Keyboard state.
     *
     * @private
     * @type {Object}
     */

    var state = {
      keycodes: {},
      keys: {}
    };

    /**
     * Key codes map getter.
     *
     * @getter
     * @type {Object}
     */

    (0, _utils.define)(_this, 'keycodes', { get: function get() {
        return state.keycodes;
      } });

    /**
     * Key names map getter.
     *
     * @getter
     * @type {Object}
     */

    (0, _utils.define)(_this, 'keys', { get: function get() {
        return state.keys;
      } });

    /**
     * Predicate to determine if
     * any key is pressed.
     *
     * @getter
     * @type {Boolean}
     */

    (0, _utils.define)(_this, 'isKeydown', {
      get: function get() {
        return Object.keys(state.keys).some(function (key) {
          return state.keys[key];
        });
      }
    });

    /**
     * Resets keyboard state by setting all keycodes
     * and keys to `false'.
     *
     * @public
     * @return {KeyboardCommand}
     */

    _this.reset = function () {
      for (var code in state.keycodes) {
        state.keycodes[code] = false;
      }

      for (var key in state.keys) {
        state.keys[key] = false;
      }
      return _this;
    };

    // update keydown states
    _domEvents2.default.on(document, 'keydown', function (e) {
      if (false == ctx.hasFocus) return;
      var code = e.which || e.keyCode || e.charCode;
      if (null != code) {
        // set key code
        state.keycodes[code] = true;
        // set key name
        state.keys[(0, _keycode2.default)(code)] = true;
      }
    }, false);

    // update keyup states
    _domEvents2.default.on(document, 'keyup', function (e) {
      if (false == ctx.hasFocus) return;
      var code = e.which || e.keyCode || e.charCode;
      if (null != code) {
        // set key code
        state.keycodes[code] = false;
        // set key name
        state.keys[(0, _keycode2.default)(code)] = false;
      }
    });
    return _this;
  }

  return KeyboardCommand;
}(_command.Command);

},{"../utils":28,"./command":4,"dom-events":34,"keycode":188,"raf":197}],8:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MediaCommand = undefined;

var _utils = require('../utils');

var _events = require('events');

var _object = require('./object');

var _resl = require('resl');

var _resl2 = _interopRequireDefault(_resl);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * reload timeout in milliseconds.
 *
 * @private
 * @type {Number}
 */

var reload_TIMEOUT = 1000;

/**
 * No-op to return undefined
 *
 * @private
 * @type {Function}
 */

var noop = function noop() {
  return void 0;
};

/**
 * MediaCommand constructor.
 * @see MediaCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(MediaCommand, [null].concat(args)))();
};

/**
 * MediaCommand class.
 *
 * @public
 * @class MediaCommand
 * @extends Command
 */

var MediaCommand = exports.MediaCommand = function (_ObjectCommand) {
  _inherits(MediaCommand, _ObjectCommand);

  /**
   * MediaCommand class constructor that loads
   * resources from a given manifest using resl
   *
   * @constructor
   * @param {Object} ctx
   * @param {Object} manifest
   * @param {(Object)?} initialState
   */

  function MediaCommand(ctx, manifest) {
    var initialState = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, MediaCommand);

    var timeout = reload_TIMEOUT;
    var hasProgress = false;
    var isLoading = false;
    var hasError = false;
    var isDoneLoading = false;

    // load when called as a function

    // mixin and initialize EventEmitter
    var _this = _possibleConstructorReturn(this, (MediaCommand.__proto__ || Object.getPrototypeOf(MediaCommand)).call(this, ctx, {
      render: function render() {
        return _this.read();
      },
      draw: function draw() {
        return _this.read();
      }
    }));

    _events.EventEmitter.call(_this);
    Object.assign(_this, _events.EventEmitter.prototype);
    _this.setMaxListeners(Infinity);

    // preload unless otherwise specified
    if (initialState && false !== initialState.preload) {
      (0, _raf2.default)(function () {
        return _this.load();
      });
    }

    /**
     * Manifest object getter.
     *
     * @type {Object}
     */

    (0, _utils.define)(_this, 'manifest', { get: function get() {
        return manifest;
      } });

    /**
     * Boolean predicate to indicate if media has
     * completed loaded enough data. All data may not be
     * loaded if media is a streaming source.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    (0, _utils.define)(_this, 'isDoneLoading', { get: function get() {
        return isDoneLoading;
      } });

    /**
     * Boolean predicate to indicate if media has
     * load progress.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    (0, _utils.define)(_this, 'hasProgress', { get: function get() {
        return hasProgress;
      } });

    /**
     * Boolean predicate to indicate if media has
     * begun loading.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    (0, _utils.define)(_this, 'isLoading', { get: function get() {
        return isLoading;
      } });

    /**
     * Boolean predicate to indicate if media loading
     * encountered an error.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    (0, _utils.define)(_this, 'hasError', { get: function get() {
        return hasError;
      } });

    /**
     * Boolean predicate to indicate if media has
     * has data to read from.
     *
     * @public
     * @getter
     * @type {Boolean}
     */

    (0, _utils.define)(_this, 'hasData', {
      get: function get() {
        return !hasError && (isDoneLoading || hasProgress);
      }
    });

    /**
     * Updates media state with
     * new manifest object. This function
     * merges an input manifest with the existing.
     *
     * @param {Object} newManifest
     * @return {MediaCommand}
     */

    _this.update = function (newManifest) {
      Object.assign(manifest, newManifest);
      return _this;
    };

    /**
     * Calls an abstract _read() method.
     *
     * @return {MediaCommand}
     */

    _this.read = function () {
      _this._read();
      return _this;
    };

    /**
     * Abstract reader method.
     *
     * @return {MediaCommand}
     */

    _this._read = function () {
      return _this;
    };

    /**
     * Begins loading of resources described in
     * the manifest object.
     *
     * @public
     * @return {Boolean}
     */

    _this.load = function () {
      if (isLoading || hasProgress || hasError || isDoneLoading) {
        return false;
      }

      // retry timeout
      setTimeout(function () {
        if (hasError || hasProgress && isLoading && !isDoneLoading) {
          (0, _utils.debug)('retrying....');
          _this.reload();
        }
      }, reload_TIMEOUT);

      isLoading = true;
      (0, _raf2.default)(function () {
        return (0, _resl2.default)({
          manifest: manifest,

          onDone: function onDone() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            isDoneLoading = true;
            void (_this.onloaded || noop).apply(undefined, args);
            _this.emit.apply(_this, ['load'].concat(args));
          },

          onError: function onError() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            hasError = true;
            isDoneLoading = true;
            void (_this.onerror || noop).apply(undefined, args);
            _this.emit.apply(_this, ['error'].concat(args));
          },

          onProgress: function onProgress() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
            }

            hasProgress = true;
            isDoneLoading = false;
            void (_this.onprogress || noop).apply(undefined, args);
            _this.emit.apply(_this, ['progress'].concat(args));
          }
        });
      });

      return true;
    };

    /**
     * Resets state and reloads resources.
     *
     * @public
     * @return {MediaCommand}
     */

    _this.reload = function () {
      _this.reset();
      _this.load();
      return _this;
    };

    /**
     * Resets state.
     *
     * @public
     * @return {MediaCommand}
     */

    _this.reset = function () {
      isDoneLoading = false;
      hasProgress = false;
      isLoading = false;
      hasError = false;
      return _this;
    };

    /**
     * Sets the timeout for loading of the media.
     *
     * @public
     * @param {Number} timeout
     * @return {MediaCommand}
     */

    _this.setTimeout = function (value) {
      timeout = value;
      return _this;
    };
    return _this;
  }

  return MediaCommand;
}(_object.ObjectCommand);

},{"../utils":28,"./object":10,"events":35,"raf":197,"resl":199}],9:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MouseCommand = undefined;

var _mouseChange = require('mouse-change');

var _mouseChange2 = _interopRequireDefault(_mouseChange);

var _mouseWheel = require('mouse-wheel');

var _mouseWheel2 = _interopRequireDefault(_mouseWheel);

var _command = require('./command');

var _domEvents = require('dom-events');

var _domEvents2 = _interopRequireDefault(_domEvents);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Mouse function.
 *
 * @see MouseCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(MouseCommand, [null].concat(args)))();
};

/**
 * MouseCommand class.
 *
 * @public
 * @class MouseCommand
 * @extends Command
 */

var MouseCommand = exports.MouseCommand = function (_Command) {
  _inherits(MouseCommand, _Command);

  /**
   * MouseCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?} opts
   */

  function MouseCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, MouseCommand);

    var _this = _possibleConstructorReturn(this, (MouseCommand.__proto__ || Object.getPrototypeOf(MouseCommand)).call(this, function (_, block) {
      if ('function' == typeof block) {
        block(_this);
      }
    }));

    ctx.on('blur', function () {
      _this.buttons = 0;
    });

    // focus/blur context on mouse down
    _domEvents2.default.on(document, 'mousedown', function (e) {
      if (e.target == ctx.domElement) {
        ctx.focus();
      } else {
        ctx.blur();
      }
    });

    /**
     * Count of buttons currently pressed.
     *
     * @type {Number}
     */

    _this.buttons = 0;

    /**
     * Previous X coordinate.
     *
     * @type {Number}
     */

    _this.prevX = 0;

    /**
     * Previous Y coordinate.
     *
     * @type {Number}
     */

    _this.prevY = 0;

    /**
     * Current X coordinate.
     *
     * @type {Number}
     */

    _this.currentX = 0;

    /**
     * Current Y coordinate.
     *
     * @type {Number}
     */

    _this.currentY = 0;

    /**
     * Delta between previous and.
     * current X coordinates.
     *
     * @type {Number}
     */

    _this.deltaX = 0;

    /**
     * Delta between previous and.
     * current Y coordinates.
     *
     * @type {Number}
     */

    _this.deltaY = 0;

    /**
     * The amount of scrolling vertically,
     * horizontally and depth-wise in pixels.
     *
     * @see https://www.npmjs.com/package/mouse-wheel
     */

    _this.wheel = {
      currentX: 0, currentY: 0,
      deltaX: 0, deltaY: 0,
      prevX: 0, prevY: 0
    };

    // update state on mouse change and reset
    // delta values on next animation frame
    (0, _mouseChange2.default)(ctx.domElement, function (buttons, x, y) {
      Object.assign(_this, {
        buttons: buttons,
        currentX: x,
        currentY: y,
        deltaX: x - _this.currentX,
        deltaY: y - _this.currentY,
        prevX: _this.currentX,
        prevY: _this.currentY
      });

      (0, _raf2.default)(function () {
        return Object.assign(_this, {
          deltaX: 0,
          deltaY: 0
        });
      });
    });

    // update mouse wheel deltas and then
    // reset them on the next animation frame
    (0, _mouseWheel2.default)(ctx.domElement, function (dx, dy, dz) {
      if (false === _this.allowWheel) {
        return;
      }
      Object.assign(_this.wheel, {
        currentX: _this.wheel.currentX + dx,
        currentY: _this.wheel.currentY + dy,
        currentZ: _this.wheel.currentZ + dz,
        deltaX: dx,
        deltaY: dy,
        deltaZ: dz,
        prevX: _this.wheel.currentX,
        prevY: _this.wheel.currentY,
        prevZ: _this.wheel.currentZ
      });

      (0, _raf2.default)(function () {
        return Object.assign(_this.wheel, {
          deltaX: 0,
          deltaY: 0,
          deltaZ: 0
        });
      });
    });
    return _this;
  }

  return MouseCommand;
}(_command.Command);

},{"./command":4,"dom-events":34,"mouse-change":189,"mouse-wheel":192,"raf":197}],10:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ObjectCommand = exports.DEFAULT_FRAGMENT_SHADER = exports.DEFAULT_VERTEX_SHADER = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _glslInjectDefines = require('glsl-inject-defines');

var _glslInjectDefines2 = _interopRequireDefault(_glslInjectDefines);

var _math = require('../math');

var _command = require('./command');

var _utils = require('../utils');

var _glslify = require('glslify');

var _glslify2 = _interopRequireDefault(_glslify);

var _glMat = require('gl-mat4');

var _glMat2 = _interopRequireDefault(_glMat);

var _glVec = require('gl-vec4');

var _glVec2 = _interopRequireDefault(_glVec);

var _glVec3 = require('gl-vec3');

var _glVec4 = _interopRequireDefault(_glVec3);

var _glQuat = require('gl-quat');

var _glQuat2 = _interopRequireDefault(_glQuat);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }return arr2;
  } else {
    return Array.from(arr);
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Default vertex shader for objects.
 *
 * @public
 * @const
 * @type {String}
 */

var DEFAULT_VERTEX_SHADER = exports.DEFAULT_VERTEX_SHADER = 'precision highp float;\n#define GLSLIFY 1\n\n/**\n * Shader uniforms.\n */\n\nuniform mat4 projection;\nuniform mat4 model;\nuniform mat4 view;\n\n/**\n * Shader IO.\n */\n\n#ifdef HAS_POSITIONS\nattribute vec3 position;\nvarying vec3 vposition;\n#endif\n\n#ifdef HAS_NORMALS\nattribute vec3 normal;\nvarying vec3 vnormal;\n#endif\n\n#ifdef HAS_UVS\nattribute vec2 uv;\nvarying vec2 vuv;\n#endif\n\n/**\n * Shader entry.\n */\n\nvoid main() {\n#ifdef HAS_POSITIONS\n  gl_Position = projection * view * model * vec4(position, 1.0);\n#elif defined HAS_NORMALS\n  gl_Position = projection * view * model * vec4(normal, 1.0);\n#elif defined HAS_UVS\n  gl_Position = projection * view * model * vec4(vec3(uv, 1.0), 1.0);\n#endif\n\n#ifdef HAS_POSITIONS\n  vposition = position;\n#endif\n\n#ifdef HAS_NORMALS\n  vnormal = normal;\n#endif\n\n#ifdef HAS_UVS\n  vuv = uv;\n#endif\n}\n';

/**
 * Default fragment shader for objects.
 *
 * @public
 * @const
 * @type {String}
 */

var DEFAULT_FRAGMENT_SHADER = exports.DEFAULT_FRAGMENT_SHADER = 'precision mediump float;\n#define GLSLIFY 1\n\n/**\n * Shader uniforms.\n */\n\nuniform vec4 color;\n\n#ifdef HAS_MAP\nuniform sampler2D map;\n#endif\n\n/**\n * Shader IO.\n */\n\n#ifdef HAS_POSITIONS\nvarying vec3 vposition;\n#endif\n\n#ifdef HAS_NORMALS\nvarying vec3 vnormal;\n#endif\n\n#ifdef HAS_UVS\nvarying vec2 vuv;\n#endif\n\n/**\n * Shader entry.\n */\n\nvoid main() {\n#ifdef HAS_MAP\n#ifdef HAS_UVS\n  gl_FragColor = vec4(texture2D(map, vuv).rgb, 1.0);\n#else\n  gl_FragColor = color;\n#endif\n#else\n  gl_FragColor = color;\n#endif\n}\n';

/**
 * Current object command counter.
 *
 * @type {Number}
 */

var OBJECT_COMMAND_COUNTER = 0;

/**
 * ObjectCommand constructor.
 * @see ObjectCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(ObjectCommand, [null].concat(args)))();
};

/**
 * ObjectCommand class.
 *
 * @public
 * @class ObjectCommand
 * @extends Command
 */

var ObjectCommand = exports.ObjectCommand = function (_Command) {
  _inherits(ObjectCommand, _Command);

  _createClass(ObjectCommand, null, [{
    key: 'id',

    /**
     * Returns the next object ID
     *
     * @public
     * @static
     * @return {Number}
     */

    value: function id() {
      return OBJECT_COMMAND_COUNTER++;
    }

    /**
     * ObjectCommand class constructor.
     *
     * @param {Context} ctx
     * @param {Object} opts
     */

  }]);

  function ObjectCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, ObjectCommand);

    var defaults = _extends({}, opts.defaults);
    var _model = _glMat2.default.identity([]);

    var render = null;
    var draw = opts.draw || null;
    var map = opts.map || null;

    /**
     * Updates state and internal matrices.
     *
     * @private
     * @param {(Object)?} state
     */

    var update = function update(state) {
      if ('scale' in state) {
        _glVec4.default.copy(_this.scale, state.scale);
      }

      if ('position' in state) {
        _glVec4.default.copy(_this.position, state.position);
      }

      if ('rotation' in state) {
        _glQuat2.default.copy(_this.rotation, state.rotation);
      }

      if ('color' in state) {
        _glVec2.default.copy(_this.color, state.color);
      }

      // update uniform model matrix
      _glMat2.default.identity(_model);
      _glMat2.default.multiply(_model, _model, _glMat2.default.fromQuat([], _this.rotation));
      _glMat2.default.translate(_model, _model, _this.position);
      _glMat2.default.scale(_model, _model, _this.scale);

      // apply and set contextual transform
      if (ctx.previous && ctx.previous.id != _this.id) {
        _glMat2.default.copy(_this.transform, _glMat2.default.multiply([], ctx.previous.transform, _model));
      } else {
        _glMat2.default.copy(_this.transform, _model);
      }

      // copy transform to uniform model matrix
      _glMat2.default.copy(_model, _this.transform);
    };

    /**
     * Configures object state. This function
     * may create a new render function from regl
     *
     * @private
     */

    var configure = function configure() {
      // reset draw function
      if (!opts.draw) {
        draw = null;
      }
      // use regl draw command if draw() function
      // was not provided
      if (!draw) {
        var geometry = opts.geometry || null;
        var elements = geometry ? geometry.primitive.cells : undefined;
        var attributes = _extends({}, opts.attributes);
        var shaderDefines = {};

        var uniforms = _extends({}, opts.uniforms, {
          color: function color() {
            return _this.color.elements;
          },
          model: function model() {
            return _model;
          }
        });

        defaults.count = opts.count || undefined;
        defaults.elements = opts.elements || elements || undefined;
        defaults.primitive = opts.primitive || 'triangles';

        if (geometry) {
          if (_this) {
            _this.geometry = geometry;
          }

          if (geometry.primitive.positions) {
            shaderDefines.HAS_POSITIONS = '';
            attributes.position = geometry.primitive.positions;
          }

          if (geometry.primitive.normals) {
            shaderDefines.HAS_NORMALS = '';
            attributes.normal = geometry.primitive.normals;
          }

          if (geometry.primitive.uvs) {
            shaderDefines.HAS_UVS = '';
            attributes.uv = geometry.primitive.uvs;
          }
        }

        if (map && map.texture) {
          uniforms.map = function () {
            if (map && map.texture) {
              if ('function' == typeof map) {
                map();
              }
              return map.texture;
            }

            return null;
          };
        } else if (map) {
          map.once('load', function () {
            return configure();
          });
        }

        if (!opts.primitive && opts.wireframe) {
          opts.primitive = 'lines';
        }

        var reglOptions = _extends({}, opts.regl, {
          uniforms: uniforms,
          attributes: attributes,
          vert: opts.vert || DEFAULT_VERTEX_SHADER,
          frag: opts.frag || DEFAULT_FRAGMENT_SHADER,
          count: null == opts.count ? undefined : ctx.regl.prop('count'),
          elements: null == elements ? undefined : ctx.regl.prop('elements'),
          primitive: function primitive() {
            if (_this.wireframe) {
              return 'line loop';
            } else {
              return defaults.primitive;
            }
          }
        });

        if (uniforms.map) {
          shaderDefines.HAS_MAP = '';
        }

        reglOptions.frag = (0, _glslInjectDefines2.default)(reglOptions.frag, shaderDefines);
        reglOptions.vert = (0, _glslInjectDefines2.default)(reglOptions.vert, shaderDefines);

        for (var key in reglOptions) {
          if (undefined == reglOptions[key]) {
            delete reglOptions[key];
          }
        }

        draw = ctx.regl(reglOptions);
      }

      // configure render command
      render = opts.render || function (_, state) {
        var next = arguments.length <= 2 || arguments[2] === undefined ? function () {
          return void 0;
        } : arguments[2];

        var args = null;

        ctx.push(_this);

        if ('function' == typeof state) {
          args = [_extends({}, defaults)];
          next = state;
        } else if (Array.isArray(state)) {
          args = [state.map(function (o) {
            return Object.assign(_extends({}, defaults), o);
          })];
        } else {
          args = [_extends({}, defaults, state)];
        }

        if (opts.before) {
          opts.before.apply(opts, _toConsumableArray(args));
        }

        update.apply(undefined, _toConsumableArray(args));
        draw.apply(undefined, _toConsumableArray(args));
        next.apply(undefined, _toConsumableArray(args));

        if (opts.after) {
          opts.after.apply(opts, _toConsumableArray(args));
        }

        ctx.pop();
      };
    };

    // initial configuration
    configure();

    // calls current target  render function

    /**
     * Object ID.
     *
     * @type {Number}
     */

    var _this = _possibleConstructorReturn(this, (ObjectCommand.__proto__ || Object.getPrototypeOf(ObjectCommand)).call(this, function () {
      return render.apply(undefined, arguments);
    }));

    _this.id = opts.id || ObjectCommand.id();

    /**
     * Object type name.
     *
     * @type {String}
     */

    _this.type = opts.type || 'object';

    /**
     * Object scale vector.
     *
     * @type {Vector}
     */

    _this.scale = opts.scale ? new (Function.prototype.bind.apply(_math.Vector, [null].concat(_toConsumableArray(opts.scale))))() : new _math.Vector(1, 1, 1);

    /**
     * Object scale vector.
     *
     * @type {Vector}
     */

    _this.position = opts.position ? new (Function.prototype.bind.apply(_math.Vector, [null].concat(_toConsumableArray(opts.position))))() : new _math.Vector(0, 0, 0);

    /**
     * Object rotation quaternion
     *
     * @type {Quaternion}
     */

    _this.rotation = opts.rotation ? new (Function.prototype.bind.apply(_math.Quaternion, [null].concat(_toConsumableArray(opts.rotation))))() : new _math.Quaternion();

    /**
     * Object transform matrix
     *
     * @type {Array}
     */

    _this.transform = _glMat2.default.identity([]);

    /**
     * Boolean to indicate if object should be drawn
     * with a line primitive.
     *
     * @type {Boolean}
     */

    _this.wireframe = false;

    /**
     * Object color property.
     *
     * @type {Vector}
     */

    _this.color = opts.color ? new (Function.prototype.bind.apply(_math.Vector, [null].concat(_toConsumableArray(opts.color))))() : new _math.Vector(197 / 255, 148 / 255, 149 / 255, 1.0);

    /**
     * Object map if given.
     *
     * @type {Media}
     */

    (0, _utils.define)(_this, 'map', {
      get: function get() {
        return map;
      },
      set: function set(value) {
        if (value && value.texture) {
          map = value;
          configure();
        } else if (null == value) {
          map = null;
          configure();
        }
      }
    });
    return _this;
  }

  return ObjectCommand;
}(_command.Command);

},{"../math":23,"../utils":28,"./command":4,"gl-mat4":47,"gl-quat":72,"gl-vec3":129,"gl-vec4":159,"glsl-inject-defines":177,"glslify":187}],11:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OrientationCommand = undefined;

var _command = require('./command');

var _utils = require('../utils');

var _domEvents = require('dom-events');

var _domEvents2 = _interopRequireDefault(_domEvents);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Global orientation state object.
 *
 * @private
 */

var globalState = {
  absolute: null,

  currentAlpha: 0, // z
  currentBeta: 0, // x
  currentGamma: 0, // y

  deltaAlpha: 0,
  deltaBeta: 0,
  deltaGamma: 0,

  prevAlpha: 0,
  prevBeta: 0,
  prevGamma: 0
};

// update global device orientation state
_domEvents2.default.on(window, 'deviceorientation', function (e) {
  // ZXY
  var alpha = e.alpha;
  var beta = e.beta;
  var gamma = e.gamma;
  var absolute = e.absolute;

  Object.assign(globalState, {
    absolute: absolute,

    currentAlpha: alpha,
    currentBeta: beta,
    currentGamma: gamma,

    deltaAlpha: alpha - globalState.currentAlpha,
    deltaBeta: beta - globalState.currentBeta,
    deltaGamma: gamma - globalState.currentGamma,

    prevAlpha: globalState.currentAlpha,
    prevBeta: globalState.currentBeta,
    prevGamma: globalState.currentGamma
  });

  (0, _raf2.default)(function () {
    return Object.assign(globalState, {
      deltaAlpha: 0,
      deltaBeta: 0,
      deltaGamma: 0
    });
  });
});

/**
 * Orientation function.
 *
 * @see OrientationCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(OrientationCommand, [null].concat(args)))();
};

/**
 * OrientationCommand class
 *
 * @public
 * @class OrientationCommand
 * @extends Command
 */

var OrientationCommand = exports.OrientationCommand = function (_Command) {
  _inherits(OrientationCommand, _Command);

  /**
   * OrientationCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?) opts
   */

  function OrientationCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, OrientationCommand);

    /**
     * Orientation state.
     *
     * @private
     * @type {Object}
     */

    var state = {
      absolute: null,

      currentAlpha: 0, // z
      currentBeta: 0, // x
      currentGamma: 0, // y

      deltaAlpha: 0,
      deltaBeta: 0,
      deltaGamma: 0,

      prevAlpha: 0,
      prevBeta: 0,
      prevGamma: 0
    };

    var _this = _possibleConstructorReturn(this, (OrientationCommand.__proto__ || Object.getPrototypeOf(OrientationCommand)).call(this, function (_, block) {
      Object.assign(state, globalState);
      if ('function' == typeof block) {
        block(_this);
      }
    }));

    var _loop = function _loop(prop) {
      (0, _utils.define)(_this, prop, { get: function get() {
          return state[prop];
        } });
    };

    for (var prop in state) {
      _loop(prop);
    }

    /**
     * Resets current state
     *
     * @public
     * @return {OrientationCommand}
     */

    _this.reset = function () {
      for (var _prop in state) {
        if ('number' == typeof state[_prop]) {
          state[_prop] = 0;
        } else {
          state[_prop] = null;
        }
      }
      return _this;
    };
    return _this;
  }

  return OrientationCommand;
}(_command.Command);

},{"../utils":28,"./command":4,"dom-events":34,"raf":197}],12:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoCommand = undefined;

var _utils = require('../utils');

var _media = require('./media');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * PhotoCommand constructor.
 * @see PhotoCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(PhotoCommand, [null].concat(args)))();
};

/**
 * PhotoCommand class.
 *
 * @public
 * @class PhotoCommand
 * @extends MediaCommand
 */

var PhotoCommand = exports.PhotoCommand = function (_MediaCommand) {
  _inherits(PhotoCommand, _MediaCommand);

  /**
   * PhotoCommand class constructor.
   *
   * @constructor
   * @param {Context} ctx
   * @param {String} src
   * @param {(Object)?} initialState
   */

  function PhotoCommand(ctx, src) {
    var initialState = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, PhotoCommand);

    var source = null;

    var manifest = {
      image: {
        stream: true,
        type: 'image',
        src: src
      }
    };

    /**
     * Sets an internal photo source property
     * value. This function is used
     * to proxy a class method to a photo
     * element property
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {PhotoCommand|Mixed}
     */

    var _this = _possibleConstructorReturn(this, (PhotoCommand.__proto__ || Object.getPrototypeOf(PhotoCommand)).call(this, ctx, manifest, initialState));

    var set = function set(property, value) {
      if (source) {
        if (undefined === value) {
          return source[property];
        } else {
          (0, _utils.debug)('PhotoCommand: set %s=%s', property, value);
          source[property] = value;
        }
      } else {
        _this.once('load', function () {
          _this[property] = value;
        });
      }
      return _this;
    };

    /**
     * Source attribute accessor.
     *
     * @type {String}
     */

    (0, _utils.define)(_this, 'src', {
      get: function get() {
        return source && source.src ? source.src : _this.manifest && _this.manifest.image ? _this.manifest.image.src : null;
      },

      set: function set(value) {
        if (source && 'string' == typeof value) {
          source.src = value;
          if (_this.manifest && _this.manifest.image) {
            _this.manifest.image.src = value;
            _this.reset();
            _this.load();
          }
        }
      }
    });

    /**
     * Photo texture target.
     *
     * @type {REGLTexture}
     */

    _this.texture = null;

    /**
     * Callback when photo  has loaded.
     *
     * @type {Function}
     */

    _this.onloaded = function (_ref) {
      var image = _ref.image;

      source = image;
      _this.texture = ctx.regl.texture(image);
      _this.emit('load');
    };
    return _this;
  }

  return PhotoCommand;
}(_media.MediaCommand);

},{"../utils":28,"./media":8}],13:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SphereCommand = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _sphere = require('../geometry/sphere');

var _object = require('./object');

var _glMat = require('gl-mat4');

var _glMat2 = _interopRequireDefault(_glMat);

var _glslify = require('glslify');

var _glslify2 = _interopRequireDefault(_glslify);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * SphereCommand constructor.
 * @see SphereCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(SphereCommand, [null].concat(args)))();
};

/**
 * SphereCommand class.
 *
 * @public
 * @class SphereCommand
 * @extends ObjectCommand
 */

var SphereCommand = exports.SphereCommand = function (_ObjectCommand) {
  _inherits(SphereCommand, _ObjectCommand);

  function SphereCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SphereCommand);

    var geometry = new _sphere.SphereGeometry(opts);
    var defaults = {};
    var uniforms = {};

    return _possibleConstructorReturn(this, (SphereCommand.__proto__ || Object.getPrototypeOf(SphereCommand)).call(this, ctx, _extends({}, opts, {
      type: 'sphere',
      defaults: defaults,
      uniforms: uniforms,
      geometry: geometry
    })));
  }

  return SphereCommand;
}(_object.ObjectCommand);

},{"../geometry/sphere":20,"./object":10,"gl-mat4":47,"glslify":187}],14:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TouchCommand = undefined;

var _touchPosition = require('touch-position');

var _command = require('./command');

var _domEvents = require('dom-events');

var _domEvents2 = _interopRequireDefault(_domEvents);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Touch function.
 *
 * @see TouchCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(TouchCommand, [null].concat(args)))();
};

/**
 * TouchCommand class.
 *
 * @public
 * @class TouchCommand
 * @extends Command
 */

var TouchCommand = exports.TouchCommand = function (_Command) {
  _inherits(TouchCommand, _Command);

  /**
   * TouchCommand class constructor.
   *
   * @param {Context} ctx
   * @param {(Object)?} opts
   */

  function TouchCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, TouchCommand);

    var _this = _possibleConstructorReturn(this, (TouchCommand.__proto__ || Object.getPrototypeOf(TouchCommand)).call(this, function (_, block) {
      if ('function' == typeof block) {
        block(_this);
      }
    }));

    var touch = (0, _touchPosition.emitter)({ element: ctx.domElement });

    _domEvents2.default.on(ctx.domElement, 'touchstart', function (e) {
      var x = e.touches[0].clientX;
      var y = e.touches[0].clientY;
      e.preventDefault();
      Object.assign(_this, {
        touches: e.targetTouches,

        currentX: x,
        currentY: y,

        deltaX: 0,
        deltaY: 0,

        prevX: _this.currentX,
        prevY: _this.currentY
      });
    });

    _domEvents2.default.on(ctx.domElement, 'touchend', function (e) {
      e.preventDefault();
      Object.assign(_this, {
        touches: 0,

        currentX: 0,
        currentY: 0,

        deltaX: 0,
        deltaY: 0,

        prevX: 0,
        prevY: 0
      });
    });

    touch.on('move', function (t) {
      var x = t.clientX;
      var y = t.clientY;
      Object.assign(_this, {
        deltaX: x - _this.currentX,
        deltaY: y - _this.currentY
      });

      (0, _raf2.default)(function () {
        return Object.assign(_this, {
          deltaX: 0,
          deltaY: 0
        });
      });
    });

    /**
     * Current active touches
     *
     * @type {Number}
     */

    _this.touches = null;

    /**
     * Previous X coordinate.
     *
     * @type {Number}
     */

    _this.prevX = 0;

    /**
     * Previous Y coordinate.
     *
     * @type {Number}
     */

    _this.prevY = 0;

    /**
     * Current X coordinate.
     *
     * @type {Number}
     */

    _this.currentX = 0;

    /**
     * Current Y coordinate.
     *
     * @type {Number}
     */

    _this.currentY = 0;

    /**
     * Delta between previous and.
     * current X coordinates.
     *
     * @type {Number}
     */

    _this.deltaX = 0;

    /**
     * Delta between previous and.
     * current Y coordinates.
     *
     * @type {Number}
     */

    _this.deltaY = 0;
    return _this;
  }

  return TouchCommand;
}(_command.Command);

},{"./command":4,"dom-events":34,"raf":197,"touch-position":204}],15:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TriangleCommand = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _triangle = require('../geometry/triangle');

var _object = require('./object');

var _glslify = require('glslify');

var _glslify2 = _interopRequireDefault(_glslify);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

// @TODO(werle) - move this into a glsl file
var vert = '\nprecision mediump float;\n\nuniform mat4 projection;\nuniform mat4 model;\nuniform mat4 view;\n\nattribute vec2 position;\nvoid main() {\n  gl_Position = projection * view * model * vec4(position, 0.0, 1.0);\n}\n';

/**
 * TriangleCommand constructor.
 * @see TriangleCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(TriangleCommand, [null].concat(args)))();
};

/**
 * TriangleCommand class.
 *
 * @public
 * @class TriangleCommand
 * @extends Command
 */

var TriangleCommand = exports.TriangleCommand = function (_ObjectCommand) {
  _inherits(TriangleCommand, _ObjectCommand);

  function TriangleCommand(ctx) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, TriangleCommand);

    var geometry = new _triangle.TriangleGeometry(opts.geometry);
    var uniforms = {};
    var defaults = {};

    return _possibleConstructorReturn(this, (TriangleCommand.__proto__ || Object.getPrototypeOf(TriangleCommand)).call(this, ctx, _extends({}, opts, {
      type: 'triangle',
      defaults: defaults,
      uniforms: uniforms,
      geometry: geometry,
      count: 3,
      vert: vert
    })));
  }

  return TriangleCommand;
}(_object.ObjectCommand);

},{"../geometry/triangle":21,"./object":10,"glslify":187}],16:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VideoCommand = undefined;

var _utils = require('../utils');

var _media = require('./media');

var _domEvents = require('dom-events');

var _domEvents2 = _interopRequireDefault(_domEvents);

var _clamp = require('clamp');

var _clamp2 = _interopRequireDefault(_clamp);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * VideoCommand constructor.
 * @see VideoCommand
 */

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(VideoCommand, [null].concat(args)))();
};

/**
 * VideoCommand class.
 *
 * @public
 * @extends MediaCommand
 */

var VideoCommand = exports.VideoCommand = function (_MediaCommand) {
  _inherits(VideoCommand, _MediaCommand);

  /**
   * VideoCommand class constructor.
   *
   * @constructor
   * @param {Context} ctx
   * @param {String} src
   * @param {(Object)?} initialState
   */

  function VideoCommand(ctx, src) {
    var initialState = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, VideoCommand);

    var source = null;
    var volume = 0;
    var isMuted = false;
    var isPaused = true;
    var isPlaying = false;

    var manifest = {
      video: {
        stream: true,
        type: 'video',
        src: src
      }
    };

    /**
     * Calls internal video source method
     * with arguments. This function is used
     * to proxy a class method to a video
     * element method.
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {VideoCommand}
     */

    var call = function call(method) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (source) {
        var _source;

        (0, _utils.debug)('VideoCommand: call %s(%j)', method, args);
        (_source = source)[method].apply(_source, args);
      } else {
        _this.once('load', function () {
          return _this[method].apply(_this, args);
        });
      }
      return _this;
    };

    /**
     * Sets an internal video source property
     * value. This function is used
     * to proxy a class method to a video
     * element property
     *
     * @private
     * @param {String} method
     * @param {...Mixed} args
     * @return {VideoCommand|Mixed}
     */

    var set = function set(property, value) {
      if (source) {
        if (undefined === value) {
          return source[property];
        } else {
          (0, _utils.debug)('VideoCommand: set %s=%s', property, value);
          source[property] = value;
        }
      } else {
        _this.once('load', function () {
          _this[property] = value;
        });
      }
      return _this;
    };

    /**
     * Emits an event on the instance.
     *
     * @private
     * @param {String} event
     * @param {...Mixed} args
     * @return {VideoCommand}
     */

    var emit = function emit(event) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      _this.emit.apply(_this, [event].concat(args));
      return _this;
    };

    // set initial video state
    var _this = _possibleConstructorReturn(this, (VideoCommand.__proto__ || Object.getPrototypeOf(VideoCommand)).call(this, ctx, manifest, initialState));

    _this.once('load', function () {
      // set initial set on source
      Object.assign(source, initialState);

      var proxy = function proxy(event, override) {
        _domEvents2.default.on(source, event, function () {
          for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          emit.apply(undefined, [override || event].concat(args));
        });
      };

      // proxy source events

      var _loop = function _loop(key) {
        if (key.match(/^on[a-z]/)) {
          proxy(key.replace(/^on/, ''));
          (0, _utils.define)(_this, key, {
            get: function get() {
              return source[key];
            },
            set: function set(value) {
              return source[key] = value;
            }
          });
        }
      };

      for (var key in HTMLVideoElement.prototype) {
        _loop(key);
      }

      volume = source.volume;
      isMuted = source.muted;
      isPlaying = source.paused;
    });

    // set to playing state
    _this.on('playing', function () {
      isPlaying = true;
      isPaused = false;
    });

    // set to paused state
    _this.on('pause', function () {
      isPlaying = false;
      isPaused = true;
    });

    // set volume mute state
    _this.on('mute', function () {
      isMuted = true;
    });

    _this.on('unmute', function () {
      isMuted = false;
    });

    /**
     * Source attribute accessor.
     *
     * @type {String}
     */

    (0, _utils.define)(_this, 'src', {
      get: function get() {
        return source && source.src ? source.src : _this.manifest && _this.manifest.video ? _this.manifest.video.src : null;
      },

      set: function set(value) {
        if (source && 'string' == typeof value) {
          source.src = value;
          if (_this.manifest && _this.manifest.video) {
            _this.manifest.video.src = value;
            _this.reset();
            _this.load();
          }
        }
      }
    })

    // proxy all configurable video properties that serve
    // some kind of real purpose
    // @TODO(werle) - support text tracks
    ;['playbackRate', 'currentTime', 'crossOrigin', 'currentSrc', 'duration', 'seekable', 'volume', 'paused', 'played', 'prefix', 'poster', 'title', 'muted', 'loop'].map(function (property) {
      return (0, _utils.define)(_this, property, {
        get: function get() {
          return source[property];
        },
        set: function set(value) {
          source[property] = value;
        }
      });
    });

    // proxy dimensions
    (0, _utils.define)(_this, 'width', { get: function get() {
        return source.videoWidth;
      } });
    (0, _utils.define)(_this, 'height', { get: function get() {
        return source.videoHeight;
      } });
    (0, _utils.define)(_this, 'aspectRatio', {
      get: function get() {
        return source.videoWidth / source.videoHeight;
      }
    });

    // expose DOM element
    (0, _utils.define)(_this, 'domElement', { get: function get() {
        return source;
      } });

    /**
     * Video texture target.
     *
     * @type {REGLTexture}
     */

    _this.texture = null;

    /**
     * Plays the video.
     *
     * @return {VideoCommand}
     */

    _this.play = function () {
      return call('play');
    };

    /**
     * Pauses the video.
     *
     * @return {VideoCommand}
     */

    _this.pause = function () {
      return call('pause');
    };

    /**
     * Mutes the video
     *
     * @return {VideoCommand}
     */

    _this.mute = function () {
      return set('muted', true) && emit('mute');
    };

    /**
     * Unutes the video
     *
     * @return {VideoCommand}
     */

    _this.unmute = function () {
      return set('muted', false) && emit('unmute');
    };

    /**
     * Callback when video  has loaded.
     *
     * @type {Function}
     */

    _this.onloaded = function (_ref) {
      var video = _ref.video;

      source = video;
      _this.texture = ctx.regl.texture({
        mag: 'linear',
        min: 'linear',
        wrap: ['clamp', 'clamp'],
        data: video
      });

      _this.emit('load');

      var lastRead = 0;
      _this._read = function () {
        var now = Date.now();
        if (isPlaying && now - lastRead >= 64 && _this.isDoneLoading && video.readyState >= video.HAVE_ENOUGH_DATA) {
          lastRead = now;
          (0, _utils.debug)('VideoCommand: read');
          _this.texture(video);
        }
      };
    };
    return _this;
  }

  return VideoCommand;
}(_media.MediaCommand);

},{"../utils":28,"./media":8,"clamp":30,"dom-events":34,"raf":197}],17:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof2 = typeof Symbol === "function" && _typeof3(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof3(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof3(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandContext = exports.defaults = undefined;

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};
// @TODO(werle) - consider using multi-regl


/**
 * Module symbols.
 */

var _events = require('events');

var _domEvents = require('dom-events');

var _domEvents2 = _interopRequireDefault(_domEvents);

var _glslify = require('glslify');

var _glslify2 = _interopRequireDefault(_glslify);

var _regl = require('regl');

var _regl2 = _interopRequireDefault(_regl);

var _symbols = require('./symbols');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Context class defaults.
 *
 * @public
 * @const
 * @type {Object}
 */

var defaults = exports.defaults = {
  clear: {
    // @TODO(werle) - use a color module
    color: [17 / 255, 17 / 255, 17 / 255, 1],
    depth: 1
  }
};

/**
 * Creates a new Context instance with
 * sane defaults.
 *
 * @param {Object} opts
 */

exports.default = function (opts) {
  return new CommandContext(_extends({}, defaults, opts));
};

/**
 * CommandContext class.
 *
 * @public
 * @class CommandContext
 * @extends EventEmitter
 */

var CommandContext = exports.CommandContext = function (_EventEmitter) {
  _inherits(CommandContext, _EventEmitter);

  /**
   * CommandContext class constructor.
   *
   * @param {(Object)?} initialState
   * @param {(Object)?} opts
   */

  function CommandContext() {
    var initialState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, CommandContext);

    var _this = _possibleConstructorReturn(this, (CommandContext.__proto__ || Object.getPrototypeOf(CommandContext)).call(this));

    var reglOptions = _extends({}, opts.regl);
    if (opts.element && 'CANVAS' == opts.element.nodeName) {
      reglOptions.canvas = opts.element;
    } else if (opts.element && opts.element.nodeName) {
      reglOptions.container = opts.element;
    } else if ('string' == typeof opts.element) {
      reglOptions.container = opts.element;
    }

    reglOptions.stencil = {
      enable: true
    };

    _this[_symbols.$regl] = (0, _regl2.default)(opts.regl);
    _this[_symbols.$stack] = [];
    _this[_symbols.$state] = initialState;
    _this[_symbols.$current] = null;
    _this[_symbols.$previous] = null;
    _this[_symbols.$hasFocus] = false;
    _this[_symbols.$domElement] = _this[_symbols.$regl]._gl.canvas;

    _this.setMaxListeners(Infinity);

    _domEvents2.default.on(_this[_symbols.$domElement], 'focus', function () {
      return _this.focus();
    });
    _domEvents2.default.on(_this[_symbols.$domElement], 'blur', function () {
      return _this.blur();
    });
    _domEvents2.default.on(window, 'blur', function () {
      _this.blur();
    });
    return _this;
  }

  /**
   * Current command getter.
   *
   * @getter
   * @type {Command}
   */

  _createClass(CommandContext, [{
    key: 'focus',

    /**
     * Focuses context.
     *
     * @return {CommandContext}
     */

    value: function focus() {
      this[_symbols.$hasFocus] = true;
      this.emit('focus');
      return this;
    }

    /**
     * Blurs context.
     *
     * @return {CommandContext}
     */

  }, {
    key: 'blur',
    value: function blur() {
      this[_symbols.$hasFocus] = false;
      this.emit('blur');
      return this;
    }

    /**
     * Pushes command to context stack.
     *
     * @param {Command} command
     * @return {CommandContext}
     */

  }, {
    key: 'push',
    value: function push(command) {
      if ('function' == typeof command) {
        this[_symbols.$stack].push(command);
        this[_symbols.$previous] = this[_symbols.$current];
        this[_symbols.$current] = command;
      }
      return this;
    }

    /**
     * Pops tail of context command stack.
     *
     * @return {CommandContext}
     */

  }, {
    key: 'pop',
    value: function pop() {
      var command = this[_symbols.$stack].pop();
      this[_symbols.$current] = this[_symbols.$previous];
      this[_symbols.$previous] = this[_symbols.$stack][this[_symbols.$stack].length - 1];
      return command;
    }

    /**
     * Updates command context state.
     *
     * @param {Function|Block}
     * @return {CommandContext}
     */

  }, {
    key: 'update',
    value: function update(block) {
      if (block && 'object' == (typeof block === 'undefined' ? 'undefined' : _typeof(block))) {
        Object.assign(this[_symbols.$state], block);
      }
      return this;
    }

    /**
     * Clears the clear buffers in regl.
     *
     * @return {CommandContext}
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.regl.clear(this[_symbols.$state].clear);
      return this;
    }
  }, {
    key: 'current',
    get: function get() {
      return this[_symbols.$current];
    }

    /**
     * Previous command getter.
     *
     * @getter
     * @type {Command}
     */

  }, {
    key: 'previous',
    get: function get() {
      return this[_symbols.$previous];
    }

    /**
     * Current stack depth.
     *
     * @type {Number}
     */

  }, {
    key: 'depth',
    get: function get() {
      return this[_symbols.$stack].length;
    }

    /**
     * DOM element associated with this
     * command context.
     *
     * @getter
     * @type {Element}
     */

  }, {
    key: 'domElement',
    get: function get() {
      return this[_symbols.$domElement];
    }

    /**
     * Boolean indicating if context has
     * focus.
     *
     * @getter
     * @type {Boolean}
     */

  }, {
    key: 'hasFocus',
    get: function get() {
      return this[_symbols.$hasFocus];
    }

    /**
     * regl instance.
     *
     * @getter
     * @type {Function}
     */

  }, {
    key: 'regl',
    get: function get() {
      return this[_symbols.$regl];
    }

    /**
     * State object.
     *
     * @getter
     * @type {Object}
     */

  }, {
    key: 'state',
    get: function get() {
      return this[_symbols.$stack];
    }
  }]);

  return CommandContext;
}(_events.EventEmitter);

},{"./symbols":27,"dom-events":34,"events":35,"glslify":187,"regl":198}],18:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoxGeometry = undefined;

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _geo3dBox = require('geo-3d-box');

var _geo3dBox2 = _interopRequireDefault(_geo3dBox);

var _geometry = require('./geometry');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * BoxGeometry class.
 *
 * @public
 * @class BoxGeometry
 * @extends Geometry
 * @see https://www.npmjs.com/package/geo-3d-box
 */

var BoxGeometry = exports.BoxGeometry = function (_Geometry) {
  _inherits(BoxGeometry, _Geometry);

  /**
   * BoxGeometry class constructor.
   *
   * @param {(Object)?} opts
   * @param {(Number)?} opts.size
   * @param {(Number)?} opts.segments
   * @param {(Object)?} primitive
   */

  function BoxGeometry() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$size = _ref.size;
    var size = _ref$size === undefined ? 1 : _ref$size;
    var _ref$segments = _ref.segments;
    var segments = _ref$segments === undefined ? 2 : _ref$segments;
    var primitive = arguments[1];

    _classCallCheck(this, BoxGeometry);

    primitive = primitive || (0, _geo3dBox2.default)({ size: size, segments: segments });
    return _possibleConstructorReturn(this, (BoxGeometry.__proto__ || Object.getPrototypeOf(BoxGeometry)).call(this, { size: size, segments: segments, primitive: primitive }));
  }

  /**
   * Updates BoxGeometry state
   *
   * @return {BoxGeometry}
   */

  _createClass(BoxGeometry, [{
    key: 'update',
    value: function update() {
      var segments = this.segments;
      var size = this.size;
      this.primitive = (0, _geo3dBox2.default)({ size: size, segments: segments });
      return this;
    }
  }]);

  return BoxGeometry;
}(_geometry.Geometry);

},{"./geometry":19,"geo-3d-box":36}],19:[function(require,module,exports){
'use strict';

/**
 * Geometry class.
 *
 * @public
 * @class Geometry
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Geometry = exports.Geometry = function () {

  /**
   * Geometry class constructor.
   *
   * @param {(Object)?} initialState
   */

  function Geometry(initialState) {
    _classCallCheck(this, Geometry);

    Object.assign(this, initialState || {});
  }

  /**
   * Abstract update method to be overloaded
   */

  _createClass(Geometry, [{
    key: 'update',
    value: function update() {
      return this;
    }
  }]);

  return Geometry;
}();

},{}],20:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SphereGeometry = undefined;

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _primitiveSphere = require('primitive-sphere');

var _primitiveSphere2 = _interopRequireDefault(_primitiveSphere);

var _geometry = require('./geometry');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * SphereGeometry class.
 *
 * @public
 * @class SphereGeometry
 * @extends Geometry
 * @see https://www.npmjs.com/package/primitive-sphere
 */

var SphereGeometry = exports.SphereGeometry = function (_Geometry) {
  _inherits(SphereGeometry, _Geometry);

  /**
   * SphereGeometry class constructor.
   *
   * @param {(Object)?} opts
   * @param {(Number)?} opts.radius
   * @param {(Number)?} opts.segments
   * @param {(Object)?} primitive
   */

  function SphereGeometry() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$radius = _ref.radius;
    var radius = _ref$radius === undefined ? 1 : _ref$radius;
    var _ref$segments = _ref.segments;
    var segments = _ref$segments === undefined ? 128 : _ref$segments;
    var primitive = arguments[1];

    _classCallCheck(this, SphereGeometry);

    primitive = primitive || (0, _primitiveSphere2.default)(radius, { segments: segments });
    return _possibleConstructorReturn(this, (SphereGeometry.__proto__ || Object.getPrototypeOf(SphereGeometry)).call(this, { radius: radius, segments: segments, primitive: primitive }));
  }

  /**
   * Updates SphereGeometry state
   *
   * @return {SphereGeometry}
   */

  _createClass(SphereGeometry, [{
    key: 'update',
    value: function update() {
      var segments = this.segments;
      var radius = this.radius;
      this.primitive = (0, _primitiveSphere2.default)(radius, { segments: segments });
      return this;
    }
  }]);

  return SphereGeometry;
}(_geometry.Geometry);

},{"./geometry":19,"primitive-sphere":196}],21:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TriangleGeometry = undefined;

var _geometry = require('./geometry');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * TriangleGeometry class.
 *
 * @public
 * @class TriangleGeometry
 * @see https://www.npmjs.com/package/primitive-sphere
 */

var TriangleGeometry = exports.TriangleGeometry = function (_Geometry) {
  _inherits(TriangleGeometry, _Geometry);

  /**
   * TriangleGeometry class constructor.
   */

  function TriangleGeometry(primitive) {
    _classCallCheck(this, TriangleGeometry);

    primitive = primitive || {
      positions: [-0.0, +1.0, +1.0, -1.0, -1.0, -1.0],

      normals: [-0.00000, +0.57735, +0.57735, -0.57735, -0.57735, -0.57735],

      uvs: [-0.0, +1.0, +1.0, -1.0, -1.0, -1.0]
    };

    return _possibleConstructorReturn(this, (TriangleGeometry.__proto__ || Object.getPrototypeOf(TriangleGeometry)).call(this, { primitive: primitive }));
  }

  return TriangleGeometry;
}(_geometry.Geometry);

},{"./geometry":19}],22:[function(require,module,exports){
'use strict';

/**
 * Module exports.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Box = exports.Audio = exports.Video = exports.Photo = exports.Media = exports.Frame = exports.Touch = exports.Mouse = exports.Camera = exports.Sphere = exports.Object = exports.Triangle = exports.Keyboard = exports.Orientation = exports.Math = exports.Utils = exports.Context = exports.Command = undefined;

var _commands = require('./commands');

Object.defineProperty(exports, 'Command', {
  enumerable: true,
  get: function get() {
    return _commands.Command;
  }
});

var _context = require('./context');

Object.defineProperty(exports, 'Context', {
  enumerable: true,
  get: function get() {
    return _context.Context;
  }
});

var _utils = require('./utils');

var _Utils = _interopRequireWildcard(_utils);

var _math = require('./math');

var _Math = _interopRequireWildcard(_math);

var _orientation = require('./commands/orientation');

var _orientation2 = _interopRequireDefault(_orientation);

var _keyboard = require('./commands/keyboard');

var _keyboard2 = _interopRequireDefault(_keyboard);

var _triangle = require('./commands/triangle');

var _triangle2 = _interopRequireDefault(_triangle);

var _object = require('./commands/object');

var _object2 = _interopRequireDefault(_object);

var _sphere = require('./commands/sphere');

var _sphere2 = _interopRequireDefault(_sphere);

var _camera = require('./commands/camera');

var _camera2 = _interopRequireDefault(_camera);

var _mouse = require('./commands/mouse');

var _mouse2 = _interopRequireDefault(_mouse);

var _touch = require('./commands/touch');

var _touch2 = _interopRequireDefault(_touch);

var _frame = require('./commands/frame');

var _frame2 = _interopRequireDefault(_frame);

var _media = require('./commands/media');

var _media2 = _interopRequireDefault(_media);

var _photo = require('./commands/photo');

var _photo2 = _interopRequireDefault(_photo);

var _video = require('./commands/video');

var _video2 = _interopRequireDefault(_video);

var _audio = require('./commands/audio');

var _audio2 = _interopRequireDefault(_audio);

var _box = require('./commands/box');

var _box2 = _interopRequireDefault(_box);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

exports.Utils = _Utils;
exports.Math = _Math;

/**
 * Axis command API.
 */

exports.Orientation = _orientation2.default;
exports.Keyboard = _keyboard2.default;
exports.Triangle = _triangle2.default;
exports.Object = _object2.default;
exports.Sphere = _sphere2.default;
exports.Camera = _camera2.default;
exports.Mouse = _mouse2.default;
exports.Touch = _touch2.default;
exports.Frame = _frame2.default;
exports.Media = _media2.default;
exports.Photo = _photo2.default;
exports.Video = _video2.default;
exports.Audio = _audio2.default;
exports.Box = _box2.default;

},{"./commands":6,"./commands/audio":1,"./commands/box":2,"./commands/camera":3,"./commands/frame":5,"./commands/keyboard":7,"./commands/media":8,"./commands/mouse":9,"./commands/object":10,"./commands/orientation":11,"./commands/photo":12,"./commands/sphere":13,"./commands/touch":14,"./commands/triangle":15,"./commands/video":16,"./context":17,"./math":23,"./utils":28}],23:[function(require,module,exports){
'use strict';

/**
 * Module exports.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _quaternion = require('./quaternion');

Object.defineProperty(exports, 'Quaternion', {
  enumerable: true,
  get: function get() {
    return _quaternion.Quaternion;
  }
});

var _vector = require('./vector');

Object.defineProperty(exports, 'Vector', {
  enumerable: true,
  get: function get() {
    return _vector.Vector;
  }
});

},{"./quaternion":24,"./vector":25}],24:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Quaternion = undefined;

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _defined = require('defined');

var _defined2 = _interopRequireDefault(_defined);

var _glQuat = require('gl-quat');

var _glQuat2 = _interopRequireDefault(_glQuat);

var _vector = require('./vector');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * Quaternion class.
 *
 * @public
 * @class Quaternion
 * @extends Vector
 */

var Quaternion = exports.Quaternion = function (_Vector) {
  _inherits(Quaternion, _Vector);

  /**
   * Quaternion class constructor.
   *
   * @public
   * @constructor
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @param {Number} w
   */

  function Quaternion() {
    var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var z = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var w = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

    _classCallCheck(this, Quaternion);

    return _possibleConstructorReturn(this, (Quaternion.__proto__ || Object.getPrototypeOf(Quaternion)).call(this, (0, _defined2.default)(x, 0), (0, _defined2.default)(y, 0), (0, _defined2.default)(z, 0), (0, _defined2.default)(w, 1)));
  }

  /**
   * Rotates target at given orientation.
   *
   * @public
   * @param {Quaternion} target
   * @param {Object} angles
   * @param {Number} interpolationFactor
   */

  _createClass(Quaternion, null, [{
    key: 'slerpTargetFromAxisAngles',
    value: function slerpTargetFromAxisAngles(target, angles) {
      var interpolationFactor = arguments.length <= 2 || arguments[2] === undefined ? 0.1 : arguments[2];

      var multiply = function multiply() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _glQuat2.default.multiply.apply(_glQuat2.default, [[]].concat(args));
      };
      var slerp = function slerp(t) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        return _glQuat2.default.slerp.apply(_glQuat2.default, [t, t].concat(args));
      };

      var vx = _vector.XVector3,
          vy = _vector.YVector3,
          vz = _vector.ZVector3;
      var ax = angles.x,
          ay = angles.y,
          az = angles.z;
      var x = _scratchX,
          y = _scratchY,
          z = _scratchZ;

      var f = interpolationFactor;
      var t = target;

      _glQuat2.default.setAxisAngle(x, vx, ax);
      _glQuat2.default.setAxisAngle(y, vy, ay);
      _glQuat2.default.setAxisAngle(z, vz, az);

      slerp(t, multiply(multiply(x, y), z), f);
    }
  }]);

  return Quaternion;
}(_vector.Vector);

var _scratchX = new Quaternion();
var _scratchY = new Quaternion();
var _scratchZ = new Quaternion();

},{"./vector":25,"defined":33,"gl-quat":72}],25:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

var _typeof3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _typeof2 = typeof Symbol === "function" && _typeof3(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof3(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof3(obj);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZVector3 = exports.YVector3 = exports.XVector3 = exports.Vector = undefined;

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _utils = require('../utils');

var _defined = require('defined');

var _defined2 = _interopRequireDefault(_defined);

var _glVec = require('gl-vec4');

var _glVec2 = _interopRequireDefault(_glVec);

var _glVec3 = require('gl-vec3');

var _glVec4 = _interopRequireDefault(_glVec3);

var _glVec5 = require('gl-vec2');

var _glVec6 = _interopRequireDefault(_glVec5);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }return arr2;
  } else {
    return Array.from(arr);
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Vector class.
 *
 * @public
 * @class Vector
 */

var Vector = exports.Vector = function () {

  /**
   * Vector class contructor.
   *
   * @param {...Mixed} input
   */

  function Vector() {
    var _this = this;

    for (var _len = arguments.length, input = Array(_len), _key = 0; _key < _len; _key++) {
      input[_key] = arguments[_key];
    }

    _classCallCheck(this, Vector);

    if (1 == input.length && 'object' == _typeof(input[0])) {
      var tmp = input[0];
      input[0] = tmp.x || tmp[0] || undefined;
      input[1] = tmp.y || tmp[1] || undefined;
      input[2] = tmp.z || tmp[2] || undefined;
      input[3] = tmp.w || tmp[3] || undefined;
      input = input.filter(function (x) {
        return undefined !== x;
      });
    }

    this.elements = new Float64Array([].concat(_toConsumableArray(input)));

    (0, _utils.define)(this, '0', {
      get: function get() {
        return _this.elements[0];
      },
      set: function set(v) {
        return _this.elements[0] = v;
      }
    });

    (0, _utils.define)(this, '1', {
      get: function get() {
        return _this.elements[1];
      },
      set: function set(v) {
        return _this.elements[1] = v;
      }
    });

    (0, _utils.define)(this, '2', {
      get: function get() {
        return _this.elements[2];
      },
      set: function set(v) {
        return _this.elements[2] = v;
      }
    });

    (0, _utils.define)(this, '3', {
      get: function get() {
        return _this.elements[3];
      },
      set: function set(v) {
        return _this.elements[3] = v;
      }
    });

    (0, _utils.define)(this, 'r', {
      get: function get() {
        return _this.elements[0];
      },
      set: function set(v) {
        return _this.elements[0] = v;
      }
    });

    (0, _utils.define)(this, 'g', {
      get: function get() {
        return _this.elements[1];
      },
      set: function set(v) {
        return _this.elements[1] = v;
      }
    });

    (0, _utils.define)(this, 'b', {
      get: function get() {
        return _this.elements[2];
      },
      set: function set(v) {
        return _this.elements[2] = v;
      }
    });

    (0, _utils.define)(this, 'a', {
      get: function get() {
        return _this.elements[3];
      },
      set: function set(v) {
        return _this.elements[3] = v;
      }
    });
  }

  _createClass(Vector, [{
    key: 'set',

    /**
     * Set components-wise values
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {Number} w
     * @return {Vector}
     */

    value: function set(x, y, z, w) {
      if (x instanceof Vector) {
        return this.set(x.x, x.y, x.z, x.w);
      }

      switch (arguments.length) {
        case 4:
          this.elements[3] = (0, _defined2.default)(w, this.elements[3]);
        case 3:
          this.elements[2] = (0, _defined2.default)(z, this.elements[2]);
        case 2:
          this.elements[1] = (0, _defined2.default)(y, this.elements[1]);
        case 1:
          this.elements[0] = (0, _defined2.default)(x, this.elements[0]);
      }
      return this;
    }

    /**
     * Converts the vector into
     * a normal Array.
     *
     * @return {Array}
     */

  }, {
    key: 'toArray',
    value: function toArray() {
      return [].concat(_toConsumableArray(this.elements));
    }

    /**
     * Returns a JSON serializable value.
     *
     * @return {Array}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.toArray();
    }

    /**
     * Returns the underlying vector
     * array value.
     *
     * @return {Float64Array}
     */

  }, {
    key: 'valueOf',
    value: function valueOf() {
      return this.elements;
    }

    /**
     * Iterator protocol implementation.
     */

  }, {
    key: Symbol.iterator,
    value: function value() {
      return this.toArray()[Symbol.iterator]();
    }
  }, {
    key: 'length',
    get: function get() {
      return this.elements.length;
    },
    set: function set(value) {
      void value;
    }

    /**
     * Returns a reference to the underlying
     * vector elements.
     *
     * @getter
     * @type {Float64Array}
     */

  }, {
    key: 'ref',
    get: function get() {
      return this.elements;
    }

    /**
     * Returns the component count of the vector
     *
     * @getter
     * @type {Number}
     */

  }, {
    key: 'componentLength',
    get: function get() {
      return this.elements.length;
    }

    /**
     * x component-wise getter.
     *
     * @getter
     * @type {Number}
     */

  }, {
    key: 'x',
    get: function get() {
      return this.elements[0];
    }

    /**
     * x component-wise setter.
     *
     * @setter
     * @type {Number}
     */

    , set: function set(x) {
      this.elements[0] = x;
    }

    /**
     * y component-wise getter.
     *
     * @getter
     * @type {Number}
     */

  }, {
    key: 'y',
    get: function get() {
      return this.elements[1];
    }

    /**
     * y component-wise setter.
     *
     * @setter
     * @type {Number}
     */

    , set: function set(y) {
      this.elements[1] = y;
    }

    /**
     * z component-wise getter.
     *
     * @getter
     * @type {Number}
     */

  }, {
    key: 'z',
    get: function get() {
      return this.elements[2];
    }

    /**
     * z component-wise setter.
     *
     * @setter
     * @type {Number}
     */

    , set: function set(z) {
      this.elements[2] = z;
    }

    /**
     * w component-wise getter.
     *
     * @getter
     * @type {Number}
     */

  }, {
    key: 'w',
    get: function get() {
      return this[3];
    }

    /**
     * w component-wise setter.
     *
     * @setter
     * @type {Number}
     */

    , set: function set(w) {
      this.elements[3] = w;
    }
  }]);

  return Vector;
}();

/**
 * Instanced x, y, z vectors
 */

var XVector3 = exports.XVector3 = new Vector(1, 0, 0);
var YVector3 = exports.YVector3 = new Vector(0, 1, 0);
var ZVector3 = exports.ZVector3 = new Vector(0, 0, 1);

},{"../utils":28,"defined":33,"gl-vec2":99,"gl-vec3":129,"gl-vec4":159}],26:[function(require,module,exports){
module.exports={
  "name": "axis",
  "version": "2.0.0",
  "description": "Spherical content rendering engine",
  "scripts": {
    "test": "node test",
    "build": "browserify app/main.js -o public/js/bundle.js"
  },
  "keywords": [
    "axis",
    "frame",
    "webgl",
    "panorama",
    "360"
  ],
  "author": "Joseph Werle <werle@littlstar.com>",
  "license": "MIT",
  "dependencies": {
    "angle-normals": "^1.0.0",
    "audio-context": "^0.1.0",
    "choo": "^3.2.2",
    "clamp": "^1.0.1",
    "debug": "^2.2.0",
    "define-properties": "^1.1.2",
    "defined": "^1.0.0",
    "dom-events": "^0.1.1",
    "ease-component": "^1.0.0",
    "fullscreen": "^1.1.0",
    "geo-3d-box": "^2.0.2",
    "gl-mat4": "^1.1.4",
    "gl-quat": "^1.0.0",
    "gl-vec2": "^1.0.0",
    "gl-vec3": "^1.0.3",
    "gl-vec4": "^1.0.1",
    "glsl-inject-defines": "^1.0.3",
    "hls.js": "^0.6.2-5",
    "ios-safe-audio-context": "^1.0.1",
    "is-android": "^1.0.1",
    "is-ios": "^1.0.0",
    "is-mobile-device": "^1.0.0",
    "keycode": "^2.1.4",
    "mouse-change": "^1.3.0",
    "mouse-wheel": "^1.2.0",
    "omnitone": "^0.1.6",
    "pointer-lock": "0.0.4",
    "primitive-sphere": "^2.0.0",
    "raf": "^3.3.0",
    "regl": "^1.2.1",
    "resl": "^1.0.3",
    "touch-position": "^2.0.0",
    "yields-keycode": "^1.1.0"
  },
  "browserify": {
    "transform": [
      "babelify"
    ]
  },
  "standard": {
    "ignore": [
      "public",
      "dist",
      "build",
      "lib"
    ]
  },
  "devDependencies": {
    "babel-cli": "^6.14.0",
    "babel-core": "^6.14.0",
    "babel-eslint": "^6.1.2",
    "babel-plugin-glslify": "^1.0.2",
    "babel-preset-es2015": "^6.14.0",
    "babel-preset-stage-0": "^6.5.0",
    "babelify": "^7.3.0",
    "browserify": "^13.1.0",
    "budo": "^9.0.0",
    "bunny": "^1.0.1",
    "glslify": "^5.1.0",
    "glslify-babel": "^1.0.1",
    "standard": "^8.0.0",
    "web-audio-analyser": "^2.0.1"
  }
}

},{}],27:[function(require,module,exports){
'use strict';

/**
 * `current' command symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
var $current = exports.$current = Symbol('current');

/**
 * `previous' command symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

var $previous = exports.$previous = Symbol('previous');

/**
 * `element' symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

var $domElement = exports.$domElement = Symbol('element');

/**
 * regl context symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

var $regl = exports.$regl = Symbol('regl');

/**
 * `hasFocus' boolean symbol.
 *
 * @public
 * @const
 * @type {Symbol}
 */

var $hasFocus = exports.$hasFocus = Symbol('hasFocus');

/**
 * Symbol for an internal run method.
 *
 * @public
 * @const
 * @symbol nun
 */

var $run = exports.$run = Symbol('run');

/**
 * Symbol for an internal reference
 *
 * @public
 * @const
 * @symbol ref
 */

var $ref = exports.$ref = Symbol('ref');

/**
 * Symbol for an internal context
 *
 * @public
 * @const
 * @symbol ctx
 */

var $ctx = exports.$ctx = Symbol('ctx');

/**
 * Symbol for an internal stack.
 *
 * @public
 * @const
 * @symbol stack
 */

var $stack = exports.$stack = Symbol('stack');

/**
 * Symbol for an internal state.
 *
 * @public
 * @const
 * @symbol state
 */

var $state = exports.$state = Symbol('state');

},{}],28:[function(require,module,exports){
'use strict';

/**
 * Module dependencies.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lerp = exports.debug = exports.radians = exports.define = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _package = require('./package');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Define property helper.
 *
 * @public
 * @param {Object} a
 * @param {String} b
 * @param {Object} c
 */

var define = exports.define = function define(a, b, c) {
  return Object.defineProperty(a, b, _extends({}, c));
};

/**
 * Converts input degrees to radians
 *
 * @public
 * @param {Number} n
 * @return {Number}
 */

var radians = exports.radians = function radians(n) {
  return n == n ? n * Math.PI / 180.0 : 0;
};

/**
 * Utility debug output
 *
 * @public
 * @param {String} fmt
 * @param {...Mixed} args
 */

var debug = exports.debug = (0, _debug2.default)('[axis@' + _package.version + ']');

/**
 * Simple linear inerpolation function.
 *
 * @public
 * @param {Number} v0
 * @param {Number} v1
 * @param {Number} t
 * @return {Number}
 */

var lerp = exports.lerp = function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
};

},{"./package":26,"debug":31}],29:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],30:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],31:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":32}],32:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":193}],33:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],34:[function(require,module,exports){

var synth = require('synthetic-dom-events');

var on = function(element, name, fn, capture) {
    return element.addEventListener(name, fn, capture || false);
};

var off = function(element, name, fn, capture) {
    return element.removeEventListener(name, fn, capture || false);
};

var once = function (element, name, fn, capture) {
    function tmp (ev) {
        off(element, name, tmp, capture);
        fn(ev);
    }
    on(element, name, tmp, capture);
};

var emit = function(element, name, opt) {
    var ev = synth(name, opt);
    element.dispatchEvent(ev);
};

if (!document.addEventListener) {
    on = function(element, name, fn) {
        return element.attachEvent('on' + name, fn);
    };
}

if (!document.removeEventListener) {
    off = function(element, name, fn) {
        return element.detachEvent('on' + name, fn);
    };
}

if (!document.dispatchEvent) {
    emit = function(element, name, opt) {
        var ev = synth(name, opt);
        return element.fireEvent('on' + ev.type, ev);
    };
}

module.exports = {
    on: on,
    off: off,
    once: once,
    emit: emit
};

},{"synthetic-dom-events":200}],35:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],36:[function(require,module,exports){
function _createConfig( properties ) {
	
	var config = {
		size : [1,1,1],
		segments : [1,1,1]
	}
	
	if( properties ) {
	
		if( Array.isArray( properties.size ) ) {
			config.size = properties.size
		} else if( typeof properties.size === "number" ) {
			config.size = [properties.size, properties.size, properties.size]
		}
	
		if( Array.isArray( properties.segments ) ) {
			config.segments = properties.segments
		} else if( typeof properties.segments === "number" ) {
			config.segments = [properties.segments, properties.segments, properties.segments]
		}
	}
	
	return config
}

function _flatten( array ) {
	var results = []
	
	for( var i=0; i < array.length; i++ ) {
		var subarray = array[i]
		for( var j=0; j < subarray.length; j++ ) {
			results.push(subarray[j])
		}
	}
	return results
}

function _generatePanel( config ) {
			
	var rows      = _generateGrid( config )
	var cells     = _generateCells( config, rows )
	var positions = _flatten( rows )
	var uvs       = _generateUvs( config, positions )
	
	return {
		positions   : positions,
		cells       : cells,
		uvs         : uvs,
		vertexCount : (config.sx + 1) * (config.sy + 1)
	}
}

function _generateUvs( config, positions ) {
	
	return positions.map(function(p) {
		return [
			p[0] / config.wx + 0.5,
			p[1] / config.wy + 0.5
		]
	})
}

function _generateGrid( config ) {
	
	var step   = config.wy / config.sy
	var halfY  = config.wy / 2
	var length = config.sy + 1
	var grid   = Array(length)
	
	for( var i=0; i < length; i++ ) {
		grid[i] = _generateRow( config, step * i - halfY)
	}
	
	return grid
}

function _generateRow( config, height ) {
	
	var halfX  = config.wx / 2
	var step   = config.wx / config.sx
	var length = config.sx + 1
	var row    = Array(length)
	
	for( var i=0; i < length; i++ ) {
		row[i] = [ step * i - halfX, height ]
	}
	
	return row
}

function _generateCells( config ) {
	
	function index( x, y ) {
		return (config.sx + 1) * y + x
	}
	
	var cells = []
	
	for( var x=0; x < config.sx; x++ ) {
		
		for( var y=0; y < config.sy; y++ ) {

			var a = index( x + 0, y + 0 )  //   d __ c
			var b = index( x + 1, y + 0 )  //    |  |
			var c = index( x + 1, y + 1 )  //    |__|
			var d = index( x + 0, y + 1 )  //   a    b
			
			cells.push( [ a, b, c ] )
			cells.push( [ c, d, a ] )
		}
	}
	
	return cells
}

function _clonePanel( panel ) {
	
	return {
		positions   : panel.positions,
		cells       : panel.cells,
		uvs         : panel.uvs,
		vertexCount : panel.vertexCount
	}
}

function _generateBoxPanels( config ) {
	
	var size = config.size
	var segs = config.segments
	
	//       yp  zm
	//        | /
	//        |/
	// xm ----+----- xp
	//       /|
	//      / |
	//    zp  ym
	
	var zp = _generatePanel({
		wx: size[0], wy: size[1],
		sx: segs[0], sy: segs[1]
	})
	var xp = _generatePanel({
		wx: size[2], wy: size[1],
		sx: segs[2], sy: segs[1]
	})
	var yp = _generatePanel({
		wx: size[0], wy: size[2],
		sx: segs[0], sy: segs[2]
	})
	
	var zm = _clonePanel(zp)
	var xm = _clonePanel(xp)
	var ym = _clonePanel(yp)
	
	zp.positions = zp.positions.map( function(p) { return [       p[0],       p[1],  size[2]/2 ] } )
	zm.positions = zm.positions.map( function(p) { return [       p[0],      -p[1], -size[2]/2 ] } )
	xp.positions = xp.positions.map( function(p) { return [  size[0]/2,      -p[1],       p[0] ] } )
	xm.positions = xm.positions.map( function(p) { return [ -size[0]/2,       p[1],       p[0] ] } )
	yp.positions = yp.positions.map( function(p) { return [       p[0],  size[1]/2,      -p[1] ] } )
	ym.positions = ym.positions.map( function(p) { return [       p[0], -size[1]/2,       p[1] ] } )
	
	zp.normals = _makeNormals( [ 0, 0, 1], zp.positions.length )
	zm.normals = _makeNormals( [ 0, 0,-1], zm.positions.length )
	xp.normals = _makeNormals( [ 1, 0, 0], xp.positions.length )
	xm.normals = _makeNormals( [-1, 0, 0], xm.positions.length )
	yp.normals = _makeNormals( [ 0, 1, 0], yp.positions.length )
	ym.normals = _makeNormals( [ 0,-1, 0], ym.positions.length )
	
	return [ zp, zm, xp, xm, yp, ym ]
}

function _makeNormals( normal, count ) {
	
	var normals = Array(count)
	
	for( var i=0; i < count; i++ ) {
		normals[i] = normal.slice()
	}
	
	return normals
}
	
function _generateBox( config ) {
	
	var panels = _generateBoxPanels( config )
	
	var positions = panels.map(function(panel) { return panel.positions })
	var uvs       = panels.map(function(panel) { return panel.uvs       })
	var normals   = panels.map(function(panel) { return panel.normals   })
	var cells     = _offsetCellIndices( panels )
	
	return {
		positions: _flatten( positions ),
		uvs:       _flatten( uvs ),
		cells:     _flatten( cells ),
		normals:   _flatten( normals ),
	}
}

function _offsetCellIndices( panels ) {
	
	/*
		From: [[[0,1,2],[2,3,0]],[[0,1,2],[2,3,0]]]
		To:   [[[0,1,2],[2,3,0]],[[6,7,8],[8,9,6]]]
	*/
	
	var offset = 0
	
	return panels.map(function(panel) {
		
		var offsetCells = panel.cells.map( function(cell) {
			return cell.map(function(v) {
				return v + offset
			})
		})
	
		offset += panel.vertexCount
	
		return offsetCells
	})
}

module.exports = function( properties ) {
	
	var config = _createConfig( properties )

	return _generateBox( config )
}
},{}],37:[function(require,module,exports){
module.exports = create

/**
 * Creates a new identity mat3
 *
 * @alias mat3.create
 * @returns {mat3} a new 3x3 matrix
 */
function create() {
  var out = new Float32Array(9)
  out[0] = 1
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 1
  out[5] = 0
  out[6] = 0
  out[7] = 0
  out[8] = 1
  return out
}

},{}],38:[function(require,module,exports){
module.exports = adjoint;

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function adjoint(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};
},{}],39:[function(require,module,exports){
module.exports = clone;

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
function clone(a) {
    var out = new Float32Array(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],40:[function(require,module,exports){
module.exports = copy;

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],41:[function(require,module,exports){
module.exports = create;

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
function create() {
    var out = new Float32Array(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
},{}],42:[function(require,module,exports){
module.exports = determinant;

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};
},{}],43:[function(require,module,exports){
module.exports = fromQuat;

/**
 * Creates a matrix from a quaternion rotation.
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @returns {mat4} out
 */
function fromQuat(out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};
},{}],44:[function(require,module,exports){
module.exports = fromRotationTranslation;

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
function fromRotationTranslation(out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};
},{}],45:[function(require,module,exports){
module.exports = frustum;

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
function frustum(out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};
},{}],46:[function(require,module,exports){
module.exports = identity;

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
},{}],47:[function(require,module,exports){
module.exports = {
  create: require('./create')
  , clone: require('./clone')
  , copy: require('./copy')
  , identity: require('./identity')
  , transpose: require('./transpose')
  , invert: require('./invert')
  , adjoint: require('./adjoint')
  , determinant: require('./determinant')
  , multiply: require('./multiply')
  , translate: require('./translate')
  , scale: require('./scale')
  , rotate: require('./rotate')
  , rotateX: require('./rotateX')
  , rotateY: require('./rotateY')
  , rotateZ: require('./rotateZ')
  , fromRotationTranslation: require('./fromRotationTranslation')
  , fromQuat: require('./fromQuat')
  , frustum: require('./frustum')
  , perspective: require('./perspective')
  , perspectiveFromFieldOfView: require('./perspectiveFromFieldOfView')
  , ortho: require('./ortho')
  , lookAt: require('./lookAt')
  , str: require('./str')
}
},{"./adjoint":38,"./clone":39,"./copy":40,"./create":41,"./determinant":42,"./fromQuat":43,"./fromRotationTranslation":44,"./frustum":45,"./identity":46,"./invert":48,"./lookAt":49,"./multiply":50,"./ortho":51,"./perspective":52,"./perspectiveFromFieldOfView":53,"./rotate":54,"./rotateX":55,"./rotateY":56,"./rotateZ":57,"./scale":58,"./str":59,"./translate":60,"./transpose":61}],48:[function(require,module,exports){
module.exports = invert;

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function invert(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};
},{}],49:[function(require,module,exports){
var identity = require('./identity');

module.exports = lookAt;

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < 0.000001 &&
        Math.abs(eyey - centery) < 0.000001 &&
        Math.abs(eyez - centerz) < 0.000001) {
        return identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};
},{"./identity":46}],50:[function(require,module,exports){
module.exports = multiply;

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply(out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};
},{}],51:[function(require,module,exports){
module.exports = ortho;

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function ortho(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};
},{}],52:[function(require,module,exports){
module.exports = perspective;

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};
},{}],53:[function(require,module,exports){
module.exports = perspectiveFromFieldOfView;

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspectiveFromFieldOfView(out, fov, near, far) {
    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0),
        downTan = Math.tan(fov.downDegrees * Math.PI/180.0),
        leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0),
        rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = ((upTan - downTan) * yScale * 0.5);
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = (far * near) / (near - far);
    out[15] = 0.0;
    return out;
}


},{}],54:[function(require,module,exports){
module.exports = rotate;

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function rotate(out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < 0.000001) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};
},{}],55:[function(require,module,exports){
module.exports = rotateX;

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateX(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};
},{}],56:[function(require,module,exports){
module.exports = rotateY;

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateY(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};
},{}],57:[function(require,module,exports){
module.exports = rotateZ;

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateZ(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};
},{}],58:[function(require,module,exports){
module.exports = scale;

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],59:[function(require,module,exports){
module.exports = str;

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};
},{}],60:[function(require,module,exports){
module.exports = translate;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
function translate(out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};
},{}],61:[function(require,module,exports){
module.exports = transpose;

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};
},{}],62:[function(require,module,exports){
/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/add')

},{"gl-vec4/add":151}],63:[function(require,module,exports){
module.exports = calculateW

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
function calculateW (out, a) {
  var x = a[0], y = a[1], z = a[2]

  out[0] = x
  out[1] = y
  out[2] = z
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z))
  return out
}

},{}],64:[function(require,module,exports){
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
module.exports = require('gl-vec4/clone')

},{"gl-vec4/clone":152}],65:[function(require,module,exports){
module.exports = conjugate

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
function conjugate (out, a) {
  out[0] = -a[0]
  out[1] = -a[1]
  out[2] = -a[2]
  out[3] = a[3]
  return out
}

},{}],66:[function(require,module,exports){
/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/copy')

},{"gl-vec4/copy":153}],67:[function(require,module,exports){
module.exports = create

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
function create () {
  var out = new Float32Array(4)
  out[0] = 0
  out[1] = 0
  out[2] = 0
  out[3] = 1
  return out
}

},{}],68:[function(require,module,exports){
/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
module.exports = require('gl-vec4/dot')

},{"gl-vec4/dot":157}],69:[function(require,module,exports){
module.exports = fromMat3

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
function fromMat3 (out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8]
  var fRoot

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0)  // 2w
    out[3] = 0.5 * fRoot
    fRoot = 0.5 / fRoot  // 1/(4w)
    out[0] = (m[5] - m[7]) * fRoot
    out[1] = (m[6] - m[2]) * fRoot
    out[2] = (m[1] - m[3]) * fRoot
  } else {
    // |w| <= 1/2
    var i = 0
    if (m[4] > m[0]) {
      i = 1
    }
    if (m[8] > m[i * 3 + i]) {
      i = 2
    }
    var j = (i + 1) % 3
    var k = (i + 2) % 3

    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0)
    out[i] = 0.5 * fRoot
    fRoot = 0.5 / fRoot
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot
  }

  return out
}

},{}],70:[function(require,module,exports){
/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
module.exports = require('gl-vec4/fromValues')

},{"gl-vec4/fromValues":158}],71:[function(require,module,exports){
module.exports = identity

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
function identity (out) {
  out[0] = 0
  out[1] = 0
  out[2] = 0
  out[3] = 1
  return out
}

},{}],72:[function(require,module,exports){
module.exports = {
  add: require('./add'),
  calculateW: require('./calculateW'),
  clone: require('./clone'),
  conjugate: require('./conjugate'),
  copy: require('./copy'),
  create: require('./create'),
  dot: require('./dot'),
  fromMat3: require('./fromMat3'),
  fromValues: require('./fromValues'),
  identity: require('./identity'),
  invert: require('./invert'),
  length: require('./length'),
  lerp: require('./lerp'),
  multiply: require('./multiply'),
  normalize: require('./normalize'),
  rotateX: require('./rotateX'),
  rotateY: require('./rotateY'),
  rotateZ: require('./rotateZ'),
  rotationTo: require('./rotationTo'),
  scale: require('./scale'),
  set: require('./set'),
  setAxes: require('./setAxes'),
  setAxisAngle: require('./setAxisAngle'),
  slerp: require('./slerp'),
  sqlerp: require('./sqlerp'),
  squaredLength: require('./squaredLength')
}

},{"./add":62,"./calculateW":63,"./clone":64,"./conjugate":65,"./copy":66,"./create":67,"./dot":68,"./fromMat3":69,"./fromValues":70,"./identity":71,"./invert":73,"./length":74,"./lerp":75,"./multiply":76,"./normalize":77,"./rotateX":78,"./rotateY":79,"./rotateZ":80,"./rotationTo":81,"./scale":82,"./set":83,"./setAxes":84,"./setAxisAngle":85,"./slerp":86,"./sqlerp":87,"./squaredLength":88}],73:[function(require,module,exports){
module.exports = invert

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
function invert (out, a) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
    dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3,
    invDot = dot ? 1.0 / dot : 0

  // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot
  out[1] = -a1 * invDot
  out[2] = -a2 * invDot
  out[3] = a3 * invDot
  return out
}

},{}],74:[function(require,module,exports){
/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
module.exports = require('gl-vec4/length')

},{"gl-vec4/length":161}],75:[function(require,module,exports){
/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/lerp')

},{"gl-vec4/lerp":162}],76:[function(require,module,exports){
module.exports = multiply

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
function multiply (out, a, b) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3],
    bx = b[0], by = b[1], bz = b[2], bw = b[3]

  out[0] = ax * bw + aw * bx + ay * bz - az * by
  out[1] = ay * bw + aw * by + az * bx - ax * bz
  out[2] = az * bw + aw * bz + ax * by - ay * bx
  out[3] = aw * bw - ax * bx - ay * by - az * bz
  return out
}

},{}],77:[function(require,module,exports){
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/normalize')

},{"gl-vec4/normalize":167}],78:[function(require,module,exports){
module.exports = rotateX

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateX (out, a, rad) {
  rad *= 0.5

  var ax = a[0], ay = a[1], az = a[2], aw = a[3],
    bx = Math.sin(rad), bw = Math.cos(rad)

  out[0] = ax * bw + aw * bx
  out[1] = ay * bw + az * bx
  out[2] = az * bw - ay * bx
  out[3] = aw * bw - ax * bx
  return out
}

},{}],79:[function(require,module,exports){
module.exports = rotateY

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateY (out, a, rad) {
  rad *= 0.5

  var ax = a[0], ay = a[1], az = a[2], aw = a[3],
    by = Math.sin(rad), bw = Math.cos(rad)

  out[0] = ax * bw - az * by
  out[1] = ay * bw + aw * by
  out[2] = az * bw + ax * by
  out[3] = aw * bw - ay * by
  return out
}

},{}],80:[function(require,module,exports){
module.exports = rotateZ

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
function rotateZ (out, a, rad) {
  rad *= 0.5

  var ax = a[0], ay = a[1], az = a[2], aw = a[3],
    bz = Math.sin(rad), bw = Math.cos(rad)

  out[0] = ax * bw + ay * bz
  out[1] = ay * bw - ax * bz
  out[2] = az * bw + aw * bz
  out[3] = aw * bw - az * bz
  return out
}

},{}],81:[function(require,module,exports){
var vecDot = require('gl-vec3/dot')
var vecCross = require('gl-vec3/cross')
var vecLength = require('gl-vec3/length')
var vecNormalize = require('gl-vec3/normalize')

var quatNormalize = require('./normalize')
var quatAxisAngle = require('./setAxisAngle')

module.exports = rotationTo

var tmpvec3 = [0, 0, 0]
var xUnitVec3 = [1, 0, 0]
var yUnitVec3 = [0, 1, 0]

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
function rotationTo (out, a, b) {
  var dot = vecDot(a, b)
  if (dot < -0.999999) {
    vecCross(tmpvec3, xUnitVec3, a)
    if (vecLength(tmpvec3) < 0.000001) {
      vecCross(tmpvec3, yUnitVec3, a)
    }
    vecNormalize(tmpvec3, tmpvec3)
    quatAxisAngle(out, tmpvec3, Math.PI)
    return out
  } else if (dot > 0.999999) {
    out[0] = 0
    out[1] = 0
    out[2] = 0
    out[3] = 1
    return out
  } else {
    vecCross(tmpvec3, a, b)
    out[0] = tmpvec3[0]
    out[1] = tmpvec3[1]
    out[2] = tmpvec3[2]
    out[3] = 1 + dot
    return quatNormalize(out, out)
  }
}

},{"./normalize":77,"./setAxisAngle":85,"gl-vec3/cross":123,"gl-vec3/dot":126,"gl-vec3/length":131,"gl-vec3/normalize":137}],82:[function(require,module,exports){
/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/scale')

},{"gl-vec4/scale":169}],83:[function(require,module,exports){
/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
module.exports = require('gl-vec4/set')

},{"gl-vec4/set":171}],84:[function(require,module,exports){
var mat3create = require('gl-mat3/create')
var fromMat3 = require('./fromMat3')
var normalize = require('./normalize')

module.exports = setAxes

var matr = mat3create()

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
function setAxes (out, view, right, up) {
  matr[0] = right[0]
  matr[3] = right[1]
  matr[6] = right[2]

  matr[1] = up[0]
  matr[4] = up[1]
  matr[7] = up[2]

  matr[2] = -view[0]
  matr[5] = -view[1]
  matr[8] = -view[2]

  return normalize(out, fromMat3(out, matr))
}

},{"./fromMat3":69,"./normalize":77,"gl-mat3/create":37}],85:[function(require,module,exports){
module.exports = setAxisAngle

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
function setAxisAngle (out, axis, rad) {
  rad = rad * 0.5
  var s = Math.sin(rad)
  out[0] = s * axis[0]
  out[1] = s * axis[1]
  out[2] = s * axis[2]
  out[3] = Math.cos(rad)
  return out
}

},{}],86:[function(require,module,exports){
module.exports = slerp

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
function slerp (out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations

  var ax = a[0], ay = a[1], az = a[2], aw = a[3],
    bx = b[0], by = b[1], bz = b[2], bw = b[3]

  var omega, cosom, sinom, scale0, scale1

  // calc cosine
  cosom = ax * bx + ay * by + az * bz + aw * bw
  // adjust signs (if necessary)
  if (cosom < 0.0) {
    cosom = -cosom
    bx = -bx
    by = -by
    bz = -bz
    bw = -bw
  }
  // calculate coefficients
  if ((1.0 - cosom) > 0.000001) {
    // standard case (slerp)
    omega = Math.acos(cosom)
    sinom = Math.sin(omega)
    scale0 = Math.sin((1.0 - t) * omega) / sinom
    scale1 = Math.sin(t * omega) / sinom
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t
    scale1 = t
  }
  // calculate final values
  out[0] = scale0 * ax + scale1 * bx
  out[1] = scale0 * ay + scale1 * by
  out[2] = scale0 * az + scale1 * bz
  out[3] = scale0 * aw + scale1 * bw

  return out
}

},{}],87:[function(require,module,exports){
var slerp = require('./slerp')

module.exports = sqlerp

var temp1 = [0, 0, 0, 1]
var temp2 = [0, 0, 0, 1]

/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount
 * @returns {quat} out
 */
function sqlerp (out, a, b, c, d, t) {
  slerp(temp1, a, d, t)
  slerp(temp2, b, c, t)
  slerp(out, temp1, temp2, 2 * t * (1 - t))

  return out
}

},{"./slerp":86}],88:[function(require,module,exports){
/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
module.exports = require('gl-vec4/squaredLength')

},{"gl-vec4/squaredLength":173}],89:[function(require,module,exports){
module.exports = add

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    return out
}
},{}],90:[function(require,module,exports){
module.exports = clone

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
function clone(a) {
    var out = new Float32Array(2)
    out[0] = a[0]
    out[1] = a[1]
    return out
}
},{}],91:[function(require,module,exports){
module.exports = copy

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
function copy(out, a) {
    out[0] = a[0]
    out[1] = a[1]
    return out
}
},{}],92:[function(require,module,exports){
module.exports = create

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
function create() {
    var out = new Float32Array(2)
    out[0] = 0
    out[1] = 0
    return out
}
},{}],93:[function(require,module,exports){
module.exports = cross

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0]
    out[0] = out[1] = 0
    out[2] = z
    return out
}
},{}],94:[function(require,module,exports){
module.exports = distance

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1]
    return Math.sqrt(x*x + y*y)
}
},{}],95:[function(require,module,exports){
module.exports = divide

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0]
    out[1] = a[1] / b[1]
    return out
}
},{}],96:[function(require,module,exports){
module.exports = dot

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1]
}
},{}],97:[function(require,module,exports){
module.exports = forEach

var vec = require('./create')()

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
function forEach(a, stride, offset, count, fn, arg) {
    var i, l
    if(!stride) {
        stride = 2
    }

    if(!offset) {
        offset = 0
    }
    
    if(count) {
        l = Math.min((count * stride) + offset, a.length)
    } else {
        l = a.length
    }

    for(i = offset; i < l; i += stride) {
        vec[0] = a[i]
        vec[1] = a[i+1]
        fn(vec, vec, arg)
        a[i] = vec[0]
        a[i+1] = vec[1]
    }
    
    return a
}
},{"./create":92}],98:[function(require,module,exports){
module.exports = fromValues

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
function fromValues(x, y) {
    var out = new Float32Array(2)
    out[0] = x
    out[1] = y
    return out
}
},{}],99:[function(require,module,exports){
module.exports = {
  create: require('./create')
  , clone: require('./clone')
  , fromValues: require('./fromValues')
  , copy: require('./copy')
  , set: require('./set')
  , add: require('./add')
  , subtract: require('./subtract')
  , multiply: require('./multiply')
  , divide: require('./divide')
  , min: require('./min')
  , max: require('./max')
  , scale: require('./scale')
  , scaleAndAdd: require('./scaleAndAdd')
  , distance: require('./distance')
  , squaredDistance: require('./squaredDistance')
  , length: require('./length')
  , squaredLength: require('./squaredLength')
  , negate: require('./negate')
  , normalize: require('./normalize')
  , dot: require('./dot')
  , cross: require('./cross')
  , lerp: require('./lerp')
  , random: require('./random')
  , transformMat2: require('./transformMat2')
  , transformMat2d: require('./transformMat2d')
  , transformMat3: require('./transformMat3')
  , transformMat4: require('./transformMat4')
  , forEach: require('./forEach')
}
},{"./add":89,"./clone":90,"./copy":91,"./create":92,"./cross":93,"./distance":94,"./divide":95,"./dot":96,"./forEach":97,"./fromValues":98,"./length":100,"./lerp":101,"./max":102,"./min":103,"./multiply":104,"./negate":105,"./normalize":106,"./random":107,"./scale":108,"./scaleAndAdd":109,"./set":110,"./squaredDistance":111,"./squaredLength":112,"./subtract":113,"./transformMat2":114,"./transformMat2d":115,"./transformMat3":116,"./transformMat4":117}],100:[function(require,module,exports){
module.exports = length

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1]
    return Math.sqrt(x*x + y*y)
}
},{}],101:[function(require,module,exports){
module.exports = lerp

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1]
    out[0] = ax + t * (b[0] - ax)
    out[1] = ay + t * (b[1] - ay)
    return out
}
},{}],102:[function(require,module,exports){
module.exports = max

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function max(out, a, b) {
    out[0] = Math.max(a[0], b[0])
    out[1] = Math.max(a[1], b[1])
    return out
}
},{}],103:[function(require,module,exports){
module.exports = min

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function min(out, a, b) {
    out[0] = Math.min(a[0], b[0])
    out[1] = Math.min(a[1], b[1])
    return out
}
},{}],104:[function(require,module,exports){
module.exports = multiply

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0]
    out[1] = a[1] * b[1]
    return out
}
},{}],105:[function(require,module,exports){
module.exports = negate

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
function negate(out, a) {
    out[0] = -a[0]
    out[1] = -a[1]
    return out
}
},{}],106:[function(require,module,exports){
module.exports = normalize

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1]
    var len = x*x + y*y
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
    }
    return out
}
},{}],107:[function(require,module,exports){
module.exports = random

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
function random(out, scale) {
    scale = scale || 1.0
    var r = Math.random() * 2.0 * Math.PI
    out[0] = Math.cos(r) * scale
    out[1] = Math.sin(r) * scale
    return out
}
},{}],108:[function(require,module,exports){
module.exports = scale

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b
    out[1] = a[1] * b
    return out
}
},{}],109:[function(require,module,exports){
module.exports = scaleAndAdd

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale)
    out[1] = a[1] + (b[1] * scale)
    return out
}
},{}],110:[function(require,module,exports){
module.exports = set

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
function set(out, x, y) {
    out[0] = x
    out[1] = y
    return out
}
},{}],111:[function(require,module,exports){
module.exports = squaredDistance

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1]
    return x*x + y*y
}
},{}],112:[function(require,module,exports){
module.exports = squaredLength

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1]
    return x*x + y*y
}
},{}],113:[function(require,module,exports){
module.exports = subtract

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    return out
}
},{}],114:[function(require,module,exports){
module.exports = transformMat2

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2(out, a, m) {
    var x = a[0],
        y = a[1]
    out[0] = m[0] * x + m[2] * y
    out[1] = m[1] * x + m[3] * y
    return out
}
},{}],115:[function(require,module,exports){
module.exports = transformMat2d

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat2d(out, a, m) {
    var x = a[0],
        y = a[1]
    out[0] = m[0] * x + m[2] * y + m[4]
    out[1] = m[1] * x + m[3] * y + m[5]
    return out
}
},{}],116:[function(require,module,exports){
module.exports = transformMat3

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat3(out, a, m) {
    var x = a[0],
        y = a[1]
    out[0] = m[0] * x + m[3] * y + m[6]
    out[1] = m[1] * x + m[4] * y + m[7]
    return out
}
},{}],117:[function(require,module,exports){
module.exports = transformMat4

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
function transformMat4(out, a, m) {
    var x = a[0], 
        y = a[1]
    out[0] = m[0] * x + m[4] * y + m[12]
    out[1] = m[1] * x + m[5] * y + m[13]
    return out
}
},{}],118:[function(require,module,exports){
module.exports = add;

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
}
},{}],119:[function(require,module,exports){
module.exports = angle

var fromValues = require('./fromValues')
var normalize = require('./normalize')
var dot = require('./dot')

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
    var tempA = fromValues(a[0], a[1], a[2])
    var tempB = fromValues(b[0], b[1], b[2])
 
    normalize(tempA, tempA)
    normalize(tempB, tempB)
 
    var cosine = dot(tempA, tempB)

    if(cosine > 1.0){
        return 0
    } else {
        return Math.acos(cosine)
    }     
}

},{"./dot":126,"./fromValues":128,"./normalize":137}],120:[function(require,module,exports){
module.exports = clone;

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function clone(a) {
    var out = new Float32Array(3)
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}
},{}],121:[function(require,module,exports){
module.exports = copy;

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}
},{}],122:[function(require,module,exports){
module.exports = create;

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function create() {
    var out = new Float32Array(3)
    out[0] = 0
    out[1] = 0
    out[2] = 0
    return out
}
},{}],123:[function(require,module,exports){
module.exports = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2]

    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    return out
}
},{}],124:[function(require,module,exports){
module.exports = distance;

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return Math.sqrt(x*x + y*y + z*z)
}
},{}],125:[function(require,module,exports){
module.exports = divide;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0]
    out[1] = a[1] / b[1]
    out[2] = a[2] / b[2]
    return out
}
},{}],126:[function(require,module,exports){
module.exports = dot;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
},{}],127:[function(require,module,exports){
module.exports = forEach;

var vec = require('./create')()

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
function forEach(a, stride, offset, count, fn, arg) {
        var i, l
        if(!stride) {
            stride = 3
        }

        if(!offset) {
            offset = 0
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length)
        } else {
            l = a.length
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i] 
            vec[1] = a[i+1] 
            vec[2] = a[i+2]
            fn(vec, vec, arg)
            a[i] = vec[0] 
            a[i+1] = vec[1] 
            a[i+2] = vec[2]
        }
        
        return a
}
},{"./create":122}],128:[function(require,module,exports){
module.exports = fromValues;

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
function fromValues(x, y, z) {
    var out = new Float32Array(3)
    out[0] = x
    out[1] = y
    out[2] = z
    return out
}
},{}],129:[function(require,module,exports){
module.exports = {
  create: require('./create')
  , clone: require('./clone')
  , angle: require('./angle')
  , fromValues: require('./fromValues')
  , copy: require('./copy')
  , set: require('./set')
  , add: require('./add')
  , subtract: require('./subtract')
  , multiply: require('./multiply')
  , divide: require('./divide')
  , min: require('./min')
  , max: require('./max')
  , scale: require('./scale')
  , scaleAndAdd: require('./scaleAndAdd')
  , distance: require('./distance')
  , squaredDistance: require('./squaredDistance')
  , length: require('./length')
  , squaredLength: require('./squaredLength')
  , negate: require('./negate')
  , inverse: require('./inverse')
  , normalize: require('./normalize')
  , dot: require('./dot')
  , cross: require('./cross')
  , lerp: require('./lerp')
  , random: require('./random')
  , transformMat4: require('./transformMat4')
  , transformMat3: require('./transformMat3')
  , transformQuat: require('./transformQuat')
  , rotateX: require('./rotateX')
  , rotateY: require('./rotateY')
  , rotateZ: require('./rotateZ')
  , forEach: require('./forEach')
}
},{"./add":118,"./angle":119,"./clone":120,"./copy":121,"./create":122,"./cross":123,"./distance":124,"./divide":125,"./dot":126,"./forEach":127,"./fromValues":128,"./inverse":130,"./length":131,"./lerp":132,"./max":133,"./min":134,"./multiply":135,"./negate":136,"./normalize":137,"./random":138,"./rotateX":139,"./rotateY":140,"./rotateZ":141,"./scale":142,"./scaleAndAdd":143,"./set":144,"./squaredDistance":145,"./squaredLength":146,"./subtract":147,"./transformMat3":148,"./transformMat4":149,"./transformQuat":150}],130:[function(require,module,exports){
module.exports = inverse;

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0]
  out[1] = 1.0 / a[1]
  out[2] = 1.0 / a[2]
  return out
}
},{}],131:[function(require,module,exports){
module.exports = length;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return Math.sqrt(x*x + y*y + z*z)
}
},{}],132:[function(require,module,exports){
module.exports = lerp;

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2]
    out[0] = ax + t * (b[0] - ax)
    out[1] = ay + t * (b[1] - ay)
    out[2] = az + t * (b[2] - az)
    return out
}
},{}],133:[function(require,module,exports){
module.exports = max;

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function max(out, a, b) {
    out[0] = Math.max(a[0], b[0])
    out[1] = Math.max(a[1], b[1])
    out[2] = Math.max(a[2], b[2])
    return out
}
},{}],134:[function(require,module,exports){
module.exports = min;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function min(out, a, b) {
    out[0] = Math.min(a[0], b[0])
    out[1] = Math.min(a[1], b[1])
    out[2] = Math.min(a[2], b[2])
    return out
}
},{}],135:[function(require,module,exports){
module.exports = multiply;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0]
    out[1] = a[1] * b[1]
    out[2] = a[2] * b[2]
    return out
}
},{}],136:[function(require,module,exports){
module.exports = negate;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
    out[0] = -a[0]
    out[1] = -a[1]
    out[2] = -a[2]
    return out
}
},{}],137:[function(require,module,exports){
module.exports = normalize;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    var len = x*x + y*y + z*z
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}
},{}],138:[function(require,module,exports){
module.exports = random;

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
function random(out, scale) {
    scale = scale || 1.0

    var r = Math.random() * 2.0 * Math.PI
    var z = (Math.random() * 2.0) - 1.0
    var zScale = Math.sqrt(1.0-z*z) * scale

    out[0] = Math.cos(r) * zScale
    out[1] = Math.sin(r) * zScale
    out[2] = z * scale
    return out
}
},{}],139:[function(require,module,exports){
module.exports = rotateX;

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateX(out, a, b, c){
    var p = [], r=[]
    //Translate point to the origin
    p[0] = a[0] - b[0]
    p[1] = a[1] - b[1]
    p[2] = a[2] - b[2]

    //perform rotation
    r[0] = p[0]
    r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c)
    r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c)

    //translate to correct position
    out[0] = r[0] + b[0]
    out[1] = r[1] + b[1]
    out[2] = r[2] + b[2]

    return out
}
},{}],140:[function(require,module,exports){
module.exports = rotateY;

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateY(out, a, b, c){
    var p = [], r=[]
    //Translate point to the origin
    p[0] = a[0] - b[0]
    p[1] = a[1] - b[1]
    p[2] = a[2] - b[2]
  
    //perform rotation
    r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c)
    r[1] = p[1]
    r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c)
  
    //translate to correct position
    out[0] = r[0] + b[0]
    out[1] = r[1] + b[1]
    out[2] = r[2] + b[2]
  
    return out
}
},{}],141:[function(require,module,exports){
module.exports = rotateZ;

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateZ(out, a, b, c){
    var p = [], r=[]
    //Translate point to the origin
    p[0] = a[0] - b[0]
    p[1] = a[1] - b[1]
    p[2] = a[2] - b[2]
  
    //perform rotation
    r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c)
    r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c)
    r[2] = p[2]
  
    //translate to correct position
    out[0] = r[0] + b[0]
    out[1] = r[1] + b[1]
    out[2] = r[2] + b[2]
  
    return out
}
},{}],142:[function(require,module,exports){
module.exports = scale;

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b
    out[1] = a[1] * b
    out[2] = a[2] * b
    return out
}
},{}],143:[function(require,module,exports){
module.exports = scaleAndAdd;

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale)
    out[1] = a[1] + (b[1] * scale)
    out[2] = a[2] + (b[2] * scale)
    return out
}
},{}],144:[function(require,module,exports){
module.exports = set;

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
    out[0] = x
    out[1] = y
    out[2] = z
    return out
}
},{}],145:[function(require,module,exports){
module.exports = squaredDistance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return x*x + y*y + z*z
}
},{}],146:[function(require,module,exports){
module.exports = squaredLength;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return x*x + y*y + z*z
}
},{}],147:[function(require,module,exports){
module.exports = subtract;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
}
},{}],148:[function(require,module,exports){
module.exports = transformMat3;

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
    var x = a[0], y = a[1], z = a[2]
    out[0] = x * m[0] + y * m[3] + z * m[6]
    out[1] = x * m[1] + y * m[4] + z * m[7]
    out[2] = x * m[2] + y * m[5] + z * m[8]
    return out
}
},{}],149:[function(require,module,exports){
module.exports = transformMat4;

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
    var x = a[0], y = a[1], z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15]
    w = w || 1.0
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w
    return out
}
},{}],150:[function(require,module,exports){
module.exports = transformQuat;

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx
    return out
}
},{}],151:[function(require,module,exports){
module.exports = add

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function add (out, a, b) {
  out[0] = a[0] + b[0]
  out[1] = a[1] + b[1]
  out[2] = a[2] + b[2]
  out[3] = a[3] + b[3]
  return out
}

},{}],152:[function(require,module,exports){
module.exports = clone

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
function clone (a) {
  var out = new Float32Array(4)
  out[0] = a[0]
  out[1] = a[1]
  out[2] = a[2]
  out[3] = a[3]
  return out
}

},{}],153:[function(require,module,exports){
module.exports = copy

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
function copy (out, a) {
  out[0] = a[0]
  out[1] = a[1]
  out[2] = a[2]
  out[3] = a[3]
  return out
}

},{}],154:[function(require,module,exports){
module.exports = create

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
function create () {
  var out = new Float32Array(4)
  out[0] = 0
  out[1] = 0
  out[2] = 0
  out[3] = 0
  return out
}

},{}],155:[function(require,module,exports){
module.exports = distance

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
function distance (a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1],
    z = b[2] - a[2],
    w = b[3] - a[3]
  return Math.sqrt(x * x + y * y + z * z + w * w)
}

},{}],156:[function(require,module,exports){
module.exports = divide

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function divide (out, a, b) {
  out[0] = a[0] / b[0]
  out[1] = a[1] / b[1]
  out[2] = a[2] / b[2]
  out[3] = a[3] / b[3]
  return out
}

},{}],157:[function(require,module,exports){
module.exports = dot

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot (a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
}

},{}],158:[function(require,module,exports){
module.exports = fromValues

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
function fromValues (x, y, z, w) {
  var out = new Float32Array(4)
  out[0] = x
  out[1] = y
  out[2] = z
  out[3] = w
  return out
}

},{}],159:[function(require,module,exports){
module.exports = {
  create: require('./create'),
  clone: require('./clone'),
  fromValues: require('./fromValues'),
  copy: require('./copy'),
  set: require('./set'),
  add: require('./add'),
  subtract: require('./subtract'),
  multiply: require('./multiply'),
  divide: require('./divide'),
  min: require('./min'),
  max: require('./max'),
  scale: require('./scale'),
  scaleAndAdd: require('./scaleAndAdd'),
  distance: require('./distance'),
  squaredDistance: require('./squaredDistance'),
  length: require('./length'),
  squaredLength: require('./squaredLength'),
  negate: require('./negate'),
  inverse: require('./inverse'),
  normalize: require('./normalize'),
  dot: require('./dot'),
  lerp: require('./lerp'),
  random: require('./random'),
  transformMat4: require('./transformMat4'),
  transformQuat: require('./transformQuat')
}

},{"./add":151,"./clone":152,"./copy":153,"./create":154,"./distance":155,"./divide":156,"./dot":157,"./fromValues":158,"./inverse":160,"./length":161,"./lerp":162,"./max":163,"./min":164,"./multiply":165,"./negate":166,"./normalize":167,"./random":168,"./scale":169,"./scaleAndAdd":170,"./set":171,"./squaredDistance":172,"./squaredLength":173,"./subtract":174,"./transformMat4":175,"./transformQuat":176}],160:[function(require,module,exports){
module.exports = inverse

/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */
function inverse (out, a) {
  out[0] = 1.0 / a[0]
  out[1] = 1.0 / a[1]
  out[2] = 1.0 / a[2]
  out[3] = 1.0 / a[3]
  return out
}

},{}],161:[function(require,module,exports){
module.exports = length

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
function length (a) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3]
  return Math.sqrt(x * x + y * y + z * z + w * w)
}

},{}],162:[function(require,module,exports){
module.exports = lerp

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
function lerp (out, a, b, t) {
  var ax = a[0],
    ay = a[1],
    az = a[2],
    aw = a[3]
  out[0] = ax + t * (b[0] - ax)
  out[1] = ay + t * (b[1] - ay)
  out[2] = az + t * (b[2] - az)
  out[3] = aw + t * (b[3] - aw)
  return out
}

},{}],163:[function(require,module,exports){
module.exports = max

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function max (out, a, b) {
  out[0] = Math.max(a[0], b[0])
  out[1] = Math.max(a[1], b[1])
  out[2] = Math.max(a[2], b[2])
  out[3] = Math.max(a[3], b[3])
  return out
}

},{}],164:[function(require,module,exports){
module.exports = min

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function min (out, a, b) {
  out[0] = Math.min(a[0], b[0])
  out[1] = Math.min(a[1], b[1])
  out[2] = Math.min(a[2], b[2])
  out[3] = Math.min(a[3], b[3])
  return out
}

},{}],165:[function(require,module,exports){
module.exports = multiply

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function multiply (out, a, b) {
  out[0] = a[0] * b[0]
  out[1] = a[1] * b[1]
  out[2] = a[2] * b[2]
  out[3] = a[3] * b[3]
  return out
}

},{}],166:[function(require,module,exports){
module.exports = negate

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
function negate (out, a) {
  out[0] = -a[0]
  out[1] = -a[1]
  out[2] = -a[2]
  out[3] = -a[3]
  return out
}

},{}],167:[function(require,module,exports){
module.exports = normalize

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
function normalize (out, a) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3]
  var len = x * x + y * y + z * z + w * w
  if (len > 0) {
    len = 1 / Math.sqrt(len)
    out[0] = x * len
    out[1] = y * len
    out[2] = z * len
    out[3] = w * len
  }
  return out
}

},{}],168:[function(require,module,exports){
var vecNormalize = require('./normalize')
var vecScale = require('./scale')

module.exports = random

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
function random (out, scale) {
  scale = scale || 1.0

  // TODO: This is a pretty awful way of doing this. Find something better.
  out[0] = Math.random()
  out[1] = Math.random()
  out[2] = Math.random()
  out[3] = Math.random()
  vecNormalize(out, out)
  vecScale(out, out, scale)
  return out
}

},{"./normalize":167,"./scale":169}],169:[function(require,module,exports){
module.exports = scale

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
function scale (out, a, b) {
  out[0] = a[0] * b
  out[1] = a[1] * b
  out[2] = a[2] * b
  out[3] = a[3] * b
  return out
}

},{}],170:[function(require,module,exports){
module.exports = scaleAndAdd

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
function scaleAndAdd (out, a, b, scale) {
  out[0] = a[0] + (b[0] * scale)
  out[1] = a[1] + (b[1] * scale)
  out[2] = a[2] + (b[2] * scale)
  out[3] = a[3] + (b[3] * scale)
  return out
}

},{}],171:[function(require,module,exports){
module.exports = set

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
function set (out, x, y, z, w) {
  out[0] = x
  out[1] = y
  out[2] = z
  out[3] = w
  return out
}

},{}],172:[function(require,module,exports){
module.exports = squaredDistance

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance (a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1],
    z = b[2] - a[2],
    w = b[3] - a[3]
  return x * x + y * y + z * z + w * w
}

},{}],173:[function(require,module,exports){
module.exports = squaredLength

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength (a) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3]
  return x * x + y * y + z * z + w * w
}

},{}],174:[function(require,module,exports){
module.exports = subtract

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
function subtract (out, a, b) {
  out[0] = a[0] - b[0]
  out[1] = a[1] - b[1]
  out[2] = a[2] - b[2]
  out[3] = a[3] - b[3]
  return out
}

},{}],175:[function(require,module,exports){
module.exports = transformMat4

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
function transformMat4 (out, a, m) {
  var x = a[0], y = a[1], z = a[2], w = a[3]
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w
  return out
}

},{}],176:[function(require,module,exports){
module.exports = transformQuat

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
function transformQuat (out, a, q) {
  var x = a[0], y = a[1], z = a[2],
    qx = q[0], qy = q[1], qz = q[2], qw = q[3],

    // calculate quat * vec
    ix = qw * x + qy * z - qz * y,
    iy = qw * y + qz * x - qx * z,
    iz = qw * z + qx * y - qy * x,
    iw = -qx * x - qy * y - qz * z

  // calculate result * inverse quat
  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx
  out[3] = a[3]
  return out
}

},{}],177:[function(require,module,exports){
var tokenize = require('glsl-tokenizer')
var stringify = require('glsl-token-string')
var inject = require('glsl-token-inject-block')

module.exports = function glslInjectDefine (source, defines) {
  if (!defines) {
    return source
  }

  var keys = Object.keys(defines)
  if (keys.length === 0) {
    return source
  }

  var tokens = tokenize(source)
  for (var i=keys.length-1; i>=0; i--) {
    var key = keys[i]
    var val = String(defines[key])
    if (val) { // allow empty value
      val = ' ' + val
    }

    inject(tokens, {
      type: 'preprocessor',
      data: '#define ' + key + val
    })
  }
  
  return stringify(tokens)
}

},{"glsl-token-inject-block":178,"glsl-token-string":179,"glsl-tokenizer":186}],178:[function(require,module,exports){
module.exports = glslTokenInject

var newline = { data: '\n', type: 'whitespace' }
var regex = /[^\r\n]$/

function glslTokenInject (tokens, newTokens) {
  if (!Array.isArray(newTokens))
    newTokens = [ newTokens ]
  var start = getStartIndex(tokens)
  var last = start > 0 ? tokens[start-1] : null
  if (last && regex.test(last.data)) {
    tokens.splice(start++, 0, newline)
  }
  tokens.splice.apply(tokens, [ start, 0 ].concat(newTokens))
  
  var end = start + newTokens.length
  if (tokens[end] && /[^\r\n]$/.test(tokens[end].data)) {
    tokens.splice(end, 0, newline)
  }
  return tokens
}

function getStartIndex (tokens) {
  // determine starting index for attributes
  var start = -1
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.type === 'preprocessor') {
      if (/^#(extension|version)/.test(token.data)) {
        start = Math.max(start, i)
      }
    } else if (token.type === 'keyword' && token.data === 'precision') {
      var semi = findNextSemicolon(tokens, i)
      if (semi === -1) {
        throw new Error('precision statement not followed by any semicolons!')
      }
      start = Math.max(start, semi)
    }
  }
  return start + 1
}

function findNextSemicolon (tokens, start) {
  for (var i = start; i < tokens.length; i++) {
    if (tokens[i].type === 'operator' && tokens[i].data === ';') {
      return i
    }
  }
  return -1
}
},{}],179:[function(require,module,exports){
module.exports = toString

function toString(tokens) {
  var output = []

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'eof') continue
    output.push(tokens[i].data)
  }

  return output.join('')
}

},{}],180:[function(require,module,exports){
module.exports = tokenize

var literals100 = require('./lib/literals')
  , operators = require('./lib/operators')
  , builtins100 = require('./lib/builtins')
  , literals300es = require('./lib/literals-300es')
  , builtins300es = require('./lib/builtins-300es')

var NORMAL = 999          // <-- never emitted
  , TOKEN = 9999          // <-- never emitted
  , BLOCK_COMMENT = 0
  , LINE_COMMENT = 1
  , PREPROCESSOR = 2
  , OPERATOR = 3
  , INTEGER = 4
  , FLOAT = 5
  , IDENT = 6
  , BUILTIN = 7
  , KEYWORD = 8
  , WHITESPACE = 9
  , EOF = 10
  , HEX = 11

var map = [
    'block-comment'
  , 'line-comment'
  , 'preprocessor'
  , 'operator'
  , 'integer'
  , 'float'
  , 'ident'
  , 'builtin'
  , 'keyword'
  , 'whitespace'
  , 'eof'
  , 'integer'
]

function tokenize(opt) {
  var i = 0
    , total = 0
    , mode = NORMAL
    , c
    , last
    , content = []
    , tokens = []
    , token_idx = 0
    , token_offs = 0
    , line = 1
    , col = 0
    , start = 0
    , isnum = false
    , isoperator = false
    , input = ''
    , len

  opt = opt || {}
  var allBuiltins = builtins100
  var allLiterals = literals100
  if (opt.version === '300 es') {
    allBuiltins = builtins300es
    allLiterals = literals300es
  }

  return function(data) {
    tokens = []
    if (data !== null) return write(data.replace ? data.replace(/\r\n/g, '\n') : data)
    return end()
  }

  function token(data) {
    if (data.length) {
      tokens.push({
        type: map[mode]
      , data: data
      , position: start
      , line: line
      , column: col
      })
    }
  }

  function write(chunk) {
    i = 0
    input += chunk
    len = input.length

    var last

    while(c = input[i], i < len) {
      last = i

      switch(mode) {
        case BLOCK_COMMENT: i = block_comment(); break
        case LINE_COMMENT: i = line_comment(); break
        case PREPROCESSOR: i = preprocessor(); break
        case OPERATOR: i = operator(); break
        case INTEGER: i = integer(); break
        case HEX: i = hex(); break
        case FLOAT: i = decimal(); break
        case TOKEN: i = readtoken(); break
        case WHITESPACE: i = whitespace(); break
        case NORMAL: i = normal(); break
      }

      if(last !== i) {
        switch(input[last]) {
          case '\n': col = 0; ++line; break
          default: ++col; break
        }
      }
    }

    total += i
    input = input.slice(i)
    return tokens
  }

  function end(chunk) {
    if(content.length) {
      token(content.join(''))
    }

    mode = EOF
    token('(eof)')
    return tokens
  }

  function normal() {
    content = content.length ? [] : content

    if(last === '/' && c === '*') {
      start = total + i - 1
      mode = BLOCK_COMMENT
      last = c
      return i + 1
    }

    if(last === '/' && c === '/') {
      start = total + i - 1
      mode = LINE_COMMENT
      last = c
      return i + 1
    }

    if(c === '#') {
      mode = PREPROCESSOR
      start = total + i
      return i
    }

    if(/\s/.test(c)) {
      mode = WHITESPACE
      start = total + i
      return i
    }

    isnum = /\d/.test(c)
    isoperator = /[^\w_]/.test(c)

    start = total + i
    mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN
    return i
  }

  function whitespace() {
    if(/[^\s]/g.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function preprocessor() {
    if((c === '\r' || c === '\n') && last !== '\\') {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }

  function line_comment() {
    return preprocessor()
  }

  function block_comment() {
    if(c === '/' && last === '*') {
      content.push(c)
      token(content.join(''))
      mode = NORMAL
      return i + 1
    }

    content.push(c)
    last = c
    return i + 1
  }

  function operator() {
    if(last === '.' && /\d/.test(c)) {
      mode = FLOAT
      return i
    }

    if(last === '/' && c === '*') {
      mode = BLOCK_COMMENT
      return i
    }

    if(last === '/' && c === '/') {
      mode = LINE_COMMENT
      return i
    }

    if(c === '.' && content.length) {
      while(determine_operator(content));

      mode = FLOAT
      return i
    }

    if(c === ';' || c === ')' || c === '(') {
      if(content.length) while(determine_operator(content));
      token(c)
      mode = NORMAL
      return i + 1
    }

    var is_composite_operator = content.length === 2 && c !== '='
    if(/[\w_\d\s]/.test(c) || is_composite_operator) {
      while(determine_operator(content));
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function determine_operator(buf) {
    var j = 0
      , idx
      , res

    do {
      idx = operators.indexOf(buf.slice(0, buf.length + j).join(''))
      res = operators[idx]

      if(idx === -1) {
        if(j-- + buf.length > 0) continue
        res = buf.slice(0, 1).join('')
      }

      token(res)

      start += res.length
      content = content.slice(res.length)
      return content.length
    } while(1)
  }

  function hex() {
    if(/[^a-fA-F0-9]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function integer() {
    if(c === '.') {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      mode = FLOAT
      last = c
      return i + 1
    }

    if(c === 'x' && content.length === 1 && content[0] === '0') {
      mode = HEX
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function decimal() {
    if(c === 'f') {
      content.push(c)
      last = c
      i += 1
    }

    if(/[eE]/.test(c)) {
      content.push(c)
      last = c
      return i + 1
    }

    if (c === '-' && /[eE]/.test(last)) {
      content.push(c)
      last = c
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    last = c
    return i + 1
  }

  function readtoken() {
    if(/[^\d\w_]/.test(c)) {
      var contentstr = content.join('')
      if(allLiterals.indexOf(contentstr) > -1) {
        mode = KEYWORD
      } else if(allBuiltins.indexOf(contentstr) > -1) {
        mode = BUILTIN
      } else {
        mode = IDENT
      }
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    last = c
    return i + 1
  }
}

},{"./lib/builtins":182,"./lib/builtins-300es":181,"./lib/literals":184,"./lib/literals-300es":183,"./lib/operators":185}],181:[function(require,module,exports){
// 300es builtins/reserved words that were previously valid in v100
var v100 = require('./builtins')

// The texture2D|Cube functions have been removed
// And the gl_ features are updated
v100 = v100.slice().filter(function (b) {
  return !/^(gl\_|texture)/.test(b)
})

module.exports = v100.concat([
  // the updated gl_ constants
    'gl_VertexID'
  , 'gl_InstanceID'
  , 'gl_Position'
  , 'gl_PointSize'
  , 'gl_FragCoord'
  , 'gl_FrontFacing'
  , 'gl_FragDepth'
  , 'gl_PointCoord'
  , 'gl_MaxVertexAttribs'
  , 'gl_MaxVertexUniformVectors'
  , 'gl_MaxVertexOutputVectors'
  , 'gl_MaxFragmentInputVectors'
  , 'gl_MaxVertexTextureImageUnits'
  , 'gl_MaxCombinedTextureImageUnits'
  , 'gl_MaxTextureImageUnits'
  , 'gl_MaxFragmentUniformVectors'
  , 'gl_MaxDrawBuffers'
  , 'gl_MinProgramTexelOffset'
  , 'gl_MaxProgramTexelOffset'
  , 'gl_DepthRangeParameters'
  , 'gl_DepthRange'

  // other builtins
  , 'trunc'
  , 'round'
  , 'roundEven'
  , 'isnan'
  , 'isinf'
  , 'floatBitsToInt'
  , 'floatBitsToUint'
  , 'intBitsToFloat'
  , 'uintBitsToFloat'
  , 'packSnorm2x16'
  , 'unpackSnorm2x16'
  , 'packUnorm2x16'
  , 'unpackUnorm2x16'
  , 'packHalf2x16'
  , 'unpackHalf2x16'
  , 'outerProduct'
  , 'transpose'
  , 'determinant'
  , 'inverse'
  , 'texture'
  , 'textureSize'
  , 'textureProj'
  , 'textureLod'
  , 'textureOffset'
  , 'texelFetch'
  , 'texelFetchOffset'
  , 'textureProjOffset'
  , 'textureLodOffset'
  , 'textureProjLod'
  , 'textureProjLodOffset'
  , 'textureGrad'
  , 'textureGradOffset'
  , 'textureProjGrad'
  , 'textureProjGradOffset'
])

},{"./builtins":182}],182:[function(require,module,exports){
module.exports = [
  // Keep this list sorted
  'abs'
  , 'acos'
  , 'all'
  , 'any'
  , 'asin'
  , 'atan'
  , 'ceil'
  , 'clamp'
  , 'cos'
  , 'cross'
  , 'dFdx'
  , 'dFdy'
  , 'degrees'
  , 'distance'
  , 'dot'
  , 'equal'
  , 'exp'
  , 'exp2'
  , 'faceforward'
  , 'floor'
  , 'fract'
  , 'gl_BackColor'
  , 'gl_BackLightModelProduct'
  , 'gl_BackLightProduct'
  , 'gl_BackMaterial'
  , 'gl_BackSecondaryColor'
  , 'gl_ClipPlane'
  , 'gl_ClipVertex'
  , 'gl_Color'
  , 'gl_DepthRange'
  , 'gl_DepthRangeParameters'
  , 'gl_EyePlaneQ'
  , 'gl_EyePlaneR'
  , 'gl_EyePlaneS'
  , 'gl_EyePlaneT'
  , 'gl_Fog'
  , 'gl_FogCoord'
  , 'gl_FogFragCoord'
  , 'gl_FogParameters'
  , 'gl_FragColor'
  , 'gl_FragCoord'
  , 'gl_FragData'
  , 'gl_FragDepth'
  , 'gl_FragDepthEXT'
  , 'gl_FrontColor'
  , 'gl_FrontFacing'
  , 'gl_FrontLightModelProduct'
  , 'gl_FrontLightProduct'
  , 'gl_FrontMaterial'
  , 'gl_FrontSecondaryColor'
  , 'gl_LightModel'
  , 'gl_LightModelParameters'
  , 'gl_LightModelProducts'
  , 'gl_LightProducts'
  , 'gl_LightSource'
  , 'gl_LightSourceParameters'
  , 'gl_MaterialParameters'
  , 'gl_MaxClipPlanes'
  , 'gl_MaxCombinedTextureImageUnits'
  , 'gl_MaxDrawBuffers'
  , 'gl_MaxFragmentUniformComponents'
  , 'gl_MaxLights'
  , 'gl_MaxTextureCoords'
  , 'gl_MaxTextureImageUnits'
  , 'gl_MaxTextureUnits'
  , 'gl_MaxVaryingFloats'
  , 'gl_MaxVertexAttribs'
  , 'gl_MaxVertexTextureImageUnits'
  , 'gl_MaxVertexUniformComponents'
  , 'gl_ModelViewMatrix'
  , 'gl_ModelViewMatrixInverse'
  , 'gl_ModelViewMatrixInverseTranspose'
  , 'gl_ModelViewMatrixTranspose'
  , 'gl_ModelViewProjectionMatrix'
  , 'gl_ModelViewProjectionMatrixInverse'
  , 'gl_ModelViewProjectionMatrixInverseTranspose'
  , 'gl_ModelViewProjectionMatrixTranspose'
  , 'gl_MultiTexCoord0'
  , 'gl_MultiTexCoord1'
  , 'gl_MultiTexCoord2'
  , 'gl_MultiTexCoord3'
  , 'gl_MultiTexCoord4'
  , 'gl_MultiTexCoord5'
  , 'gl_MultiTexCoord6'
  , 'gl_MultiTexCoord7'
  , 'gl_Normal'
  , 'gl_NormalMatrix'
  , 'gl_NormalScale'
  , 'gl_ObjectPlaneQ'
  , 'gl_ObjectPlaneR'
  , 'gl_ObjectPlaneS'
  , 'gl_ObjectPlaneT'
  , 'gl_Point'
  , 'gl_PointCoord'
  , 'gl_PointParameters'
  , 'gl_PointSize'
  , 'gl_Position'
  , 'gl_ProjectionMatrix'
  , 'gl_ProjectionMatrixInverse'
  , 'gl_ProjectionMatrixInverseTranspose'
  , 'gl_ProjectionMatrixTranspose'
  , 'gl_SecondaryColor'
  , 'gl_TexCoord'
  , 'gl_TextureEnvColor'
  , 'gl_TextureMatrix'
  , 'gl_TextureMatrixInverse'
  , 'gl_TextureMatrixInverseTranspose'
  , 'gl_TextureMatrixTranspose'
  , 'gl_Vertex'
  , 'greaterThan'
  , 'greaterThanEqual'
  , 'inversesqrt'
  , 'length'
  , 'lessThan'
  , 'lessThanEqual'
  , 'log'
  , 'log2'
  , 'matrixCompMult'
  , 'max'
  , 'min'
  , 'mix'
  , 'mod'
  , 'normalize'
  , 'not'
  , 'notEqual'
  , 'pow'
  , 'radians'
  , 'reflect'
  , 'refract'
  , 'sign'
  , 'sin'
  , 'smoothstep'
  , 'sqrt'
  , 'step'
  , 'tan'
  , 'texture2D'
  , 'texture2DLod'
  , 'texture2DProj'
  , 'texture2DProjLod'
  , 'textureCube'
  , 'textureCubeLod'
  , 'texture2DLodEXT'
  , 'texture2DProjLodEXT'
  , 'textureCubeLodEXT'
  , 'texture2DGradEXT'
  , 'texture2DProjGradEXT'
  , 'textureCubeGradEXT'
]

},{}],183:[function(require,module,exports){
var v100 = require('./literals')

module.exports = v100.slice().concat([
   'layout'
  , 'centroid'
  , 'smooth'
  , 'case'
  , 'mat2x2'
  , 'mat2x3'
  , 'mat2x4'
  , 'mat3x2'
  , 'mat3x3'
  , 'mat3x4'
  , 'mat4x2'
  , 'mat4x3'
  , 'mat4x4'
  , 'uint'
  , 'uvec2'
  , 'uvec3'
  , 'uvec4'
  , 'samplerCubeShadow'
  , 'sampler2DArray'
  , 'sampler2DArrayShadow'
  , 'isampler2D'
  , 'isampler3D'
  , 'isamplerCube'
  , 'isampler2DArray'
  , 'usampler2D'
  , 'usampler3D'
  , 'usamplerCube'
  , 'usampler2DArray'
  , 'coherent'
  , 'restrict'
  , 'readonly'
  , 'writeonly'
  , 'resource'
  , 'atomic_uint'
  , 'noperspective'
  , 'patch'
  , 'sample'
  , 'subroutine'
  , 'common'
  , 'partition'
  , 'active'
  , 'filter'
  , 'image1D'
  , 'image2D'
  , 'image3D'
  , 'imageCube'
  , 'iimage1D'
  , 'iimage2D'
  , 'iimage3D'
  , 'iimageCube'
  , 'uimage1D'
  , 'uimage2D'
  , 'uimage3D'
  , 'uimageCube'
  , 'image1DArray'
  , 'image2DArray'
  , 'iimage1DArray'
  , 'iimage2DArray'
  , 'uimage1DArray'
  , 'uimage2DArray'
  , 'image1DShadow'
  , 'image2DShadow'
  , 'image1DArrayShadow'
  , 'image2DArrayShadow'
  , 'imageBuffer'
  , 'iimageBuffer'
  , 'uimageBuffer'
  , 'sampler1DArray'
  , 'sampler1DArrayShadow'
  , 'isampler1D'
  , 'isampler1DArray'
  , 'usampler1D'
  , 'usampler1DArray'
  , 'isampler2DRect'
  , 'usampler2DRect'
  , 'samplerBuffer'
  , 'isamplerBuffer'
  , 'usamplerBuffer'
  , 'sampler2DMS'
  , 'isampler2DMS'
  , 'usampler2DMS'
  , 'sampler2DMSArray'
  , 'isampler2DMSArray'
  , 'usampler2DMSArray'
])

},{"./literals":184}],184:[function(require,module,exports){
module.exports = [
  // current
    'precision'
  , 'highp'
  , 'mediump'
  , 'lowp'
  , 'attribute'
  , 'const'
  , 'uniform'
  , 'varying'
  , 'break'
  , 'continue'
  , 'do'
  , 'for'
  , 'while'
  , 'if'
  , 'else'
  , 'in'
  , 'out'
  , 'inout'
  , 'float'
  , 'int'
  , 'void'
  , 'bool'
  , 'true'
  , 'false'
  , 'discard'
  , 'return'
  , 'mat2'
  , 'mat3'
  , 'mat4'
  , 'vec2'
  , 'vec3'
  , 'vec4'
  , 'ivec2'
  , 'ivec3'
  , 'ivec4'
  , 'bvec2'
  , 'bvec3'
  , 'bvec4'
  , 'sampler1D'
  , 'sampler2D'
  , 'sampler3D'
  , 'samplerCube'
  , 'sampler1DShadow'
  , 'sampler2DShadow'
  , 'struct'

  // future
  , 'asm'
  , 'class'
  , 'union'
  , 'enum'
  , 'typedef'
  , 'template'
  , 'this'
  , 'packed'
  , 'goto'
  , 'switch'
  , 'default'
  , 'inline'
  , 'noinline'
  , 'volatile'
  , 'public'
  , 'static'
  , 'extern'
  , 'external'
  , 'interface'
  , 'long'
  , 'short'
  , 'double'
  , 'half'
  , 'fixed'
  , 'unsigned'
  , 'input'
  , 'output'
  , 'hvec2'
  , 'hvec3'
  , 'hvec4'
  , 'dvec2'
  , 'dvec3'
  , 'dvec4'
  , 'fvec2'
  , 'fvec3'
  , 'fvec4'
  , 'sampler2DRect'
  , 'sampler3DRect'
  , 'sampler2DRectShadow'
  , 'sizeof'
  , 'cast'
  , 'namespace'
  , 'using'
]

},{}],185:[function(require,module,exports){
module.exports = [
    '<<='
  , '>>='
  , '++'
  , '--'
  , '<<'
  , '>>'
  , '<='
  , '>='
  , '=='
  , '!='
  , '&&'
  , '||'
  , '+='
  , '-='
  , '*='
  , '/='
  , '%='
  , '&='
  , '^^'
  , '^='
  , '|='
  , '('
  , ')'
  , '['
  , ']'
  , '.'
  , '!'
  , '~'
  , '*'
  , '/'
  , '%'
  , '+'
  , '-'
  , '<'
  , '>'
  , '&'
  , '^'
  , '|'
  , '?'
  , ':'
  , '='
  , ','
  , ';'
  , '{'
  , '}'
]

},{}],186:[function(require,module,exports){
var tokenize = require('./index')

module.exports = tokenizeString

function tokenizeString(str, opt) {
  var generator = tokenize(opt)
  var tokens = []

  tokens = tokens.concat(generator(str))
  tokens = tokens.concat(generator(null))

  return tokens
}

},{"./index":180}],187:[function(require,module,exports){
module.exports = function() {
  throw new Error(
      "It appears that you're using glslify in browserify without "
    + "its transform applied. Make sure that you've set up glslify as a source transform: "
    + "https://github.com/substack/node-browserify#browserifytransform"
  )
}

},{}],188:[function(require,module,exports){
// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

exports = module.exports = function(searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
    if (hasKeyCode) searchInput = hasKeyCode
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput]

  // Everything else (cast to string)
  var search = String(searchInput)

  // check codes
  var foundNamedKey = codes[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // weird character?
  if (search.length === 1) return search.charCodeAt(0)

  return undefined
}

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'command': 91,
  'left command': 91,
  'right command': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
}

// Helper aliases

var aliases = exports.aliases = {
  'windows': 91,
  '⇧': 16,
  '⌥': 18,
  '⌃': 17,
  '⌘': 91,
  'ctl': 17,
  'control': 17,
  'option': 18,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'return': 13,
  'escape': 27,
  'spc': 32,
  'pgup': 33,
  'pgdn': 34,
  'ins': 45,
  'del': 46,
  'cmd': 91
}


/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i

// function keys
for (i = 1; i < 13; i++) codes['f'+i] = i + 111

// numpad keys
for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {} // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias]
}

},{}],189:[function(require,module,exports){
'use strict'

module.exports = mouseListen

var mouse = require('mouse-event')

function mouseListen(element, callback) {
  if(!callback) {
    callback = element
    element = window
  }

  var buttonState = 0
  var x = 0
  var y = 0
  var mods = {
    shift:   false,
    alt:     false,
    control: false,
    meta:    false
  }
  var attached = false

  function updateMods(ev) {
    var changed = false
    if('altKey' in ev) {
      changed = changed || ev.altKey !== mods.alt
      mods.alt = !!ev.altKey
    }
    if('shiftKey' in ev) {
      changed = changed || ev.shiftKey !== mods.shift
      mods.shift = !!ev.shiftKey
    }
    if('ctrlKey' in ev) {
      changed = changed || ev.ctrlKey !== mods.control
      mods.control = !!ev.ctrlKey
    }
    if('metaKey' in ev) {
      changed = changed || ev.metaKey !== mods.meta
      mods.meta = !!ev.metaKey
    }
    return changed
  }

  function handleEvent(nextButtons, ev) {
    var nextX = mouse.x(ev)
    var nextY = mouse.y(ev)
    if('buttons' in ev) {
      nextButtons = ev.buttons|0
    }
    if(nextButtons !== buttonState ||
       nextX !== x ||
       nextY !== y ||
       updateMods(ev)) {
      buttonState = nextButtons|0
      x = nextX||0
      y = nextY||0
      callback && callback(buttonState, x, y, mods)
    }
  }

  function clearState(ev) {
    handleEvent(0, ev)
  }

  function handleBlur() {
    if(buttonState ||
      x ||
      y ||
      mods.shift ||
      mods.alt ||
      mods.meta ||
      mods.control) {

      x = y = 0
      buttonState = 0
      mods.shift = mods.alt = mods.control = mods.meta = false
      callback && callback(0, 0, 0, mods)
    }
  }

  function handleMods(ev) {
    if(updateMods(ev)) {
      callback && callback(buttonState, x, y, mods)
    }
  }

  function handleMouseMove(ev) {
    if(mouse.buttons(ev) === 0) {
      handleEvent(0, ev)
    } else {
      handleEvent(buttonState, ev)
    }
  }

  function handleMouseDown(ev) {
    handleEvent(buttonState | mouse.buttons(ev), ev)
  }

  function handleMouseUp(ev) {
    handleEvent(buttonState & ~mouse.buttons(ev), ev)
  }

  function attachListeners() {
    if(attached) {
      return
    }
    attached = true

    element.addEventListener('mousemove', handleMouseMove)

    element.addEventListener('mousedown', handleMouseDown)

    element.addEventListener('mouseup', handleMouseUp)

    element.addEventListener('mouseleave', clearState)
    element.addEventListener('mouseenter', clearState)
    element.addEventListener('mouseout', clearState)
    element.addEventListener('mouseover', clearState)

    element.addEventListener('blur', handleBlur)

    element.addEventListener('keyup', handleMods)
    element.addEventListener('keydown', handleMods)
    element.addEventListener('keypress', handleMods)

    if(element !== window) {
      window.addEventListener('blur', handleBlur)

      window.addEventListener('keyup', handleMods)
      window.addEventListener('keydown', handleMods)
      window.addEventListener('keypress', handleMods)
    }
  }

  function detachListeners() {
    if(!attached) {
      return
    }
    attached = false

    element.removeEventListener('mousemove', handleMouseMove)

    element.removeEventListener('mousedown', handleMouseDown)

    element.removeEventListener('mouseup', handleMouseUp)

    element.removeEventListener('mouseleave', clearState)
    element.removeEventListener('mouseenter', clearState)
    element.removeEventListener('mouseout', clearState)
    element.removeEventListener('mouseover', clearState)

    element.removeEventListener('blur', handleBlur)

    element.removeEventListener('keyup', handleMods)
    element.removeEventListener('keydown', handleMods)
    element.removeEventListener('keypress', handleMods)

    if(element !== window) {
      window.removeEventListener('blur', handleBlur)

      window.removeEventListener('keyup', handleMods)
      window.removeEventListener('keydown', handleMods)
      window.removeEventListener('keypress', handleMods)
    }
  }

  //Attach listeners
  attachListeners()

  var result = {
    element: element
  }

  Object.defineProperties(result, {
    enabled: {
      get: function() { return attached },
      set: function(f) {
        if(f) {
          attachListeners()
        } else {
          detachListeners
        }
      },
      enumerable: true
    },
    buttons: {
      get: function() { return buttonState },
      enumerable: true
    },
    x: {
      get: function() { return x },
      enumerable: true
    },
    y: {
      get: function() { return y },
      enumerable: true
    },
    mods: {
      get: function() { return mods },
      enumerable: true
    }
  })

  return result
}

},{"mouse-event":191}],190:[function(require,module,exports){
var rootPosition = { left: 0, top: 0 }

module.exports = mouseEventOffset
function mouseEventOffset (ev, target, out) {
  target = target || ev.currentTarget || ev.srcElement
  if (!Array.isArray(out)) {
    out = [ 0, 0 ]
  }
  var cx = ev.clientX || 0
  var cy = ev.clientY || 0
  var rect = getBoundingClientOffset(target)
  out[0] = cx - rect.left
  out[1] = cy - rect.top
  return out
}

function getBoundingClientOffset (element) {
  if (element === window ||
      element === document ||
      element === document.body) {
    return rootPosition
  } else {
    return element.getBoundingClientRect()
  }
}

},{}],191:[function(require,module,exports){
'use strict'

function mouseButtons(ev) {
  if(typeof ev === 'object') {
    if('buttons' in ev) {
      return ev.buttons
    } else if('which' in ev) {
      var b = ev.which
      if(b === 2) {
        return 4
      } else if(b === 3) {
        return 2
      } else if(b > 0) {
        return 1<<(b-1)
      }
    } else if('button' in ev) {
      var b = ev.button
      if(b === 1) {
        return 4
      } else if(b === 2) {
        return 2
      } else if(b >= 0) {
        return 1<<b
      }
    }
  }
  return 0
}
exports.buttons = mouseButtons

function mouseElement(ev) {
  return ev.target || ev.srcElement || window
}
exports.element = mouseElement

function mouseRelativeX(ev) {
  if(typeof ev === 'object') {
    if('offsetX' in ev) {
      return ev.offsetX
    }
    var target = mouseElement(ev)
    var bounds = target.getBoundingClientRect()
    return ev.clientX - bounds.left
  }
  return 0
}
exports.x = mouseRelativeX

function mouseRelativeY(ev) {
  if(typeof ev === 'object') {
    if('offsetY' in ev) {
      return ev.offsetY
    }
    var target = mouseElement(ev)
    var bounds = target.getBoundingClientRect()
    return ev.clientY - bounds.top
  }
  return 0
}
exports.y = mouseRelativeY

},{}],192:[function(require,module,exports){
'use strict'

var toPX = require('to-px')

module.exports = mouseWheelListen

function mouseWheelListen(element, callback, noScroll) {
  if(typeof element === 'function') {
    noScroll = !!callback
    callback = element
    element = window
  }
  var lineHeight = toPX('ex', element)
  var listener = function(ev) {
    if(noScroll) {
      ev.preventDefault()
    }
    var dx = ev.deltaX || 0
    var dy = ev.deltaY || 0
    var dz = ev.deltaZ || 0
    var mode = ev.deltaMode
    var scale = 1
    switch(mode) {
      case 1:
        scale = lineHeight
      break
      case 2:
        scale = window.innerHeight
      break
    }
    dx *= scale
    dy *= scale
    dz *= scale
    if(dx || dy || dz) {
      return callback(dx, dy, dz, ev)
    }
  }
  element.addEventListener('wheel', listener)
  return listener
}

},{"to-px":203}],193:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],194:[function(require,module,exports){
module.exports = function parseUnit(str, out) {
    if (!out)
        out = [ 0, '' ]

    str = String(str)
    var num = parseFloat(str, 10)
    out[0] = num
    out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || ''
    return out
}
},{}],195:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.7.1
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

}).call(this,require('_process'))
},{"_process":29}],196:[function(require,module,exports){
var identity = require('gl-mat4/identity')
var rotateY = require('gl-mat4/rotateY')
var rotateZ = require('gl-mat4/rotateZ')

var scale = require('gl-vec3/scale')
var transformMat4 = require('gl-vec3/transformMat4')
var normalize = require('gl-vec3/normalize')

var matRotY = identity([])
var matRotZ = identity([])
var up = [0, 1, 0]
var tmpVec3 = [0, 0, 0]

module.exports = primitiveSphere
function primitiveSphere (radius, opt) {
  opt = opt || {}
  radius = typeof radius !== 'undefined' ? radius : 1
  var segments = typeof opt.segments !== 'undefined' ? opt.segments : 32

  var totalZRotationSteps = 2 + segments
  var totalYRotationSteps = 2 * totalZRotationSteps

  var indices = []
  var positions = []
  var normals = []
  var uvs = []

  for (var zRotationStep = 0; zRotationStep <= totalZRotationSteps; zRotationStep++) {
    var normalizedZ = zRotationStep / totalZRotationSteps
    var angleZ = (normalizedZ * Math.PI)

    for (var yRotationStep = 0; yRotationStep <= totalYRotationSteps; yRotationStep++) {
      var normalizedY = yRotationStep / totalYRotationSteps
      var angleY = normalizedY * Math.PI * 2

      identity(matRotZ)
      rotateZ(matRotZ, matRotZ, -angleZ)

      identity(matRotY)
      rotateY(matRotY, matRotY, angleY)

      transformMat4(tmpVec3, up, matRotZ)
      transformMat4(tmpVec3, tmpVec3, matRotY)

      scale(tmpVec3, tmpVec3, -radius)
      positions.push(tmpVec3.slice())

      normalize(tmpVec3, tmpVec3)
      normals.push(tmpVec3.slice())

      uvs.push([ normalizedY, 1 - normalizedZ ])
    }

    if (zRotationStep > 0) {
      var verticesCount = positions.length
      var firstIndex = verticesCount - 2 * (totalYRotationSteps + 1)
      for (; (firstIndex + totalYRotationSteps + 2) < verticesCount; firstIndex++) {
        indices.push([
          firstIndex,
          firstIndex + 1,
          firstIndex + totalYRotationSteps + 1
        ])
        indices.push([
          firstIndex + totalYRotationSteps + 1,
          firstIndex + 1,
          firstIndex + totalYRotationSteps + 2
        ])
      }
    }
  }

  return {
    cells: indices,
    positions: positions,
    normals: normals,
    uvs: uvs
  }
}

},{"gl-mat4/identity":46,"gl-mat4/rotateY":56,"gl-mat4/rotateZ":57,"gl-vec3/normalize":137,"gl-vec3/scale":142,"gl-vec3/transformMat4":149}],197:[function(require,module,exports){
(function (global){
var now = require('performance-now')
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function() {
  root.requestAnimationFrame = raf
  root.cancelAnimationFrame = caf
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"performance-now":195}],198:[function(require,module,exports){
(function (global){
(function(Oa){"object"===typeof exports&&"undefined"!==typeof module?module.exports=Oa():"function"===typeof define&&define.amd?define([],Oa):("undefined"!==typeof window?window:"undefined"!==typeof global?global:"undefined"!==typeof self?self:this).createREGL=Oa()})(function(){return function f(p,u,l){function k(c,a){if(!u[c]){if(!p[c]){var b="function"==typeof require&&require;if(!a&&b)return b(c,!0);if(x)return x(c,!0);b=Error("Cannot find module '"+c+"'");throw b.code="MODULE_NOT_FOUND",b;}b=
u[c]={exports:{}};p[c][0].call(b.exports,function(a){var b=p[c][1][a];return k(b?b:a)},b,b.exports,f,p,u,l)}return u[c].exports}for(var x="function"==typeof require&&require,r=0;r<l.length;r++)k(l[r]);return k}({1:[function(f,p,u){function l(){this.w=this.z=this.y=this.x=this.state=0;this.buffer=null;this.size=0;this.normalized=!1;this.type=5126;this.divisor=this.stride=this.offset=0}p.exports=function(k,x,r,c,a){k=r.maxAttributes;x=Array(k);for(r=0;r<k;++r)x[r]=new l;return{Record:l,scope:{},state:x}}},
{}],2:[function(f,p,u){function l(c){return t[Object.prototype.toString.call(c)]|0}function k(c,a){for(var b=0;b<a.length;++b)c[b]=a[b]}function x(c,a,b,k,l,r,x){for(var g=0,h=0;h<b;++h)for(var f=0;f<k;++f)c[g++]=a[l*h+r*f+x]}var r=f("./util/is-typed-array"),c=f("./util/is-ndarray"),a=f("./util/values"),b=f("./util/pool");u=f("./util/flatten");var F=u.flatten,M=u.shape,t=f("./constants/arraytypes.json"),y=f("./constants/dtypes.json"),g=f("./constants/usage.json"),E=[];E[5120]=1;E[5122]=2;E[5124]=
4;E[5121]=1;E[5123]=2;E[5125]=4;E[5126]=4;p.exports=function(f,t,n){function m(c){this.id=H++;this.buffer=f.createBuffer();this.type=c;this.usage=35044;this.byteLength=0;this.dimension=1;this.dtype=5121;this.persistentData=null;n.profile&&(this.stats={size:0})}function B(c,a,b){c.byteLength=a.byteLength;f.bufferData(c.type,a,b)}function p(a,h,m,f,g,n){a.usage=m;if(Array.isArray(h)){if(a.dtype=f||5126,0<h.length)if(Array.isArray(h[0])){g=M(h);for(var K=f=1;K<g.length;++K)f*=g[K];a.dimension=f;h=F(h,
g,a.dtype);B(a,h,m);n?a.persistentData=h:b.freeType(h)}else"number"===typeof h[0]?(a.dimension=g,g=b.allocType(a.dtype,h.length),k(g,h),B(a,g,m),n?a.persistentData=g:b.freeType(g)):r(h[0])&&(a.dimension=h[0].length,a.dtype=f||l(h[0])||5126,h=F(h,[h.length,h[0].length],a.dtype),B(a,h,m),n?a.persistentData=h:b.freeType(h))}else if(r(h))a.dtype=f||l(h),a.dimension=g,B(a,h,m),n&&(a.persistentData=new Uint8Array(new Uint8Array(h.buffer)));else if(c(h)){g=h.shape;var C=h.stride,K=h.offset,y=0,q=0,S=0,t=
0;1===g.length?(y=g[0],q=1,S=C[0],t=0):2===g.length&&(y=g[0],q=g[1],S=C[0],t=C[1]);a.dtype=f||l(h.data)||5126;a.dimension=q;g=b.allocType(a.dtype,y*q);x(g,h.data,y,q,S,t,K);B(a,g,m);n?a.persistentData=g:b.freeType(g)}}function L(c){t.bufferCount--;f.deleteBuffer(c.buffer);c.buffer=null;delete h[c.id]}var H=0,h={};m.prototype.bind=function(){f.bindBuffer(this.type,this.buffer)};m.prototype.destroy=function(){L(this)};var fa=[];n.profile&&(t.getTotalBufferSize=function(){var c=0;Object.keys(h).forEach(function(a){c+=
h[a].stats.size});return c});return{create:function(a,B,H,fa){function u(a){var h=35044,b=null,q=0,k=0,m=1;Array.isArray(a)||r(a)||c(a)?b=a:"number"===typeof a?q=a|0:a&&("data"in a&&(b=a.data),"usage"in a&&(h=g[a.usage]),"type"in a&&(k=y[a.type]),"dimension"in a&&(m=a.dimension|0),"length"in a&&(q=a.length|0));D.bind();b?p(D,b,h,k,m,fa):(f.bufferData(D.type,q,h),D.dtype=k||5121,D.usage=h,D.dimension=m,D.byteLength=q);n.profile&&(D.stats.size=D.byteLength*E[D.dtype]);return u}t.bufferCount++;var D=
new m(B);h[D.id]=D;H||u(a);u._reglType="buffer";u._buffer=D;u.subdata=function(a,h){var m=(h||0)|0,q;D.bind();if(Array.isArray(a)){if(0<a.length)if("number"===typeof a[0]){var g=b.allocType(D.dtype,a.length);k(g,a);f.bufferSubData(D.type,m,g);b.freeType(g)}else if(Array.isArray(a[0])||r(a[0]))q=M(a),g=F(a,q,D.dtype),f.bufferSubData(D.type,m,g),b.freeType(g)}else if(r(a))f.bufferSubData(D.type,m,a);else if(c(a)){q=a.shape;var n=a.stride,B=g=0,y=0,t=0;1===q.length?(g=q[0],B=1,y=n[0],t=0):2===q.length&&
(g=q[0],B=q[1],y=n[0],t=n[1]);q=Array.isArray(a.data)?D.dtype:l(a.data);q=b.allocType(q,g*B);x(q,a.data,g,B,y,t,a.offset);f.bufferSubData(D.type,m,q);b.freeType(q)}return u};n.profile&&(u.stats=D.stats);u.destroy=function(){L(D)};return u},createStream:function(a,c){var h=fa.pop();h||(h=new m(a));h.bind();p(h,c,35040,0,1,!1);return h},destroyStream:function(a){fa.push(a)},clear:function(){a(h).forEach(L);fa.forEach(L)},getBuffer:function(a){return a&&a._buffer instanceof m?a._buffer:null},restore:function(){a(h).forEach(function(a){a.buffer=
f.createBuffer();f.bindBuffer(a.type,a.buffer);f.bufferData(a.type,a.persistentData||a.byteLength,a.usage)})},_initBuffer:p}}},{"./constants/arraytypes.json":3,"./constants/dtypes.json":4,"./constants/usage.json":6,"./util/flatten":23,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/pool":28,"./util/values":31}],3:[function(f,p,u){p.exports={"[object Int8Array]":5120,"[object Int16Array]":5122,"[object Int32Array]":5124,"[object Uint8Array]":5121,"[object Uint8ClampedArray]":5121,"[object Uint16Array]":5123,
"[object Uint32Array]":5125,"[object Float32Array]":5126,"[object Float64Array]":5121,"[object ArrayBuffer]":5121}},{}],4:[function(f,p,u){p.exports={int8:5120,int16:5122,int32:5124,uint8:5121,uint16:5123,uint32:5125,"float":5126,float32:5126}},{}],5:[function(f,p,u){p.exports={points:0,point:0,lines:1,line:1,"line loop":2,"line strip":3,triangles:4,triangle:4,"triangle strip":5,"triangle fan":6}},{}],6:[function(f,p,u){p.exports={"static":35044,dynamic:35048,stream:35040}},{}],7:[function(f,p,u){function l(a){return Array.isArray(a)||
M(a)||t(a)}function k(a){return a.sort(function(a,c){return"viewport"===a?-1:"viewport"===c?1:a<c?-1:1})}function x(a,c,b,k){this.thisDep=a;this.contextDep=c;this.propDep=b;this.append=k}function r(a){return a&&!(a.thisDep||a.contextDep||a.propDep)}function c(a){return new x(!1,!1,!1,a)}function a(a,c){var b=a.type;return 0===b?(b=a.data.length,new x(!0,1<=b,2<=b,c)):4===b?(b=a.data,new x(b.thisDep,b.contextDep,b.propDep,c)):new x(3===b,2===b,1===b,c)}var b=f("./util/codegen"),F=f("./util/loop"),
M=f("./util/is-typed-array"),t=f("./util/is-ndarray"),y=f("./util/is-array-like"),g=f("./dynamic"),E=f("./constants/primitives.json"),C=f("./constants/dtypes.json"),N=["x","y","z","w"],n="blend.func blend.equation stencil.func stencil.opFront stencil.opBack sample.coverage viewport scissor.box polygonOffset.offset".split(" "),m={0:0,1:1,zero:0,one:1,"src color":768,"one minus src color":769,"src alpha":770,"one minus src alpha":771,"dst color":774,"one minus dst color":775,"dst alpha":772,"one minus dst alpha":773,
"constant color":32769,"one minus constant color":32770,"constant alpha":32771,"one minus constant alpha":32772,"src alpha saturate":776},B={never:512,less:513,"<":513,equal:514,"=":514,"==":514,"===":514,lequal:515,"<=":515,greater:516,">":516,notequal:517,"!=":517,"!==":517,gequal:518,">=":518,always:519},Y={0:0,zero:0,keep:7680,replace:7681,increment:7682,decrement:7683,"increment wrap":34055,"decrement wrap":34056,invert:5386},L={cw:2304,ccw:2305},H=new x(!1,!1,!1,function(){});p.exports=function(h,
f,t,p,M,u,Z,D,K,Aa,va,q,S,ma,ga){function W(d){return d.replace(".","_")}function R(d,a,c){var b=W(d);w.push(d);z[b]=e[b]=!!c;wa[b]=a}function G(d,a,c){var b=W(d);w.push(d);Array.isArray(c)?(e[b]=c.slice(),z[b]=c.slice()):e[b]=z[b]=c;xa[b]=a}function ba(){var d=b(),a=d.link,c=d.global;d.id=Ra++;d.batchId="0";var h=a(Qa),A=d.shared={props:"a0"};Object.keys(Qa).forEach(function(d){A[d]=c.def(h,".",d)});var J=d.next={},P=d.current={};Object.keys(xa).forEach(function(d){Array.isArray(e[d])&&(J[d]=c.def(A.next,
".",d),P[d]=c.def(A.current,".",d))});var Sa=d.constants={};Object.keys(Ma).forEach(function(d){Sa[d]=c.def(JSON.stringify(Ma[d]))});d.invoke=function(e,I){switch(I.type){case 0:var c=["this",A.context,A.props,d.batchId];return e.def(a(I.data),".call(",c.slice(0,Math.max(I.data.length+1,4)),")");case 1:return e.def(A.props,I.data);case 2:return e.def(A.context,I.data);case 3:return e.def("this",I.data);case 4:return I.data.append(d,e),I.data.ref}};d.attribCache={};var I={};d.scopeAttrib=function(d){d=
f.id(d);if(d in I)return I[d];var e=Aa.scope[d];e||(e=Aa.scope[d]=new Ba);return I[d]=a(e)};return d}function na(d){var e=d["static"];d=d.dynamic;var b;if("profile"in e){var h=!!e.profile;b=c(function(d,e){return h});b.enable=h}else if("profile"in d){var A=d.profile;b=a(A,function(d,e){return d.invoke(e,A)})}return b}function ya(d,e){var b=d["static"],h=d.dynamic;if("framebuffer"in b){var A=b.framebuffer;return A?(A=D.getFramebuffer(A),c(function(d,e){var a=d.link(A),v=d.shared;e.set(v.framebuffer,
".next",a);v=v.context;e.set(v,".framebufferWidth",a+".width");e.set(v,".framebufferHeight",a+".height");return a})):c(function(d,e){var a=d.shared;e.set(a.framebuffer,".next","null");a=a.context;e.set(a,".framebufferWidth",a+".drawingBufferWidth");e.set(a,".framebufferHeight",a+".drawingBufferHeight");return"null"})}if("framebuffer"in h){var J=h.framebuffer;return a(J,function(d,e){var a=d.invoke(e,J),v=d.shared,c=v.framebuffer,a=e.def(c,".getFramebuffer(",a,")");e.set(c,".next",a);v=v.context;e.set(v,
".framebufferWidth",a+"?"+a+".width:"+v+".drawingBufferWidth");e.set(v,".framebufferHeight",a+"?"+a+".height:"+v+".drawingBufferHeight");return a})}return null}function U(d,e,c){function b(d){if(d in h){var I=h[d];d=!0;var c=I.x|0,qa=I.y|0,P,aa;"width"in I?P=I.width|0:d=!1;"height"in I?aa=I.height|0:d=!1;return new x(!d&&e&&e.thisDep,!d&&e&&e.contextDep,!d&&e&&e.propDep,function(d,e){var a=d.shared.context,v=P;"width"in I||(v=e.def(a,".","framebufferWidth","-",c));var b=aa;"height"in I||(b=e.def(a,
".","framebufferHeight","-",qa));return[c,qa,v,b]})}if(d in J){var w=J[d];d=a(w,function(d,e){var a=d.invoke(e,w),I=d.shared.context,c=e.def(a,".x|0"),v=e.def(a,".y|0"),qa=e.def('"width" in ',a,"?",a,".width|0:","(",I,".","framebufferWidth","-",c,")"),a=e.def('"height" in ',a,"?",a,".height|0:","(",I,".","framebufferHeight","-",v,")");return[c,v,qa,a]});e&&(d.thisDep=d.thisDep||e.thisDep,d.contextDep=d.contextDep||e.contextDep,d.propDep=d.propDep||e.propDep);return d}return e?new x(e.thisDep,e.contextDep,
e.propDep,function(d,e){var a=d.shared.context;return[0,0,e.def(a,".","framebufferWidth"),e.def(a,".","framebufferHeight")]}):null}var h=d["static"],J=d.dynamic;if(d=b("viewport")){var P=d;d=new x(d.thisDep,d.contextDep,d.propDep,function(d,e){var a=P.append(d,e),c=d.shared.context;e.set(c,".viewportWidth",a[2]);e.set(c,".viewportHeight",a[3]);return a})}return{viewport:d,scissor_box:b("scissor.box")}}function ia(d){function e(d){if(d in b){var I=f.id(b[d]);d=c(function(){return I});d.id=I;return d}if(d in
h){var v=h[d];return a(v,function(d,e){var a=d.invoke(e,v);return e.def(d.shared.strings,".id(",a,")")})}return null}var b=d["static"],h=d.dynamic,A=e("frag"),J=e("vert"),P=null;r(A)&&r(J)?(P=va.program(J.id,A.id),d=c(function(d,e){return d.link(P)})):d=new x(A&&A.thisDep||J&&J.thisDep,A&&A.contextDep||J&&J.contextDep,A&&A.propDep||J&&J.propDep,function(d,e){var a=d.shared.shader,c;c=A?A.append(d,e):e.def(a,".","frag");var v;v=J?J.append(d,e):e.def(a,".","vert");return e.def(a+".program("+v+","+c+
")")});return{frag:A,vert:J,progVar:d,program:P}}function ka(d,e){function b(d,e){if(d in h){var v=h[d]|0;return c(function(d,a){e&&(d.OFFSET=v);return v})}if(d in A){var qa=A[d];return a(qa,function(d,a){var c=d.invoke(a,qa);e&&(d.OFFSET=c);return c})}return e&&J?c(function(d,e){d.OFFSET="0";return 0}):null}var h=d["static"],A=d.dynamic,J=function(){if("elements"in h){var d=h.elements;l(d)?d=u.getElements(u.create(d,!0)):d&&(d=u.getElements(d));var e=c(function(e,a){if(d){var c=e.link(d);return e.ELEMENTS=
c}return e.ELEMENTS=null});e.value=d;return e}if("elements"in A){var v=A.elements;return a(v,function(d,e){var a=d.shared,c=a.isBufferArgs,a=a.elements,I=d.invoke(e,v),b=e.def("null"),c=e.def(c,"(",I,")"),I=d.cond(c).then(b,"=",a,".createStream(",I,");")["else"](b,"=",a,".getElements(",I,");");e.entry(I);e.exit(d.cond(c).then(a,".destroyStream(",b,");"));return d.ELEMENTS=b})}return null}(),P=b("offset",!0);return{elements:J,primitive:function(){if("primitive"in h){var d=h.primitive;return c(function(e,
a){return E[d]})}if("primitive"in A){var e=A.primitive;return a(e,function(d,a){var c=d.constants.primTypes,v=d.invoke(a,e);return a.def(c,"[",v,"]")})}return J?r(J)?J.value?c(function(d,e){return e.def(d.ELEMENTS,".primType")}):c(function(){return 4}):new x(J.thisDep,J.contextDep,J.propDep,function(d,e){var a=d.ELEMENTS;return e.def(a,"?",a,".primType:",4)}):null}(),count:function(){if("count"in h){var d=h.count|0;return c(function(){return d})}if("count"in A){var e=A.count;return a(e,function(d,
a){return d.invoke(a,e)})}return J?r(J)?J?P?new x(P.thisDep,P.contextDep,P.propDep,function(d,e){return e.def(d.ELEMENTS,".vertCount-",d.OFFSET)}):c(function(d,e){return e.def(d.ELEMENTS,".vertCount")}):c(function(){return-1}):new x(J.thisDep||P.thisDep,J.contextDep||P.contextDep,J.propDep||P.propDep,function(d,e){var a=d.ELEMENTS;return d.OFFSET?e.def(a,"?",a,".vertCount-",d.OFFSET,":-1"):e.def(a,"?",a,".vertCount:-1")}):null}(),instances:b("instances",!1),offset:P}}function ra(d,e){var b=d["static"],
h=d.dynamic,A={};w.forEach(function(d){function e(I,w){if(d in b){var qa=I(b[d]);A[v]=c(function(){return qa})}else if(d in h){var P=h[d];A[v]=a(P,function(d,e){return w(d,e,d.invoke(e,P))})}}var v=W(d);switch(d){case "cull.enable":case "blend.enable":case "dither":case "stencil.enable":case "depth.enable":case "scissor.enable":case "polygonOffset.enable":case "sample.alpha":case "sample.enable":case "depth.mask":return e(function(d){return d},function(d,e,a){return a});case "depth.func":return e(function(d){return B[d]},
function(d,e,a){return e.def(d.constants.compareFuncs,"[",a,"]")});case "depth.range":return e(function(d){return d},function(d,e,a){d=e.def("+",a,"[0]");e=e.def("+",a,"[1]");return[d,e]});case "blend.func":return e(function(d){return[m["srcRGB"in d?d.srcRGB:d.src],m["dstRGB"in d?d.dstRGB:d.dst],m["srcAlpha"in d?d.srcAlpha:d.src],m["dstAlpha"in d?d.dstAlpha:d.dst]]},function(d,e,a){function c(d,v){return e.def('"',d,v,'" in ',a,"?",a,".",d,v,":",a,".",d)}d=d.constants.blendFuncs;var v=c("src","RGB"),
b=c("dst","RGB"),v=e.def(d,"[",v,"]"),h=e.def(d,"[",c("src","Alpha"),"]"),b=e.def(d,"[",b,"]");d=e.def(d,"[",c("dst","Alpha"),"]");return[v,b,h,d]});case "blend.equation":return e(function(d){if("string"===typeof d)return[ca[d],ca[d]];if("object"===typeof d)return[ca[d.rgb],ca[d.alpha]]},function(d,e,a){var c=d.constants.blendEquations,v=e.def(),b=e.def();d=d.cond("typeof ",a,'==="string"');d.then(v,"=",b,"=",c,"[",a,"];");d["else"](v,"=",c,"[",a,".rgb];",b,"=",c,"[",a,".alpha];");e(d);return[v,b]});
case "blend.color":return e(function(d){return F(4,function(e){return+d[e]})},function(d,e,a){return F(4,function(d){return e.def("+",a,"[",d,"]")})});case "stencil.mask":return e(function(d){return d|0},function(d,e,a){return e.def(a,"|0")});case "stencil.func":return e(function(d){return[B[d.cmp||"keep"],d.ref||0,"mask"in d?d.mask:-1]},function(d,e,a){d=e.def('"cmp" in ',a,"?",d.constants.compareFuncs,"[",a,".cmp]",":",7680);var c=e.def(a,".ref|0");e=e.def('"mask" in ',a,"?",a,".mask|0:-1");return[d,
c,e]});case "stencil.opFront":case "stencil.opBack":return e(function(e){return["stencil.opBack"===d?1029:1028,Y[e.fail||"keep"],Y[e.zfail||"keep"],Y[e.zpass||"keep"]]},function(e,a,c){function v(d){return a.def('"',d,'" in ',c,"?",b,"[",c,".",d,"]:",7680)}var b=e.constants.stencilOps;return["stencil.opBack"===d?1029:1028,v("fail"),v("zfail"),v("zpass")]});case "polygonOffset.offset":return e(function(d){return[d.factor|0,d.units|0]},function(d,e,a){d=e.def(a,".factor|0");e=e.def(a,".units|0");return[d,
e]});case "cull.face":return e(function(d){var e=0;"front"===d?e=1028:"back"===d&&(e=1029);return e},function(d,e,a){return e.def(a,'==="front"?',1028,":",1029)});case "lineWidth":return e(function(d){return d},function(d,e,a){return a});case "frontFace":return e(function(d){return L[d]},function(d,e,a){return e.def(a+'==="cw"?2304:2305')});case "colorMask":return e(function(d){return d.map(function(d){return!!d})},function(d,e,a){return F(4,function(d){return"!!"+a+"["+d+"]"})});case "sample.coverage":return e(function(d){return["value"in
d?d.value:1,!!d.invert]},function(d,e,a){d=e.def('"value" in ',a,"?+",a,".value:1");e=e.def("!!",a,".invert");return[d,e]})}});return A}function sa(d,e){var b=d["static"],h=d.dynamic,A={};Object.keys(b).forEach(function(d){var e=b[d],a;if("number"===typeof e||"boolean"===typeof e)a=c(function(){return e});else if("function"===typeof e){var v=e._reglType;if("texture2d"===v||"textureCube"===v)a=c(function(d){return d.link(e)});else if("framebuffer"===v||"framebufferCube"===v)a=c(function(d){return d.link(e.color[0])})}else y(e)&&
(a=c(function(d){return d.global.def("[",F(e.length,function(d){return e[d]}),"]")}));a.value=e;A[d]=a});Object.keys(h).forEach(function(d){var e=h[d];A[d]=a(e,function(d,a){return d.invoke(a,e)})});return A}function da(d,e){var b=d["static"],h=d.dynamic,A={};Object.keys(b).forEach(function(d){var e=b[d],a=f.id(d),v=new Ba;if(l(e))v.state=1,v.buffer=M.getBuffer(M.create(e,34962,!1,!0)),v.type=0;else{var h=M.getBuffer(e);if(h)v.state=1,v.buffer=h,v.type=0;else if(e.constant){var w=e.constant;v.buffer=
"null";v.state=2;"number"===typeof w?v.x=w:N.forEach(function(d,e){e<w.length&&(v[d]=w[e])})}else{var h=l(e.buffer)?M.getBuffer(M.create(e.buffer,34962,!1,!0)):M.getBuffer(e.buffer),z=e.offset|0,q=e.stride|0,k=e.size|0,g=!!e.normalized,m=0;"type"in e&&(m=C[e.type]);e=e.divisor|0;v.buffer=h;v.state=1;v.size=k;v.normalized=g;v.type=m||h.dtype;v.offset=z;v.stride=q;v.divisor=e}}A[d]=c(function(d,e){var c=d.attribCache;if(a in c)return c[a];var b={isStream:!1};Object.keys(v).forEach(function(d){b[d]=
v[d]});v.buffer&&(b.buffer=d.link(v.buffer),b.type=b.type||b.buffer+".dtype");return c[a]=b})});Object.keys(h).forEach(function(d){var e=h[d];A[d]=a(e,function(d,a){function v(d){a(A[d],"=",c,".",d,"|0;")}var c=d.invoke(a,e),b=d.shared,h=b.isBufferArgs,w=b.buffer,A={isStream:a.def(!1)},z=new Ba;z.state=1;Object.keys(z).forEach(function(d){A[d]=a.def(""+z[d])});var aa=A.buffer,q=A.type;a("if(",h,"(",c,")){",A.isStream,"=true;",aa,"=",w,".createStream(",34962,",",c,");",q,"=",aa,".dtype;","}else{",
aa,"=",w,".getBuffer(",c,");","if(",aa,"){",q,"=",aa,".dtype;",'}else if("constant" in ',c,"){",A.state,"=",2,";","if(typeof "+c+'.constant === "number"){',A[N[0]],"=",c,".constant;",N.slice(1).map(function(d){return A[d]}).join("="),"=0;","}else{",N.map(function(d,e){return A[d]+"="+c+".constant.length>="+e+"?"+c+".constant["+e+"]:0;"}).join(""),"}}else{","if(",h,"(",c,".buffer)){",aa,"=",w,".createStream(",34962,",",c,".buffer);","}else{",aa,"=",w,".getBuffer(",c,".buffer);","}",q,'="type" in ',
c,"?",b.glTypes,"[",c,".type]:",aa,".dtype;",A.normalized,"=!!",c,".normalized;");v("size");v("offset");v("stride");v("divisor");a("}}");a.exit("if(",A.isStream,"){",w,".destroyStream(",aa,");","}");return A})});return A}function ja(d){var e=d["static"],b=d.dynamic,h={};Object.keys(e).forEach(function(d){var a=e[d];h[d]=c(function(d,e){return"number"===typeof a||"boolean"===typeof a?""+a:d.link(a)})});Object.keys(b).forEach(function(d){var e=b[d];h[d]=a(e,function(d,a){return d.invoke(a,e)})});return h}
function la(d,e,a,c,b){var h=ya(d,b),w=U(d,h,b),z=ka(d,b),q=ra(d,b),k=ia(d,b),g=w.viewport;g&&(q.viewport=g);g=W("scissor.box");(w=w[g])&&(q[g]=w);w=0<Object.keys(q).length;h={framebuffer:h,draw:z,shader:k,state:q,dirty:w};h.profile=na(d,b);h.uniforms=sa(a,b);h.attributes=da(e,b);h.context=ja(c,b);return h}function ea(d,e,a){var c=d.shared.context,b=d.scope();Object.keys(a).forEach(function(h){e.save(c,"."+h);b(c,".",h,"=",a[h].append(d,e),";")});e(b)}function O(d,e,a,c){var b=d.shared,h=b.gl,w=b.framebuffer,
z;oa&&(z=e.def(b.extensions,".webgl_draw_buffers"));var q=d.constants,b=q.drawBuffer,q=q.backBuffer;d=a?a.append(d,e):e.def(w,".next");c||e("if(",d,"!==",w,".cur){");e("if(",d,"){",h,".bindFramebuffer(",36160,",",d,".framebuffer);");oa&&e(z,".drawBuffersWEBGL(",b,"[",d,".colorAttachments.length]);");e("}else{",h,".bindFramebuffer(",36160,",null);");oa&&e(z,".drawBuffersWEBGL(",q,");");e("}",w,".cur=",d,";");c||e("}")}function ha(d,a,c){var b=d.shared,h=b.gl,z=d.current,q=d.next,g=b.current,k=b.next,
m=d.cond(g,".dirty");w.forEach(function(a){a=W(a);if(!(a in c.state)){var v,b;if(a in q){v=q[a];b=z[a];var w=F(e[a].length,function(d){return m.def(v,"[",d,"]")});m(d.cond(w.map(function(d,e){return d+"!=="+b+"["+e+"]"}).join("||")).then(h,".",xa[a],"(",w,");",w.map(function(d,e){return b+"["+e+"]="+d}).join(";"),";"))}else v=m.def(k,".",a),w=d.cond(v,"!==",g,".",a),m(w),a in wa?w(d.cond(v).then(h,".enable(",wa[a],");")["else"](h,".disable(",wa[a],");"),g,".",a,"=",v,";"):w(h,".",xa[a],"(",v,");",
g,".",a,"=",v,";")}});0===Object.keys(c.state).length&&m(g,".dirty=false;");a(m)}function Q(d,e,a,c){var b=d.shared,h=d.current,w=b.current,q=b.gl;k(Object.keys(a)).forEach(function(b){var z=a[b];if(!c||c(z)){var g=z.append(d,e);if(wa[b]){var k=wa[b];r(z)?g?e(q,".enable(",k,");"):e(q,".disable(",k,");"):e(d.cond(g).then(q,".enable(",k,");")["else"](q,".disable(",k,");"));e(w,".",b,"=",g,";")}else if(y(g)){var m=h[b];e(q,".",xa[b],"(",g,");",g.map(function(d,e){return m+"["+e+"]="+d}).join(";"),";")}else e(q,
".",xa[b],"(",g,");",w,".",b,"=",g,";")}})}function pa(d,e){ta&&(d.instancing=e.def(d.shared.extensions,".angle_instanced_arrays"))}function V(d,e,a,c,b){function h(){return"undefined"===typeof performance?"Date.now()":"performance.now()"}function w(d){l=e.def();d(l,"=",h(),";");"string"===typeof b?d(k,".count+=",b,";"):d(k,".count++;");ma&&(c?(n=e.def(),d(n,"=",f,".getNumPendingQueries();")):d(f,".beginQuery(",k,");"))}function q(d){d(k,".cpuTime+=",h(),"-",l,";");ma&&(c?d(f,".pushScopeStats(",n,
",",f,".getNumPendingQueries(),",k,");"):d(f,".endQuery();"))}function z(d){var a=e.def(m,".profile");e(m,".profile=",d,";");e.exit(m,".profile=",a,";")}var g=d.shared,k=d.stats,m=g.current,f=g.timer;a=a.profile;var l,n;if(a){if(r(a)){a.enable?(w(e),q(e.exit),z("true")):z("false");return}a=a.append(d,e);z(a)}else a=e.def(m,".profile");g=d.block();w(g);e("if(",a,"){",g,"}");d=d.block();q(d);e.exit("if(",a,"){",d,"}")}function X(d,e,a,c,b){function h(d){switch(d){case 35664:case 35667:case 35671:return 2;
case 35665:case 35668:case 35672:return 3;case 35666:case 35669:case 35673:return 4;default:return 1}}function w(a,c,b){function h(){e("if(!",m,".buffer){",g,".enableVertexAttribArray(",k,");}");var a=b.type,w;w=b.size?e.def(b.size,"||",c):c;e("if(",m,".type!==",a,"||",m,".size!==",w,"||",aa.map(function(d){return m+"."+d+"!=="+b[d]}).join("||"),"){",g,".bindBuffer(",34962,",",f,".buffer);",g,".vertexAttribPointer(",[k,w,a,b.normalized,b.stride,b.offset],");",m,".type=",a,";",m,".size=",w,";",aa.map(function(d){return m+
"."+d+"="+b[d]+";"}).join(""),"}");ta&&(a=b.divisor,e("if(",m,".divisor!==",a,"){",d.instancing,".vertexAttribDivisorANGLE(",[k,a],");",m,".divisor=",a,";}"))}function z(){e("if(",m,".buffer){",g,".disableVertexAttribArray(",k,");","}if(",N.map(function(d,e){return m+"."+d+"!=="+A[e]}).join("||"),"){",g,".vertexAttrib4f(",k,",",A,");",N.map(function(d,e){return m+"."+d+"="+A[e]+";"}).join(""),"}")}var g=q.gl,k=e.def(a,".location"),m=e.def(q.attributes,"[",k,"]");a=b.state;var f=b.buffer,A=[b.x,b.y,
b.z,b.w],aa=["buffer","normalized","offset","stride"];1===a?h():2===a?z():(e("if(",a,"===",1,"){"),h(),e("}else{"),z(),e("}"))}var q=d.shared;c.forEach(function(c){var q=c.name,g=a.attributes[q],z;if(g){if(!b(g))return;z=g.append(d,e)}else{if(!b(H))return;var m=d.scopeAttrib(q);z={};Object.keys(new Ba).forEach(function(d){z[d]=e.def(m,".",d)})}w(d.link(c),h(c.info.type),z)})}function T(d,e,a,c,b){for(var h=d.shared,w=h.gl,g,q=0;q<c.length;++q){var z=c[q],m=z.name,k=z.info.type,l=a.uniforms[m],z=d.link(z)+
".location",n;if(l){if(!b(l))continue;if(r(l)){m=l.value;if(35678===k||35680===k)k=d.link(m._texture||m.color[0]._texture),e(w,".uniform1i(",z,",",k+".bind());"),e.exit(k,".unbind();");else if(35674===k||35675===k||35676===k)m=d.global.def("new Float32Array(["+Array.prototype.slice.call(m)+"])"),l=2,35675===k?l=3:35676===k&&(l=4),e(w,".uniformMatrix",l,"fv(",z,",false,",m,");");else{switch(k){case 5126:g="1f";break;case 35664:g="2f";break;case 35665:g="3f";break;case 35666:g="4f";break;case 35670:g=
"1i";break;case 5124:g="1i";break;case 35671:g="2i";break;case 35667:g="2i";break;case 35672:g="3i";break;case 35668:g="3i";break;case 35673:g="4i";break;case 35669:g="4i"}e(w,".uniform",g,"(",z,",",y(m)?Array.prototype.slice.call(m):m,");")}continue}else n=l.append(d,e)}else{if(!b(H))continue;n=e.def(h.uniforms,"[",f.id(m),"]")}35678===k?e("if(",n,"&&",n,'._reglType==="framebuffer"){',n,"=",n,".color[0];","}"):35680===k&&e("if(",n,"&&",n,'._reglType==="framebufferCube"){',n,"=",n,".color[0];","}");
m=1;switch(k){case 35678:case 35680:k=e.def(n,"._texture");e(w,".uniform1i(",z,",",k,".bind());");e.exit(k,".unbind();");continue;case 5124:case 35670:g="1i";break;case 35667:case 35671:g="2i";m=2;break;case 35668:case 35672:g="3i";m=3;break;case 35669:case 35673:g="4i";m=4;break;case 5126:g="1f";break;case 35664:g="2f";m=2;break;case 35665:g="3f";m=3;break;case 35666:g="4f";m=4;break;case 35674:g="Matrix2fv";break;case 35675:g="Matrix3fv";break;case 35676:g="Matrix4fv"}e(w,".uniform",g,"(",z,",");
if("M"===g.charAt(0)){var z=Math.pow(k-35674+2,2),B=d.global.def("new Float32Array(",z,")");e("false,(Array.isArray(",n,")||",n," instanceof Float32Array)?",n,":(",F(z,function(d){return B+"["+d+"]="+n+"["+d+"]"}),",",B,")")}else 1<m?e(F(m,function(d){return n+"["+d+"]"})):e(n);e(");")}}function ua(d,e,a,c){function b(h){var g=k[h];return g?g.contextDep&&c.contextDynamic||g.propDep?g.append(d,a):g.append(d,e):e.def(m,".",h)}function h(){function d(){a(x,".drawElementsInstancedANGLE(",[f,n,K,l+"<<(("+
K+"-5121)>>1)",B],");")}function e(){a(x,".drawArraysInstancedANGLE(",[f,l,n,B],");")}q?S?d():(a("if(",q,"){"),d(),a("}else{"),e(),a("}")):e()}function g(){function d(){a(z+".drawElements("+[f,n,K,l+"<<(("+K+"-5121)>>1)"]+");")}function e(){a(z+".drawArrays("+[f,l,n]+");")}q?S?d():(a("if(",q,"){"),d(),a("}else{"),e(),a("}")):e()}var w=d.shared,z=w.gl,m=w.draw,k=c.draw,q=function(){var b=k.elements,h=e;if(b){if(b.contextDep&&c.contextDynamic||b.propDep)h=a;b=b.append(d,h)}else b=h.def(m,".","elements");
b&&h("if("+b+")"+z+".bindBuffer(34963,"+b+".buffer.buffer);");return b}(),f=b("primitive"),l=b("offset"),n=function(){var b=k.count,h=e;if(b){if(b.contextDep&&c.contextDynamic||b.propDep)h=a;b=b.append(d,h)}else b=h.def(m,".","count");return b}();if("number"===typeof n){if(0===n)return}else a("if(",n,"){"),a.exit("}");var B,x;ta&&(B=b("instances"),x=d.instancing);var K=q+".type",S=k.elements&&r(k.elements);ta&&("number"!==typeof B||0<=B)?"string"===typeof B?(a("if(",B,">0){"),h(),a("}else if(",B,
"<0){"),g(),a("}")):h():g()}function Ea(d,e,a,b,c){e=ba();c=e.proc("body",c);ta&&(e.instancing=c.def(e.shared.extensions,".angle_instanced_arrays"));d(e,c,a,b);return e.compile().body}function Fa(d,e,a,b){pa(d,e);X(d,e,a,b.attributes,function(){return!0});T(d,e,a,b.uniforms,function(){return!0});ua(d,e,e,a)}function Ha(d,e){var a=d.proc("draw",1);pa(d,a);ea(d,a,e.context);O(d,a,e.framebuffer);ha(d,a,e);Q(d,a,e.state);V(d,a,e,!1,!0);var b=e.shader.progVar.append(d,a);a(d.shared.gl,".useProgram(",b,
".program);");if(e.shader.program)Fa(d,a,e,e.shader.program);else{var c=d.global.def("{}"),h=a.def(b,".id"),g=a.def(c,"[",h,"]");a(d.cond(g).then(g,".call(this,a0);")["else"](g,"=",c,"[",h,"]=",d.link(function(a){return Ea(Fa,d,e,a,1)}),"(",b,");",g,".call(this,a0);"))}0<Object.keys(e.state).length&&a(d.shared.current,".dirty=true;")}function Ia(d,e,a,b){function c(){return!0}d.batchId="a1";pa(d,e);X(d,e,a,b.attributes,c);T(d,e,a,b.uniforms,c);ua(d,e,e,a)}function Ca(e,a,b,c){function h(e){return e.contextDep&&
w||e.propDep}function g(e){return!h(e)}pa(e,a);var w=b.contextDep,z=a.def(),m=a.def();e.shared.props=m;e.batchId=z;var k=e.scope(),q=e.scope();a(k.entry,"for(",z,"=0;",z,"<","a1",";++",z,"){",m,"=","a0","[",z,"];",q,"}",k.exit);b.needsContext&&ea(e,q,b.context);b.needsFramebuffer&&O(e,q,b.framebuffer);Q(e,q,b.state,h);b.profile&&h(b.profile)&&V(e,q,b,!1,!0);c?(X(e,k,b,c.attributes,g),X(e,q,b,c.attributes,h),T(e,k,b,c.uniforms,g),T(e,q,b,c.uniforms,h),ua(e,k,q,b)):(a=e.global.def("{}"),c=b.shader.progVar.append(e,
q),m=q.def(c,".id"),k=q.def(a,"[",m,"]"),q(e.shared.gl,".useProgram(",c,".program);","if(!",k,"){",k,"=",a,"[",m,"]=",e.link(function(a){return Ea(Ia,e,b,a,2)}),"(",c,");}",k,".call(this,a0[",z,"],",z,");"))}function Da(e,a){function b(e){return e.contextDep&&h||e.propDep}var c=e.proc("batch",2);e.batchId="0";pa(e,c);var h=!1,g=!0;Object.keys(a.context).forEach(function(e){h=h||a.context[e].propDep});h||(ea(e,c,a.context),g=!1);var w=a.framebuffer,z=!1;w?(w.propDep?h=z=!0:w.contextDep&&h&&(z=!0),
z||O(e,c,w)):O(e,c,null);a.state.viewport&&a.state.viewport.propDep&&(h=!0);ha(e,c,a);Q(e,c,a.state,function(e){return!b(e)});a.profile&&b(a.profile)||V(e,c,a,!1,"a1");a.contextDep=h;a.needsContext=g;a.needsFramebuffer=z;g=a.shader.progVar;if(g.contextDep&&h||g.propDep)Ca(e,c,a,null);else if(g=g.append(e,c),c(e.shared.gl,".useProgram(",g,".program);"),a.shader.program)Ca(e,c,a,a.shader.program);else{var w=e.global.def("{}"),z=c.def(g,".id"),q=c.def(w,"[",z,"]");c(e.cond(q).then(q,".call(this,a0,a1);")["else"](q,
"=",w,"[",z,"]=",e.link(function(b){return Ea(Ca,e,a,b,2)}),"(",g,");",q,".call(this,a0,a1);"))}0<Object.keys(a.state).length&&c(e.shared.current,".dirty=true;")}function Pa(e,a){function b(g){var w=a.shader[g];w&&c.set(h.shader,"."+g,w.append(e,c))}var c=e.proc("scope",3);e.batchId="a2";var h=e.shared,g=h.current;ea(e,c,a.context);a.framebuffer&&a.framebuffer.append(e,c);k(Object.keys(a.state)).forEach(function(b){var g=a.state[b].append(e,c);y(g)?g.forEach(function(a,h){c.set(e.next[b],"["+h+"]",
a)}):c.set(h.next,"."+b,g)});V(e,c,a,!0,!0);["elements","offset","count","instances","primitive"].forEach(function(b){var g=a.draw[b];g&&c.set(h.draw,"."+b,""+g.append(e,c))});Object.keys(a.uniforms).forEach(function(b){c.set(h.uniforms,"["+f.id(b)+"]",a.uniforms[b].append(e,c))});Object.keys(a.attributes).forEach(function(b){var h=a.attributes[b].append(e,c),g=e.scopeAttrib(b);Object.keys(new Ba).forEach(function(e){c.set(g,"."+e,h[e])})});b("vert");b("frag");0<Object.keys(a.state).length&&(c(g,
".dirty=true;"),c.exit(g,".dirty=true;"));c("a1(",e.shared.context,",a0,",e.batchId,");")}function Na(e){if("object"===typeof e&&!y(e)){for(var a=Object.keys(e),b=0;b<a.length;++b)if(g.isDynamic(e[a[b]]))return!0;return!1}}function Ja(e,b,c){function h(e,a){q.forEach(function(d){var b=w[d];g.isDynamic(b)&&(b=e.invoke(a,b),a(n,".",d,"=",b,";"))})}var w=b["static"][c];if(w&&Na(w)){var z=e.global,q=Object.keys(w),k=!1,m=!1,f=!1,n=e.global.def("{}");q.forEach(function(b){var c=w[b];if(g.isDynamic(c))"function"===
typeof c&&(c=w[b]=g.unbox(c)),b=a(c,null),k=k||b.thisDep,f=f||b.propDep,m=m||b.contextDep;else{z(n,".",b,"=");switch(typeof c){case "number":z(c);break;case "string":z('"',c,'"');break;case "object":Array.isArray(c)&&z("[",c.join(),"]");break;default:z(e.link(c))}z(";")}});b.dynamic[c]=new g.DynamicVariable(4,{thisDep:k,contextDep:m,propDep:f,ref:n,append:h});delete b["static"][c]}}var Ba=Aa.Record,ca={add:32774,subtract:32778,"reverse subtract":32779};t.ext_blend_minmax&&(ca.min=32775,ca.max=32776);
var ta=t.angle_instanced_arrays,oa=t.webgl_draw_buffers,e={dirty:!0,profile:ga.profile},z={},w=[],wa={},xa={};R("dither",3024);R("blend.enable",3042);G("blend.color","blendColor",[0,0,0,0]);G("blend.equation","blendEquationSeparate",[32774,32774]);G("blend.func","blendFuncSeparate",[1,0,1,0]);R("depth.enable",2929,!0);G("depth.func","depthFunc",513);G("depth.range","depthRange",[0,1]);G("depth.mask","depthMask",!0);G("colorMask","colorMask",[!0,!0,!0,!0]);R("cull.enable",2884);G("cull.face","cullFace",
1029);G("frontFace","frontFace",2305);G("lineWidth","lineWidth",1);R("polygonOffset.enable",32823);G("polygonOffset.offset","polygonOffset",[0,0]);R("sample.alpha",32926);R("sample.enable",32928);G("sample.coverage","sampleCoverage",[1,!1]);R("stencil.enable",2960);G("stencil.mask","stencilMask",-1);G("stencil.func","stencilFunc",[519,0,-1]);G("stencil.opFront","stencilOpSeparate",[1028,7680,7680,7680]);G("stencil.opBack","stencilOpSeparate",[1029,7680,7680,7680]);R("scissor.enable",3089);G("scissor.box",
"scissor",[0,0,h.drawingBufferWidth,h.drawingBufferHeight]);G("viewport","viewport",[0,0,h.drawingBufferWidth,h.drawingBufferHeight]);var Qa={gl:h,context:S,strings:f,next:z,current:e,draw:q,elements:u,buffer:M,shader:va,attributes:Aa.state,uniforms:K,framebuffer:D,extensions:t,timer:ma,isBufferArgs:l},Ma={primTypes:E,compareFuncs:B,blendFuncs:m,blendEquations:ca,stencilOps:Y,glTypes:C,orientationType:L};oa&&(Ma.backBuffer=[1029],Ma.drawBuffer=F(p.maxDrawbuffers,function(e){return 0===e?[0]:F(e,function(e){return 36064+
e})}));var Ra=0;return{next:z,current:e,procs:function(){var a=ba(),b=a.proc("poll"),c=a.proc("refresh"),g=a.block();b(g);c(g);var w=a.shared,z=w.gl,q=w.next,k=w.current;g(k,".dirty=false;");O(a,b);O(a,c,null,!0);var m=h.getExtension("angle_instanced_arrays"),f;m&&(f=a.link(m));for(var n=0;n<p.maxAttributes;++n){var l=c.def(w.attributes,"[",n,"]"),B=a.cond(l,".buffer");B.then(z,".enableVertexAttribArray(",n,");",z,".bindBuffer(",34962,",",l,".buffer.buffer);",z,".vertexAttribPointer(",n,",",l,".size,",
l,".type,",l,".normalized,",l,".stride,",l,".offset);")["else"](z,".disableVertexAttribArray(",n,");",z,".vertexAttrib4f(",n,",",l,".x,",l,".y,",l,".z,",l,".w);",l,".buffer=null;");c(B);m&&c(f,".vertexAttribDivisorANGLE(",n,",",l,".divisor);")}Object.keys(wa).forEach(function(e){var h=wa[e],w=g.def(q,".",e),m=a.block();m("if(",w,"){",z,".enable(",h,")}else{",z,".disable(",h,")}",k,".",e,"=",w,";");c(m);b("if(",w,"!==",k,".",e,"){",m,"}")});Object.keys(xa).forEach(function(h){var w=xa[h],m=e[h],f,
n,l=a.block();l(z,".",w,"(");y(m)?(w=m.length,f=a.global.def(q,".",h),n=a.global.def(k,".",h),l(F(w,function(e){return f+"["+e+"]"}),");",F(w,function(e){return n+"["+e+"]="+f+"["+e+"];"}).join("")),b("if(",F(w,function(e){return f+"["+e+"]!=="+n+"["+e+"]"}).join("||"),"){",l,"}")):(f=g.def(q,".",h),n=g.def(k,".",h),l(f,");",k,".",h,"=",f,";"),b("if(",f,"!==",n,"){",l,"}"));c(l)});return a.compile()}(),compile:function(e,a,b,c,h){var g=ba();g.stats=g.link(h);Object.keys(a["static"]).forEach(function(e){Ja(g,
a,e)});n.forEach(function(a){Ja(g,e,a)});b=la(e,a,b,c,g);Ha(g,b);Pa(g,b);Da(g,b);return g.compile()}}}},{"./constants/dtypes.json":4,"./constants/primitives.json":5,"./dynamic":8,"./util/codegen":21,"./util/is-array-like":24,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/loop":27}],8:[function(f,p,u){function l(c,a){this.id=r++;this.type=c;this.data=a}function k(c){if(0===c.length)return[];var a=c.charAt(0),b=c.charAt(c.length-1);if(1<c.length&&a===b&&('"'===a||"'"===a))return['"'+c.substr(1,
c.length-2).replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"'];if(a=/\[(false|true|null|\d+|'[^']*'|"[^"]*")\]/.exec(c))return k(c.substr(0,a.index)).concat(k(a[1])).concat(k(c.substr(a.index+a[0].length)));a=c.split(".");if(1===a.length)return['"'+c.replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"'];c=[];for(b=0;b<a.length;++b)c=c.concat(k(a[b]));return c}function x(c){return"["+k(c).join("][")+"]"}var r=0;p.exports={DynamicVariable:l,define:function(c,a){return new l(c,x(a+""))},isDynamic:function(c){return"function"===
typeof c&&!c._reglType||c instanceof l},unbox:function(c,a){return"function"===typeof c?new l(0,c):c},accessor:x}},{}],9:[function(f,p,u){var l=f("./util/is-typed-array"),k=f("./util/is-ndarray"),x=f("./util/values"),r=f("./constants/primitives.json"),c=f("./constants/usage.json");p.exports=function(a,b,f,p){function t(a){this.id=C++;E[this.id]=this;this.buffer=a;this.primType=4;this.type=this.vertCount=0}function y(c,g,n,r,x,h,t){c.buffer.bind();if(g){var y=t;t||l(g)&&(!k(g)||l(g.data))||(y=b.oes_element_index_uint?
5125:5123);f._initBuffer(c.buffer,g,n,y,3)}else a.bufferData(34963,h,n),c.buffer.dtype=y||5121,c.buffer.usage=n,c.buffer.dimension=3,c.buffer.byteLength=h;y=t;if(!t){switch(c.buffer.dtype){case 5121:case 5120:y=5121;break;case 5123:case 5122:y=5123;break;case 5125:case 5124:y=5125}c.buffer.dtype=y}c.type=y;g=x;0>g&&(g=c.buffer.byteLength,5123===y?g>>=1:5125===y&&(g>>=2));c.vertCount=g;g=r;0>r&&(g=4,r=c.buffer.dimension,1===r&&(g=0),2===r&&(g=1),3===r&&(g=4));c.primType=g}function g(a){p.elementsCount--;
delete E[a.id];a.buffer.destroy();a.buffer=null}var E={},C=0,N={uint8:5121,uint16:5123};b.oes_element_index_uint&&(N.uint32=5125);t.prototype.bind=function(){this.buffer.bind()};var n=[];return{create:function(a,b){function n(a){if(a)if("number"===typeof a)x(a),C.primType=4,C.vertCount=a|0,C.type=5121;else{var b=null,g=35044,m=-1,f=-1,t=0,B=0;if(Array.isArray(a)||l(a)||k(a))b=a;else if("data"in a&&(b=a.data),"usage"in a&&(g=c[a.usage]),"primitive"in a&&(m=r[a.primitive]),"count"in a&&(f=a.count|0),
"type"in a&&(B=N[a.type]),"length"in a)t=a.length|0;else if(t=f,5123===B||5122===B)t*=2;else if(5125===B||5124===B)t*=4;y(C,b,g,m,f,t,B)}else x(),C.primType=4,C.vertCount=0,C.type=5121;return n}var x=f.create(null,34963,!0),C=new t(x._buffer);p.elementsCount++;n(a);n._reglType="elements";n._elements=C;n.subdata=function(a,b){x.subdata(a,b);return n};n.destroy=function(){g(C)};return n},createStream:function(a){var b=n.pop();b||(b=new t(f.create(null,34963,!0,!1)._buffer));y(b,a,35040,-1,-1,0,0);return b},
destroyStream:function(a){n.push(a)},getElements:function(a){return"function"===typeof a&&a._elements instanceof t?a._elements:null},clear:function(){x(E).forEach(g)}}}},{"./constants/primitives.json":5,"./constants/usage.json":6,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/values":31}],10:[function(f,p,u){p.exports=function(f,k){function x(a){a=a.toLowerCase();var c;try{c=r[a]=f.getExtension(a)}catch(k){}return!!c}for(var r={},c=0;c<k.extensions.length;++c){var a=k.extensions[c];if(!x(a))return k.onDestroy(),
k.onDone('"'+a+'" extension is not supported by the current WebGL context, try upgrading your system or a different browser'),null}k.optionalExtensions.forEach(x);return{extensions:r,restore:function(){Object.keys(r).forEach(function(a){if(!x(a))throw Error("(regl): error restoring extension "+a);})}}}},{}],11:[function(f,p,u){var l=f("./util/values"),k=f("./util/extend"),x=[];x[6408]=4;var r=[];r[5121]=1;r[5126]=4;r[36193]=2;p.exports=function(c,a,b,f,p,t){function y(a,c,b){this.target=a;this.texture=
c;this.renderbuffer=b;var h=a=0;c?(a=c.width,h=c.height):b&&(a=b.width,h=b.height);this.width=a;this.height=h}function g(a){a&&(a.texture&&a.texture._texture.decRef(),a.renderbuffer&&a.renderbuffer._renderbuffer.decRef())}function E(a,c,b){a&&(a.texture?a.texture._texture.refCount+=1:a.renderbuffer._renderbuffer.refCount+=1)}function C(a,b){b&&(b.texture?c.framebufferTexture2D(36160,a,b.target,b.texture._texture.texture,0):c.framebufferRenderbuffer(36160,a,36161,b.renderbuffer._renderbuffer.renderbuffer))}
function N(a){var b=3553,c=null,h=null,g=a;"object"===typeof a&&(g=a.data,"target"in a&&(b=a.target|0));a=g._reglType;"texture2d"===a?c=g:"textureCube"===a?c=g:"renderbuffer"===a&&(h=g,b=36161);return new y(b,c,h)}function n(a,b,c,h,g){if(c)return a=f.create2D({width:a,height:b,format:h,type:g}),a._texture.refCount=0,new y(3553,a,null);a=p.create({width:a,height:b,format:h});a._renderbuffer.refCount=0;return new y(36161,null,a)}function m(a){return a&&(a.texture||a.renderbuffer)}function B(a,b,c){a&&
(a.texture?a.texture.resize(b,c):a.renderbuffer&&a.renderbuffer.resize(b,c))}function u(){this.id=Z++;D[this.id]=this;this.framebuffer=c.createFramebuffer();this.height=this.width=0;this.colorAttachments=[];this.depthStencilAttachment=this.stencilAttachment=this.depthAttachment=null}function L(a){a.colorAttachments.forEach(g);g(a.depthAttachment);g(a.stencilAttachment);g(a.depthStencilAttachment)}function H(a){c.deleteFramebuffer(a.framebuffer);a.framebuffer=null;t.framebufferCount--;delete D[a.id]}
function h(a){var h;c.bindFramebuffer(36160,a.framebuffer);var g=a.colorAttachments;for(h=0;h<g.length;++h)C(36064+h,g[h]);for(h=g.length;h<b.maxColorAttachments;++h)c.framebufferTexture2D(36160,36064+h,3553,null,0);c.framebufferTexture2D(36160,33306,3553,null,0);c.framebufferTexture2D(36160,36096,3553,null,0);c.framebufferTexture2D(36160,36128,3553,null,0);C(36096,a.depthAttachment);C(36128,a.stencilAttachment);C(33306,a.depthStencilAttachment);c.checkFramebufferStatus(36160);c.bindFramebuffer(36160,
Ka.next);Ka.cur=Ka.next;c.getError()}function fa(a,b){function c(a,b){var k,f=0,l=0,t=!0,y=!0;k=null;var B=!0,C="rgba",F="uint8",p=1,M=null,H=null,u=null,Y=!1;if("number"===typeof a)f=a|0,l=b|0||f;else if(a){"shape"in a?(l=a.shape,f=l[0],l=l[1]):("radius"in a&&(f=l=a.radius),"width"in a&&(f=a.width),"height"in a&&(l=a.height));if("color"in a||"colors"in a)k=a.color||a.colors,Array.isArray(k);if(!k){"colorCount"in a&&(p=a.colorCount|0);"colorTexture"in a&&(B=!!a.colorTexture,C="rgba4");if("colorType"in
a&&(F=a.colorType,!B))if("half float"===F||"float16"===F)C="rgba16f";else if("float"===F||"float32"===F)C="rgba32f";"colorFormat"in a&&(C=a.colorFormat,0<=La.indexOf(C)?B=!0:0<=za.indexOf(C)&&(B=!1))}if("depthTexture"in a||"depthStencilTexture"in a)Y=!(!a.depthTexture&&!a.depthStencilTexture);"depth"in a&&("boolean"===typeof a.depth?t=a.depth:(M=a.depth,y=!1));"stencil"in a&&("boolean"===typeof a.stencil?y=a.stencil:(H=a.stencil,t=!1));"depthStencil"in a&&("boolean"===typeof a.depthStencil?t=y=a.depthStencil:
(u=a.depthStencil,y=t=!1))}else f=l=1;var D=null,fa=null,K=null,O=null;if(Array.isArray(k))D=k.map(N);else if(k)D=[N(k)];else for(D=Array(p),k=0;k<p;++k)D[k]=n(f,l,B,C,F);f=f||D[0].width;l=l||D[0].height;M?fa=N(M):t&&!y&&(fa=n(f,l,Y,"depth","uint32"));H?K=N(H):y&&!t&&(K=n(f,l,!1,"stencil","uint8"));u?O=N(u):!M&&!H&&y&&t&&(O=n(f,l,Y,"depth stencil","depth stencil"));t=null;for(k=0;k<D.length;++k)E(D[k],f,l),D[k]&&D[k].texture&&(y=x[D[k].texture._texture.format]*r[D[k].texture._texture.type],null===
t&&(t=y));E(fa,f,l);E(K,f,l);E(O,f,l);L(g);g.width=f;g.height=l;g.colorAttachments=D;g.depthAttachment=fa;g.stencilAttachment=K;g.depthStencilAttachment=O;c.color=D.map(m);c.depth=m(fa);c.stencil=m(K);c.depthStencil=m(O);c.width=g.width;c.height=g.height;h(g);return c}var g=new u;t.framebufferCount++;c(a,b);return k(c,{resize:function(a,b){var k=a|0,f=b|0||k;if(k===g.width&&f===g.height)return c;for(var m=g.colorAttachments,l=0;l<m.length;++l)B(m[l],k,f);B(g.depthAttachment,k,f);B(g.stencilAttachment,
k,f);B(g.depthStencilAttachment,k,f);g.width=c.width=k;g.height=c.height=f;h(g);return c},_reglType:"framebuffer",_framebuffer:g,destroy:function(){H(g);L(g)}})}var Ka={cur:null,next:null,dirty:!1},La=["rgba"],za=["rgba4","rgb565","rgb5 a1"];a.ext_srgb&&za.push("srgba");a.ext_color_buffer_half_float&&za.push("rgba16f","rgb16f");a.webgl_color_buffer_float&&za.push("rgba32f");var Ga=["uint8"];a.oes_texture_half_float&&Ga.push("half float","float16");a.oes_texture_float&&Ga.push("float","float32");var Z=
0,D={};return k(Ka,{getFramebuffer:function(a){return"function"===typeof a&&"framebuffer"===a._reglType&&(a=a._framebuffer,a instanceof u)?a:null},create:fa,createCube:function(a){function c(a){var g,h={color:null},m=0,l=null;g="rgba";var n="uint8",r=1;if("number"===typeof a)m=a|0;else if(a){"shape"in a?m=a.shape[0]:("radius"in a&&(m=a.radius|0),"width"in a?m=a.width|0:"height"in a&&(m=a.height|0));if("color"in a||"colors"in a)l=a.color||a.colors,Array.isArray(l);l||("colorCount"in a&&(r=a.colorCount|
0),"colorType"in a&&(n=a.colorType),"colorFormat"in a&&(g=a.colorFormat));"depth"in a&&(h.depth=a.depth);"stencil"in a&&(h.stencil=a.stencil);"depthStencil"in a&&(h.depthStencil=a.depthStencil)}else m=1;if(l)if(Array.isArray(l))for(a=[],g=0;g<l.length;++g)a[g]=l[g];else a=[l];else for(a=Array(r),l={radius:m,format:g,type:n},g=0;g<r;++g)a[g]=f.createCube(l);h.color=Array(a.length);for(g=0;g<a.length;++g)r=a[g],m=m||r.width,h.color[g]={target:34069,data:a[g]};for(g=0;6>g;++g){for(r=0;r<a.length;++r)h.color[r].target=
34069+g;0<g&&(h.depth=b[0].depth,h.stencil=b[0].stencil,h.depthStencil=b[0].depthStencil);if(b[g])b[g](h);else b[g]=fa(h)}return k(c,{width:m,height:m,color:a})}var b=Array(6);c(a);return k(c,{faces:b,resize:function(a){var g=a|0;if(g===c.width)return c;var h=c.color;for(a=0;a<h.length;++a)h[a].resize(g);for(a=0;6>a;++a)b[a].resize(g);c.width=c.height=g;return c},_reglType:"framebufferCube",destroy:function(){b.forEach(function(a){a.destroy()})}})},clear:function(){l(D).forEach(H)},restore:function(){l(D).forEach(function(a){a.framebuffer=
c.createFramebuffer();h(a)})}})}},{"./util/extend":22,"./util/values":31}],12:[function(f,p,u){p.exports=function(f,k){var x=1;k.ext_texture_filter_anisotropic&&(x=f.getParameter(34047));var r=1,c=1;k.webgl_draw_buffers&&(r=f.getParameter(34852),c=f.getParameter(36063));return{colorBits:[f.getParameter(3410),f.getParameter(3411),f.getParameter(3412),f.getParameter(3413)],depthBits:f.getParameter(3414),stencilBits:f.getParameter(3415),subpixelBits:f.getParameter(3408),extensions:Object.keys(k).filter(function(a){return!!k[a]}),
maxAnisotropic:x,maxDrawbuffers:r,maxColorAttachments:c,pointSizeDims:f.getParameter(33901),lineWidthDims:f.getParameter(33902),maxViewportDims:f.getParameter(3386),maxCombinedTextureUnits:f.getParameter(35661),maxCubeMapSize:f.getParameter(34076),maxRenderbufferSize:f.getParameter(34024),maxTextureUnits:f.getParameter(34930),maxTextureSize:f.getParameter(3379),maxAttributes:f.getParameter(34921),maxVertexUniforms:f.getParameter(36347),maxVertexTextureUnits:f.getParameter(35660),maxVaryingVectors:f.getParameter(36348),
maxFragmentUniforms:f.getParameter(36349),glsl:f.getParameter(35724),renderer:f.getParameter(7937),vendor:f.getParameter(7936),version:f.getParameter(7938)}}},{}],13:[function(f,p,u){var l=f("./util/is-typed-array");p.exports=function(k,f,r,c,a,b){return function(a){var b;b=null===f.next?5121:f.next.colorAttachments[0].texture._texture.type;var t=0,y=0,g=c.framebufferWidth,p=c.framebufferHeight,C=null;l(a)?C=a:a&&(t=a.x|0,y=a.y|0,g=(a.width||c.framebufferWidth-t)|0,p=(a.height||c.framebufferHeight-
y)|0,C=a.data||null);r();a=g*p*4;C||(5121===b?C=new Uint8Array(a):5126===b&&(C=C||new Float32Array(a)));k.pixelStorei(3333,4);k.readPixels(t,y,g,p,6408,b,C);return C}}},{"./util/is-typed-array":26}],14:[function(f,p,u){var l=f("./util/values"),k=[];k[32854]=2;k[32855]=2;k[36194]=2;k[33189]=2;k[36168]=1;k[34041]=4;k[35907]=4;k[34836]=16;k[34842]=8;k[34843]=6;p.exports=function(f,r,c,a,b){function p(a){this.id=g++;this.refCount=1;this.renderbuffer=a;this.format=32854;this.height=this.width=0;b.profile&&
(this.stats={size:0})}function M(b){var c=b.renderbuffer;f.bindRenderbuffer(36161,null);f.deleteRenderbuffer(c);b.renderbuffer=null;b.refCount=0;delete E[b.id];a.renderbufferCount--}var t={rgba4:32854,rgb565:36194,"rgb5 a1":32855,depth:33189,stencil:36168,"depth stencil":34041};r.ext_srgb&&(t.srgba=35907);r.ext_color_buffer_half_float&&(t.rgba16f=34842,t.rgb16f=34843);r.webgl_color_buffer_float&&(t.rgba32f=34836);var y=[];Object.keys(t).forEach(function(a){y[t[a]]=a});var g=0,E={};p.prototype.decRef=
function(){0>=--this.refCount&&M(this)};b.profile&&(a.getTotalRenderbufferSize=function(){var a=0;Object.keys(E).forEach(function(b){a+=E[b].stats.size});return a});return{create:function(c,g){function n(a,c){var g=0,l=0,h=32854;"object"===typeof a&&a?("shape"in a?(l=a.shape,g=l[0]|0,l=l[1]|0):("radius"in a&&(g=l=a.radius|0),"width"in a&&(g=a.width|0),"height"in a&&(l=a.height|0)),"format"in a&&(h=t[a.format])):"number"===typeof a?(g=a|0,l="number"===typeof c?c|0:g):a||(g=l=1);if(g!==m.width||l!==
m.height||h!==m.format)return n.width=m.width=g,n.height=m.height=l,m.format=h,f.bindRenderbuffer(36161,m.renderbuffer),f.renderbufferStorage(36161,h,g,l),b.profile&&(m.stats.size=k[m.format]*m.width*m.height),n.format=y[m.format],n}var m=new p(f.createRenderbuffer());E[m.id]=m;a.renderbufferCount++;n(c,g);n.resize=function(a,c){var g=a|0,l=c|0||g;if(g===m.width&&l===m.height)return n;n.width=m.width=g;n.height=m.height=l;f.bindRenderbuffer(36161,m.renderbuffer);f.renderbufferStorage(36161,m.format,
g,l);b.profile&&(m.stats.size=k[m.format]*m.width*m.height);return n};n._reglType="renderbuffer";n._renderbuffer=m;b.profile&&(n.stats=m.stats);n.destroy=function(){m.decRef()};return n},clear:function(){l(E).forEach(M)},restore:function(){l(E).forEach(function(a){a.renderbuffer=f.createRenderbuffer();f.bindRenderbuffer(36161,a.renderbuffer);f.renderbufferStorage(36161,a.format,a.width,a.height)});f.bindRenderbuffer(36161,null)}}}},{"./util/values":31}],15:[function(f,p,u){var l=f("./util/values");
p.exports=function(f,x,r,c){function a(a,c,b,g){this.name=a;this.id=c;this.location=b;this.info=g}function b(a,c){for(var b=0;b<a.length;++b)if(a[b].id===c.id){a[b].location=c.location;return}a.push(c)}function p(a,c,b){b=35632===a?y:g;var l=b[c];if(!l){var r=x.str(c),l=f.createShader(a);f.shaderSource(l,r);f.compileShader(l);b[c]=l}return l}function M(a,b){this.id=u++;this.fragId=a;this.vertId=b;this.program=null;this.uniforms=[];this.attributes=[];c.profile&&(this.stats={uniformsCount:0,attributesCount:0})}
function t(g,m){var l,r;l=p(35632,g.fragId);r=p(35633,g.vertId);var t=g.program=f.createProgram();f.attachShader(t,l);f.attachShader(t,r);f.linkProgram(t);var y=f.getProgramParameter(t,35718);c.profile&&(g.stats.uniformsCount=y);var h=g.uniforms;for(l=0;l<y;++l)if(r=f.getActiveUniform(t,l))if(1<r.size)for(var C=0;C<r.size;++C){var E=r.name.replace("[0]","["+C+"]");b(h,new a(E,x.id(E),f.getUniformLocation(t,E),r))}else b(h,new a(r.name,x.id(r.name),f.getUniformLocation(t,r.name),r));y=f.getProgramParameter(t,
35721);c.profile&&(g.stats.attributesCount=y);h=g.attributes;for(l=0;l<y;++l)(r=f.getActiveAttrib(t,l))&&b(h,new a(r.name,x.id(r.name),f.getAttribLocation(t,r.name),r))}var y={},g={},E={},C=[],u=0;c.profile&&(r.getMaxUniformsCount=function(){var a=0;C.forEach(function(b){b.stats.uniformsCount>a&&(a=b.stats.uniformsCount)});return a},r.getMaxAttributesCount=function(){var a=0;C.forEach(function(b){b.stats.attributesCount>a&&(a=b.stats.attributesCount)});return a});return{clear:function(){var a=f.deleteShader.bind(f);
l(y).forEach(a);y={};l(g).forEach(a);g={};C.forEach(function(a){f.deleteProgram(a.program)});C.length=0;E={};r.shaderCount=0},program:function(a,b,c){r.shaderCount++;var g=E[b];g||(g=E[b]={});var f=g[a];f||(f=new M(b,a),t(f,c),g[a]=f,C.push(f));return f},restore:function(){y={};g={};for(var a=0;a<C.length;++a)t(C[a])},shader:p,frag:-1,vert:-1}}},{"./util/values":31}],16:[function(f,p,u){p.exports=function(){return{bufferCount:0,elementsCount:0,framebufferCount:0,shaderCount:0,textureCount:0,cubeCount:0,
renderbufferCount:0,maxTextureUnits:0}}},{}],17:[function(f,p,u){p.exports=function(){var f={"":0},k=[""];return{id:function(x){var r=f[x];if(r)return r;r=f[x]=k.length;k.push(x);return r},str:function(f){return k[f]}}}},{}],18:[function(f,p,u){function l(a){return Array.isArray(a)&&(0===a.length||"number"===typeof a[0])}function k(a){return Array.isArray(a)&&0!==a.length&&E(a[0])?!0:!1}function x(a){return Object.prototype.toString.call(a)}function r(a){if(!a)return!1;var b=x(a);return 0<=Y.indexOf(b)?
!0:l(a)||k(a)||t(a)}function c(a,b){36193===a.type?(a.data=g(b),y.freeType(b)):a.data=b}function a(a,b,c,g,f,k){a="undefined"!==typeof H[a]?H[a]:B[a]*L[b];k&&(a*=6);if(f){for(g=0;1<=c;)g+=a*c*c,c/=2;return g}return a*c*g}var b=f("./util/extend"),F=f("./util/values"),M=f("./util/is-typed-array"),t=f("./util/is-ndarray"),y=f("./util/pool"),g=f("./util/to-half-float"),E=f("./util/is-array-like"),C=f("./util/flatten");u=f("./constants/arraytypes.json");var N=f("./constants/arraytypes.json"),n=[9984,9986,
9985,9987],m=[0,6409,6410,6407,6408],B={};B[6409]=B[6406]=B[6402]=1;B[34041]=B[6410]=2;B[6407]=B[35904]=3;B[6408]=B[35906]=4;var Y=Object.keys(u).concat(["[object HTMLCanvasElement]","[object CanvasRenderingContext2D]","[object HTMLImageElement]","[object HTMLVideoElement]"]),L=[];L[5121]=1;L[5126]=4;L[36193]=2;L[5123]=2;L[5125]=4;var H=[];H[32854]=2;H[32855]=2;H[36194]=2;H[34041]=4;H[33776]=.5;H[33777]=.5;H[33778]=1;H[33779]=1;H[35986]=.5;H[35987]=1;H[34798]=1;H[35840]=.5;H[35841]=.25;H[35842]=.5;
H[35843]=.25;H[36196]=.5;p.exports=function(h,f,p,u,H,L,Z){function D(){this.format=this.internalformat=6408;this.type=5121;this.flipY=this.premultiplyAlpha=this.compressed=!1;this.unpackAlignment=1;this.channels=this.height=this.width=this.colorSpace=0}function K(a,b){a.internalformat=b.internalformat;a.format=b.format;a.type=b.type;a.compressed=b.compressed;a.premultiplyAlpha=b.premultiplyAlpha;a.flipY=b.flipY;a.unpackAlignment=b.unpackAlignment;a.colorSpace=b.colorSpace;a.width=b.width;a.height=
b.height;a.channels=b.channels}function Y(a,b){if("object"===typeof b&&b){"premultiplyAlpha"in b&&(a.premultiplyAlpha=b.premultiplyAlpha);"flipY"in b&&(a.flipY=b.flipY);"alignment"in b&&(a.unpackAlignment=b.alignment);"colorSpace"in b&&(a.colorSpace=pa[b.colorSpace]);"type"in b&&(a.type=V[b.type]);var c=a.width,g=a.height,h=a.channels,f=!1;"shape"in b?(c=b.shape[0],g=b.shape[1],3===b.shape.length&&(h=b.shape[2],f=!0)):("radius"in b&&(c=g=b.radius),"width"in b&&(c=b.width),"height"in b&&(g=b.height),
"channels"in b&&(h=b.channels,f=!0));a.width=c|0;a.height=g|0;a.channels=h|0;c=!1;"format"in b&&(c=b.format,g=a.internalformat=X[c],a.format=Pa[g],c in V&&!("type"in b)&&(a.type=V[c]),c in T&&(a.compressed=!0),c=!0);!f&&c?a.channels=B[a.format]:f&&!c&&a.channels!==m[a.format]&&(a.format=a.internalformat=m[a.channels])}}function va(a){h.pixelStorei(37440,a.flipY);h.pixelStorei(37441,a.premultiplyAlpha);h.pixelStorei(37443,a.colorSpace);h.pixelStorei(3317,a.unpackAlignment)}function q(){D.call(this);
this.yOffset=this.xOffset=0;this.data=null;this.needsFree=!1;this.element=null;this.needsCopy=!1}function S(a,b){var h=null;r(b)?h=b:b&&(Y(a,b),"x"in b&&(a.xOffset=b.x|0),"y"in b&&(a.yOffset=b.y|0),r(b.data)&&(h=b.data));if(b.copy){var f=H.viewportWidth,n=H.viewportHeight;a.width=a.width||f-a.xOffset;a.height=a.height||n-a.yOffset;a.needsCopy=!0}else if(!h)a.width=a.width||1,a.height=a.height||1,a.channels=a.channels||4;else if(M(h))a.channels=a.channels||4,a.data=h,"type"in b||5121!==a.type||(a.type=
N[Object.prototype.toString.call(h)]|0);else if(l(h)){a.channels=a.channels||4;f=h;n=f.length;switch(a.type){case 5121:case 5123:case 5125:case 5126:n=y.allocType(a.type,n);n.set(f);a.data=n;break;case 36193:a.data=g(f)}a.alignment=1;a.needsFree=!0}else if(t(h)){f=h.data;Array.isArray(f)||5121!==a.type||(a.type=N[Object.prototype.toString.call(f)]|0);var n=h.shape,q=h.stride,p,F,d,v;3===n.length?(d=n[2],v=q[2]):v=d=1;p=n[0];F=n[1];n=q[0];q=q[1];a.alignment=1;a.width=p;a.height=F;a.channels=d;a.format=
a.internalformat=m[d];a.needsFree=!0;p=v;h=h.offset;d=a.width;v=a.height;F=a.channels;for(var u=y.allocType(36193===a.type?5126:a.type,d*v*F),B=0,A=0;A<v;++A)for(var D=0;D<d;++D)for(var ua=0;ua<F;++ua)u[B++]=f[n*D+q*A+p*ua+h];c(a,u)}else if("[object HTMLCanvasElement]"===x(h)||"[object CanvasRenderingContext2D]"===x(h))"[object HTMLCanvasElement]"===x(h)?a.element=h:a.element=h.canvas,a.width=a.element.width,a.height=a.element.height,a.channels=4;else if("[object HTMLImageElement]"===x(h))a.element=
h,a.width=h.naturalWidth,a.height=h.naturalHeight,a.channels=4;else if("[object HTMLVideoElement]"===x(h))a.element=h,a.width=h.videoWidth,a.height=h.videoHeight,a.channels=4;else if(k(h)){f=a.width||h[0].length;n=a.height||h.length;q=a.channels;q=E(h[0][0])?q||h[0][0].length:q||1;p=C.shape(h);d=1;for(v=0;v<p.length;++v)d*=p[v];d=y.allocType(36193===a.type?5126:a.type,d);C.flatten(h,p,"",d);c(a,d);a.alignment=1;a.width=f;a.height=n;a.channels=q;a.format=a.internalformat=m[q];a.needsFree=!0}}function ma(a,
b,c,g,f){var k=a.element,l=a.data,m=a.internalformat,d=a.format,r=a.type,n=a.width,q=a.height;va(a);k?h.texSubImage2D(b,f,c,g,d,r,k):a.compressed?h.compressedTexSubImage2D(b,f,c,g,m,n,q,l):a.needsCopy?(u(),h.copyTexSubImage2D(b,f,c,g,a.xOffset,a.yOffset,n,q)):h.texSubImage2D(b,f,c,g,n,q,d,r,l)}function ga(){return Na.pop()||new q}function W(a){a.needsFree&&y.freeType(a.data);q.call(a);Na.push(a)}function R(){D.call(this);this.genMipmaps=!1;this.mipmapHint=4352;this.mipmask=0;this.images=Array(16)}
function G(a,b,c){var g=a.images[0]=ga();a.mipmask=1;g.width=a.width=b;g.height=a.height=c;g.channels=a.channels=4}function ba(a,b){var c=null;if(r(b))c=a.images[0]=ga(),K(c,a),S(c,b),a.mipmask=1;else if(Y(a,b),Array.isArray(b.mipmap))for(var g=b.mipmap,h=0;h<g.length;++h)c=a.images[h]=ga(),K(c,a),c.width>>=h,c.height>>=h,S(c,g[h]),a.mipmask|=1<<h;else c=a.images[0]=ga(),K(c,a),S(c,b),a.mipmask=1;K(a,a.images[0])}function na(a,b){for(var c=a.images,g=0;g<c.length&&c[g];++g){var f=c[g],k=b,l=g,m=f.element,
d=f.data,r=f.internalformat,n=f.format,q=f.type,t=f.width,y=f.height;va(f);m?h.texImage2D(k,l,n,n,q,m):f.compressed?h.compressedTexImage2D(k,l,r,t,y,0,d):f.needsCopy?(u(),h.copyTexImage2D(k,l,n,f.xOffset,f.yOffset,t,y,0)):h.texImage2D(k,l,n,t,y,0,n,q,d)}}function ya(){var a=Ja.pop()||new R;D.call(a);for(var b=a.mipmask=0;16>b;++b)a.images[b]=null;return a}function U(a){for(var b=a.images,c=0;c<b.length;++c)b[c]&&W(b[c]),b[c]=null;Ja.push(a)}function ia(){this.magFilter=this.minFilter=9728;this.wrapT=
this.wrapS=33071;this.anisotropic=1;this.genMipmaps=!1;this.mipmapHint=4352}function ka(a,b){"min"in b&&(a.minFilter=Q[b.min],0<=n.indexOf(a.minFilter)&&(a.genMipmaps=!0));"mag"in b&&(a.magFilter=ha[b.mag]);var c=a.wrapS,g=a.wrapT;if("wrap"in b){var h=b.wrap;"string"===typeof h?c=g=O[h]:Array.isArray(h)&&(c=O[h[0]],g=O[h[1]])}else"wrapS"in b&&(c=O[b.wrapS]),"wrapT"in b&&(g=O[b.wrapT]);a.wrapS=c;a.wrapT=g;"anisotropic"in b&&(a.anisotropic=b.anisotropic);if("mipmap"in b){c=!1;switch(typeof b.mipmap){case "string":a.mipmapHint=
ea[b.mipmap];c=a.genMipmaps=!0;break;case "boolean":c=a.genMipmaps=b.mipmap;break;case "object":a.genMipmaps=!1,c=!0}!c||"min"in b||(a.minFilter=9984)}}function ra(a,b){h.texParameteri(b,10241,a.minFilter);h.texParameteri(b,10240,a.magFilter);h.texParameteri(b,10242,a.wrapS);h.texParameteri(b,10243,a.wrapT);f.ext_texture_filter_anisotropic&&h.texParameteri(b,34046,a.anisotropic);a.genMipmaps&&(h.hint(33170,a.mipmapHint),h.generateMipmap(b))}function sa(a){D.call(this);this.mipmask=0;this.internalformat=
6408;this.id=Ba++;this.refCount=1;this.target=a;this.texture=h.createTexture();this.unit=-1;this.bindCount=0;this.texInfo=new ia;Z.profile&&(this.stats={size:0})}function da(a){h.activeTexture(33984);h.bindTexture(a.target,a.texture)}function ja(){var a=oa[0];a?h.bindTexture(a.target,a.texture):h.bindTexture(3553,null)}function la(a){var b=a.texture,c=a.unit,g=a.target;0<=c&&(h.activeTexture(33984+c),h.bindTexture(g,null),oa[c]=null);h.deleteTexture(b);a.texture=null;a.params=null;a.pixels=null;a.refCount=
0;delete ca[a.id];L.textureCount--}var ea={"don't care":4352,"dont care":4352,nice:4354,fast:4353},O={repeat:10497,clamp:33071,mirror:33648},ha={nearest:9728,linear:9729},Q=b({mipmap:9987,"nearest mipmap nearest":9984,"linear mipmap nearest":9985,"nearest mipmap linear":9986,"linear mipmap linear":9987},ha),pa={none:0,browser:37444},V={uint8:5121,rgba4:32819,rgb565:33635,"rgb5 a1":32820},X={alpha:6406,luminance:6409,"luminance alpha":6410,rgb:6407,rgba:6408,rgba4:32854,"rgb5 a1":32855,rgb565:36194},
T={};f.ext_srgb&&(X.srgb=35904,X.srgba=35906);f.oes_texture_float&&(V.float32=V["float"]=5126);f.oes_texture_half_float&&(V.float16=V["half float"]=36193);f.webgl_depth_texture&&(b(X,{depth:6402,"depth stencil":34041}),b(V,{uint16:5123,uint32:5125,"depth stencil":34042}));f.webgl_compressed_texture_s3tc&&b(T,{"rgb s3tc dxt1":33776,"rgba s3tc dxt1":33777,"rgba s3tc dxt3":33778,"rgba s3tc dxt5":33779});f.webgl_compressed_texture_atc&&b(T,{"rgb atc":35986,"rgba atc explicit alpha":35987,"rgba atc interpolated alpha":34798});
f.webgl_compressed_texture_pvrtc&&b(T,{"rgb pvrtc 4bppv1":35840,"rgb pvrtc 2bppv1":35841,"rgba pvrtc 4bppv1":35842,"rgba pvrtc 2bppv1":35843});f.webgl_compressed_texture_etc1&&(T["rgb etc1"]=36196);var ua=Array.prototype.slice.call(h.getParameter(34467));Object.keys(T).forEach(function(a){var b=T[a];0<=ua.indexOf(b)&&(X[a]=b)});var Ea=Object.keys(X);p.textureFormats=Ea;var Fa=[];Object.keys(X).forEach(function(a){Fa[X[a]]=a});var Ha=[];Object.keys(V).forEach(function(a){Ha[V[a]]=a});var Ia=[];Object.keys(ha).forEach(function(a){Ia[ha[a]]=
a});var Ca=[];Object.keys(Q).forEach(function(a){Ca[Q[a]]=a});var Da=[];Object.keys(O).forEach(function(a){Da[O[a]]=a});var Pa=Ea.reduce(function(a,b){var c=X[b];6409===c||6406===c||6409===c||6410===c||6402===c||34041===c?a[c]=c:32855===c||0<=b.indexOf("rgba")?a[c]=6408:a[c]=6407;return a},{}),Na=[],Ja=[],Ba=0,ca={},ta=p.maxTextureUnits,oa=Array(ta).map(function(){return null});b(sa.prototype,{bind:function(){this.bindCount+=1;var a=this.unit;if(0>a){for(var b=0;b<ta;++b){var c=oa[b];if(c){if(0<c.bindCount)continue;
c.unit=-1}oa[b]=this;a=b;break}Z.profile&&L.maxTextureUnits<a+1&&(L.maxTextureUnits=a+1);this.unit=a;h.activeTexture(33984+a);h.bindTexture(this.target,this.texture)}return a},unbind:function(){--this.bindCount},decRef:function(){0>=--this.refCount&&la(this)}});Z.profile&&(L.getTotalTextureSize=function(){var a=0;Object.keys(ca).forEach(function(b){a+=ca[b].stats.size});return a});return{create2D:function(b,c){function g(b,c){var e=f.texInfo;ia.call(e);var h=ya();"number"===typeof b?"number"===typeof c?
G(h,b|0,c|0):G(h,b|0,b|0):b?(ka(e,b),ba(h,b)):G(h,1,1);e.genMipmaps&&(h.mipmask=(h.width<<1)-1);f.mipmask=h.mipmask;K(f,h);f.internalformat=h.internalformat;g.width=h.width;g.height=h.height;da(f);na(h,3553);ra(e,3553);ja();U(h);Z.profile&&(f.stats.size=a(f.internalformat,f.type,h.width,h.height,e.genMipmaps,!1));g.format=Fa[f.internalformat];g.type=Ha[f.type];g.mag=Ia[e.magFilter];g.min=Ca[e.minFilter];g.wrapS=Da[e.wrapS];g.wrapT=Da[e.wrapT];return g}var f=new sa(3553);ca[f.id]=f;L.textureCount++;
g(b,c);g.subimage=function(a,b,c,e){b|=0;c|=0;e|=0;var d=ga();K(d,f);d.width=0;d.height=0;S(d,a);d.width=d.width||(f.width>>e)-b;d.height=d.height||(f.height>>e)-c;da(f);ma(d,3553,b,c,e);ja();W(d);return g};g.resize=function(b,c){var e=b|0,k=c|0||e;if(e===f.width&&k===f.height)return g;g.width=f.width=e;g.height=f.height=k;da(f);for(var d=0;f.mipmask>>d;++d)h.texImage2D(3553,d,f.format,e>>d,k>>d,0,f.format,f.type,null);ja();Z.profile&&(f.stats.size=a(f.internalformat,f.type,e,k,!1,!1));return g};
g._reglType="texture2d";g._texture=f;Z.profile&&(g.stats=f.stats);g.destroy=function(){f.decRef()};return g},createCube:function(b,c,g,f,k,l){function m(b,c,e,g,h,f){var k,l=n.texInfo;ia.call(l);for(k=0;6>k;++k)d[k]=ya();if("number"===typeof b||!b)for(b=b|0||1,k=0;6>k;++k)G(d[k],b,b);else if("object"===typeof b)if(c)ba(d[0],b),ba(d[1],c),ba(d[2],e),ba(d[3],g),ba(d[4],h),ba(d[5],f);else if(ka(l,b),Y(n,b),"faces"in b)for(b=b.faces,k=0;6>k;++k)K(d[k],n),ba(d[k],b[k]);else for(k=0;6>k;++k)ba(d[k],b);
K(n,d[0]);n.mipmask=l.genMipmaps?(d[0].width<<1)-1:d[0].mipmask;n.internalformat=d[0].internalformat;m.width=d[0].width;m.height=d[0].height;da(n);for(k=0;6>k;++k)na(d[k],34069+k);ra(l,34067);ja();Z.profile&&(n.stats.size=a(n.internalformat,n.type,m.width,m.height,l.genMipmaps,!0));m.format=Fa[n.internalformat];m.type=Ha[n.type];m.mag=Ia[l.magFilter];m.min=Ca[l.minFilter];m.wrapS=Da[l.wrapS];m.wrapT=Da[l.wrapT];for(k=0;6>k;++k)U(d[k]);return m}var n=new sa(34067);ca[n.id]=n;L.cubeCount++;var d=Array(6);
m(b,c,g,f,k,l);m.subimage=function(a,b,c,d,e){c|=0;d|=0;e|=0;var g=ga();K(g,n);g.width=0;g.height=0;S(g,b);g.width=g.width||(n.width>>e)-c;g.height=g.height||(n.height>>e)-d;da(n);ma(g,34069+a,c,d,e);ja();W(g);return m};m.resize=function(b){b|=0;if(b!==n.width){m.width=n.width=b;m.height=n.height=b;da(n);for(var c=0;6>c;++c)for(var d=0;n.mipmask>>d;++d)h.texImage2D(34069+c,d,n.format,b>>d,b>>d,0,n.format,n.type,null);ja();Z.profile&&(n.stats.size=a(n.internalformat,n.type,m.width,m.height,!1,!0));
return m}};m._reglType="textureCube";m._texture=n;Z.profile&&(m.stats=n.stats);m.destroy=function(){n.decRef()};return m},clear:function(){for(var a=0;a<ta;++a)h.activeTexture(33984+a),h.bindTexture(3553,null),oa[a]=null;F(ca).forEach(la);L.cubeCount=0;L.textureCount=0},getTexture:function(a){return null},restore:function(){F(ca).forEach(function(a){a.texture=h.createTexture();h.bindTexture(a.target,a.texture);for(var b=0;32>b;++b)if(0!==(a.mipmask&1<<b))if(3553===a.target)h.texImage2D(3553,b,a.internalformat,
a.width>>b,a.height>>b,0,a.internalformat,a.type,null);else for(var c=0;6>c;++c)h.texImage2D(34069+c,b,a.internalformat,a.width>>b,a.height>>b,0,a.internalformat,a.type,null);ra(a.texInfo,a.target)})}}}},{"./constants/arraytypes.json":3,"./util/extend":22,"./util/flatten":23,"./util/is-array-like":24,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/pool":28,"./util/to-half-float":30,"./util/values":31}],19:[function(f,p,u){p.exports=function(f,k){function p(){this.endQueryIndex=this.startQueryIndex=
-1;this.sum=0;this.stats=null}function r(a,b,c){var f=F.pop()||new p;f.startQueryIndex=a;f.endQueryIndex=b;f.sum=0;f.stats=c;u.push(f)}var c=k.ext_disjoint_timer_query;if(!c)return null;var a=[],b=[],F=[],u=[],t=[],y=[];return{beginQuery:function(g){var f=a.pop()||c.createQueryEXT();c.beginQueryEXT(35007,f);b.push(f);r(b.length-1,b.length,g)},endQuery:function(){c.endQueryEXT(35007)},pushScopeStats:r,update:function(){var g,f;g=b.length;if(0!==g){y.length=Math.max(y.length,g+1);t.length=Math.max(t.length,
g+1);t[0]=0;var k=y[0]=0;for(f=g=0;f<b.length;++f){var l=b[f];c.getQueryObjectEXT(l,34919)?(k+=c.getQueryObjectEXT(l,34918),a.push(l)):b[g++]=l;t[f+1]=k;y[f+1]=g}b.length=g;for(f=g=0;f<u.length;++f){var k=u[f],n=k.startQueryIndex,l=k.endQueryIndex;k.sum+=t[l]-t[n];n=y[n];l=y[l];l===n?(k.stats.gpuTime+=k.sum/1E6,F.push(k)):(k.startQueryIndex=n,k.endQueryIndex=l,u[g++]=k)}u.length=g}},getNumPendingQueries:function(){return b.length},clear:function(){a.push.apply(a,b);for(var g=0;g<a.length;g++)c.deleteQueryEXT(a[g]);
b.length=0;a.length=0},restore:function(){b.length=0;a.length=0}}}},{}],20:[function(f,p,u){p.exports="undefined"!==typeof performance&&performance.now?function(){return performance.now()}:function(){return+new Date}},{}],21:[function(f,p,u){function l(f){return Array.prototype.slice.call(f)}function k(f){return l(f).join("")}var x=f("./extend");p.exports=function(){function f(){var b=[],c=[];return x(function(){b.push.apply(b,l(arguments))},{def:function(){var f="v"+a++;c.push(f);0<arguments.length&&
(b.push(f,"="),b.push.apply(b,l(arguments)),b.push(";"));return f},toString:function(){return k([0<c.length?"var "+c+";":"",k(b)])}})}function c(){function a(f,k){c(f,k,"=",b.def(f,k),";")}var b=f(),c=f(),k=b.toString,t=c.toString;return x(function(){b.apply(b,l(arguments))},{def:b.def,entry:b,exit:c,save:a,set:function(c,f,k){a(c,f);b(c,f,"=",k,";")},toString:function(){return k()+t()}})}var a=0,b=[],p=[],u=f(),t={};return{global:u,link:function(c){for(var g=0;g<p.length;++g)if(p[g]===c)return b[g];
g="g"+a++;b.push(g);p.push(c);return g},block:f,proc:function(a,b){function f(){var a="a"+l.length;l.push(a);return a}var l=[];b=b||0;for(var r=0;r<b;++r)f();var r=c(),n=r.toString;return t[a]=x(r,{arg:f,toString:function(){return k(["function(",l.join(),"){",n(),"}"])}})},scope:c,cond:function(){var a=k(arguments),b=c(),f=c(),r=b.toString,t=f.toString;return x(b,{then:function(){b.apply(b,l(arguments));return this},"else":function(){f.apply(f,l(arguments));return this},toString:function(){var b=
t();b&&(b="else{"+b+"}");return k(["if(",a,"){",r(),"}",b])}})},compile:function(){var a=['"use strict";',u,"return {"];Object.keys(t).forEach(function(b){a.push('"',b,'":',t[b].toString(),",")});a.push("}");var c=k(a).replace(/;/g,";\n").replace(/}/g,"}\n").replace(/{/g,"{\n");return Function.apply(null,b.concat(c)).apply(null,p)}}}},{"./extend":22}],22:[function(f,p,u){p.exports=function(f,k){for(var p=Object.keys(k),r=0;r<p.length;++r)f[p[r]]=k[p[r]];return f}},{}],23:[function(f,p,u){function l(f,
c,a,b,k,l){for(var t=0;t<c;++t)for(var p=f[t],g=0;g<a;++g)for(var x=p[g],u=0;u<b;++u)k[l++]=x[u]}function k(f,c,a,b,p){for(var x=1,t=a+1;t<c.length;++t)x*=c[t];var y=c[a];if(4===c.length-a){var g=c[a+1],u=c[a+2];c=c[a+3];for(t=0;t<y;++t)l(f[t],g,u,c,b,p),p+=x}else for(t=0;t<y;++t)k(f[t],c,a+1,b,p),p+=x}var x=f("./pool");p.exports={shape:function(f){for(var c=[];f.length;f=f[0])c.push(f.length);return c},flatten:function(f,c,a,b){var p=1;if(c.length)for(var u=0;u<c.length;++u)p*=c[u];else p=0;a=b||
x.allocType(a,p);switch(c.length){case 0:break;case 1:b=c[0];for(c=0;c<b;++c)a[c]=f[c];break;case 2:b=c[0];c=c[1];for(u=p=0;u<b;++u)for(var t=f[u],y=0;y<c;++y)a[p++]=t[y];break;case 3:l(f,c[0],c[1],c[2],a,0);break;default:k(f,c,0,a,0)}return a}}},{"./pool":28}],24:[function(f,p,u){var l=f("./is-typed-array");p.exports=function(f){return Array.isArray(f)||l(f)}},{"./is-typed-array":26}],25:[function(f,p,u){var l=f("./is-typed-array");p.exports=function(f){return!!f&&"object"===typeof f&&Array.isArray(f.shape)&&
Array.isArray(f.stride)&&"number"===typeof f.offset&&f.shape.length===f.stride.length&&(Array.isArray(f.data)||l(f.data))}},{"./is-typed-array":26}],26:[function(f,p,u){var l=f("../constants/arraytypes.json");p.exports=function(f){return Object.prototype.toString.call(f)in l}},{"../constants/arraytypes.json":3}],27:[function(f,p,u){p.exports=function(f,k){for(var p=Array(f),r=0;r<f;++r)p[r]=k(r);return p}},{}],28:[function(f,p,u){function l(c){var a,b;a=(65535<c)<<4;c>>>=a;b=(255<c)<<3;c>>>=b;a|=
b;b=(15<c)<<2;c>>>=b;a|=b;b=(3<c)<<1;return a|b|c>>>b>>1}function k(c){a:{for(var a=16;268435456>=a;a*=16)if(c<=a){c=a;break a}c=0}a=r[l(c)>>2];return 0<a.length?a.pop():new ArrayBuffer(c)}function x(c){r[l(c.byteLength)>>2].push(c)}var r=f("./loop")(8,function(){return[]});p.exports={alloc:k,free:x,allocType:function(c,a){var b=null;switch(c){case 5120:b=new Int8Array(k(a),0,a);break;case 5121:b=new Uint8Array(k(a),0,a);break;case 5122:b=new Int16Array(k(2*a),0,a);break;case 5123:b=new Uint16Array(k(2*
a),0,a);break;case 5124:b=new Int32Array(k(4*a),0,a);break;case 5125:b=new Uint32Array(k(4*a),0,a);break;case 5126:b=new Float32Array(k(4*a),0,a);break;default:return null}return b.length!==a?b.subarray(0,a):b},freeType:function(c){x(c.buffer)}}},{"./loop":27}],29:[function(f,p,u){p.exports="function"===typeof requestAnimationFrame&&"function"===typeof cancelAnimationFrame?{next:function(f){return requestAnimationFrame(f)},cancel:function(f){return cancelAnimationFrame(f)}}:{next:function(f){return setTimeout(f,
16)},cancel:clearTimeout}},{}],30:[function(f,p,u){var l=f("./pool"),k=new Float32Array(1),x=new Uint32Array(k.buffer);p.exports=function(f){for(var c=l.allocType(5123,f.length),a=0;a<f.length;++a)if(isNaN(f[a]))c[a]=65535;else if(Infinity===f[a])c[a]=31744;else if(-Infinity===f[a])c[a]=64512;else{k[0]=f[a];var b=x[0],p=b>>>31<<15,u=(b<<1>>>24)-127,b=b>>13&1023;c[a]=-24>u?p:-14>u?p+(b+1024>>-14-u):15<u?p+31744:p+(u+15<<10)+b}return c}},{"./pool":28}],31:[function(f,p,u){p.exports=function(f){return Object.keys(f).map(function(k){return f[k]})}},
{}],32:[function(f,p,u){function l(a,b,f){function k(){var b=window.innerWidth,g=window.innerHeight;a!==document.body&&(g=a.getBoundingClientRect(),b=g.right-g.left,g=g.top-g.bottom);l.width=f*b;l.height=f*g;c(l.style,{width:b+"px",height:g+"px"})}var l=document.createElement("canvas");c(l.style,{border:0,margin:0,padding:0,top:0,left:0});a.appendChild(l);a===document.body&&(l.style.position="absolute",c(a.style,{margin:0,padding:0}));window.addEventListener("resize",k,!1);k();return{canvas:l,onDestroy:function(){window.removeEventListener("resize",
k);a.removeChild(l)}}}function k(a,b){function c(f){try{return a.getContext(f,b)}catch(k){return null}}return c("webgl")||c("experimental-webgl")||c("webgl-experimental")}function x(a){return"string"===typeof a?a.split():a}function r(a){return"string"===typeof a?document.querySelector(a):a}var c=f("./util/extend");p.exports=function(a){var b=a||{},c,f,p,u;a={};var g=[],E=[],C="undefined"===typeof window?1:window.devicePixelRatio,N=!1,n=function(a){},m=function(){};"string"===typeof b?c=document.querySelector(b):
"object"===typeof b&&("string"===typeof b.nodeName&&"function"===typeof b.appendChild&&"function"===typeof b.getBoundingClientRect?c=b:"function"===typeof b.drawArrays||"function"===typeof b.drawElements?(u=b,p=u.canvas):("gl"in b?u=b.gl:"canvas"in b?p=r(b.canvas):"container"in b&&(f=r(b.container)),"attributes"in b&&(a=b.attributes),"extensions"in b&&(g=x(b.extensions)),"optionalExtensions"in b&&(E=x(b.optionalExtensions)),"onDone"in b&&(n=b.onDone),"profile"in b&&(N=!!b.profile),"pixelRatio"in b&&
(C=+b.pixelRatio)));c&&("canvas"===c.nodeName.toLowerCase()?p=c:f=c);if(!u){if(!p){c=l(f||document.body,n,C);if(!c)return null;p=c.canvas;m=c.onDestroy}u=k(p,a)}return u?{gl:u,canvas:p,container:f,extensions:g,optionalExtensions:E,pixelRatio:C,profile:N,onDone:n,onDestroy:m}:(m(),n("webgl not supported, try upgrading your browser or graphics drivers http://get.webgl.org"),null)}},{"./util/extend":22}],33:[function(f,p,u){function l(a,b){for(var c=0;c<a.length;++c)if(a[c]===b)return c;return-1}var k=
f("./lib/util/extend"),x=f("./lib/dynamic"),r=f("./lib/util/raf"),c=f("./lib/util/clock"),a=f("./lib/strings"),b=f("./lib/webgl"),F=f("./lib/extension"),M=f("./lib/limits"),t=f("./lib/buffer"),y=f("./lib/elements"),g=f("./lib/texture"),E=f("./lib/renderbuffer"),C=f("./lib/framebuffer"),N=f("./lib/attribute"),n=f("./lib/shader"),m=f("./lib/read"),B=f("./lib/core"),Y=f("./lib/stats"),L=f("./lib/timer");p.exports=function(f){function h(){if(0===Q.length)G&&G.update(),T=null;else{T=r.next(h);K();for(var a=
Q.length-1;0<=a;--a){var b=Q[a];b&&b(U,null,0)}q.flush();G&&G.update()}}function p(){!T&&0<Q.length&&(T=r.next(h))}function u(){T&&(r.cancel(h),T=null)}function La(a){a.preventDefault();u();pa.forEach(function(a){a()})}function za(a){q.getError();ma.restore();sa.restore();ka.restore();da.restore();ja.restore();la.restore();G&&G.restore();ea.procs.refresh();p();V.forEach(function(a){a()})}function Ga(a){function b(a){var c={},f={};Object.keys(a).forEach(function(b){var g=a[b];x.isDynamic(g)?f[b]=x.unbox(g,
b):c[b]=g});return{dynamic:f,"static":c}}function c(a){for(;q.length<a;)q.push(null);return q}var f=b(a.context||{}),g=b(a.uniforms||{}),h=b(a.attributes||{}),l=b(function(a){function b(a){if(a in c){var f=c[a];delete c[a];Object.keys(f).forEach(function(b){c[a+"."+b]=f[b]})}}var c=k({},a);delete c.uniforms;delete c.attributes;delete c.context;"stencil"in c&&c.stencil.op&&(c.stencil.opBack=c.stencil.opFront=c.stencil.op,delete c.stencil.op);b("blend");b("depth");b("cull");b("stencil");b("polygonOffset");
b("scissor");b("sample");return c}(a));a={gpuTime:0,cpuTime:0,count:0};var f=ea.compile(l,h,g,f,a),m=f.draw,n=f.batch,p=f.scope,q=[];return k(function(a,b){var f;if("function"===typeof a)return p.call(this,null,a,0);if("function"===typeof b)if("number"===typeof a)for(f=0;f<a;++f)p.call(this,null,b,f);else if(Array.isArray(a))for(f=0;f<a.length;++f)p.call(this,a[f],b,f);else return p.call(this,a,b,0);else if("number"===typeof a){if(0<a)return n.call(this,c(a|0),a|0)}else if(Array.isArray(a)){if(a.length)return n.call(this,
a,a.length)}else return m.call(this,a)},{stats:a})}function Z(a){Q.push(a);p();return{cancel:function(){function b(){var a=l(Q,b);Q[a]=Q[Q.length-1];--Q.length;0>=Q.length&&u()}var c=l(Q,a);Q[c]=b}}}function D(){var a=O.viewport,b=O.scissor_box;a[0]=a[1]=b[0]=b[1]=0;U.viewportWidth=U.framebufferWidth=U.drawingBufferWidth=a[2]=b[2]=q.drawingBufferWidth;U.viewportHeight=U.framebufferHeight=U.drawingBufferHeight=a[3]=b[3]=q.drawingBufferHeight}function K(){U.tick+=1;U.time=va();D();ea.procs.poll()}function Aa(){D();
ea.procs.refresh();G&&G.update()}function va(){return(c()-ba)/1E3}f=b(f);if(!f)return null;var q=f.gl,S=q.getContextAttributes();q.isContextLost();var ma=F(q,f);if(!ma)return null;var ga=a(),W=Y(),R=ma.extensions,G=L(q,R),ba=c(),na=q.drawingBufferWidth,ya=q.drawingBufferHeight,U={tick:0,time:0,viewportWidth:na,viewportHeight:ya,framebufferWidth:na,framebufferHeight:ya,drawingBufferWidth:na,drawingBufferHeight:ya,pixelRatio:f.pixelRatio},ia=M(q,R),ka=t(q,W,f),ra=y(q,R,ka,W),na=N(q,R,ia,ka,ga),sa=n(q,
ga,W,f),da=g(q,R,ia,function(){ea.procs.poll()},U,W,f),ja=E(q,R,ia,W,f),la=C(q,R,ia,da,ja,W),ea=B(q,ga,R,ia,ka,ra,da,la,{},na,sa,{elements:null,primitive:4,count:-1,offset:0,instances:-1},U,G,f),ga=m(q,la,ea.procs.poll,U,S,R),O=ea.next,ha=q.canvas,Q=[],pa=[],V=[],X=[f.onDestroy],T=null;ha&&(ha.addEventListener("webglcontextlost",La,!1),ha.addEventListener("webglcontextrestored",za,!1));Aa();S=k(Ga,{clear:function(a){var b=0;ea.procs.poll();var c=a.color;c&&(q.clearColor(+c[0]||0,+c[1]||0,+c[2]||0,
+c[3]||0),b|=16384);"depth"in a&&(q.clearDepth(+a.depth),b|=256);"stencil"in a&&(q.clearStencil(a.stencil|0),b|=1024);q.clear(b)},prop:x.define.bind(null,1),context:x.define.bind(null,2),"this":x.define.bind(null,3),draw:Ga({}),buffer:function(a){return ka.create(a,34962,!1,!1)},elements:function(a){return ra.create(a,!1)},texture:da.create2D,cube:da.createCube,renderbuffer:ja.create,framebuffer:la.create,framebufferCube:la.createCube,attributes:S,frame:Z,on:function(a,b){var c;switch(a){case "frame":return Z(b);
case "lost":c=pa;break;case "restore":c=V;break;case "destroy":c=X}c.push(b);return{cancel:function(){for(var a=0;a<c.length;++a)if(c[a]===b){c[a]=c[c.length-1];c.pop();break}}}},limits:ia,hasExtension:function(a){return 0<=ia.extensions.indexOf(a.toLowerCase())},read:ga,destroy:function(){Q.length=0;u();ha&&(ha.removeEventListener("webglcontextlost",La),ha.removeEventListener("webglcontextrestored",za));sa.clear();la.clear();ja.clear();da.clear();ra.clear();ka.clear();G&&G.clear();X.forEach(function(a){a()})},
_gl:q,_refresh:Aa,poll:function(){K();G&&G.update()},now:va,stats:W});f.onDone(null,S);return S}},{"./lib/attribute":1,"./lib/buffer":2,"./lib/core":7,"./lib/dynamic":8,"./lib/elements":9,"./lib/extension":10,"./lib/framebuffer":11,"./lib/limits":12,"./lib/read":13,"./lib/renderbuffer":14,"./lib/shader":15,"./lib/stats":16,"./lib/strings":17,"./lib/texture":18,"./lib/timer":19,"./lib/util/clock":20,"./lib/util/extend":22,"./lib/util/raf":29,"./lib/webgl":32}]},{},[33])(33)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],199:[function(require,module,exports){
/* global XMLHttpRequest */
var configParameters = [
  'manifest',
  'onDone',
  'onProgress',
  'onError'
]

var manifestParameters = [
  'type',
  'src',
  'stream',
  'credentials',
  'parser'
]

var parserParameters = [
  'onData',
  'onDone'
]

var STATE_ERROR = -1
var STATE_DATA = 0
var STATE_COMPLETE = 1

function raise (message) {
  throw new Error('resl: ' + message)
}

function checkType (object, parameters, name) {
  Object.keys(object).forEach(function (param) {
    if (parameters.indexOf(param) < 0) {
      raise('invalid parameter "' + param + '" in ' + name)
    }
  })
}

function Loader (name, cancel) {
  this.state = STATE_DATA
  this.ready = false
  this.progress = 0
  this.name = name
  this.cancel = cancel
}

module.exports = function resl (config) {
  if (typeof config !== 'object' || !config) {
    raise('invalid or missing configuration')
  }

  checkType(config, configParameters, 'config')

  var manifest = config.manifest
  if (typeof manifest !== 'object' || !manifest) {
    raise('missing manifest')
  }

  function getFunction (name, dflt) {
    if (name in config) {
      var func = config[name]
      if (typeof func !== 'function') {
        raise('invalid callback "' + name + '"')
      }
      return func
    }
    return null
  }

  var onDone = getFunction('onDone')
  if (!onDone) {
    raise('missing onDone() callback')
  }

  var onProgress = getFunction('onProgress')
  var onError = getFunction('onError')

  var assets = {}

  var state = STATE_DATA

  function loadXHR (request) {
    var name = request.name
    var stream = request.stream
    var binary = request.type === 'binary'
    var parser = request.parser

    var xhr = new XMLHttpRequest()
    var asset = null

    var loader = new Loader(name, cancel)

    if (stream) {
      xhr.onreadystatechange = onReadyStateChange
    } else {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          onReadyStateChange()
        }
      }
    }

    if (binary) {
      xhr.responseType = 'arraybuffer'
    }

    function onReadyStateChange () {
      if (xhr.readyState < 2 ||
          loader.state === STATE_COMPLETE ||
          loader.state === STATE_ERROR) {
        return
      }
      if (xhr.status !== 200) {
        return abort('error loading resource "' + request.name + '"')
      }
      if (xhr.readyState > 2 && loader.state === STATE_DATA) {
        var response
        if (request.type === 'binary') {
          response = xhr.response
        } else {
          response = xhr.responseText
        }
        if (parser.data) {
          try {
            asset = parser.data(response)
          } catch (e) {
            return abort(e)
          }
        } else {
          asset = response
        }
      }
      if (xhr.readyState > 3 && loader.state === STATE_DATA) {
        if (parser.done) {
          try {
            asset = parser.done()
          } catch (e) {
            return abort(e)
          }
        }
        loader.state = STATE_COMPLETE
      }
      assets[name] = asset
      loader.progress = 0.75 * loader.progress + 0.25
      loader.ready =
        (request.stream && !!asset) ||
        loader.state === STATE_COMPLETE
      notifyProgress()
    }

    function cancel () {
      if (loader.state === STATE_COMPLETE || loader.state === STATE_ERROR) {
        return
      }
      xhr.onreadystatechange = null
      xhr.abort()
      loader.state = STATE_ERROR
    }

    // set up request
    if (request.credentials) {
      xhr.withCredentials = true
    }
    xhr.open('GET', request.src, true)
    xhr.send()

    return loader
  }

  function loadElement (request, element) {
    var name = request.name
    var parser = request.parser

    var loader = new Loader(name, cancel)
    var asset = element

    function handleProgress () {
      if (loader.state === STATE_DATA) {
        if (parser.data) {
          try {
            asset = parser.data(element)
          } catch (e) {
            return abort(e)
          }
        } else {
          asset = element
        }
      }
    }

    function onProgress (e) {
      handleProgress()
      assets[name] = asset
      if (e.lengthComputable) {
        loader.progress = Math.max(loader.progress, e.loaded / e.total)
      } else {
        loader.progress = 0.75 * loader.progress + 0.25
      }
      notifyProgress(name)
    }

    function onComplete () {
      handleProgress()
      if (loader.state === STATE_DATA) {
        if (parser.done) {
          try {
            asset = parser.done()
          } catch (e) {
            return abort(e)
          }
        }
        loader.state = STATE_COMPLETE
      }
      loader.progress = 1
      loader.ready = true
      assets[name] = asset
      removeListeners()
      notifyProgress('finish ' + name)
    }

    function onError () {
      abort('error loading asset "' + name + '"')
    }

    if (request.stream) {
      element.addEventListener('progress', onProgress)
    }
    if (request.type === 'image') {
      element.addEventListener('load', onComplete)
    } else {
      var canPlay = false
      var loadedMetaData = false
      element.addEventListener('loadedmetadata', function () {
        loadedMetaData = true
        if (canPlay) {
          onComplete()
        }
      })
      element.addEventListener('canplay', function () {
        canPlay = true
        if (loadedMetaData) {
          onComplete()
        }
      })
    }
    element.addEventListener('error', onError)

    function removeListeners () {
      if (request.stream) {
        element.removeEventListener('progress', onProgress)
      }
      if (request.type === 'image') {
        element.addEventListener('load', onComplete)
      } else {
        element.addEventListener('canplay', onComplete)
      }
      element.removeEventListener('error', onError)
    }

    function cancel () {
      if (loader.state === STATE_COMPLETE || loader.state === STATE_ERROR) {
        return
      }
      loader.state = STATE_ERROR
      removeListeners()
      element.src = ''
    }

    // set up request
    if (request.credentials) {
      element.crossOrigin = 'use-credentials'
    } else {
      element.crossOrigin = 'anonymous'
    }
    element.src = request.src

    return loader
  }

  var loaders = {
    text: loadXHR,
    binary: function (request) {
      // TODO use fetch API for streaming if supported
      return loadXHR(request)
    },
    image: function (request) {
      return loadElement(request, document.createElement('img'))
    },
    video: function (request) {
      return loadElement(request, document.createElement('video'))
    },
    audio: function (request) {
      return loadElement(request, document.createElement('audio'))
    }
  }

  // First we parse all objects in order to verify that all type information
  // is correct
  var pending = Object.keys(manifest).map(function (name) {
    var request = manifest[name]
    if (typeof request === 'string') {
      request = {
        src: request
      }
    } else if (typeof request !== 'object' || !request) {
      raise('invalid asset definition "' + name + '"')
    }

    checkType(request, manifestParameters, 'asset "' + name + '"')

    function getParameter (prop, accepted, init) {
      var value = init
      if (prop in request) {
        value = request[prop]
      }
      if (accepted.indexOf(value) < 0) {
        raise('invalid ' + prop + ' "' + value + '" for asset "' + name + '", possible values: ' + accepted)
      }
      return value
    }

    function getString (prop, required, init) {
      var value = init
      if (prop in request) {
        value = request[prop]
      } else if (required) {
        raise('missing ' + prop + ' for asset "' + name + '"')
      }
      if (typeof value !== 'string') {
        raise('invalid ' + prop + ' for asset "' + name + '", must be a string')
      }
      return value
    }

    function getParseFunc (name, dflt) {
      if (name in request.parser) {
        var result = request.parser[name]
        if (typeof result !== 'function') {
          raise('invalid parser callback ' + name + ' for asset "' + name + '"')
        }
        return result
      } else {
        return dflt
      }
    }

    var parser = {}
    if ('parser' in request) {
      if (typeof request.parser === 'function') {
        parser = {
          data: request.parser
        }
      } else if (typeof request.parser === 'object' && request.parser) {
        checkType(parser, parserParameters, 'parser for asset "' + name + '"')
        if (!('onData' in parser)) {
          raise('missing onData callback for parser in asset "' + name + '"')
        }
        parser = {
          data: getParseFunc('onData'),
          done: getParseFunc('onDone')
        }
      } else {
        raise('invalid parser for asset "' + name + '"')
      }
    }

    return {
      name: name,
      type: getParameter('type', Object.keys(loaders), 'text'),
      stream: !!request.stream,
      credentials: !!request.credentials,
      src: getString('src', true, ''),
      parser: parser
    }
  }).map(function (request) {
    return (loaders[request.type])(request)
  })

  function abort (message) {
    if (state === STATE_ERROR || state === STATE_COMPLETE) {
      return
    }
    state = STATE_ERROR
    pending.forEach(function (loader) {
      loader.cancel()
    })
    if (onError) {
      if (typeof message === 'string') {
        onError(new Error('resl: ' + message))
      } else {
        onError(message)
      }
    } else {
      console.error('resl error:', message)
    }
  }

  function notifyProgress (message) {
    if (state === STATE_ERROR || state === STATE_COMPLETE) {
      return
    }

    var progress = 0
    var numReady = 0
    pending.forEach(function (loader) {
      if (loader.ready) {
        numReady += 1
      }
      progress += loader.progress
    })

    if (numReady === pending.length) {
      state = STATE_COMPLETE
      onDone(assets)
    } else {
      if (onProgress) {
        onProgress(progress / pending.length, message)
      }
    }
  }

  if (pending.length === 0) {
    setTimeout(function () {
      notifyProgress('done')
    }, 1)
  }
}

},{}],200:[function(require,module,exports){

// for compression
var win = window;
var doc = document || {};
var root = doc.documentElement || {};

// detect if we need to use firefox KeyEvents vs KeyboardEvents
var use_key_event = true;
try {
    doc.createEvent('KeyEvents');
}
catch (err) {
    use_key_event = false;
}

// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
function check_kb(ev, opts) {
    if (ev.ctrlKey != (opts.ctrlKey || false) ||
        ev.altKey != (opts.altKey || false) ||
        ev.shiftKey != (opts.shiftKey || false) ||
        ev.metaKey != (opts.metaKey || false) ||
        ev.keyCode != (opts.keyCode || 0) ||
        ev.charCode != (opts.charCode || 0)) {

        ev = document.createEvent('Event');
        ev.initEvent(opts.type, opts.bubbles, opts.cancelable);
        ev.ctrlKey  = opts.ctrlKey || false;
        ev.altKey   = opts.altKey || false;
        ev.shiftKey = opts.shiftKey || false;
        ev.metaKey  = opts.metaKey || false;
        ev.keyCode  = opts.keyCode || 0;
        ev.charCode = opts.charCode || 0;
    }

    return ev;
}

// modern browsers, do a proper dispatchEvent()
var modern = function(type, opts) {
    opts = opts || {};

    // which init fn do we use
    var family = typeOf(type);
    var init_fam = family;
    if (family === 'KeyboardEvent' && use_key_event) {
        family = 'KeyEvents';
        init_fam = 'KeyEvent';
    }

    var ev = doc.createEvent(family);
    var init_fn = 'init' + init_fam;
    var init = typeof ev[init_fn] === 'function' ? init_fn : 'initEvent';

    var sig = initSignatures[init];
    var args = [];
    var used = {};

    opts.type = type;
    for (var i = 0; i < sig.length; ++i) {
        var key = sig[i];
        var val = opts[key];
        // if no user specified value, then use event default
        if (val === undefined) {
            val = ev[key];
        }
        used[key] = true;
        args.push(val);
    }
    ev[init].apply(ev, args);

    // webkit key event issue workaround
    if (family === 'KeyboardEvent') {
        ev = check_kb(ev, opts);
    }

    // attach remaining unused options to the object
    for (var key in opts) {
        if (!used[key]) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

var legacy = function (type, opts) {
    opts = opts || {};
    var ev = doc.createEventObject();

    ev.type = type;
    for (var key in opts) {
        if (opts[key] !== undefined) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

// expose either the modern version of event generation or legacy
// depending on what we support
// avoids if statements in the code later
module.exports = doc.createEvent ? modern : legacy;

var initSignatures = require('./init.json');
var types = require('./types.json');
var typeOf = (function () {
    var typs = {};
    for (var key in types) {
        var ts = types[key];
        for (var i = 0; i < ts.length; i++) {
            typs[ts[i]] = key;
        }
    }

    return function (name) {
        return typs[name] || 'Event';
    };
})();

},{"./init.json":201,"./types.json":202}],201:[function(require,module,exports){
module.exports={
  "initEvent" : [
    "type",
    "bubbles",
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail",
    "screenX",
    "screenY",
    "clientX",
    "clientY",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "relatedNode",
    "prevValue",
    "newValue",
    "attrName",
    "attrChange"
  ],
  "initKeyboardEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ],
  "initKeyEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ]
}

},{}],202:[function(require,module,exports){
module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyboardEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvents" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}],203:[function(require,module,exports){
'use strict'

var parseUnit = require('parse-unit')

module.exports = toPX

var PIXELS_PER_INCH = 96

function getPropertyInPX(element, prop) {
  var parts = parseUnit(getComputedStyle(element).getPropertyValue(prop))
  return parts[0] * toPX(parts[1], element)
}

//This brutal hack is needed
function getSizeBrutal(unit, element) {
  var testDIV = document.createElement('div')
  testDIV.style['font-size'] = '128' + unit
  element.appendChild(testDIV)
  var size = getPropertyInPX(testDIV, 'font-size') / 128
  element.removeChild(testDIV)
  return size
}

function toPX(str, element) {
  element = element || document.body
  str = (str || 'px').trim().toLowerCase()
  if(element === window || element === document) {
    element = document.body 
  }
  switch(str) {
    case '%':  //Ambiguous, not sure if we should use width or height
      return element.clientHeight / 100.0
    case 'ch':
    case 'ex':
      return getSizeBrutal(str, element)
    case 'em':
      return getPropertyInPX(element, 'font-size')
    case 'rem':
      return getPropertyInPX(document.body, 'font-size')
    case 'vw':
      return window.innerWidth/100
    case 'vh':
      return window.innerHeight/100
    case 'vmin':
      return Math.min(window.innerWidth, window.innerHeight) / 100
    case 'vmax':
      return Math.max(window.innerWidth, window.innerHeight) / 100
    case 'in':
      return PIXELS_PER_INCH
    case 'cm':
      return PIXELS_PER_INCH / 2.54
    case 'mm':
      return PIXELS_PER_INCH / 25.4
    case 'pt':
      return PIXELS_PER_INCH / 72
    case 'pc':
      return PIXELS_PER_INCH / 6
  }
  return 1
}
},{"parse-unit":194}],204:[function(require,module,exports){
var offset = require('mouse-event-offset');
var EventEmitter = require('events').EventEmitter;

function attach (opt) {
  opt = opt || {};
  var element = opt.element || window;

  var emitter = new EventEmitter();

  var position = opt.position || [0, 0];
  if (opt.touchstart !== false) {
    element.addEventListener('mousedown', update, false);
    element.addEventListener('touchstart', updateTouch, false);
  }

  element.addEventListener('mousemove', update, false);
  element.addEventListener('touchmove', updateTouch, false);

  emitter.position = position;
  emitter.dispose = dispose;
  return emitter;

  function updateTouch (ev) {
    var touch = ev.targetTouches[0];
    update(touch);
  }

  function update (ev) {
    offset(ev, element, position);
    emitter.emit('move', ev);
  }

  function dispose () {
    element.removeEventListener('mousemove', update, false);
    element.removeEventListener('mousedown', update, false);
    element.removeEventListener('touchmove', updateTouch, false);
    element.removeEventListener('touchstart', updateTouch, false);
  }
}

module.exports = function (opt) {
  return attach(opt).position;
};

module.exports.emitter = function (opt) {
  return attach(opt);
};

},{"events":35,"mouse-event-offset":190}]},{},[22])(22)
});