import OpenAI from "openai";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";
import express from "express";

export const chatRouter = express.Router();

export const ERROR_NOT_PREMIUM = 111;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const validateAuth = async (token) => {
  if (!token) {
    return { valid: false, message: "Neautorizuota prieiga" };
  }

  try {
    const dec = jwt.verify(token, process.env.JWT_SECRET);
    if (dec.user.premium === 1) {
      return { valid: true, user: dec.user };
    } else {
      return {
        valid: false,
        code: ERROR_NOT_PREMIUM,
        message: "Pokalbio funkcija leidžiama tik premium naudotojams.",
      };
    }
  } catch (err) {
    return { valid: false, message: "Nepavyko atkoduoti žetono" };
  }
};

export const getResponse = async (
  message,
  convoHistory = [],
  problemContext = null
) => {
  try {
    let prompt =
      "Tu esi AI programavimo asistentas, skirtas padėti 17–18 metų mokiniams mokytis C++ ir Python programavimo kalbų. Tavo paskirtis – atsakyti tik į klausimus, tiesiogiai susijusius su programavimu šiomis kalbomis. Tu neteiki jokios informacijos, kuri nėra susijusi su programavimu – tai apima istoriją, politiką, sveikatą, psichologiją, religiją, naujienas, pramogas ir kitus neprogramavimo dalykus. \n\nJeigu mokinys klausia apie temą, nesusijusią su programavimu, mandagiai atsakyk, kad tu esi tik programavimo asistentas ir negali atsakyti į tokio tipo klausimus.\n\nJeigu mokinys naudoja įžeidžiančią, nepagarbią ar neetišką kalbą (įskaitant keiksmažodžius ar neapykantos kalbą), tu ramiai ir profesionaliai atsakai, kad toks bendravimo stilius nepriimtinas, ir grįžti prie programavimo temos, jei įmanoma. \n\nNiekada neatsakinėk į klausimus, kurie gali būti netinkami, pavojingi, ar nesusiję su mokymusi programuoti. Visada būk aiškus, mandagus ir orientuotas į mokymąsi. Tavo atsakymai turi būti aiškūs, edukaciniai ir pritaikyti 17–18 metų mokinių supratimo lygiui.";
    if (problemContext) {
      prompt += `\n\nŠiuo metu mokinys sprendžia šią programavimo užduotį: 
            Užduoties pavadinimas: ${problemContext.problemName}
            Pasirinkta programavimo kalba: ${problemContext.language}
            Užduoties aprašymas: ${problemContext.problemDescription}

            ${
              problemContext.testCases && problemContext.testCases.length > 0
                ? `Pavyzdiniai testiniai atvejai:
                ${problemContext.testCases
                  .map(
                    (tc, idx) =>
                      `Testas ${idx + 1}:
                   Įvestis: ${tc.input}
                   Laukiamas rezultatas: ${tc.expected_output}`
                  )
                  .join("\n\n")}`
                : ""
            }`;

      if (problemContext.code) {
        prompt += `\n\nMokinio parašytas kodas:
                    \`\`\`${
                      problemContext.language === "cpp" ? "cpp" : "python"
                    }
                    ${problemContext.code}
                    \`\`\`
                    \n\n

                    Analizuok šį kodą savo atsakymuose. Atkreipk dėmesį į galimas klaidas ar neefektyvumus. Teik konstruktyvius patarimus, kurie padėtų mokiniui tobulėti. Nekopijuok viso kodo ir neteik pilno sprendimo - geriau paaiškink koncepcijas ir pateik trumpus pavyzdžius, kaip galima taisyti problemas ar tobulinti kodą. Jeigu kodas nieko neturi (pvz. tik return 0 ar panašiai), tai pasakyk, kad mokinys dar neparašė jokio kodo ir paaiškink, nuo kur galima pradėti užduotį. \n\n`;
      }
      prompt += `\n\nJeigu mokinys tavęs klaus apie užduotį, savo atsakymuose atsižvelk į jos informaciją. Padėk mokiniui suprasti užduotį ir ją išspręsti, tačiau neteik pilno sprendimo kodo. Geriau pateik patarimų, užuominų, konceptualių paaiškinimų ir pavyzdžių, kurie padėtų mokiniui savarankiškai rasti sprendimą.`;
    }
    const messages = [
      {
        role: "system",
        content: prompt,
      },
      ...convoHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages,
    });

    return {
      success: true,
      message: response.choices[0].message.content,
      timestamp: new Date(),
    };
  } catch (err) {
    console.error("AI chat klaida:", err);
    return {
      success: false,
      details: err.message,
    };
  }
};

function addHoursToISOString(isoString, hoursToAdd = 3) {
  const date = new Date(isoString);
  date.setHours(date.getHours() + hoursToAdd);
  return date.toISOString();
}

export async function getUserChatHistory(userId) {
  const [rows] = await pool.execute(
    "SELECT * FROM chat_messages WHERE fk_USERid = ? ORDER BY TIMESTAMP ASC LIMIT 20",
    [userId]
  );
  
  return rows.map((row) => ({
    role: row.role,
    content: row.content,
    timestamp: addHoursToISOString(row.timestamp, 3),
  }));
}

export async function saveUserMessage(userId, content) {
  await pool.execute(
    "INSERT INTO chat_messages (fk_USERid, role, content) VALUES (?, ?, ?)",
    [userId, "user", content]
  );
}

export async function saveAIMessage(userId, message) {
  await pool.execute(
    "INSERT INTO chat_messages (fk_USERid, role, content) VALUES (?, ?, ?)",
    [userId, "assistant", message]
  );
}

export async function saveGeneratedProblemWithDetails(
  userId,
  problemData,
  hints,
  testCases
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert into problems table
    const [problemResult] = await connection.execute(
      `INSERT INTO problems 
        (name, description, \`generated\`, difficulty, fk_USERid) 
        VALUES (?, ?, ?, ?, ?)`,
      [problemData.name, problemData.description, 1, "generated", userId]
    );

    const problemId = problemResult.insertId;

    // Insert each hint
    for (const hint of hints) {
      await connection.execute(
        "INSERT INTO hints (fk_PROBLEMid, hint) VALUES (?, ?)",
        [problemId, hint]
      );
    }

    // Insert each test case
    for (const testCase of testCases) {
      console.log("testCase", testCase);
      await connection.execute(
        "INSERT INTO test_cases (fk_PROBLEMid, input, expected_output) VALUES (?, ?, ?)",
        [problemId, testCase.input, testCase.expected_output]
      );
    }

    await connection.commit();
    return { success: true, problemId };
  } catch (err) {
    await connection.rollback();
    console.error("Transaction failed:", err);
    return { success: false, error: err };
  } finally {
    connection.release();
  }
}

export async function processUserMessage(
  userId,
  message,
  convoHist,
  problemContext = null
) {
  await saveUserMessage(userId, message);
  const response = await getResponse(message, convoHist, problemContext);
  if (response.success) {
    await saveAIMessage(userId, response.message);
  }
  return response;
}

export async function clearChatHistory(userId) {
  await pool.execute("DELETE FROM chat_messages WHERE fk_USERid = ?", [userId]);
  return {
    message: "Chat istorija ištrinta",
    count: result.affectedRows,
  };
}
export async function deleteMessagesFromId(userId, timestamp) {
  const [result] = await pool.execute(
    "DELETE FROM chat_messages WHERE fk_USERid = ? AND timestamp >= ?",
    [userId, timestamp]
  );
  return result.affectedRows;
}
const convoHist = new Map();
chatRouter.post("/authenticate", async (req, res) => {
  const { token } = req.body;
  const result = await validateAuth(token);
  if (result.valid) {
    res.json({ success: true, user: result.user });
  } else {
    res.status(401).json({ success: false, message: result.message, code: result.code });
  }
});

chatRouter.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  const history = await getUserChatHistory(userId);
  res.json(history);
});

chatRouter.post("/message", async (req, res) => {
  const { userId, message, convoHist, problemContext } = req.body;
  try {
    const response = await processUserMessage(userId, message, convoHist || [], problemContext);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

chatRouter.post("/deleteMessages", async (req, res) => {
  const { userId, timestamp } = req.body;
  if (!userId || !timestamp) {
    return res.status(400).json({ success: false, message: "Missing userId or timestamp" });
  }

  const sqlTimestamp = timestamp;
  console.log(sqlTimestamp);
  try {
    const deletionResult = await deleteMessagesFromId(userId, sqlTimestamp);
    if (deletionResult === 0) {
      return res.json({ success: false, message: "No messages deleted" });
    }
    console.log(deletionResult);
    const updatedHistory = await getUserChatHistory(userId);
    res.json({ success: true, updatedHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting messages" });
  }
});

export default chatRouter;
