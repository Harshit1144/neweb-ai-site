/* Neweb mobile navigation — injects a hamburger toggle and a body-level slide-in
   drawer cloned from the existing nav links. The drawer is appended to <body>
   (not inside nav.top) because nav.top uses backdrop-filter, which would
   otherwise clip a position:fixed descendant to the header height. */
(function () {
  function init() {
    var nav = document.querySelector('nav.top .nav-row');
    if (!nav) return;
    var links = nav.querySelector('.nav-links');
    if (!links || nav.querySelector('.nav-burger')) return;

    // Hamburger button, appended last so it sits on the far right.
    var btn = document.createElement('button');
    btn.className = 'nav-burger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(btn);

    // Build a body-level drawer (clone of the nav links + the CTAs).
    var drawer = document.createElement('div');
    drawer.className = 'nav-drawer';
    drawer.innerHTML = links.innerHTML;
    var cta = nav.querySelector('.nav-cta');
    if (cta) {
      var ctaWrap = document.createElement('div');
      ctaWrap.className = 'nav-drawer-cta';
      ctaWrap.innerHTML = cta.innerHTML;
      drawer.appendChild(ctaWrap);
    }
    var scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);

    var open = false;
    function setOpen(state) {
      open = state;
      document.body.classList.toggle('nav-open', open);
      drawer.classList.toggle('open', open);
      scrim.classList.toggle('open', open);
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    btn.addEventListener('click', function () { setOpen(!open); });
    scrim.addEventListener('click', function () { setOpen(false); });

    // Close when a real link inside the drawer is tapped (not the dropdown toggles).
    drawer.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && a.getAttribute('href') && a.getAttribute('href') !== '#') setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && open) setOpen(false);
    });

    // Dropdown buttons become accordions inside the drawer.
    drawer.querySelectorAll('.nav-drop-btn').forEach(function (db) {
      db.addEventListener('click', function (e) {
        e.preventDefault();
        var drop = db.closest('.nav-drop');
        if (drop) drop.classList.toggle('open');
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
