import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());

// Basic CORS configuration
app.use(cors());

// Serve static files from the src directory
app.use(express.static(path.join(__dirname)));

app.get("/", (_req: Request, res: Response) => {
  res.send("Kaan Backend - Phase 1 Ready ✅");
});

app.use("/auth", authRoutes);

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});