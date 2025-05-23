import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.query;

  try {
    let query = "SELECT * FROM test_cases";
    let params = [];

    if (id) {
      query += " WHERE fk_PROBLEMid = ?";
      params.push(id);
    }

    const [result] = await pool.execute(query, params);

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }
  const { problemId, input, output } = req.body;
  try {
    if (!problemId || !input || !output) {
      return res.status(400).json({ message: "Trūksta duomenų" });
    }
    const [problem] = await pool.execute(
      "SELECT * FROM problems WHERE id = ?",
      [problemId]
    );
    if (problem.length === 0) {
      return res.status(404).json({ message: "Užduotis nerasta" });
    }
    const [result] = await pool.execute(
      "INSERT INTO test_cases (fk_PROBLEMid, input, expected_output) VALUES (?, ?, ?)",
      [problemId, input, output]
    );
    if (result.affectedRows > 0) {
      res.status(201).json({ message: "Testas sukurtas" });
    } else {
      res.status(400).json({ message: "Nepavyko sukurti testo" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.put("/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }
  const { id } = req.params;
  const { input, output, visibility } = req.body;
  if (!input && !output && visibility === undefined) {
    res.status(400).json({ message: "Nėra ką atnaujinti" });
  } else {
    try {
      const updates = [];
      const values = [];
      if (input) {
        updates.push("input = ?");
        values.push(input);
      }
      if (output) {
        updates.push("expected_output = ?");
        values.push(output);
      }
      if(visibility !== undefined){
        updates.push("visibility = ?");
        values.push(visibility);
      }
      values.push(id);
      const [result] = await pool.execute(
        `UPDATE test_cases SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Testas atnaujintas" });
      } else {
        res.status(404).json({ message: "Testas nerastas" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Serverio klaida" });
    }
  }
});

router.delete("/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }
  const { id } = req.params;
  try {
    const [result] = await pool.execute("DELETE FROM test_cases WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Testas ištrintas" });
    } else {
      res.status(404).json({ message: "Testas nerastas" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
