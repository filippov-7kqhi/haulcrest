/* BranchForge — shared behaviour */
(function () {
  'use strict';

  // mobile nav
  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // scroll reveal
  var els = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // product gallery
  var main = document.getElementById('galMain'), thumbs = document.getElementById('galThumbs');
  if (main && thumbs) {
    thumbs.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      main.src = btn.dataset.full;
      main.alt = btn.dataset.alt || main.alt;
      thumbs.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
    });
  }

  // offer countdown — resets on a rolling 3-day window so it never shows zeros
  var cd = document.getElementById('cd');
  if (cd) {
    var span = 3 * 864e5;
    var end = Math.ceil(Date.now() / span) * span;
    var f = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      var d = Math.max(0, end - Date.now());
      cd.querySelector('[data-d]').textContent = f(Math.floor(d / 864e5));
      cd.querySelector('[data-h]').textContent = f(Math.floor(d / 36e5) % 24);
      cd.querySelector('[data-m]').textContent = f(Math.floor(d / 6e4) % 60);
      cd.querySelector('[data-s]').textContent = f(Math.floor(d / 1e3) % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  // demo forms — no backend is wired up, so we confirm locally
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = form.parentElement.querySelector('.result');
      if (box) { box.classList.add('show'); box.textContent = form.dataset.demo; }
      form.reset();
    });
  });

  // year
  document.querySelectorAll('[data-year]').forEach(function (n) {
    n.textContent = new Date().getFullYear();
  });
})();
