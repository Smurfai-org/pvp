import express from 'express'
import pool from '../utils/db.js'

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
            return res.status(404).json({ message: "Problemos nerastos" });
        }

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Serverio klaida" });
    }
});

router.post('/create', async (req, res) => {
    const { name, description, generated, hints, solution, difficulty, fk_COURSEid, fk_AI_RESPONSEid } = req.body;

    if (!name || !description || generated === undefined || !difficulty) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    }

    try {
        const query = `INSERT INTO problems 
            (name, description, \`generated\`, hints, solution, difficulty, fk_COURSEid, fk_AI_RESPONSEid) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [name, description, generated ? 1 : 0, hints, solution, difficulty, fk_COURSEid, fk_AI_RESPONSEid];

        const [result] = await pool.execute(query, values);

        if (result && result.insertId) {
            return res.status(201).json({ message: 'Problema sukurta sėkmingai' });
        } else {
            return res.status(500).json({ message: 'Nepavyko sukurti problemos' });
        }

    } catch (error) {
        return res.status(500).json({ message: "Serverio klaida", error });
    }
});

router.post('/update', async (req, res) => {
    const { id, name, description, generated, hints, solution, difficulty, fk_COURSEid, fk_AI_RESPONSEid } = req.body;

    if (!id || !name || !description || generated === undefined || !difficulty) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    }

    try {
        const query = `UPDATE problems SET name = ?, description = ?, \`generated\` = ? , hints = ? , solution = ?, difficulty = ?, fk_COURSEid = ?, fk_AI_RESPONSEid = ? WHERE id = ?`;
        
        const values = [name, description, generated ? 1 : 0, hints, solution, difficulty, fk_COURSEid, fk_AI_RESPONSEid, id];

        const [result] = await pool.execute(query, values);

        if (result.affectedRows == 0) {
            return res.status(500).json({ message: 'Nepavyko rasti problemos' });
        }
        return res.status(201).json({ message: 'Problema atnaujinta sėkmingai' });

    } catch (error) {
        return res.status(500).json({ message: "Serverio klaida", error });
    }
});

router.delete('/delete', async (req, res) =>{
    const {id} = req.body;

    if(!id) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    }

    try {
        const [result] = await pool.execute("DELETE FROM problems WHERE id = ?", [id]);

        if(result.affectedRows === 0) {
            return res.status(404).json({ message: 'Nepavyko ištrinti problemos'});
        }

        return res.status(200).json({ message: 'Problema sėkmingai ištrinta'});
    } catch (error) {
        return res.status(500).json({ message: "Serverio klaida", error });
    }
});

export default router;