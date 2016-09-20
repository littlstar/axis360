'use strict';

/**
 * Module dependencies.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoxGeometry = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _geo3dBox = require('geo-3d-box');

var _geo3dBox2 = _interopRequireDefault(_geo3dBox);

var _geometry = require('./geometry');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nZW9tZXRyeS9ib3guanMiXSwibmFtZXMiOlsiQm94R2VvbWV0cnkiLCJzaXplIiwic2VnbWVudHMiLCJwcmltaXRpdmUiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBOzs7Ozs7Ozs7OztBQUlBOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQTs7Ozs7Ozs7O0lBU2FBLFcsV0FBQUEsVzs7O0FBRVg7Ozs7Ozs7OztBQVNBLHlCQUFzRDtBQUFBLHFFQUFmLEVBQWU7O0FBQUEseUJBQXpDQyxJQUF5QztBQUFBLFFBQXpDQSxJQUF5Qyw2QkFBbEMsQ0FBa0M7QUFBQSw2QkFBL0JDLFFBQStCO0FBQUEsUUFBL0JBLFFBQStCLGlDQUFwQixDQUFvQjtBQUFBLFFBQVhDLFNBQVc7O0FBQUE7O0FBQ3BEQSxnQkFBWUEsYUFBYSx3QkFBYSxFQUFDRixVQUFELEVBQU9DLGtCQUFQLEVBQWIsQ0FBekI7QUFEb0QscUhBRTlDLEVBQUNELFVBQUQsRUFBT0Msa0JBQVAsRUFBaUJDLG9CQUFqQixFQUY4QztBQUdyRDs7QUFFRDs7Ozs7Ozs7NkJBTVM7QUFDUCxVQUFNRCxXQUFXLEtBQUtBLFFBQXRCO0FBQ0EsVUFBTUQsT0FBTyxLQUFLQSxJQUFsQjtBQUNBLFdBQUtFLFNBQUwsR0FBaUIsd0JBQWEsRUFBQ0YsVUFBRCxFQUFPQyxrQkFBUCxFQUFiLENBQWpCO0FBQ0EsYUFBTyxJQUFQO0FBQ0QiLCJmaWxlIjoiYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG5pbXBvcnQgUHJpbWl0aXZlQm94IGZyb20gJ2dlby0zZC1ib3gnXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gJy4vZ2VvbWV0cnknXG5cbi8qKlxuICogQm94R2VvbWV0cnkgY2xhc3MuXG4gKlxuICogQHB1YmxpY1xuICogQGNsYXNzIEJveEdlb21ldHJ5XG4gKiBAZXh0ZW5kcyBHZW9tZXRyeVxuICogQHNlZSBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9nZW8tM2QtYm94XG4gKi9cblxuZXhwb3J0IGNsYXNzIEJveEdlb21ldHJ5IGV4dGVuZHMgR2VvbWV0cnkge1xuXG4gIC8qKlxuICAgKiBCb3hHZW9tZXRyeSBjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHsoT2JqZWN0KT99IG9wdHNcbiAgICogQHBhcmFtIHsoTnVtYmVyKT99IG9wdHMuc2l6ZVxuICAgKiBAcGFyYW0geyhOdW1iZXIpP30gb3B0cy5zZWdtZW50c1xuICAgKiBAcGFyYW0geyhPYmplY3QpP30gcHJpbWl0aXZlXG4gICAqL1xuXG4gIGNvbnN0cnVjdG9yKHtzaXplID0gMSwgc2VnbWVudHMgPSAyfSA9IHt9LCBwcmltaXRpdmUpIHtcbiAgICBwcmltaXRpdmUgPSBwcmltaXRpdmUgfHwgUHJpbWl0aXZlQm94KHtzaXplLCBzZWdtZW50c30pXG4gICAgc3VwZXIoe3NpemUsIHNlZ21lbnRzLCBwcmltaXRpdmV9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgQm94R2VvbWV0cnkgc3RhdGVcbiAgICpcbiAgICogQHJldHVybiB7Qm94R2VvbWV0cnl9XG4gICAqL1xuXG4gIHVwZGF0ZSgpIHtcbiAgICBjb25zdCBzZWdtZW50cyA9IHRoaXMuc2VnbWVudHNcbiAgICBjb25zdCBzaXplID0gdGhpcy5zaXplXG4gICAgdGhpcy5wcmltaXRpdmUgPSBQcmltaXRpdmVCb3goe3NpemUsIHNlZ21lbnRzfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG4iXX0=