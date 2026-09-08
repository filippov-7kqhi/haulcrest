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

  // ---- Stripe --------------------------------------------------------------
  function cfg() { return window.SITE_CONFIG || window.STRIPE_CONFIG || {}; }

  function linkFor(sku) {
    var links = cfg().paymentLinks || {};
    return (links[sku] || '').trim();
  }

  /** A basket is payable by Payment Link only when it holds one distinct machine. */
  function singleLine(items) {
    return items.length === 1 ? items[0] : null;
  }

  function goToPaymentLink(url, item) {
    var u = url;
    // Stripe reads these from the query string on a Payment Link.
    u += (u.indexOf('?') === -1 ? '?' : '&') +
         'client_reference_id=' + encodeURIComponent(item.sku);
    window.location.href = u;
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
    if (btn.hasAttribute('data-buynow')) {
      var direct = linkFor(btn.dataset.add);
      if (direct) {
        goToPaymentLink(direct, { sku: btn.dataset.add });
      } else {
        window.location.href = 'checkout.html';
      }
      return;
    }
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
  var payReady = document.getElementById('payReady');
  if (payReady) {
    var items = read();
    if (!items.length) { window.location.replace('cart.html'); return; }

    document.getElementById('checkoutItems').innerHTML = items.map(function (i) {
      return '<div><span>' + i.name + ' &times; ' + i.qty + '</span><span>' +
             money(i.price * i.qty) + '</span></div>';
    }).join('');
    paintTotals(items);

    var box = document.getElementById('ckResult');
    var say = function (html) { box.className = 'result show'; box.innerHTML = html; };

    var endpoint = (cfg().checkoutEndpoint || '').trim();
    var only = singleLine(items);
    var link = only ? linkFor(only.sku) : '';

    if (endpoint) {
      // Any basket, including several different machines.
      payReady.hidden = false;
      document.getElementById('payBtn').addEventListener('click', function (ev) {
        var b = ev.currentTarget;
        b.disabled = true;
        b.textContent = 'Contacting Stripe…';
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(function (i) { return { sku: i.sku, qty: i.qty }; })
          })
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        }).then(function (d) {
          if (!d.url) throw new Error('no session url');
          window.location.href = d.url;
        }).catch(function (err) {
          b.disabled = false;
          b.textContent = 'Pay securely with Stripe';
          say('<strong>We could not start the payment.</strong> Nothing has been charged. ' +
              'Please try again, or email us and we will take the order directly. ' +
              '<span class="muted">(' + err.message + ')</span>');
        });
      });

    } else if (only && link) {
      // Single machine, paid through its Stripe Payment Link.
      payReady.hidden = false;
      document.getElementById('payBtn').addEventListener('click', function () {
        goToPaymentLink(link, only);
      });
      if (only.qty > 1) {
        say('You have ' + only.qty + ' of this machine in your basket. Set the quantity to ' +
            only.qty + ' on the Stripe page before paying.');
      }

    } else if (items.length > 1) {
      say('<strong>One machine at a time.</strong> Card payment currently handles a single ' +
          'machine per order. Remove all but one from your <a href="cart.html">basket</a> and pay, ' +
          'then repeat for the next &mdash; or <a href="contact.html">contact us</a> and we will ' +
          'raise one invoice for the lot.');

    } else {
      say('<strong>Card payment is not switched on yet.</strong> No order has been placed and no ' +
          'money has been taken. <a href="contact.html">Send us an enquiry</a> and we will take ' +
          'the order directly.');
    }
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


  // ---- business identity from config --------------------------------------
  (function () {
    var biz = cfg().business || {};
    document.querySelectorAll('[data-biz]').forEach(function (el) {
      var v = (biz[el.dataset.biz] || '').trim();
      if (!v) return;                       // keep the placeholder until it is filled in
      el.textContent = v;
      if (el.tagName === 'A' && el.getAttribute('href') === '') {
        el.setAttribute('href', 'tel:' + v.replace(/[^+0-9]/g, ''));
      }
    });
  })();

  // ---- admin config editor -------------------------------------------------
  var gate = document.getElementById('gate');
  if (gate) {
    var panel = document.getElementById('panel');
    var out = document.getElementById('out');

    var sha256 = function (text) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        .then(function (buf) {
          return [].map.call(new Uint8Array(buf), function (b) {
            return b.toString(16).padStart(2, '0');
          }).join('');
        });
    };

    var linkInputs = function () { return document.querySelectorAll('[data-link]'); };
    var bizInputs = function () { return document.querySelectorAll('[data-biz-field]'); };

    var load = function () {
      var c = cfg(), links = c.paymentLinks || {}, biz = c.business || {};
      linkInputs().forEach(function (i) { i.value = links[i.dataset.link] || ''; });
      bizInputs().forEach(function (i) { i.value = biz[i.dataset.bizField] || ''; });
    };

    var render = function () {
      var c = cfg();
      var links = {}, biz = {};
      linkInputs().forEach(function (i) { links[i.dataset.link] = i.value.trim(); });
      bizInputs().forEach(function (i) { biz[i.dataset.bizField] = i.value.trim(); });
      var pad = function (k) { return '"' + k + '":' + ' '.repeat(Math.max(1, 12 - k.length)); };
      out.value =
        '/* Runtime configuration. THIS FILE IS PUBLIC.\n' +
        '   Never put a Stripe secret key (sk_live_... / sk_test_...) in it. */\n' +
        'window.SITE_CONFIG = {\n' +
        '  admin: { passHash: "' + ((c.admin && c.admin.passHash) || '') + '" },\n\n' +
        '  business: {\n' +
        Object.keys(biz).map(function (k) {
          return '    ' + pad(k) + '"' + biz[k].replace(/"/g, '\\"') + '"';
        }).join(',\n') + '\n  },\n\n' +
        '  checkoutEndpoint: "' + (c.checkoutEndpoint || '') + '",\n\n' +
        '  paymentLinks: {\n' +
        Object.keys(links).map(function (k) {
          return '    "' + k + '": "' + links[k] + '"';
        }).join(',\n') + '\n  }\n};\n';
    };

    gate.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var want = (cfg().admin || {}).passHash || '';
      var msg = document.getElementById('gateMsg');
      sha256(document.getElementById('pass').value).then(function (got) {
        if (got === want) {
          gate.hidden = true;
          panel.hidden = false;
          load();
          render();
        } else {
          msg.textContent = 'That passphrase does not match.';
        }
      });
    });

    document.addEventListener('input', function (ev) {
      if (ev.target.matches('[data-link],[data-biz-field]')) render();
    });

    document.getElementById('copyBtn').addEventListener('click', function () {
      out.select();
      navigator.clipboard.writeText(out.value).then(function () {
        document.getElementById('saveMsg').textContent =
          'Copied. Open assets/js/site-config.js on GitHub, replace all of it, and commit.';
      }, function () {
        document.getElementById('saveMsg').textContent =
          'Could not reach the clipboard — select the text below and copy it manually.';
      });
    });

    document.getElementById('dlBtn').addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([out.value], { type: 'text/javascript' }));
      a.download = 'site-config.js';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById('hashForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = document.getElementById('newpass').value;
      if (!v) return;
      sha256(v).then(function (h) {
        document.getElementById('hashOut').textContent = h;
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (n) {
    n.textContent = new Date().getFullYear();
  });

  paintCount();
})();
