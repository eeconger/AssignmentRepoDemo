import express from "express";
import { Routes } from "./routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

export const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3002",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json());

// Register routes
const routes = new Routes();
routes.registerRoutes(app);

const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`Equanimity backend listening on port ${port}`);
});
