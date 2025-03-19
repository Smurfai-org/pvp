import express from "express";
import pool from "../utils/db.js";
import { hashPassword } from "../utils/passwordService.js";

const router = express.Router();

// visi
router.get("/", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "SELECT id, username, creation_date, role FROM users WHERE deleted = 0"
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
  const { username, password } = req.body;
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
      await pool.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword]
      );
      res.status(201).json({ message: "Vartotojas sukurtas" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Serverio klaida" });
    }
  }
});

router.put("/:id", async (req, res) => {
  // pridėti roles kai bus autorizacija
  const userId = req.params.id;
  const { username, password } = req.body;

  if (!username && !password) {
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
      return res.status(200).json({ message: "Vartotojas atnaujintas" });
    } else {
      return res.status(404).json({ message: "Vartotojas nerastas" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.delete("/:id", async (req, res) => {
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

router.get("/:id/problem_code", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.execute(
      "SELECT id, code FROM problem_codes WHERE fk_USERid = ?",
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Vartotojas neturi sprendimo kodų" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/:id/problem_code/:id2", async (req, res) => {
  const id = req.params.id;
  const id2 = req.params.id2;
  try {
    const [rows] = await pool.execute(
      "SELECT id, code FROM problem_codes WHERE fk_USERid = ? AND fk_PROBLEMid = ?",
      [id, id2]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Sprendimo kodas nerastas" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/:id/problem_code", async (req, res) => {
  const id = req.params.id;
  const { code, problemId } = req.body;
  try {
    await pool.execute(
      "INSERT INTO problem_codes (code, fk_USERid, fk_PROBLEMid) VALUES (?, ?, ?)",
      [code, id, problemId]
    );
    res.status(201).json({ message: "Sprendimo kodas sukurtas" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.put("/:id/problem_code/:id2", async (req, res) => {
  const id = req.params.id;
  const id2 = req.params.id2;
  try {
    const [result] = await pool.execute(
      "UPDATE problem_codes SET code = ? WHERE fk_USERid = ? AND id = ?",
      [req.body.code, id, id2]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Sprendimo kodas atnaujintas" });
    } else {
      res.status(404).json({ message: "Sprendimo kodas nerastas" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
