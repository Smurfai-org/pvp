import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.query;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  try {
    let query = "SELECT * FROM hints WHERE deleted = 0";
    let params = [];

    if (id) {
      query += " AND fk_PROBLEMid = ? AND (fk_USERid IS NULL OR fk_USERid = ?)";
      params.push(id, decoded.user.id);
    }

    const [result] = await pool.execute(query, params);

    res.status(200).json(result);
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
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }

  const { problemId, hint } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO hints (fk_PROBLEMid, hint) VALUES (?, ?)",
      [problemId, hint]
    );
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Patarimas pridėtas" });
    }
    res.status(500).json({ message: "Nepavyko pridėti patarimo" });
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
  const { hint } = req.body;
  try {
    const [result] = await pool.execute(
      "UPDATE hints SET hint = ? WHERE id = ?",
      [hint, req.params.id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Patarimas atnaujintas" });
    }
    res.status(404).json({ message: "Patarimas nerastas" });
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
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }
  try {
    const [result] = await pool.execute(
      "UPDATE hints SET deleted = 1 WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Patarimas ištrintas" });
    }
    res.status(404).json({ message: "Patarimas nerastas" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
