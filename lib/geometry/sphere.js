'use strict';

/**
 * Module dependencies.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SphereGeometry = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _primitiveSphere = require('primitive-sphere');

var _primitiveSphere2 = _interopRequireDefault(_primitiveSphere);

var _geometry = require('./geometry');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nZW9tZXRyeS9zcGhlcmUuanMiXSwibmFtZXMiOlsiU3BoZXJlR2VvbWV0cnkiLCJyYWRpdXMiLCJzZWdtZW50cyIsInByaW1pdGl2ZSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7Ozs7Ozs7O0FBSUE7Ozs7QUFDQTs7Ozs7Ozs7OztBQUVBOzs7Ozs7Ozs7SUFTYUEsYyxXQUFBQSxjOzs7QUFFWDs7Ozs7Ozs7O0FBU0EsNEJBQTBEO0FBQUEscUVBQWYsRUFBZTs7QUFBQSwyQkFBN0NDLE1BQTZDO0FBQUEsUUFBN0NBLE1BQTZDLCtCQUFwQyxDQUFvQztBQUFBLDZCQUFqQ0MsUUFBaUM7QUFBQSxRQUFqQ0EsUUFBaUMsaUNBQXRCLEdBQXNCO0FBQUEsUUFBWEMsU0FBVzs7QUFBQTs7QUFDeERBLGdCQUFZQSxhQUFhLCtCQUFnQkYsTUFBaEIsRUFBd0IsRUFBQ0Msa0JBQUQsRUFBeEIsQ0FBekI7QUFEd0QsMkhBRWxELEVBQUNELGNBQUQsRUFBU0Msa0JBQVQsRUFBbUJDLG9CQUFuQixFQUZrRDtBQUd6RDs7QUFFRDs7Ozs7Ozs7NkJBTVM7QUFDUCxVQUFNRCxXQUFXLEtBQUtBLFFBQXRCO0FBQ0EsVUFBTUQsU0FBUyxLQUFLQSxNQUFwQjtBQUNBLFdBQUtFLFNBQUwsR0FBaUIsK0JBQWdCRixNQUFoQixFQUF3QixFQUFDQyxrQkFBRCxFQUF4QixDQUFqQjtBQUNBLGFBQU8sSUFBUDtBQUNEIiwiZmlsZSI6InNwaGVyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuaW1wb3J0IFByaW1pdGl2ZVNwaGVyZSBmcm9tICdwcmltaXRpdmUtc3BoZXJlJ1xuaW1wb3J0IHsgR2VvbWV0cnkgfSBmcm9tICcuL2dlb21ldHJ5J1xuXG4vKipcbiAqIFNwaGVyZUdlb21ldHJ5IGNsYXNzLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBjbGFzcyBTcGhlcmVHZW9tZXRyeVxuICogQGV4dGVuZHMgR2VvbWV0cnlcbiAqIEBzZWUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcHJpbWl0aXZlLXNwaGVyZVxuICovXG5cbmV4cG9ydCBjbGFzcyBTcGhlcmVHZW9tZXRyeSBleHRlbmRzIEdlb21ldHJ5IHtcblxuICAvKipcbiAgICogU3BoZXJlR2VvbWV0cnkgY2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7KE9iamVjdCk/fSBvcHRzXG4gICAqIEBwYXJhbSB7KE51bWJlcik/fSBvcHRzLnJhZGl1c1xuICAgKiBAcGFyYW0geyhOdW1iZXIpP30gb3B0cy5zZWdtZW50c1xuICAgKiBAcGFyYW0geyhPYmplY3QpP30gcHJpbWl0aXZlXG4gICAqL1xuXG4gIGNvbnN0cnVjdG9yKHtyYWRpdXMgPSAxLCBzZWdtZW50cyA9IDEyOH0gPSB7fSwgcHJpbWl0aXZlKSB7XG4gICAgcHJpbWl0aXZlID0gcHJpbWl0aXZlIHx8IFByaW1pdGl2ZVNwaGVyZShyYWRpdXMsIHtzZWdtZW50c30pXG4gICAgc3VwZXIoe3JhZGl1cywgc2VnbWVudHMsIHByaW1pdGl2ZX0pXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBTcGhlcmVHZW9tZXRyeSBzdGF0ZVxuICAgKlxuICAgKiBAcmV0dXJuIHtTcGhlcmVHZW9tZXRyeX1cbiAgICovXG5cbiAgdXBkYXRlKCkge1xuICAgIGNvbnN0IHNlZ21lbnRzID0gdGhpcy5zZWdtZW50c1xuICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMucmFkaXVzXG4gICAgdGhpcy5wcmltaXRpdmUgPSBQcmltaXRpdmVTcGhlcmUocmFkaXVzLCB7c2VnbWVudHN9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cbiJdfQ==