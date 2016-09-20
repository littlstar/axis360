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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJDb21tYW5kIiwiQ29udGV4dCIsIlV0aWxzIiwiTWF0aCIsIk9yaWVudGF0aW9uIiwiS2V5Ym9hcmQiLCJUcmlhbmdsZSIsIk9iamVjdCIsIlNwaGVyZSIsIkNhbWVyYSIsIk1vdXNlIiwiVG91Y2giLCJGcmFtZSIsIk1lZGlhIiwiUGhvdG8iLCJWaWRlbyIsIkF1ZGlvIiwiQm94Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7cUJBSVNBLE87Ozs7Ozs7OztvQkFDQUMsTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQ0dDLEs7UUFDQUMsSTs7QUFFWjs7OztRQUlPQyxXO1FBQ0FDLFE7UUFDQUMsUTtRQUNBQyxNO1FBQ0FDLE07UUFDQUMsTTtRQUNBQyxLO1FBQ0FDLEs7UUFDQUMsSztRQUNBQyxLO1FBQ0FDLEs7UUFDQUMsSztRQUNBQyxLO1FBQ0FDLEciLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5leHBvcnQgeyBDb21tYW5kIH0gZnJvbSAnLi9jb21tYW5kcydcbmV4cG9ydCB7IENvbnRleHQgfSBmcm9tICcuL2NvbnRleHQnXG5leHBvcnQgKiBhcyBVdGlscyBmcm9tICcuL3V0aWxzJ1xuZXhwb3J0ICogYXMgTWF0aCBmcm9tICcuL21hdGgnXG5cbi8qKlxuICogQXhpcyBjb21tYW5kIEFQSS5cbiAqL1xuXG5leHBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi9jb21tYW5kcy9vcmllbnRhdGlvbidcbmV4cG9ydCBLZXlib2FyZCBmcm9tICcuL2NvbW1hbmRzL2tleWJvYXJkJ1xuZXhwb3J0IFRyaWFuZ2xlIGZyb20gJy4vY29tbWFuZHMvdHJpYW5nbGUnXG5leHBvcnQgT2JqZWN0IGZyb20gJy4vY29tbWFuZHMvb2JqZWN0J1xuZXhwb3J0IFNwaGVyZSBmcm9tICcuL2NvbW1hbmRzL3NwaGVyZSdcbmV4cG9ydCBDYW1lcmEgZnJvbSAnLi9jb21tYW5kcy9jYW1lcmEnXG5leHBvcnQgTW91c2UgZnJvbSAnLi9jb21tYW5kcy9tb3VzZSdcbmV4cG9ydCBUb3VjaCBmcm9tICcuL2NvbW1hbmRzL3RvdWNoJ1xuZXhwb3J0IEZyYW1lIGZyb20gJy4vY29tbWFuZHMvZnJhbWUnXG5leHBvcnQgTWVkaWEgZnJvbSAnLi9jb21tYW5kcy9tZWRpYSdcbmV4cG9ydCBQaG90byBmcm9tICcuL2NvbW1hbmRzL3Bob3RvJ1xuZXhwb3J0IFZpZGVvIGZyb20gJy4vY29tbWFuZHMvdmlkZW8nXG5leHBvcnQgQXVkaW8gZnJvbSAnLi9jb21tYW5kcy9hdWRpbydcbmV4cG9ydCBCb3ggZnJvbSAnLi9jb21tYW5kcy9ib3gnXG4iXX0=