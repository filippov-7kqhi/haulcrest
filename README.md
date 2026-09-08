# HaulCrest — haulcrest.shop

UK storefront for four compact machines. Static HTML, CSS and JavaScript — no build
step, no dependencies, no framework.

| Product | Price (inc. VAT) |
|---|---|
| Cyclone 150 TD Wood Chipper | £2,899 |
| Grindmaster 380 TX Stump Grinder | £3,449 |
| Titan 1000 HT Tracked Dumper | £2,699 |
| Vanguard 850 SL Compact Loader | £3,299 |

## Structure

```
index.html       machines.html    cart.html        checkout.html
about.html       contact.html     track-order.html
returns.html     shipping.html    payment.html     privacy.html    terms.html
<product>.html   x4
feed.xml         Google Merchant Center product feed
assets/img/      32 product images (8 views x 4 machines)
CNAME  sitemap.xml  robots.txt
```

## Before you can trade or submit to Google Merchant Center

Two things are deliberately unfinished, because only you can supply them.

**1. Business identity.** Every page footer currently shows bracketed placeholders:

- `[Registered company name] Ltd`
- `[Companies House number]`
- `[VAT registration number]`
- `[Registered address]`, `[Town]`, `[Postcode]`
- `[Add your phone number]`

Merchant Center verifies these against public records. Replace them with your real
details before going live — publishing invented ones is misrepresentation.

**2. Payment.** Checkout collects the order and then stops, saying plainly that no
payment provider is connected and no money has been taken. Connect Stripe Checkout,
PayPal or similar in `assets/js/script.js` (the `checkoutForm` submit handler).
Merchant Center requires a checkout a buyer can actually complete.

## What is already in place for Merchant Center

- Returns policy with window, procedure, costs, refund method and timing, linked from
  the footer of every page including cart and checkout
- Delivery, payment/billing, privacy and terms pages
- Product structured data with price, availability, condition, shipping and return policy
- `feed.xml` with `identifier_exists: no` (own-brand goods carry no GTIN)
- Prices inclusive of VAT at 20%, stated on every price
- No countdown timers and no customer reviews — both were removed rather than invented

## Run locally

```bash
python3 -m http.server 8000
```

Published with GitHub Pages from `main` at `/ (root)`; `CNAME` binds haulcrest.shop.
