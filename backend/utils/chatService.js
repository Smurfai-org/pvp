import OpenAI from "openai";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import { processUserMessageProblemGeneration } from "./problemGenerationService.js";

const ERROR_NOT_PREMIUM = 111;

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

export async function getUserChatHistory(userId) {
  const [rows] = await pool.execute(
    "SELECT * FROM chat_messages WHERE fk_USERid = ? ORDER BY TIMESTAMP ASC LIMIT 20",
    [userId]
  );

  return rows.map((row) => ({
    role: row.role,
    content: row.content,
    timestamp: row.timestamp,
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

const convoHist = new Map();
export function setupSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    let user = null;

    socket.on("authenticate", async (token) => {
      try {
        const result = await validateAuth(token);
        if (result.valid) {
          user = result.user;
          console.log("user:", user);
          socket.emit("authenticated", { success: true, user: user });

          const hist = await getUserChatHistory(user.id);
          convoHist.set(user.id, hist);
          socket.emit("history", hist);
        } else if (result.code === ERROR_NOT_PREMIUM) {
          socket.emit("authenticated", {
            success: false,
            code: ERROR_NOT_PREMIUM,
            message: result.message,
          });
        } else {
          socket.emit("authenticated", {
            success: false,
            message: result.message,
          });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        socket.emit("error", { message: "Authentication error" });
        return;
      }
    });

    socket.on("message", async (data) => {
      if (!user) {
        socket.emit("error", {
          message: "Neturite prieigos prie pokalbio funkcijos.",
        });
        return;
      }

      try {
        const hist = convoHist.get(user.id) || [];
        hist.push({ role: "user", content: data.message });

        const response = await processUserMessage(
          user.id,
          data.message,
          hist,
          data.problemContext
        );

        if (response.success) {
          hist.push({ role: "assistant", content: response.message });

          while (hist.length > 50) {
            hist.shift();
          }

          convoHist.set(user.id, hist);

          socket.emit("response", {
            message: response.message,
            timestamp: response.timestamp,
          });
        } else {
          socket.emit("error", {
            message: response.error || "AI response error",
          });
        }
      } catch (error) {
        console.error("Message processing error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("generateProblem", async (data) => {
      // if (!user) {
      //   console.log(user);
      //   socket.emit("error", {
      //     message: "Neturite prieigos prie problemos generavimo funkcijos.",
      //   });
      //   return;
      // }

      console.log("begin");
      try {
        const response = await processUserMessageProblemGeneration(
          user.id,
          data.message
        );
        console.log(response);

        if (response.success) {
          socket.emit("response", {
            message: response.message,
            timestamp: response.timestamp,
          });
        } else {
          socket.emit("error", {
            message: response.error || "AI response error",
          });
        }
      } catch (error) {
        console.error("Message processing error:", error);
        socket.emit("error", { message: error.message });
      }
      console.log("end");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
}
