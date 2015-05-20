void function (global) {
  var sources = [
    '/assets/times-square.mp4',
    '/assets/paramotor.mp4'
  ];
  var promo = global.promo = new Bubble(document.querySelector('.promo'), {
    crossorigin: true,
    forceFocus: true,
    clickable: false,
    resizable: true,
    preload: true,
    autoplay: true,
    height: window.innerHeight - 40,
    muted: true,
    loop: true,
    src: sources[(Math.random() * 100|0) % sources.length],
    vr: true
  });

  if (promo.src().match('vsn')) {
    document.querySelector('.projections').style.display = 'none';
  }

  promo.el.style.opacity = 0;
  promo.el.classList.add('animated');
  promo.el.classList.add('fadeIn');
  promo.render().once('ready', function () { promo.seek(3); });
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
  var projections = ['equilinear', 'tinyplanet', 'fisheye', 'mirrorball'];
  function transition () {
    clearInterval(_id);
    var idx = projections.indexOf(promo.projection());
    _id = setInterval(function () {
      if (false == promo.state.mousedown) {
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
    var projection = ['tinyplanet', 'fisheye', 'mirrorball'][(Math.random()*100|0) % 2];
    document.querySelector('[data-type='+projection+']').classList.add('active');
    promo.projection(projection).lon(0);
  }, 500);

  var panloopto = setTimeout(function loop () {
    var panloop = setInterval(function () {
      if (false == promo.state.mousedown && false == promo.state.keydown) {
        promo.state.lon += .7;
      } else {
        clearInterval(panloop);
        clearTimeout(panloopto);
        setTimeout(loop, 1000);
      }
    }, 100);
  }, 100);
}((function () { return this; })());
