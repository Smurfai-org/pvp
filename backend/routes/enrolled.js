import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM enrolled WHERE fk_USERid = ?",
      [userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Pradėti kursai nerasti" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/:userId/:courseId", async (req, res) => {
  const userId = req.params.userId;
  const courseId = req.params.courseId;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM enrolled WHERE fk_USERid = ? AND fk_COURSEid = ?",
      [userId, courseId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Pradėti kursai nerasti" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }

  const { courseId, userId, completed_problems, language } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO enrolled (fk_COURSEid, fk_USERid, completed_problems, language) VALUES (?, ?, ?, ?)",
      [courseId, userId, completed_problems, language]
    );
    if (result.affectedRows > 0) {
      res.status(201).json({ message: "Kurso progresas pridėtas" });
    } else {
      res.status(500).json({ message: "Nepavyko pridėti kurso progreso" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.put("/:userId/:courseId", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const { completed_problems, language } = req.body;
  if (!completed_problems && !language) {
    res.status(400).json({ message: "Nėra ką atnaujinti" });
  } else {
    try {
      const updates = [];
      const values = [];
      if (completed_problems !== null) {
        updates.push("completed_problems = ?");
        values.push(completed_problems);
      }
      if (language) {
        updates.push("language = ?");
        values.push(language);
      }

      if (updates.length === 0) {
        res.status(400).json({ message: "Nėra ką atnaujinti" });
      } else {
        values.push(req.params.userId);
        values.push(req.params.courseId);
        const [result] = await pool.execute(
          `UPDATE enrolled SET ${updates.join(
            ", "
          )} WHERE fk_USERid = ? AND fk_COURSEid = ?`,
          values
        );
        if (result.affectedRows > 0) {
          res.status(200).json({ message: "Kurso progresas atnaujintas" });
        } else {
          res.status(404).json({ message: "Kurso progresas nerastas" });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Serverio klaida" });
    }
  }
});

export default router;
