import express from "express";
import jwt from "jsonwebtoken";
import db from "../utils/db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { gresponse } = req.body;

  if (!gresponse) {
    console.error(gresponse);
    return res.status(500).json({ message: "Nepavyko prisijungti." });
  }

  const code = decodeURIComponent(gresponse.code);
  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_SECRET;
  const redirect_uri = "postmessage";
  const grant_type = "authorization_code";

  try {
    const url = "https://oauth2.googleapis.com/token";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type,
      }),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(response.statusText);
      return res.status(400).json({ message: "Nepavyko prisijungti." });
    }

    const tokenData = await response.json();
    const googleToken = tokenData.access_token;

    const userDataResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?accessToken=${googleToken}`
    );
    const userData = await userDataResponse.json();

    let dbid;
    const [user] = await db.execute("SELECT * FROM users WHERE email = ?", [
      userData.email,
    ]);

    if (user.length > 0) {
      dbid = user[0].id;
    } else {
      return res
        .status(400)
        .json({ message: "Naudotojas su tokiu el. paštu neegzistuoja." });
    }
    const token = jwt.sign(
      {
        user: {
          id: user[0].id,
          role: user[0].role,
          profile_pic: user[0].profile_pic,
          email: user[0].email,
          username: user[0].username,
        },
        accessToken: tokenData.access_token,
        id: user[0].id,
        loginType: "google",
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenData.expires_in }
    );

    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 604800000,
    });

    return res.status(200).json({
      message: "Sėkmingai prisijungėte!",
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Nepavyko prisijungti." });
  }
});

export default router;
