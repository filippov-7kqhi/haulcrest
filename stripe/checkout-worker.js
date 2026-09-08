/**
 * Optional: multi-machine baskets.
 *
 * GitHub Pages cannot run server code, so the stores use Stripe Payment Links,
 * which handle one machine per order. If you want a basket holding several
 * different machines to check out in one go, deploy this Cloudflare Worker and
 * put its URL in `checkoutEndpoint` in assets/js/stripe-config.js.
 *
 * Deploy:
 *   npm i -g wrangler && wrangler deploy
 *   wrangler secret put STRIPE_SECRET_KEY     # sk_live_... — NEVER commit this
 *
 * Prices are read from Stripe, never from the browser, so a tampered basket
 * cannot change what a customer is charged.
 */

// Map your item codes to Stripe Price IDs (Dashboard -> Product -> Pricing).
const PRICES = {
  'BF-CY150': 'price_xxx', 'BF-GM380': 'price_xxx',
  'BF-TT1000': 'price_xxx', 'BF-VG850': 'price_xxx',
  'HC-CY150': 'price_xxx', 'HC-GM380': 'price_xxx',
  'HC-TT1000': 'price_xxx', 'HC-VG850': 'price_xxx',
};

const ALLOWED_ORIGINS = ['https://branchforge.shop', 'https://haulcrest.shop'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'bad request' }, 400, cors); }

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return json({ error: 'empty basket' }, 400, cors);

    const form = new URLSearchParams();
    form.set('mode', 'payment');
    form.set('success_url', `${origin}/index.html?paid=1`);
    form.set('cancel_url', `${origin}/cart.html`);
    form.set('shipping_address_collection[allowed_countries][0]', 'GB');
    form.set('phone_number_collection[enabled]', 'true');

    items.forEach((item, i) => {
      const price = PRICES[item.sku];
      if (!price) return;
      const qty = Math.max(1, Math.min(5, parseInt(item.qty, 10) || 1));
      form.set(`line_items[${i}][price]`, price);
      form.set(`line_items[${i}][quantity]`, String(qty));
      form.set(`line_items[${i}][adjustable_quantity][enabled]`, 'true');
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    const session = await res.json();
    if (!res.ok) return json({ error: session.error?.message || 'stripe error' }, 502, cors);
    return json({ url: session.url }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
