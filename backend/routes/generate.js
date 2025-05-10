import express from "express";
import pool from "../utils/db.js";
import OpenAI from "openai";
import { processUserMessageProblemGeneration } from "../utils/problemGenerationService.js";
const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/hint", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json();
  }
  const { userId, problemId, language } = req.body;

  try {
    const [[problem]] = await pool.execute(
      "SELECT description FROM problems WHERE id = ?",
      [problemId]
    );

    const [[progress]] = await pool.execute(
      "SELECT code, score FROM progress WHERE fk_USERid = ? AND fk_PROBLEMid = ?",
      [userId, problemId]
    );

    if (!problem || !progress || !language) {
      return res.status(400).json({ message: "Trūksta duomenų" });
    }

    if (progress.score === 100) {
      // reikės ateityje pakeist
      const noHint = {
        hint: "Užduotis jau išspręsta, tad patarimo nereikės.",
        problemId,
        userId,
      };
      return res.status(200).json(noHint);
    }

    const codeObj = JSON.parse(progress.code);

    const userInput = {
      code: codeObj[language],
      description: problem.description,
      problemId,
      userId,
    };
    //console.log(userInput);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "Tu esi AI asistentas, padedantis mokiniams spręsti programavimo užduotis Python ir C++ kalbomis. Analizuok mokinio parašytą kodą ir pagal pateiktą užduotį sukurk naudingą patarimą.",
        },
        {
          role: "user",
          content: JSON.stringify(userInput),
        },
      ],
      temperature: 1.5,
    });

    const aiHint = response.output_text;
    //console.log(aiHint);
    const parsed = JSON.parse(aiHint);

    const [[hintCount]] = await pool.execute(
      "SELECT COUNT(*) as count FROM hints WHERE fk_PROBLEMid = ? AND fk_USERid = ?",
      [problemId, userId]
    );

    if (hintCount.count >= 3) {
      await pool.execute(
        "DELETE hints FROM hints INNER JOIN (SELECT id FROM hints WHERE fk_PROBLEMid = ? AND fk_USERid = ? ORDER BY id ASC LIMIT 1) AS oldest_hint ON hints.id = oldest_hint.id",
        [problemId, userId]
      );
    }

    const [saveHint] = await pool.execute(
      "INSERT INTO hints (fk_PROBLEMid, hint, fk_USERid) VALUES (?, ?, ?)",
      [problemId, parsed.hint, userId]
    );
    if (!saveHint) {
      return res.status(500).json({ message: "Nepavyko išsaugoti patarimo" });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/problem", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId) {
    console.log("No user found");
    return res.status(403).json({
      message: "Neturite prieigos prie problemos generavimo funkcijos.",
    });
  }

  try {
    const response = await processUserMessageProblemGeneration(userId, message);

    if (response.success) {
      return res.status(200).json({
        message: response.message,
        problemId: response.problemId,
        timestamp: response.timestamp,
      });
    } else {
      return res.status(500).json({
        message: response.error || "AI response error",
      });
    }
  } catch (error) {
    console.error("Message processing error:", error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
