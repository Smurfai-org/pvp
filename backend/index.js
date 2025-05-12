import express from "express";
import cors from "cors";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocketIO } from "./utils/chatService.js";
import stripeWebhook from "./routes/stripeWebHook.js";

dotenv.config();

const app = express();
app.use(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    credentials: true,
  }
});
const port = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

setupSocketIO(io);

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
  server.listen(port, () => {
    console.log(`Server listening on port ${port} with Socket.io`);
  });
});
