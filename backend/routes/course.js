import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// FRONTE PRIDET HEADER: Content-Type: "application/json"

router.get("/", async (req, res) => {
  const { id, userId } = req.query;

  try {
    let query = `
      SELECT 
        c.*, 
        (
          SELECT e.completed_problems 
          FROM enrolled e 
          WHERE e.fk_COURSEid = c.id AND e.fk_USERid = ?
          LIMIT 1
        ) AS completed_problems,
        (
          SELECT e.language 
          FROM enrolled e 
          WHERE e.fk_COURSEid = c.id AND e.fk_USERid = ?
          LIMIT 1
        ) AS language,
        (
          SELECT COUNT(*) 
          FROM problems p 
          WHERE p.fk_COURSEid = c.id AND p.deleted = 0
        ) AS total_problems
      FROM courses c
    `;

    let params = [];

    if (userId) {
      params.push(userId, userId);
    } else {
      params.push(null, null);
    }

    if (id) {
      query += " WHERE c.id = ?";
      params.push(id);
    }

    query += " ORDER BY c.id";

    const [result] = await pool.execute(query, params);

    if (result.length === 0) {
      return res
        .status(id ? 404 : 200)
        .json(id ? { message: "Kursas nerastas" } : []);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.get("/problems", async (req, res) => {
  const { id, userId } = req.query;

  try {
    let query = "SELECT * FROM problems WHERE fk_COURSEid = ? AND deleted = 0";
    const params = [id];

    const [problems] = await pool.execute(query, params);

    if (problems.length === 0) {
      return res.status(404).json({ message: "Problemos nerastos" });
    }

    if (userId) {
      const problemIds = problems.map((p) => p.id);
      const placeholders = problemIds.map(() => "?").join(",");
      const progressQuery = `
        SELECT fk_PROBLEMid, score, status 
        FROM progress 
        WHERE fk_USERid = ? AND fk_PROBLEMid IN (${placeholders})
      `;

      if (problemIds.length > 0) {
        const [progress] = await pool.execute(progressQuery, [
          userId,
          ...problemIds,
        ]);

        const progressMap = progress.reduce((acc, p) => {
          acc[p.fk_PROBLEMid] = { score: p.score, status: p.status };
          return acc;
        }, {});

        problems.forEach((problem) => {
          if (progressMap[problem.id]) {
            problem.progress = progressMap[problem.id];
          }
        });
      }
    }

    res.status(200).json(problems);
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/create", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }

  if (decoded.user.role !== "admin") {
    return res.status(403).json({ message: "Permission denied" });
  }

  const { name, description, icon_url } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "Nepakankami duomenys" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO courses (name, description, icon_url) VALUES (?, ?, ?)",
      [name, description, icon_url]
    );

    if (result && result.insertId) {
      return res
        .status(201)
        .json({ id: result.insertId, message: "Kursas sukurtas sėkmingai" });
    } else {
      return res.status(500).json({ message: "Nepavyko sukurti kurso" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/update", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json();
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }

  const { id, name, description, icon_url } = req.body;

  if (!id || !name || !description) {
    return res.status(400).json({ message: "Nepakankami duomenys" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE courses SET name = ?, description = ?, icon_url = ? WHERE id = ?",
      [name, description, icon_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Nepavyko atnaujinti kurso" });
    } else {
      return res.status(201).json({ message: "Kursas atnaujintas sėkmingai" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/delete", async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Nepakankami duomenys" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE courses SET deleted = 1 WHERE id = ?",
      [id]
    );

    await pool.execute(
      "UPDATE problems SET deleted = 1 WHERE fk_COURSEid = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Nepavyko ištrinti kurso" });
    } else {
      return res.status(201).json({ message: "Kursas ištrintas sėkmingai" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/restore", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json();
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.user.role !== "admin") {
    return res.status(403).json();
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Nepakankami duomenys" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE courses SET deleted = 0 WHERE id = ?",
      [id]
    );

    await pool.execute(
      "UPDATE problems SET deleted = 0 WHERE fk_COURSEid = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Nepavyko atkurti kurso" });
    }

    return res.status(200).json({ message: "Kursas atkurtas sėkmingai" });
  } catch (error) {
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
