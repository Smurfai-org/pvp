import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import pool from "./db.js";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,

});

export const validateAuth = async (token) => {
    if (!token) {
        return { valid: false, message: "Neautorizuota prieiga" };
    }

    try {
        const dec = jwt.verify(token, process.env.JWT_SECRET);
        return { valid: true, user: dec.user };
    } catch (err) {
        return { valid: false, message: "Nepavyko atkoduoti žetono" };
    }
};

export const getResponse = async (message, convoHistory = []) => {
    try {
        const messages = [
            {
                role: 'system',
                content: 'Tu esi AI programavimo asistentas, skirtas padėti 17–18 metų mokiniams mokytis C++ ir Python programavimo kalbų. Tavo paskirtis – atsakyti tik į klausimus, tiesiogiai susijusius su programavimu šiomis kalbomis. Tu neteiki jokios informacijos, kuri nėra susijusi su programavimu – tai apima istoriją, politiką, sveikatą, psichologiją, religiją, naujienas, pramogas ir kitus neprogramavimo dalykus. \n\nJeigu mokinys klausia apie temą, nesusijusią su programavimu, mandagiai atsakyk, kad tu esi tik programavimo asistentas ir negali atsakyti į tokio tipo klausimus.\n\nJeigu mokinys naudoja įžeidžiančią, nepagarbią ar neetišką kalbą (įskaitant keiksmažodžius ar neapykantos kalbą), tu ramiai ir profesionaliai atsakai, kad toks bendravimo stilius nepriimtinas, ir grįžti prie programavimo temos, jei įmanoma. \n\nNiekada neatsakinėk į klausimus, kurie gali būti netinkami, pavojingi, ar nesusiję su mokymusi programuoti. Visada būk aiškus, mandagus ir orientuotas į mokymąsi. Tavo atsakymai turi būti aiškūs, edukaciniai ir pritaikyti 17–18 metų mokinių supratimo lygiui.'
            },
            ...convoHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message}
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
        console.error('AI chat klaida:', err);
        return {
            success: false,
            details: err.message,
        };
    }
}

export async function getUserChatHistory(userId) {
    const [rows] = await pool.execute(
        "SELECT * FROM chat_messages WHERE fk_USERid = ? ORDER BY TIMESTAMP ASC LIMIT 20",
        [userId]
    );
    
    return rows.map(row => ({
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

export async function processUserMessage(userId, message, convoHist) {
    await saveUserMessage(userId, message);
    const response = await getResponse(message, convoHist);
    if (response.success) {
        await saveAIMessage(userId, response.message);
    }
    return response;
}

export async function clearChatHistory(userId) {
    await pool.execute(
        "DELETE FROM chat_messages WHERE fk_USERid = ?",
        [userId]
    );
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
                    socket.emit("authenticated", { success: true, user: user });

                    const hist = await getUserChatHistory(user.id);
                    convoHist.set(user.id, hist);
                    socket.emit("history", hist);
                } else {
                    socket.emit("authenticated", { success: false, message: result.message });
                }
            } catch (error) {
                console.error("Authentication error:", error);
                socket.emit("error", { message: "Authentication error" });
                return;
            }
        });

        socket.on("message", async (data) => {
            if (!user) {
                socket.emit("error", { message: "Unauthorized" });
                return;
            }

            try {
                const hist = convoHist.get(user.id) || [];
                hist.push({ role: "user", content: data.message });

                const response = await processUserMessage(user.id, data.message, hist);

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
                    socket.emit("error", { message: response.error || "AI response error" });
                }
            } catch (error) {
                console.error("Message processing error:", error);
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });
}
