import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js"; // your DB connection
import cookieParser from "cookie-parser";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    try {
      const [result] = await pool.execute("SELECT * FROM users WHERE id = ?", [userId]);

      if (result.length === 0) return res.status(404).send("User not found");

      const user = result[0];

      // Update premium
      await pool.execute("UPDATE users SET premium = 1 WHERE id = ?", [userId]);

      // Create a new token with updated premium
      const token = jwt.sign(
        {
          user: {
            id: user.id,
            role: user.role,
            profile_pic: user.profile_pic,
            email: user.email,
            username: user.username,
            premium: true, // <- ensure premium is true here
          },
          id: user.id,
          loginType: "password",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set new cookie
      res.cookie("token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 604800000,
      });

      console.log("✅ Premium status updated and token refreshed for user:", user.email);
    } catch (error) {
      console.error("❌ Error updating user:", error.message);
      return res.status(500).send("Internal error");
    }
  }

  res.sendStatus(200);
});

export default router;
