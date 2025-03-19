import express from "express";
import pool from "../utils/db.js";

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

    if (result.length === 0) {
      return res.status(404).json({ message: "Pavyzdžiai nerasti" });
    }

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
