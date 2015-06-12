Axis
======

Axis is a panoramic rendering engine. It supports the rendering of
equirectangular, cylindrical, and panoramic textures. It can playback
spherical videos and render panoramic images. It also supports stacked
video produced from the VSN Mobile V.360 video camera. Axis has support for
rendering multiple projections such as Stereoscopic (Oculus), Tiny Planet and
Fisheye.

![](public/assets/tiny-planet.png)

![](public/assets/oculus.png)

## Status

Development

## Installation

```sh
$ component install littlstar/axis
```

or

```js
var Axis = require('littlstar/axis');
```

## Usage

```js
var el = document.querySelector('#video');
var frame = new Axis(el, {src: '/path/to/video.mp4'});
frame.render()
.once('ready', function () {
  this.seek(5).play().projection('tiny planet');
});
```

## License

MIT
