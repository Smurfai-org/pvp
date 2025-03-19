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
            return res.status(404).json({ message: "Užduotys nerastos" });
        }

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Serverio klaida" });
    }
});


router.post("/create", async (req, res) => {
  const {
    name,
    description,
    generated,
    difficulty,
    fk_COURSEid,
    fk_AI_RESPONSEid,
  } = req.body;

    if (!name || !description || generated === undefined || !difficulty) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    }

    const values = [
        name, 
        description, 
        generated ? 1 : 0,
        difficulty, 
        fk_COURSEid || null, 
        fk_AI_RESPONSEid || null
      ];

    try {
        const query = `INSERT INTO problems 
            (name, description, \`generated\`, difficulty, fk_COURSEid, fk_AI_RESPONSEid) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        const [result] = await pool.execute(query, values);

        if (result && result.insertId) {
            return res.status(201).json({ message: 'Užduotis sukurta sėkmingai' });
        } else {
            return res.status(500).json({ message: 'Nepavyko sukurti užduoties' });
        }

    } catch (error) {
        return res.status(500).json({ message: "Serverio klaida", error });
    }
});

router.post('/update', async (req, res) => {
    const { id, name, description, generated, difficulty, fk_COURSEid, fk_AI_RESPONSEid } = req.body;

    if (!id || !name || !description || generated === undefined || !difficulty) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    }

    try {
        const query = `UPDATE problems 
        SET name = ?, description = ?, \`generated\` = ?, difficulty = ?, fk_COURSEid = ?, fk_AI_RESPONSEid = ? 
        WHERE id = ?`;

        const values = [
            name, 
            description, 
            generated ? 1 : 0,
            difficulty, 
            fk_COURSEid, 
            fk_AI_RESPONSEid || null,
            id
        ];

        const [result] = await pool.execute(query, values);

        if (result.affectedRows == 0) {
            return res.status(500).json({ message: 'Nepavyko rasti užduoties' });
        }
        
        return res.status(200).json({ message: 'Užduotis atnaujinta sėkmingai' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Serverio klaida", error });
  }
});

router.post('/delete', async (req, res) =>{
    const {id} = req.body;

    if(!id) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    }

    try {
        const [result] = await pool.execute("UPDATE problems SET deleted = 1 WHERE id = ?", [id]);

        if(result.affectedRows === 0) {
            return res.status(404).json({ message: 'Nepavyko ištrinti užduoties'});
        }

        return res.status(200).json({ message: 'Užduotis sėkmingai ištrinta'});
    } catch (error) {
        return res.status(500).json({ message: "Serverio klaida", error });
    }
});

router.post('/restore', async (req, res) => {
    const {id} = req.body;

    if(!id) {
        return res.status(400).json({ message: 'Nepakanka duomenų' });
    }

    try {
        const [result] = await pool.execute('UPDAte problems SET deleted = 0 WHERE id = ?', [id]);

        if(result.affectedRows === 0) {
            return res.status(404).json({ message: 'Nepavyko atkurti užduoties' });
        }

        return res.status(200).json({ message: 'Užduotis atkurta sėkmingai' });
    } catch (error) {
        return res.status(500).json({ message: 'Serverio klaida'});
    }
});

export default router;