import express from "express";
import cors from "cors";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import stripeWebhook from "./routes/stripeWebHook.js";

dotenv.config();

const app = express();
app.use(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
const port = 5000;

app.use(
  cors({
    origin: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' data: blob: *"
  );
  next();
});
app.use(express.json());
app.use(cookieParser());

app.use(
  (req, res, next) => (
    console.log(
      `[${new Date().toTimeString().slice(0, 5)}] ${req.method} ${
        req.originalUrl
      } Body:`,
      req.body
    ),
    next()
  )
);

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
