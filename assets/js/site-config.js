/* ---------------------------------------------------------------------------
   Runtime configuration for HaulCrest. Edited through /admin.html, or by hand.

   THIS FILE IS PUBLIC. Everything in it ships to every visitor.
   Payment Link URLs, business details and the admin hash are all fine to publish.
   A Stripe SECRET key (sk_live_... / sk_test_...) is NOT. Never put one here.
--------------------------------------------------------------------------- */
window.SITE_CONFIG = {
  // SHA-256 of the admin passphrase. This only hides the form from a casual
  // visitor -- anyone can read this file and bypass it. Nothing behind it is
  // secret; the real gate on changing the live site is your GitHub login.
  admin: { passHash: "5b9e9741342f4f8a87a03b52634853031e9478d49220cadd57e189392e0b7bb3" },

  // Shown in the footer of every page. Google and Stripe both verify these.
  business: {
    company:   "HaulCrest Ltd",
    companyNo: "",
    vatNo:     "",
    street:    "Kingham",
    city:      "Chipping Norton",
    postcode:  "OX7 6YA",
    phone:     "+44 1905 741210"
  },

  // Data collector that feeds the admin dashboard. Without it the dashboard
  // shows nothing rather than inventing figures. See stripe/README.md.
  analyticsEndpoint: "https://branchforge-haulcrest-collector.stellapark1141.workers.dev",

  // Optional: Checkout Sessions for baskets with more than one machine.
  checkoutEndpoint: "https://branchforge-haulcrest-collector.stellapark1141.workers.dev/checkout",

  // One Stripe Payment Link per machine. Blank = that machine routes to an
  // enquiry instead of pretending to take payment.
  paymentLinks: {
    "HC-HC15H": "https://buy.stripe.com/4gM7sLdoW7MycZ6gPO6c004",
    "HC-CREX10K": "https://buy.stripe.com/5kQ3cvbgO9UG4sAczy6c005",
    "HC-MD500": "https://buy.stripe.com/6oU7sL84C8QC2kseHG6c006",
    "HC-MSS739": "https://buy.stripe.com/00w3cvdoWgj43ow8ji6c007"
  }
};
