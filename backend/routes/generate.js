import express from "express";
import axios from "axios";
import pool from "../utils/db.js";
import OpenAI from "openai";
const router = express.Router();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,

});
    
router.post('/hint', async (req, res) => {
    const { userId, problemId, language } = req.body;

    try {
        const [[problem]] = await pool.execute(
            'SELECT description FROM problems WHERE id = ?',
            [problemId]
        );

        const [[progress]] = await pool.execute(
            'SELECT code FROM progress WHERE fk_USERid = ? AND fk_PROBLEMid = ?',
            [userId, problemId]
        );
        
        if (!problem || !progress || !language) {
            res.status(404).json({ message: 'Trūksta duomenų' });
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
                    role: 'system',
                    content: 'Tu esi AI asistentas, padedantis mokiniams spręsti programavimo užduotis Python ir C++ kalbomis. Analizuok mokinio parašytą kodą ir pagal pateiktą užduotį sukurk naudingą patarimą.'
                },
                {
                    role: 'user',
                    content: JSON.stringify(userInput)
                },
            ],
            temperature: 0.7,
        });

        const aiHint = response.output_text;
        //console.log(aiHint);
        const parsed = JSON.parse(aiHint);
        res.status(200).json(parsed);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverio klaida' });
    }

});

export default router;
