# HaulCrest — haulcrest.shop

UK storefront for four compact machines. Static HTML, CSS and JavaScript — no build
step, no dependencies, no framework.

| Product | Price (inc. VAT) |
|---|---|
| HC15H Towable Wood Chipper | £2,899 |
| CREX10-K Mini Excavator | £3,449 |
| MD-500HPRO Tracked Mini Dumper | £2,699 |
| Mini Skid Steer Loader | £3,299 |

All four carry real photography, ten views each.

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

## Before you can trade

**Business identity.** Every page footer shows bracketed placeholders — company name,
Companies House number, VAT number, registered address, phone. Google and Stripe both
verify these against public records. Replace them in the store config and rebuild;
publishing invented details is misrepresentation.

**Stripe.** Payment runs on Stripe Payment Links, which is the supported route for a
static site with no server. Paste one link per machine into
`assets/js/stripe-config.js` — see `stripe/README.md` for the 15-minute setup. Until a
link is pasted in, checkout says plainly that payment is not switched on and routes to
an enquiry, rather than pretending to take money.

Never commit a Stripe secret key (`sk_live_…`). Payment Link URLs are public by design;
secret keys are not.

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
