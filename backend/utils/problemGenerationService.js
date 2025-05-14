import OpenAI from "openai";
import { saveGeneratedProblemWithDetails } from "./chatService.js";
import pool from "./db.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getProblemGenerationResponse = async (message) => {
  try {
    let prompt =
      'Tu esi AI asistentas, padedantis mokiniams spręsti programavimo užduotis Python ir C++ kalbomis. Tavo užduotis – pagal vartotojo pateiktą aprašą sukurti užduotį, kuri apima: problemos pavadinimą, aprašymą, 3 testavimo atvejus ir 3 užuominas. Testavimo atvejų input struktūros pavyzdys toks: {"cpp":"int num1 = 5;\nint num2 = 10;","python":"num1 = 5\nnum2 = 10"}. Atsakymas privalo būti griežtai pateiktas kaip vienas JSON objektas, kurio struktūra tokia: {"name": string, "description": string, "test_cases": [{"input": {"cpp": string, "python": string}, "expected_output": string}], "hints": [string, ...]}. Visi įrašai turi būti pateikti tame pačiame JSON objekte. Atsakymas neturi turėti paaiškinimų, komentarų ar jokios kitos informacijos – tik teisingą JSON struktūrą. Užduoties sąlyga lietuviška. Sugeneruotam atskymui turi veikti javascript JSON.parse.';

    const messages = [
      {
        role: "system",
        content: prompt,
      },
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages,
      temperature: 0.7,
    });

    return {
      success: true,
      message: response.choices[0].message.content,
      timestamp: new Date(),
    };
  } catch (err) {
    console.error("AI užduoties generavimo klaida:", err);
    return {
      success: false,
      details: err.message,
    };
  }
};

export async function processUserMessageProblemGeneration(userId, message) {
  try {
    const response = await getProblemGenerationResponse(message);
    if (response.success) {
      console.log(response);
      try {
        const problemJSON = JSON.parse(response.message);
        const { problemId } = await saveGeneratedProblemWithDetails(
          userId,
          problemJSON,
          problemJSON.hints,
          problemJSON.test_cases
        );
        return {
          success: response.success,
          problemId: problemId,
          message: problemJSON,
          timestamp: response.timestamp,
        };
      } catch {
        return {
          success: response.success,
          message: "Sugeneruoti užduoties nepavyko.",
          timestamp: response.timestamp,
        };
      }
    }
    return response;
  } catch (error) {
    console.error("Klaida generuojant užduotį:", error);
    return {
      success: false,
      message: "Serverio klaida",
    };
  }
}
