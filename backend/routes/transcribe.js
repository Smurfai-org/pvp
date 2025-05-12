import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { SpeechClient } from '@google-cloud/speech';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const client = new SpeechClient({ keyFilename: path.join(__dirname, '../google-creds.json') });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file || req.file.size === 0) {
      return res.status(400).send('No audio file uploaded or file is empty.');
    }

    const fileName = req.file.path;
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');

    const audio = { content: audioBytes };
    const config = {
      encoding: 'ENCODING_UNSPECIFIED',
      languageCode: 'lt-LT',
    };

    const request = { audio, config };
    const [response] = await client.recognize(request);
    const transcription = response.results.map(r => r.alternatives[0].transcript).join('\n') || 'Neaptikta kalba';

    res.json({ transcript: transcription });
    fs.unlinkSync(fileName);
  } catch (err) {
    console.error('Transcription Error:', err.message);
    console.error('Full error:', err);
    res.status(500).send('Error transcribing audio');
  }
});

export default router;