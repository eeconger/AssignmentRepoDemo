import express from "express";
import { Routes } from "./routes";
import dotenv from "dotenv"

// Load .env
dotenv.config();

// Create API instance
export const app = express();

// Make API instance auto-decode JSON body
app.use(express.json())

// Register API routes
const routes = new Routes();
routes.registerRoutes();

// Get the port from the environment variables
const port = process.env.PORT!;

// Start the server
app.listen(port, () => {
    console.log(`Equanimity backend listening on port ${port}`);
});
