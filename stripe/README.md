# Stripe setup

Both stores are static sites on GitHub Pages, so there is no server to hold a Stripe
secret key. Stripe's supported route for that is **Payment Links** — the old
client-only `stripe.redirectToCheckout` was removed from Stripe.js and is no longer an
option.

## Step 1 — one Payment Link per machine (15 minutes, no code)

In the Stripe Dashboard:

1. **Product catalogue → Add product.** One per machine. Price in **GBP**, and enter the
   price shown on the site — those figures already include 20% VAT.
2. **Payment Links → New link**, pick the product, and switch on:
   - **Collect customers' addresses → Shipping** (you need somewhere to deliver to)
   - **Let customers adjust quantity** (so a buyer can order two)
   - a **custom text field** named `Delivery access notes` — gate width, gradient,
     parking. The carrier needs it and Stripe is the only place it now gets asked.
3. Set **Tax behaviour** to *inclusive* so Stripe does not add VAT on top of a
   VAT-inclusive price.
4. Copy each link URL.

## Step 2 — paste the links in

Edit `assets/js/stripe-config.js` in each store repo:

```js
paymentLinks: {
  "BF-CY150": "https://buy.stripe.com/xxxxxxxx",
  ...
}
```

That is the whole integration. The site reads the file at runtime, so you can edit it
straight on GitHub — no rebuild needed.

**Never put a secret key (`sk_live_…` / `sk_test_…`) in this file or anywhere in the
repo.** Payment Link URLs are public by design; secret keys are not. If one is ever
committed, roll it in the Dashboard immediately.

## What happens once links are in

| Basket | Behaviour |
|---|---|
| **Buy now** on a product page | Straight to that machine's Stripe page |
| One machine in the basket | Checkout shows **Pay securely with Stripe** |
| Two or more *different* machines | Checkout explains they must be paid for one at a time, or invoiced — see below |
| A machine with no link pasted in | Checkout says payment is not switched on and routes to an enquiry, rather than pretending |

## Step 3 (optional) — multi-machine baskets

Payment Links handle one machine per order. Most orders here are a single £2–3k machine,
so this is rarely the binding constraint — but if you want a basket with several
different machines to pay in one go, you need a server.

`checkout-worker.js` in this folder is a Cloudflare Worker that creates a Stripe
Checkout Session. Deploy it, then set `checkoutEndpoint` in `stripe-config.js` to its URL
and the checkout switches to that path automatically.

```bash
npm i -g wrangler
wrangler deploy
wrangler secret put STRIPE_SECRET_KEY     # sk_live_… lives here, never in the repo
```

Fill in the `PRICES` map with your Stripe Price IDs. The worker reads prices **from
Stripe**, never from the browser, so editing a basket in devtools cannot change what a
customer is charged.

## Before taking real money

- Test with a test-mode link first (`4242 4242 4242 4242`).
- Switch the Dashboard to live mode and re-copy the links — test and live links differ.
- Turn on Stripe email receipts.
- Fill in the business identity placeholders in the site footer. Stripe and Google both
  verify these against Companies House.
