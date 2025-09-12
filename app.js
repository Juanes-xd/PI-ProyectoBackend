/**
 * Express application setup.
 * Configures middleware, routes, and environment variables for the backend API.
 *
 * - Uses CORS with credentials
 * - Parses URL-encoded and JSON request bodies
 * - Handles cookies
 * - Mounts user and task routes under /api/v1
 */
import express from "express";

import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/userRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";

configDotenv();

const app = express();
app.use(cors({ 
  credentials: true,
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", userRoutes);
app.use("/api/v1", taskRoutes);

export default app;
