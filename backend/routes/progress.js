import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [result] = await pool.execute("SELECT * FROM progress");
    if (result.length === 0) {
      return res.status(404).json({ message: "Sprendimų nerasta" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/u=:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM progress WHERE fk_USERid = ?",
      [userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Sprendimas nerastas" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/p=:problemId", async (req, res) => {
  const problemId = req.params.problemId;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM progress WHERE fk_PROBLEMid = ?",
      [problemId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Sprendimas nerastas" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/:userId/:problemId", async (req, res) => {
  const userId = req.params.userId;
  const problemId = req.params.problemId;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM progress WHERE fk_USERid = ? AND fk_PROBLEMid = ?",
      [userId, problemId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Sprendimas nerastas" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/", async (req, res) => {
  const { userId, problemId, code, score, status } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO progress (fk_USERid, fk_PROBLEMid, code, score, status) VALUES (?, ?, ?, ?, ?)",
      [userId, problemId, code, score, status]
    );
    if (result.affectedRows > 0) {
      res.status(201).json({ message: "Sprendimas pridėtas" });
    } else {
      res.status(400).json({ message: "Nepavyko pridėti sprendimo" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.put("/:userId/:problemId", async (req, res) => {
  const { code, score, status } = req.body;
  if (!code && !score && !status) {
    res.status(400).json({ message: "Nėra ką atnaujinti" });
  } else {
    try {
      const updates = [];
      const values = [];
      if (code) {
        updates.push("code = ?");
        values.push(code);
      }
      if (score) {
        updates.push("score = ?");
        values.push(score);
      }
      if (status) {
        updates.push("status = ?");
        values.push(status);
      }
      updates.push("completion_date = NOW()");

      if (updates.length === 0) {
        res.status(400).json({ message: "Nėra ką atnaujinti" });
      } else {
        values.push(req.params.userId);
        values.push(req.params.problemId);
        const [result] = await pool.execute(
          `UPDATE progress SET ${updates.join(
            ", "
          )} WHERE fk_USERid = ? AND fk_PROBLEMid = ?`,
          values
        );
        if (result.affectedRows > 0) {
          res.status(200).json({ message: "Sprendimas atnaujintas" });
        } else {
          res.status(404).json({ message: "Sprendimas nerastas" });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Serverio klaida" });
    }
  }
});

export default router;
