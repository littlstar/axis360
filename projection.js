
/**
 * Module dependencies
 */

var raf = require('raf')
  , three = require('three.js')

// default field of view
var DEFAULT_FOV = require('./constants').DEFAULT_FOV;
var CYLINDRICAL_ZOOM = require('./constants').CYLINDRICAL_ZOOM;

/**
 * Predicate to determine whether `n' is
 * in fact `NaN'
 *
 * @api private
 * @param {Mixed} n
 */

function isNaN (n) {
  return 'number' == typeof n && n !== n
}

/**
 * Creates the correct geometry for
 * the current content in axis
 *
 * @api private
 * @param {Axis} axis
 */

function getCorrectGeometry (axis) {
  var dimensions = axis.dimensions();
  var ratio = dimensions.ratio;
  var geo = null;

  if ('flat' == axis.state.projectionrequested) {
    geo = axis.geometry('plane')
  } else if (ratio == ratio && 2 == ratio) {
    geo = axis.geometry('sphere');
  } else {
    axis.state.fov += CYLINDRICAL_ZOOM;
    geo = axis.geometry('cylinder');
  }

  return geo;
}


/**
 * `Projections' constructor
 *
 * @api public
 * @param {Object} scope - optional
 */

module.exports = Projections;
function Projections (scope) {
  // ensure instance
  if (!(this instanceof Projections)) {
    return new Projections(scope);
  }

  // projection scope
  this.scope = 'object' == typeof scope ? scope : {};

  // install `.state' object if not defined
  if ('object' != typeof this.scope.state) {
    this.scope.state = {};
  }

  // ID generated from `requestAnimationFrame()'
  this.animationFrameID = NaN;

  // installed projections
  this.projections = {};
}

/**
 * Cancels current animation for a projection
 *
 * @api public
 */

Projections.prototype.cancel = function () {
  if (false == isNaN(this.animationFrameID)) {
    raf.cancel(this.animationFrameID);
    this.scope.state.animating = false;
    this.scope.update();
  }
  return this;
};

/**
 * Requests an animation frame for a given
 * function `fn'. Animation frames are mutually
 * exclusive.
 *
 * @api public
 * @param {Function} fn
 */

Projections.prototype.animate = function (fn) {
  var self = this;
  if ('function' == typeof fn) {
    this.scope.state.animating = true;
    this.animationFrameID = raf(function animate () {
      if (false == self.scope.state.animating) {
        self.cancel();
      } else {
        fn.call(self);
        self.scope.update();
        if (self.scope.state.animating) {
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
 * @api public
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
 * @api public
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
 * @api public
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
 * @api public
 * @param {String} name
 */

Projections.prototype.apply = function (name) {
  if ('string' == typeof name && 'function' == typeof this.projections[name]) {
    this.projections[name].call(this, this.scope);
  }
  return this;
};

/**
 * Predicate to determine if a projection is defiend
 *
 * @api public
 * @param {String} name
 */

Projections.prototype.contains = function (name) {
  return 'function' == typeof this.projections[name];
};

/**
 * Predicate to determine if axis content has
 * correct sizing
 *
 * @api public
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
 * @api public
 */

Projections.prototype.isReady = function () {
  return Boolean(this.scope.state.ready);
};

/**
 * Initializes scene for a projection
 *
 * @api public
 */

Projections.prototype.initializeScene = function () {
  var scope = this.scope;

  if (false == this.isReady()) {
    scope.once('ready', init);
  } else {
    init();
  }

  function init () {
    // max FOV for animating
    var maxFov = DEFAULT_FOV;
    var width = scope.width();
    var height = scope.height();

    // get geometry for content
    var geo = getCorrectGeometry(scope);

    // create material and mesh
    var material = new three.MeshBasicMaterial({map: scope.texture});
    var mesh = new three.Mesh(geo, material);

    // current projection
    var projection = scope.projection();

    // current fov
    var fov = scope.fov();

    // zoom offset where applicable
    var zoom = CYLINDRICAL_ZOOM;

    // apply zoom to cylinder geometry type
    if ('cylinder' == scope.geometry()) {
      maxFov += zoom;
      scope.fov(fov += zoom);
    }

    // set mesh scale
    mesh.scale.x = -1;

    // add mesh to scene
    scope.scene = new three.Scene();
    scope.scene.add(mesh);
  }
};

/**
 * Predicate to determine if projection is mirrorball and
 * the request projection is a mirrorball.
 *
 * @api public
 */

Projections.prototype.isMirrorBall = function () {
  return ! Boolean(
    'mirrorball' != this.scope.state.projection &&
    'mirrorball' != this.scope.state.projectionrequested);
};
