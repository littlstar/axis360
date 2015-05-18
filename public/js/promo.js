void function (global) {
  var sources = [
    '/assets/times-square.mp4',
    '/assets/paramotor.mp4',
    '/assets/lake-of-glass.jpg',
    '/assets/vsn-scuba.mp4',
  ];
  var promo = global.promo = new Bubble(document.querySelector('.promo'), {
    crossorigin: true,
    forceFocus: true,
    clickable: false,
    resizable: true,
    preload: true,
    autoplay: true,
    height: window.innerHeight - 40,
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
      case 'normal': promo.projection('normal'); break;
      case 'tinyplanet': promo.projection('tinyplanet'); break;
      case 'fisheye': promo.projection('fisheye'); break;
    }

    var active = document.querySelector('.controls .active');
    if (active) { active.classList.remove('active'); }
    el.classList.add('active');
    transition();
  }, false);
  var _id = 0;
  var projections = ['normal', 'tinyplanet', 'fisheye'];
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
    var projection = projections[(Math.random()*100|0) % projections.length];
    document.querySelector('[data-type='+projection+']').classList.add('active');
    promo.projection(projection).lon(0);
  }, 500);
}((function () { return this; })());
