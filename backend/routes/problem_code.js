import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [result] = await pool.execute('SELECT * FROM problem_codes');
        if (result.length === 0) {
            return res.status(404).json({ message: 'Sprendimų kodų nerasta' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverio klaida' });
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await pool.execute('SELECT * FROM problem_codes WHERE id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Sprendimo kodas nerastas' });
        } else {
            res.status(200).json(rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverio klaida' });
    }
});

router.post('/', async (req, res) => {
    const { userId, problemId, code } = req.body;
    if (!userId || !problemId) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    } else {
        try {
            const [result] = await pool.execute('INSERT INTO problem_codes (fk_USERid, fk_PROBLEMid, code) VALUES (?, ?, ?)', [userId, problemId, code]);
            if (result.affectedRows > 0) {
                res.status(201).json({ message: 'Sprendimo kodas pridėtas' });
            } else {
                res.status(500).json({ message: 'Nepavyko pridėti sprendimo kodo' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Serverio klaida' });
        }
    }
});

router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { code } = req.body;
    try {
        const [result] = await pool.execute('UPDATE problem_codes SET code = ? WHERE id = ?', [code, id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Sprendimo kodas atnaujintas' });
        } else {
            res.status(404).json({ message: 'Sprendimo kodas nerastas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverio klaida' });
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await pool.execute('DELETE FROM problem_codes WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Sprendimo kodas nerastas' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverio klaida' });
    }
});

export default router;