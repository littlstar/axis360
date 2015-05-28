
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
 * The mirror ball projection mode.
 *
 * @public
 * @module axis/projection/mirrorball
 * @type {Function}
 */

/**
 * Module dependencies
 * @private
 */

var three = require('three.js')

/**
 * Mirror ball projection constraints.
 *
 * @public
 * @type {Object}
 */

var constraints = mirrorball.constraints = {
  keys: {up: true, down: true}
};

/**
 * Applies a special mirror ball projection
 * to Axis frame
 *
 * @api public
 * @param {Axis} axis
 */

module.exports = mirrorball;
function mirrorball (axis) {

  // this projection requires an already initialized
  // camera on the `Axis' instance
  var camera = axis.camera;

  // bail if camera not present
  if (null == camera) { return; }

  // bail if not ready
  if (false == this.isReady()) { return; }

  // bail if content sizing is incorrect
  if (false == this.contentHasCorrectSizing()) { return; }

  // bail if geometry is a cylinder because mirrow ball
  // projection is only supported in a spherical geometry
  if ('cylinder' == axis.geometry()) { return; }

  // initialize new scene
  var scene = new three.Scene();

  // create geometry
  var geometry = new three.SphereGeometry(30, 32, 32);

  // create light
  var light = new three.DirectionalLight(0xffffff, 1);

  // initialize material with texture
  var material = new three.MeshPhongMaterial({
    shininess: 50,
    specular: 0x050505,
    ambient: 0xffffff,
    color: 0xffffff,
    map: axis.texture
  });

  // notify texture of needed update
  axis.texture.needsUpdate = true;

  // set currenty geometry type
  axis.state.update('geometry', 'sphere');

  // initialize mesh
  var mesh = new three.Mesh(geometry, material);

  // new field of view
  var fov = 20;
  var controls = null;

  // initialize controls if allowed
  if (axis.state.allowControls) {
    controls = new three.OrbitControls(camera, axis.el);
    controls.minDistance = 75;
    controls.maxDistance = 200;
    controls.noPan = true;
    controls.noZoom = true;
    axis.controls = controls;
  }

  // add camera to new scene
  scene.add(camera);

  // update field of view
  axis.fov(fov);

  // configure camera
  camera.near = 1;
  camera.far = 1000;
  camera.setLens(axis.height() * .5);
  camera.updateProjectionMatrix();

  // confiure lighting
  light.position.set(5,5,5);
  light.castShadow = true;
  light.shadowCameraNear = 0.01;
  light.shadowCameraNeardowCameraFar = 15;
  light.shadowCameraFov = 45;
  light.shadowCameraLeft =15 -1;
  light.shadowCameraRight =  1;
  light.shadowCameraTop =  1;
  light.shadowCameraBottom = -1;
  light.shadowBias = 0.001;
  light.shadowDarkness = 0.2;
  light.shadowCameraTopadowMapWidth = 1024;
  light.shadowMapHeight = 1024;

  // add light to scene
  scene.add(light);

  // add mesh to scene
  scene.add(mesh);

  // add ambient light
  scene.add(new three.AmbientLight(0xffffff));

  // set new scene
  axis.scene = scene;
};

