require("dotenv").config();

const path = require("path");
const express = require("express");
const Stripe = require("stripe");

const app = express();
const port = process.env.PORT || 4242;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("Missing STRIPE_SECRET_KEY. Checkout session creation will fail until you add it to .env.");
}

const stripe = Stripe(stripeSecretKey || "sk_test_placeholder");

const catalog = {
  "manhattan-navy-suit": {
    name: "Manhattan Navy Suit",
    collection: "Foundation Collection",
    options: {
      "2-piece": 19900,
      "3-piece-upgrade": 27900,
      "premium-fabric-upgrade": 34900
    }
  },
  "executive-charcoal-suit": {
    name: "Executive Charcoal Suit",
    collection: "Foundation Collection",
    options: {
      "2-piece": 19900,
      "3-piece-upgrade": 27900,
      "premium-fabric-upgrade": 34900
    }
  },
  "metropolitan-grey-suit": {
    name: "Metropolitan Grey Suit",
    collection: "Foundation Collection",
    options: {
      "2-piece": 19900,
      "3-piece-upgrade": 27900,
      "premium-fabric-upgrade": 34900
    }
  },
  "riviera-linen-suit": {
    name: "Riviera Linen Suit",
    collection: "Riviera Collection",
    options: {
      "2-piece": 22900,
      "3-piece-upgrade": 30900,
      "premium-fabric-upgrade": 37900
    }
  },
  "milano-olive-suit": {
    name: "Milano Olive Suit",
    collection: "Riviera Collection",
    options: {
      "2-piece": 22900,
      "3-piece-upgrade": 30900,
      "premium-fabric-upgrade": 37900
    }
  }
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/create-checkout-session", async (req, res) => {
  const { productSlug, option } = req.body;
  const product = catalog[productSlug];
  const price = product?.options?.[option];

  if (!product || !price) {
    return res.status(400).json({ error: "Invalid product or option." });
  }

  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const optionLabel = option.replace(/-/g, " ");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      customer_creation: "always",
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${product.name} (${optionLabel})`,
              description: `${product.collection} - custom tailored by NECKTIE Premium Tailoring`
            },
            unit_amount: price
          },
          quantity: 1
        }
      ],
      metadata: {
        product_slug: productSlug,
        option
      },
      success_url: `${baseUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout-cancel.html?product=${encodeURIComponent(productSlug)}`
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "Unable to create checkout session." });
  }
});

app.listen(port, () => {
  console.log(`NECKTIE site running at http://localhost:${port}`);
});
