import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.query;

  try {
    let query = "SELECT * FROM hints WHERE deleted = 0";
    let params = [];

    if (id) {
      query += " AND fk_PROBLEMid = ?";
      params.push(id);
    }

    const [result] = await pool.execute(query, params);

    if (result.length === 0) {
      return res.status(404).json({ message: "Patarimų nerasta" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/", async (req, res) => {
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
