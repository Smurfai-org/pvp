import express from 'express';
import cors from 'cors';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import bodyParser from 'body-parser'

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const __filename = fileURLToPath(import.meta.url);
const routesDirectory = path.join(path.dirname(__filename), 'routes');

const files = fs.readdirSync(routesDirectory);

for (const file of files) {
    if (!file.endsWith('.js')) continue;
  
    const routeFilePath = pathToFileURL(path.join(routesDirectory, file)).href;
  
    const route = await import(routeFilePath);
  
    const routePath = `/${file.replace('.js', '')}`;
  
    app.use(routePath, route.default);
  }

app.listen(port, () => {
    console.log('listening on port', port);
});