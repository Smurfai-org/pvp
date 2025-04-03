import express from "express";
import fetch from "node-fetch";
import db from "../utils/db.js";
import jwt, { decode } from "jsonwebtoken";
import bcrypt from 'bcrypt';

const router = express.Router();

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to log out" });
  }
});

router.get("/validate", async (req, res) => {
  const token = req.cookies.token;
  const result = await validateToken(token);

  if (result.valid) {
    res.status(200).json(result.data);
  } else {
    res.status(401).json({ message: result.message });
  }
});

export async function validateToken(token) {
  if (!token) {
    return { valid: false, message: "No token found." };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const res_json = {
      valid: true,
      user: {
        id: decoded.user.id,
        role: decoded.user.role,
        profile_pic: decoded.user.profile_pic,
        email: decoded.user.email,
        username: decoded.user.username,
      },
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    };

    if (decoded.loginType === "password") {
      return { valid: true, data: res_json };
    } else if (decoded.loginType === "google") {
      const val_res = await validateGoogle(decoded);
      if (val_res) {
        return { valid: true, data: res_json };
      } else {
        return { valid: false, message: "Invalid Google token." };
      }
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return { valid: false, message: "Token expired." };
    }
    console.error("Invalid token", err);
    return { valid: false, message: "Invalid token." };
  }
}

const validateGoogle = async (decodedToken) => {
  const url = `https://oauth2.googleapis.com/tokeninfo?accessToken=${decodedToken.accessToken}`;

  let data;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      data = await response.json();
      throw new Error(JSON.stringify(data));
    }
    data = await response.json();
  } catch (fetchError) {
    console.error(fetchError);
    return false;
  }

  if (data.expires_in < 0) return false;

  const [user] = await db.execute("SELECT * FROM users WHERE email = ?", [
    data.email,
  ]);
  return user.length > 0 && user[0].id === decodedToken.id;
};

router.post('/register', async (req, res) => {
  const { username, password, email, role, google_id, profile_pic } = req.body;

  if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required' });
  }

  try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const sql = 'INSERT INTO users (username, password, email, role, google_id, profile_pic, creation_date, deleted) VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)';
      const values = [username, hashedPassword, email, role || 'user', google_id || null, profile_pic || null];

      db.query(sql, values, (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'User registered successfully' });
      });
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  console.log('Received req:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  console.log('Querying the database...');
  const sql = 'SELECT * FROM users WHERE username = ?';
  console.log('SQL Query:', sql);
  console.log('Parameters:', [username]);

  try {
    // Call the dbQuery function
    const results = await db.execute(sql, [username]);
    console.log('Query results:', results);  // Log query results

    if (results.length === 0) {
      console.log('No user found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log('Password from DB:', user.password);  // Check the password field

    if (!user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Creating JWT token...');
    const token = jwt.sign(
      {
        user: {
          id: user.id,
          role: user.role,
          profile_pic: user.profile_pic,
          email: user.email,
          username: user.username,
        },
        id: user.id,
        loginType: 'password',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 604800000,  // 7 days in milliseconds
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error, please try again later.' });
  }
});



export default router;
