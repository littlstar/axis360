'use strict';

/**
 * Module constants.
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

var _triangle = require('./triangle');

Object.defineProperty(exports, 'Triangle', {
  enumerable: true,
  get: function get() {
    return _triangle.Triangle;
  }
});

var _context = require('./context');

Object.defineProperty(exports, 'Context', {
  enumerable: true,
  get: function get() {
    return _context.Context;
  }
});

var _camera = require('./camera');

Object.defineProperty(exports, 'Camera', {
  enumerable: true,
  get: function get() {
    return _camera.Camera;
  }
});

var _vector = require('./vector');

Object.defineProperty(exports, 'Vector', {
  enumerable: true,
  get: function get() {
    return _vector.Vector;
  }
});

var _object = require('./object');

Object.defineProperty(exports, 'Object', {
  enumerable: true,
  get: function get() {
    return _object.Object;
  }
});

var _sphere = require('./sphere');

Object.defineProperty(exports, 'Sphere', {
  enumerable: true,
  get: function get() {
    return _sphere.Sphere;
  }
});

var _frame = require('./frame');

Object.defineProperty(exports, 'Frame', {
  enumerable: true,
  get: function get() {
    return _frame.Frame;
  }
});

var _photo = require('./photo');

Object.defineProperty(exports, 'Photo', {
  enumerable: true,
  get: function get() {
    return _photo.Photo;
  }
});
var AXIS_TYPE_VIDEO = exports.AXIS_TYPE_VIDEO = 0x01;
var AXIS_TYPE_PHOTO = exports.AXIS_TYPE_PHOTO = 0x02;

/**
 * Module dependencies.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJRdWF0ZXJuaW9uIiwiVHJpYW5nbGUiLCJDb250ZXh0IiwiQ2FtZXJhIiwiVmVjdG9yIiwiT2JqZWN0IiwiU3BoZXJlIiwiRnJhbWUiLCJQaG90byIsIkFYSVNfVFlQRV9WSURFTyIsIkFYSVNfVFlQRV9QSE9UTyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7Ozs7Ozs7Ozs7dUJBV1NBLFU7Ozs7Ozs7OztxQkFDQUMsUTs7Ozs7Ozs7O29CQUNBQyxPOzs7Ozs7Ozs7bUJBQ0FDLE07Ozs7Ozs7OzttQkFDQUMsTTs7Ozs7Ozs7O21CQUNBQyxNOzs7Ozs7Ozs7bUJBQ0FDLE07Ozs7Ozs7OztrQkFDQUMsSzs7Ozs7Ozs7O2tCQUNBQyxLOzs7QUFmRixJQUFNQyw0Q0FBa0IsSUFBeEI7QUFDQSxJQUFNQyw0Q0FBa0IsSUFBeEI7O0FBRVAiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBNb2R1bGUgY29uc3RhbnRzLlxuICovXG5cbmV4cG9ydCBjb25zdCBBWElTX1RZUEVfVklERU8gPSAweDAxXG5leHBvcnQgY29uc3QgQVhJU19UWVBFX1BIT1RPID0gMHgwMlxuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuZXhwb3J0IHsgUXVhdGVybmlvbiB9IGZyb20gJy4vcXVhdGVybmlvbidcbmV4cG9ydCB7IFRyaWFuZ2xlIH0gZnJvbSAnLi90cmlhbmdsZSdcbmV4cG9ydCB7IENvbnRleHQgfSBmcm9tICcuL2NvbnRleHQnXG5leHBvcnQgeyBDYW1lcmEgfSBmcm9tICcuL2NhbWVyYSdcbmV4cG9ydCB7IFZlY3RvciB9IGZyb20gJy4vdmVjdG9yJ1xuZXhwb3J0IHsgT2JqZWN0IH0gZnJvbSAnLi9vYmplY3QnXG5leHBvcnQgeyBTcGhlcmUgfSBmcm9tICcuL3NwaGVyZSdcbmV4cG9ydCB7IEZyYW1lIH0gZnJvbSAnLi9mcmFtZSdcbmV4cG9ydCB7IFBob3RvIH0gZnJvbSAnLi9waG90bydcbiJdfQ==