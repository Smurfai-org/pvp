import express from 'express';
import fetch from 'node-fetch';
import db from '../utils/db.js';
import jwt, { decode } from 'jsonwebtoken';

const router = express.Router();

router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to log out' });
    }
});

router.get('/validate', async (req, res) => {
    const token = req.cookies.token;
    const result = await validateToken(token);

    if (result.valid) {
        res.status(200).json(result.data);
    } else {
        res.status(401).json({ message: result.message });
    }
});


export async function validateToken(token) {
    if (!token) {
        return { valid: false, message: 'No token found.' };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const res_json = {
            valid: true,
            user: {
                id: decoded.user.id,
                role: decoded.user.role,
                profile_pic: decoded.user.profile_pic,
                email: decoded.user.email,
                username: decoded.user.username
            },
            expiresAt: new Date(decoded.exp * 1000).toISOString(),
        };

        if (decoded.loginType === "password") {
            return { valid: true, data: res_json };
        } else if (decoded.loginType === "google") {
            const val_res = await validateGoogle(decoded);
            if (val_res) {
                return { valid: true, data: res_json };
            } else {
                return { valid: false, message: 'Invalid Google token.' };
            }
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return { valid: false, message: 'Token expired.' };
        }
        console.error("Invalid token", err);
        return { valid: false, message: 'Invalid token.' };
    }
}


const validateGoogle = async (decodedToken) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?accessToken=${decodedToken.accessToken}`;

    let data;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            data = await response.json();
            throw new Error(JSON.stringify(data));
        }
        data = await response.json();
    } catch (fetchError) {
        console.error(fetchError);
        return false;
    }

    if (data.expires_in < 0) return false;

    const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [data.email]);
    return user.length > 0 && user[0].id === decodedToken.id;
};

export default router;
