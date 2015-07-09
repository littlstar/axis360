void function (global) {
  var ua = navigator.userAgent;
  var h264Supported = ! /firefox/.test(ua.toLowerCase());
  var domElement = document.querySelector('.promo');
  var sources = [
  ];

  if (h264Supported) {
    sources.push({
      owner: 'KonceptVR',
      user:'koncept-vr',
      name: 'times-square'
    });
  }

  sources.push({
    owner: 'VideoStitch',
    user: 'videostitch',
    name: 'paramotor'
  });

  function setRandomSource () {
    var content = sources[(Math.random() * 100|0) % sources.length];
    var src = '/assets/'+ content.name + (h264Supported ? '.mp4' : '.webm');
    var a = domElement.querySelector('.attribution .name');
    a.setAttribute('href', 'http://littlstar.com/'+ content.user);
    a.setAttribute('target', '_blank');
    a.innerHTML = content.owner;
    promo.src(src);
  }

  var promo = global.promo = new Axis(domElement, {
    crossorigin: true,
    resizable: true,
    preload: true,
    autoplay: true,
    height: (window.innerHeight),
    muted: true,
    loop: true,
    vr: true
  });

  setRandomSource();

  promo.domElement.style.opacity = 0;
  promo.domElement.classList.add('animated');
  promo.domElement.classList.add('fadeIn');
  promo.render().once('ready', function () { promo.focus().seek(2); });
  document.querySelector('.controls').addEventListener('click', function (e) {
    var el = null
    var type = null;
    e.preventDefault();
    e.stopPropagation();
    if ('A' == e.target.tagName) {
      el = e.target.parentNode;
    } else if ('LI' == e.target.tagName) {
      el = e.target;
    } else {
      return false;
    }
    type = el.dataset.type;

    if (el.classList.contains('active')) {
      return false;
    }

    switch (type) {
      case 'vr': break;
      default: promo.projection(type);
    }

    var active = document.querySelector('.controls .active');
    if (active) { active.classList.remove('active'); }
    el.classList.add('active');
    transition();
  }, false);
  var _id = 0;
  var projections = ['equilinear', 'tinyplanet', 'fisheye'];
  function transition () {
    clearInterval(_id);
    var idx = projections.indexOf(promo.projection());
    _id = setInterval(function () {
      if (false == promo.state.isMousedown) {
        var projection = projections[++idx % projections.length];
        var active = document.querySelector('.controls .active');
        if (active) { active.classList.remove('active'); }
        document.querySelector('[data-type='+projection+']').classList.add('active');
        promo.projection(projection);
      }
    }, 30000);
  }
  transition();
  setTimeout(function () {
    var projection = ['tinyplanet', 'fisheye'][(Math.random()*100|0) % 2];
    document.querySelector('[data-type='+projection+']').classList.add('active');
    promo.projection(projection).x(0);
  }, 500);

  setTimeout(function loop () {
    var panloop = setInterval(function () {
      if (false == promo.state.isMousedown && false == promo.state.isKeydown) {
        promo.state.x += .7;
      } else {
        clearInterval(panloop);
        setTimeout(loop, 1000);
      }
    }, 100);
  }, 600);
}((function () { return this; })());
