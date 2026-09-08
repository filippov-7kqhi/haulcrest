/* Shared store behaviour. Basket lives in this browser only — nothing is sent anywhere. */
(function () {
  'use strict';

  var KEY = 'basket.v1';
  var VAT = 0.20;

  function money(n) {
    return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (err) { return []; }
  }

  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (err) { /* private mode */ }
    paintCount(items);
  }

  function paintCount(items) {
    var n = (items || read()).reduce(function (t, i) { return t + i.qty; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0 && el.classList.contains('cartbadge');
    });
  }

  function totals(items) {
    var gross = items.reduce(function (t, i) { return t + i.price * i.qty; }, 0);
    var net = Math.round(gross / (1 + VAT));
    return { gross: gross, net: net, vat: gross - net };
  }

  function paintTotals(items) {
    var t = totals(items);
    var set = function (sel, v) {
      document.querySelectorAll(sel).forEach(function (el) { el.textContent = money(v); });
    };
    set('[data-sum-net]', t.net);
    set('[data-sum-vat]', t.vat);
    set('[data-sum-total]', t.gross);
  }

  // ---- add to basket -------------------------------------------------------
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-add]');
    if (!btn) return;
    ev.preventDefault();
    var qty = 1;
    if (btn.dataset.qty) {
      var input = document.querySelector(btn.dataset.qty);
      qty = Math.max(1, Math.min(5, parseInt(input && input.value, 10) || 1));
    }
    var items = read();
    var found = items.filter(function (i) { return i.sku === btn.dataset.add; })[0];
    if (found) {
      found.qty = Math.min(5, found.qty + qty);
    } else {
      items.push({
        sku: btn.dataset.add, name: btn.dataset.name, price: +btn.dataset.price,
        img: btn.dataset.img, url: btn.dataset.url, qty: qty
      });
    }
    write(items);
    if (btn.hasAttribute('data-buynow')) { window.location.href = 'checkout.html'; return; }
    var note = document.querySelector('[data-added]');
    if (note) { note.hidden = false; }
    btn.classList.add('is-added');
    var label = btn.textContent;
    btn.textContent = 'Added to basket';
    setTimeout(function () { btn.textContent = label; btn.classList.remove('is-added'); }, 1600);
  });

  // ---- basket page ---------------------------------------------------------
  var list = document.getElementById('cartItems');
  if (list) {
    var render = function () {
      var items = read();
      var empty = document.getElementById('cartEmpty');
      var summary = document.getElementById('cartSummary');
      empty.hidden = items.length > 0;
      summary.hidden = items.length === 0;
      list.innerHTML = items.map(function (i) {
        return '<div class="cartitem" data-sku="' + i.sku + '">' +
          '<a href="' + i.url + '"><img src="' + i.img + '" width="1200" height="760" alt=""></a>' +
          '<div><h3><a href="' + i.url + '">' + i.name + '</a></h3>' +
          '<p class="line">Item code ' + i.sku + ' &middot; ' + money(i.price) + ' each, inc. VAT</p>' +
          '<label class="line">Qty <input type="number" min="1" max="5" value="' + i.qty +
          '" data-qty-for="' + i.sku + '"></label></div>' +
          '<div class="cartitem__right"><b>' + money(i.price * i.qty) + '</b>' +
          '<button class="linkbtn" data-remove="' + i.sku + '">Remove</button></div></div>';
      }).join('');
      paintTotals(items);
      paintCount(items);
    };
    list.addEventListener('click', function (ev) {
      var rm = ev.target.closest('[data-remove]');
      if (!rm) return;
      write(read().filter(function (i) { return i.sku !== rm.dataset.remove; }));
      render();
    });
    var applyQty = function (f) {
      var items = read();
      items.forEach(function (i) {
        if (i.sku === f.dataset.qtyFor) i.qty = Math.max(1, Math.min(5, parseInt(f.value, 10) || 1));
      });
      write(items);
      // update this row and the totals in place so the field keeps focus
      var row = f.closest('.cartitem');
      var it = items.filter(function (i) { return i.sku === f.dataset.qtyFor; })[0];
      if (row && it) row.querySelector('.cartitem__right b').textContent = money(it.price * it.qty);
      paintTotals(items);
    };
    ['input', 'change'].forEach(function (evt) {
      list.addEventListener(evt, function (ev) {
        var f = ev.target.closest('[data-qty-for]');
        if (f) applyQty(f);
      });
    });
    render();
  }

  // ---- checkout page -------------------------------------------------------
  var ck = document.getElementById('checkoutForm');
  if (ck) {
    var items = read();
    if (!items.length) { window.location.replace('cart.html'); return; }
    document.getElementById('checkoutItems').innerHTML = items.map(function (i) {
      return '<div><span>' + i.name + ' &times; ' + i.qty + '</span><span>' +
             money(i.price * i.qty) + '</span></div>';
    }).join('');
    paintTotals(items);
    ck.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!ck.reportValidity()) return;
      var box = document.getElementById('ckResult');
      box.className = 'result show';
      box.innerHTML = '<strong>Payment is not connected yet.</strong> This store has no payment ' +
        'provider configured, so no order was placed and no money has been taken. ' +
        'See the deployment notes for how to connect one.';
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ---- mobile nav ----------------------------------------------------------
  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ---- reveal on scroll ----------------------------------------------------
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

  // ---- product gallery -----------------------------------------------------
  var main = document.getElementById('galMain'), thumbs = document.getElementById('galThumbs');
  if (main && thumbs) {
    thumbs.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      main.src = b.dataset.full;
      main.alt = b.dataset.alt || main.alt;
      thumbs.querySelectorAll('button').forEach(function (x) {
        x.setAttribute('aria-selected', x === b ? 'true' : 'false');
      });
    });
  }

  // ---- enquiry forms (no backend wired up) ---------------------------------
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var box = form.parentElement.querySelector('.result');
      if (box) { box.className = 'result show'; box.textContent = form.dataset.demo; }
      form.reset();
    });
  });

  document.querySelectorAll('[data-year]').forEach(function (n) {
    n.textContent = new Date().getFullYear();
  });

  paintCount();
})();
