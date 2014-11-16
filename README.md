slant-frame
==========

## install

with **component:**

```sh
$ component install littlstar/slant-frame
```

## usage

```js
var Frame = require('slant-frame');
var el = document.querySelector('#video');
var frame = new Frame(el, {src: '/path/to/video.mp4'});
```

## api

### Frame(opts)

`Frame` cconstructor

where `el` is the root DOM node (required) and
where `opts` is an object of:

* `src` - Frame video src (required)
* `fov` or `fieldOfView` - Field of view
  ([fov](http://en.wikipedia.org/wiki/Field_of_view) and
[3js](http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera))
(Default: `36`)
* `width` - Frame width (required)
* `height` - Frame height (required)
* `preload` - Preload video frame (Default: `false`)
* `autoplay` - Autoplay video when rendered (Default: `false`)
* `loop` - Loop frame playback (Default: `false`)
* `muted` - Mute audio frame playback (Default: `false`)
* `crossorigin` - `anonymous` or `use-credentials` (See
  [(crossorigin](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-crossorigin)) (Default: `null`)
* `clearColor` - Frame clear color (Default `0x000`)
* `opacity` - Frame opacity (Default: `1`)
* `scroll` -  Scroll velocity and direction (Default: `null` - disabled)

Inherits from
[EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter)

#### Events

* `canplaythrough` - `<video>` 'oncanplaythrough' event
* `ready` - synonymous with `canplaythrough`
* `state` - state change
* `progress` - stream progress and `<video>` 'onprogress' event with added
`.percent` field
* `timeupdate` - `<video>` 'ontimeupdate' event with added `.percent` field
* `onended` or `end` - `<video>` 'onended' event
* `mousedown` - mouse down event
* `mouseup` - mouse up event
* `mousemove` - mouse move event
* `mousewheel` - mouse wheel event (scroll must be anled in constructor)
* `play` - Video playback start
* `waiting` - Video playback buffering
* `loadstart` - Video playback loading started
* `pause` - Video playback stop
* `refresh` - Frame refresh
* `draw` - Frame draw

### Frame#size(width, height)

Sets frame size

```js
frame.size(800, 500);
```

### Frame#src([src])

Set or get frame video source

```js
frame.src('video.webm');
console.log(frame.src()); // 'video.webm'
```

### Frame#play()

Plays frame video

```js
frame.play();
```

### Frame#pause()

Pause frame video

```js
frame.pause();
```
### Frame#volume(vol)

Set frame volume (`0.0 - 1.0`)

```js
frame.volume(0.8);
```

### Frame#mute([mute])

Mute and unmute frame volume

```js
frame.mute(); // mute volume
frame.mute(false); // unmute volume
```

### Frame#unmute()

Unmutes frame volume

```js
frame.unmute();
```

### Frame#refresh()

Refresh video frame

```js
frame.refresh();
```

### Frame.use(fn)

Use plugin with `Frame` instance

```js
function plugin (opts) {
  return function (frame) {
    opts.play.addEventListener('click', function (e) {
      frame.play();
    });

    opts.mute.addEventListener('click', function (e) {
      frame
    });
  };
}

var f = new Frame(document.querySelector('#video', {
  src: 'video.webm',
  scroll: 0.08
});

f.use(plugin({
  play: document.querySelector('.play'),
  mute: document.querySelector('.mute')
});

f.play();
```

### Frame#draw

Draw view and position camera

```js
frame.draw();
```

### Frame#offset

Sets frame camera view offset

```js
frame.offset(1920 * 2, 1080 * 2);
```

## license

MIT
