import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, plan } = req.body;

  if (!userId || !plan) {
    return res.status(400).json({ error: "Missing userId or plan" });
  }

  try {
    const [result] = await pool.execute("SELECT * FROM users WHERE id = ?", [userId]);

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result[0];

    await pool.execute(
      "UPDATE users SET premium = 1 WHERE id = ?",
      [userId]
    );

    const token = jwt.sign(
      {
        user: {
          id: user.id,
          role: user.role,
          profile_pic: user.profile_pic,
          email: user.email,
          username: user.username,
          premium: true,
        },
        id: user.id,
        loginType: "password",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set the updated token cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Respond with updated user info
    res.json({
      ...user,
      premium: true,
      premium_plan: plan,
    });
  } catch (err) {
    console.error("❌ Failed to update subscription:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
