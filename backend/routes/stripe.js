// stripe.js (in routes folder)
import express from "express";
import Stripe from "stripe";

const router = express.Router();

// ✅ Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_KEY,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/premium-area",
      cancel_url: "http://localhost:3000/subscribe",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
