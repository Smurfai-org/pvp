import express from "express";
import pool from "../utils/db.js";
import { hashPassword } from "../utils/passwordService.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// visi
router.get("/", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "SELECT id, username, email, creation_date, deleted, role FROM users"
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Vartotojų nerasta" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

// vienas
router.get("/:id", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "SELECT id, username, creation_date, role FROM users WHERE deleted = 0 AND id = ?",
      [req.params.id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Vartotojas nerastas" });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Ne visi laukai užpildyti" });
  }
  const [existingUser] = await pool.execute(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  if (existingUser.length > 0) {
    res
      .status(409)
      .json({ message: "Vartotojas su tokiu vardu jau egzistuoja" });
  } else {
    try {
      const hashedPassword = await hashPassword(password);
      if (!email) {
        await pool.execute(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hashedPassword]
        );
      } else {
        await pool.execute(
          "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
          [username, hashedPassword, email]
        );
      }
      res.status(201).json({ message: "Vartotojas sukurtas" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Serverio klaida" });
    }
  }
});

router.put("/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin" && decoded.user.id != req.params.id) {
    return res.status(403).json();
  }

  const userId = req.params.id;
  const { username, email, password } = req.body;

  if (!username && !email && !password) {
    return res.status(400).json({ message: "Nėra ką atnaujinti" });
  }

  try {
    if (username) {
      const [existingUser] = await pool.execute(
        "SELECT * FROM users WHERE username = ? AND id != ?",
        [username, userId]
      );
      if (existingUser.length > 0) {
        return res
          .status(409)
          .json({ message: "Vartotojas su tokiu vardu jau egzistuoja" });
      }
    }

    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Nėra ką atnaujinti" });
    }

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    values.push(userId);

    const [result] = await pool.execute(query, values);

    if (result.affectedRows > 0) {
      const [updatedUser] = await pool.execute(
        "SELECT id, role, profile_pic, email, username FROM users WHERE id = ?", 
        [userId]
      );

      const newToken = jwt.sign(
        {
          user: {
            id: updatedUser[0].id,
            role: updatedUser[0].role,
            profile_pic: updatedUser[0].profile_pic,
            email: updatedUser[0].email,
            username: updatedUser[0].username,
          },
          id: updatedUser[0].id,
          loginType: "password",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.cookie("token", newToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 604800000,
      });

      return res.status(200).json({ token: newToken });
    } else {
      return res.status(404).json({ message: "Vartotojas nerastas" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.delete("/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin" && decoded.user.id != req.params.id) {
    return res.status(403).json();
  }
  try {
    const [result] = await pool.execute(
      "UPDATE users SET deleted = 1 WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows > 0) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "Vartotojas nerastas" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
