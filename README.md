Axis
======

Axis is a panoramic rendering engine built for the Littlstar Player. It supports the rendering of
equirectangular, cylindrical, and panoramic textures. It can playback
spherical videos and render panoramic images. It also supports stacked
video produced from the VSN Mobile V.360 video camera. Axis has support for
rendering multiple projections such as Stereoscopic (Oculus), Tiny Planet and
Fisheye.

![](public/assets/tiny-planet.png)

![](public/assets/iceland-oculus.png)

Axis is currently in use in production on the Littlstar web platform.
![](https://www.dropbox.com/s/fzg561w81t1rn3t/Screenshot%202015-07-17%2016.33.26.png?dl=1)

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
frame.once('ready', function () {
  frame
  .seek(5)
  .play()
  .projection('tiny planet')
  .rotate('y', {value: 0.002, every: 500});
});
```

## License

MIT
