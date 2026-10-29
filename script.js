/* =========================================================
   Vasanthasenan R | Portfolio
   Theme toggle, mobile menu, scroll progress, active nav,
   reveal-on-scroll, typed roles, hero spotlight, card tilt.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Theme toggle ---------- */
  var themeBtn = $('#themeToggle');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#0D141B' : '#0F766E');
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menuToggle');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  }
  $all('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 820) setMenu(false); });

  /* ---------- Scroll: header state, progress bar, back-to-top ---------- */
  var header = $('#siteHeader');
  var progress = $('#progress');
  var toTop = $('#toTop');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (toTop) toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = $all('.nav a[data-link]');
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('data-link')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('data-link') === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $all('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Typed roles ---------- */
  var typedEl = $('#typed');
  if (typedEl && !reduceMotion) {
    var phrases = [
      'C# · ASP.NET Core',
      'WPF · Windows Forms',
      'SQL Server · EF Core',
      'Azure App Service · Azure SQL'
    ];
    var p = 0, c = 0, deleting = false;
    var tick = function () {
      var word = phrases[p];
      if (!deleting) {
        c++;
        typedEl.textContent = word.slice(0, c);
        if (c === word.length) { deleting = true; return setTimeout(tick, 1700); }
        return setTimeout(tick, 70);
      }
      c--;
      typedEl.textContent = word.slice(0, c);
      if (c === 0) { deleting = false; p = (p + 1) % phrases.length; return setTimeout(tick, 350); }
      return setTimeout(tick, 34);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Hero spotlight follows the pointer ---------- */
  var hero = $('.hero');
  var spot = $('.hero .spot');
  if (hero && spot && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- Project card tilt ---------- */
  if (finePointer && !reduceMotion) {
    $all('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (!card.classList.contains('in')) return;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.classList.add('tilting');
        card.style.transform = 'perspective(1100px) rotateX(' + ((0.5 - y) * 3.2).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 4.2).toFixed(2) + 'deg) translateY(-4px)';
        card.style.setProperty('--gx', (x * 100) + '%');
        card.style.setProperty('--gy', (y * 100) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });
  }
  /* ---------- Round 2: booking-state cycle ---------- */
  var states = $all('.state');
  if (states.length) {
    var si = 0;
    var setState = function (i) { states.forEach(function (el, k) { el.classList.toggle('on', k === i); }); };
    setState(0);
    if (!reduceMotion) {
      setInterval(function () { si = (si + 1) % states.length; setState(si); }, 1500);
    }
  }

  /* ---------- Round 2: magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $all('.actions .btn, .links-row .link-card').forEach(function (el) {
      if (el.classList.contains('btn')) el.classList.add('magnet');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        if (el.classList.contains('btn')) el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y - 2).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { if (el.classList.contains('btn')) el.style.transform = ''; });
    });
  }
})();
