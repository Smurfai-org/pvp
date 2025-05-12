import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);


router.post('/create-checkout-session', async (req, res) => {
  const { id } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: 'price_1RO26xE2ccvohllamkHn8zzu',
          quantity: 1,
        },
      ],
      metadata: {
        userId: id,
      },
      success_url: 'http://localhost:5173/subscribe-success',
      cancel_url: 'http://localhost:5173/subscribe',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ Payment completed for session:", session.id);
    }

    res.status(200).send("Received webhook");
  }
);

export default router;