import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.query;
  try {
    let query = "SELECT * FROM problems";
    let params = [];

    if (id) {
      query += " WHERE id = ?";
      params.push(id);
    }

    const [result] = await pool.execute(query, params);

    if (result.length === 0) {
      return res.status(404).json({ message: "Užduotys nerastos" });
    }

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/create", async (req, res) => { 
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== "admin") {
      return res.status(403).json();
    }

  const {
    name,
    description,
    generated,
    difficulty,
    fk_COURSEid,
    fk_AI_RESPONSEid,
  } = req.body;

  if (!name || !description || generated === undefined || !difficulty) {
    return res.status(400).json({ message: "Nepakanka duomenų" });
  }

  const values = [
    name,
    description,
    generated ? 1 : 0,
    difficulty,
    fk_COURSEid || null,
    fk_AI_RESPONSEid || null,
  ];

  try {
    const query = `INSERT INTO problems 
            (name, description, \`generated\`, difficulty, fk_COURSEid, fk_AI_RESPONSEid) 
            VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.execute(query, values);

    if (result && result.insertId) {
      return res.status(201).json({ message: "Užduotis sukurta sėkmingai" });
    } else {
      return res.status(500).json({ message: "Nepavyko sukurti užduoties" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida", error });
  }
});

router.post("/update", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== "admin") {
      return res.status(403).json();
    }

  const {
    id,
    name,
    description,
    generated,
    difficulty,
    fk_COURSEid,
    fk_AI_RESPONSEid,
  } = req.body;

  if (!id || !name || !description || generated === undefined || !difficulty) {
    return res.status(400).json({ message: "Nepakanka duomenų" });
  }

  try {
    const query = `UPDATE problems 
        SET name = ?, description = ?, \`generated\` = ?, difficulty = ?, fk_COURSEid = ?, fk_AI_RESPONSEid = ? 
        WHERE id = ?`;

    const values = [
      name,
      description,
      generated ? 1 : 0,
      difficulty,
      fk_COURSEid,
      fk_AI_RESPONSEid || null,
      id,
    ];

    const [result] = await pool.execute(query, values);

    if (result.affectedRows == 0) {
      return res.status(500).json({ message: "Nepavyko rasti užduoties" });
    }

    return res.status(200).json({ message: "Užduotis atnaujinta sėkmingai" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Serverio klaida", error });
  }
});

router.post("/delete", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Nepakanka duomenų" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE problems SET deleted = 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nepavyko ištrinti užduoties" });
    }

    return res.status(200).json({ message: "Užduotis sėkmingai ištrinta" });
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida", error });
  }
});

router.post("/restore", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Nepakanka duomenų" });
  }

  try {
    const [result] = await pool.execute(
      "UPDAte problems SET deleted = 0 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nepavyko atkurti užduoties" });
    }

    return res.status(200).json({ message: "Užduotis atkurta sėkmingai" });
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/:id/hints", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      "SELECT * FROM hints WHERE deleted = 0 AND fk_PROBLEMid = ?",
      [id]
    );
    if (result.length === 0) {
      res.status(404).json({ message: "Patarimų nerasta" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/:id/hints/:id2", async (req, res) => {
  const id = req.params.id;
  const id2 = req.params.id2;
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM hints WHERE deleted = 0 AND fk_PROBLEMid = ? AND id = ?",
      [id, id2]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: "Patarimas nerastas" });
    } else {
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/:id/hints", async (req, res) => {
  const id = req.params.id;
  const { hint } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO hints (fk_PROBLEMid, hint) VALUES (?, ?)",
      [id, hint]
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

router.put("/:id/hints/:id2", async (req, res) => {
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
      [hint, req.params.id2]
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

router.delete("/:id/hints/:id2", async (req, res) => {
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
      [req.params.id2]
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

router.post("/solve", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const { code, userId, probId, score } = req.body;

  try {
    const [exists] = await pool.execute(
      "SELECT * from progress WHERE fk_PROBLEMid = ? AND fk_USERid = ?",
      [probId, userId]
    );
    const timestamp = new Date();

    let result;
    if (exists.length === 0) {
      [result] = await pool.execute(
        "INSERT INTO progress (fk_PROBLEMid, fk_USERid, completion_date, score, status, code) VALUES (?, ?, ?, ?, ?, ?)",
        [
          probId,
          userId,
          timestamp,
          score,
          score === 0 ? "in progress" : "finished",
          code,
        ]
      );
    } else {
      [result] = await pool.execute(
        "UPDATE progress SET code = ?, completion_date = ?, score = ?, status = ? WHERE fk_PROBLEMid = ? AND fk_USERid = ?",
        [
          code,
          timestamp,
          score,
          score === 0 ? "in progress" : "finished",
          probId,
          userId,
        ]
      );
    }

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Nepavyko įkelti užduoties" });
    }

    return res.status(200).json({ message: "Sprendimas sėkmingai įkeltas" });
  } catch (error) {
    console.error("Database error:", error);
    return res
      .status(500)
      .json({ message: "Serverio klaida", error: error.message });
  }
});

export default router;
