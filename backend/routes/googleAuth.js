import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../utils/db.js';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/', async (req, res) => {
    const { gresponse } = req.body;

    if (!gresponse) {
        console.error("No Google response received");
        return res.status(500).json({ message: 'Nepavyko prisijungti.' });
    }

    const code = decodeURIComponent(gresponse.code);
    const client_id = process.env.OAUTH_CLIENT_ID;
    const client_secret = process.env.OAUTH_SECRET;
    const redirect_uri = 'postmessage';
    const grant_type = 'authorization_code';

    try {
        const url = 'https://oauth2.googleapis.com/token';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type
            }),
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            console.error(await response.text());
            return res.status(400).json({ message: 'Nepavyko prisijungti.' });
        }

        const token_data = await response.json();
        const google_token = token_data.access_token;

        const user_data_res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${google_token}` },
        });

        if (!user_data_res.ok) {
            console.error(await user_data_res.text());
            return res.status(400).json({ message: 'Nepavyko gauti vartotojo duomenų.' });
        }

        const user_data = await user_data_res.json();

        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [user_data.email]);

        let dbid;
        if (user.length > 0) {
            dbid = user[0].id;
        } else {
            const [create] = await db.execute(
                'INSERT INTO users (username, email, google_id, profile_pic, role) VALUES (?, ?, ?, ?, ?)',
                [user_data.name, user_data.email, user_data.id, user_data.picture, 'user']
            );
            dbid = create.insertId;
        }

        const token = jwt.sign({ id: dbid, email: user_data.email }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({ message: 'Prisijungimas sėkmingas', token, user: { id: dbid, email: user_data.email, name: user_data.name, profile_pic: user_data.picture } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverio klaida' });
    }
});

export default router;
