import express from "express";
import cors from "cors";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDirectory = path.join(__dirname, "routes");

async function loadRoutes() {
  try {
    const files = fs.readdirSync(routesDirectory);

    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      const routeFilePath = pathToFileURL(
        path.join(routesDirectory, file)
      ).href;

      const route = await import(routeFilePath);

      const routePath = `/${file.replace(".js", "")}`;
      app.use(routePath, route.default);
    }
  } catch (error) {
    console.error("Error loading routes:", error);
  }
}

loadRoutes().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
