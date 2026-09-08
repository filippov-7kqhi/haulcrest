/* ---------------------------------------------------------------------------
   Stripe configuration for HaulCrest.

   This file is PUBLIC. Never put a secret key (sk_live_... / sk_test_...) here.
   Payment Link URLs and publishable keys are safe to publish; secret keys are not.

   HOW TO FILL THIS IN
   1. Stripe Dashboard -> Product catalogue -> add each machine with its price
      (prices below are GBP and already include 20% VAT).
   2. For each product, create a Payment Link. On each link switch on:
        - "Collect customers' addresses" -> Shipping
        - "Let customers adjust quantity" (so a buyer can order two)
        - a custom text field named "Delivery access notes" (gate width, gradient,
          parking) so the carrier gets what it needs
   3. Paste each Payment Link URL below, next to its item code.

   Leave a link blank and that machine falls back to the enquiry route rather
   than pretending to take payment.
--------------------------------------------------------------------------- */
window.STRIPE_CONFIG = {
  // Optional: a serverless endpoint that creates a Checkout Session.
  // Needed only for baskets holding more than one different machine.
  // See stripe/README.md. Leave "" while you are on GitHub Pages.
  checkoutEndpoint: "",

  paymentLinks: {
    "HC-CY150": "",      // Cyclone 150 TD Wood Chipper — £2,899
    "HC-GM380": "",      // Grindmaster 380 TX Stump Grinder — £3,449
    "HC-TT1000": "",     // Titan 1000 HT Tracked Dumper — £2,699
    "HC-VG850": "",      // Vanguard 850 SL Compact Loader — £3,299
  }
};
