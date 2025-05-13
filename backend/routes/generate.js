import express from "express";
import pool from "../utils/db.js";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
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

    if (!problem || !language) {
      return res.status(400).json({ message: "Trūksta duomenų" });
    }

    const token = req.cookies.token;
    const decToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decToken.user.premium === 0) {
      const [[hintCount]] = await pool.execute(
        `SELECT COUNT(*) as count FROM hints 
         WHERE fk_USERid = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)`,
        [userId]
      );


      if (hintCount.count >= 3) {
        const remainingTime = await pool.execute(
          `SELECT TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(
            (SELECT MIN(created_at) FROM hints WHERE fk_USERid = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)),
            INTERVAL 1 WEEK)) AS remaining_time`,
          [userId]
        );
        const remainingSeconds = remainingTime[0][0].remaining_time;
        const nextHintTime = new Date(Date.now() + remainingSeconds * 1000);
        const nextHintTimeFormatted = nextHintTime.toLocaleString("lt-LT", {
          timeZone: "Europe/Vilnius",
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
        const msg = "Jau sunaudojote šios savaitės nemokamų užuominų kiekį. Naujas užuominas galėsite gauti " + nextHintTimeFormatted + ".";

        const noHint = {
          hint: msg,
          problemId,
          userId,
        }
        return res.status(200).json(noHint);
      }
    }

    if (!progress) {
      const noHint = {
        hint: "Pirmiausia pabandykite parašyti kažkiek savo kodo, tada paspauskite mygtuką 'Tikrinti'.",
        problemId,
        userId,
      };
      return res.status(200).json(noHint);
    }

    if (progress.score === 100) {
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
      "INSERT INTO hints (fk_PROBLEMid, hint, fk_USERid, created_at) VALUES (?, ?, ?, NOW())",
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

router.post("/solution", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json();
  }
  const decToken = jwt.verify(token, process.env.JWT_SECRET);
  if (decToken.user.premium === 0) {
    return res
      .status(403)
      .json({ message: "Paslauga skirta tik premium vartotojams" });
  }

  const { userId, problemId, language } = req.body;

  const [[problem]] = await pool.execute(
    "SELECT description FROM problems WHERE id = ?",
    [problemId]
  );
  const [[test_cases]] = await pool.execute(
    "SELECT input, expected_output FROM test_cases WHERE fk_PROBLEMid = ? LIMIT 2",
    [problemId]
  );
  const [[progress]] = await pool.execute(
    "SELECT code, score FROM progress WHERE fk_USERid = ? AND fk_PROBLEMid = ?",
    [userId, problemId]
  );
  if (!problem || !language) {
    return res.status(400).json({ message: "Trūksta duomenų" });
  }

  if (progress && progress.status === "finished") {
    const noHint = {
      hint: "Užduotis jau išspręsta, tad sprendimo nereikės.",
      problemId,
      userId,
    };
    return res.status(200).json(noHint);
  }

  try {
    const codeObj = progress ? JSON.parse(progress.code) : {};
    const inputObj = JSON.parse(test_cases.input);

    const userInput = {
      description: problem.description,
      language,
      test_cases: [
        {
          ivestis: inputObj[language] || "",
          norimas_rezultatas: inputObj.expected_output,
        },
      ],
    };

    const response = await client.responses.create({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content:
            'Tu esi pažangus programavimo asistentas, padedantis 17–18 metų mokiniams mokytis programuoti C++ arba Python kalbomis. Tavo užduotis – pagal pateiktą užduoties aprašymą parašyti veikiančią funkciją, kuri atitiktų visus reikalavimus ir veiktų pagal testų atvejus. Vadovaukis šiomis taisyklėmis:\n\n1. Programavimo kalba bus nurodyta įvestyje. Naudok tik tą kalbą.\n2. Funkcijos pavadinimas turi būti "Sprendimas".\n3. Funkcijos argumentų tipus nustatyk iš užduoties aprašymo bei testinių atvejų.\n4. Funkcijos grąžinimo tipas taip pat turi būti nustatomas pagal užduoties aprašymą bei testinius atvejus.\n5. Funkcija turi visiškai atitikti aprašytą užduoties logiką.\n6. Jei sprendimas sudėtingas, pridėk tik vieną arba dvi komentaro eilutes, paaiškinančias sunkiau suprantamas kodo vietas. Komentarai turi būti trumpi ir aiškūs pradedančiajam.\n7. Nerašyk jokio paaiškinimo ar įžanginio teksto – pateik tik kodą su reikiamais komentarais (jei reikia).\n8. NENAUDOK jokių „Markdown“ formatavimo simbolių, tokių kaip ``` arba **. Grąžink tik paprastą, gryną kodą be jokio papildomo formatavimo.',
        },
        {
          role: "user",
          content:
            "Parinkta programavimo kalba: " +
            language +
            ".\n\n" +
            "Užduoties aprašymas: " +
            problem.description +
            "\n\n" +
            "Testų atvejai: " +
            JSON.stringify(userInput.test_cases) +
            "\n\n",
        },
      ],
    });

    const aiSolution = response.output_text;
    codeObj[language] = aiSolution;
    //     console.log(userId, problemId, JSON.stringify(codeObj), 0
    //     , "ai solved"
    // )

    if (!progress) {
      const [saveProgress] = await pool.execute(
        'INSERT INTO progress (fk_USERid, fk_PROBLEMid, code, score, status) VALUES (?, ?, ?, 0, "ai solved")',
        [userId, problemId, JSON.stringify(codeObj)]
      );
      if (!saveProgress) {
        return res.status(500).json({ message: "Nepavyko išsaugoti progreso" });
      }
    } else {
      const [updateProgress] = await pool.execute(
        'UPDATE progress SET code = ?, score = 0, status = "ai solved" WHERE fk_USERid = ? AND fk_PROBLEMid = ?',
        [JSON.stringify(codeObj), userId, problemId]
      );
      if (!updateProgress) {
        return res
          .status(500)
          .json({ message: "Nepavyko atnaujinti progreso" });
      }
    }
    return res
      .status(200)
      .json({ message: "Sprendimas gautas", solution: aiSolution });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Serverio klaida" });
  }
});
export default router;
