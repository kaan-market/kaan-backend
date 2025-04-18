import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import profileRoutes from "./modules/profile/profile.routes";
import { UnauthorizedException } from "./utils/exceptions";

dotenv.config();

const app = express();
app.use(express.json());

// Basic CORS configuration
app.use(cors());

// Serve static files from the src directory
app.use(express.static(path.join(__dirname)));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Kaan Backend - Phase 1 Ready ✅" });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof UnauthorizedException) {
    res.status(401).json({ error: err.message });
    return;
  }
  
  res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});