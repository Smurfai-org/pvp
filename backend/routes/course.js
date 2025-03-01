import express from 'express'
import pool from '../utils/db.js'

const router = express.Router();

// FRONTE PRIDET HEADER: Content-Type: "application/json"

router.get('/', async (req, res) => {
    try {
        const [result] = await pool.execute("SELECT * FROM courses");

        if(result.length === 0) {
            return res.status(404).json({ message: 'Kursai nerasti' })
        }

        res.status(200).json(result);
    } catch (error) {
        return res.status(503).json({ message: 'Nepavyko gauti kursų'});
    }
});

router.post('/create', async (req, res) => {
    const { name, description, icon_url } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: 'Nepakankami duomenys' });
    }

    try {
        const [result] = await pool.execute(
            "INSERT INTO courses (name, description, icon_url) VALUES (?, ?, ?)", 
            [name, description, icon_url]
        );

        if (result && result.insertId) {
            return res.status(201).json({ message: 'Kursas sukurtas sėkmingai'});
        } else {
            return res.status(500).json({ message: 'Nepavyko sukurti kurso' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Serverio klaida' });
    }
});

router.post('/update', async (req, res) => {
    const {id, name, description, icon_url} = req.body;

    if (!id || !name || !description) {
        return res.status(400).json({ message: 'Nepakankami duomenys' });
    }

    try {
        const [result] = await pool.execute(
            "UPDATE courses SET name = ?, description = ?, icon_url = ? WHERE id = ?",
            [name, description, icon_url, id]
        );

        if(result.affectedRows === 0) {
            return res.status(500).json({ message: 'Nepavyko atnaujinti kurso' });
        } else {
            return res.status(201).json({ message: 'Kursas atnaujintas sėkmingai' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Serverio klaida' });
    }
});

router.delete('/delete', async (req, res) => {
    const [id] = req.body;

    if(!id) {
        return res.status(400).json({ message: 'Nepakankami duomenys' });
    }

    try {
        const [result] = await pool.execute("DELETE FROM courses WHERE id = ?", [id]);

        if(result.affectedRows === 0) {
            return res.status(500).json({ message: 'Nepavyko ištrinti kurso' });
        } else {
            return res.status(201).json({ message: 'Kursas ištrintas sėkmingai' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Serverio klaida' });
    }
});
export default router;