# HaulCrest — haulcrest.shop

Storefront for UK tracked dumpers and compact loaders. Static HTML, CSS and JavaScript
with no build step and no dependencies.

| Product | Price |
|---|---|
| Titan 1000 HT Tracked Dumper | £2,699 |
| Vanguard 850 SL Compact Loader | £3,299 |

## Structure

```
index.html               Home
titan-1000-ht.html       Tracked dumper product page
vanguard-850-sl.html     Compact loader product page
about.html  contact.html  track-order.html  policies.html
assets/css/style.css     Theme
assets/js/script.js      Mobile nav, gallery, countdown, form handling
assets/img/<product>/    8 product images per machine
CNAME                    haulcrest.shop
sitemap.xml  robots.txt
```

## Deployment

Published with GitHub Pages from `main` at `/ (root)`. The `CNAME` file binds the
custom domain; DNS is four A records on the apex pointing at GitHub Pages plus a
`www` CNAME.

## Run locally

```bash
python3 -m http.server 8000
```

## Not wired up

The contact, enquiry and order-tracking forms validate and confirm in the browser but
send nothing — connect a form handler before taking real enquiries. There is no payment
processing; product pages say checkout is handled by the sales team rather than
implying a live cart.
