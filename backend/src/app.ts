import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { correlationMiddleware } from "./middleware/correlation.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";

export function createApp(): Express {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.WEB_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );

  // Body parser with size limits
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Tracing
  app.use(correlationMiddleware);

  // Health checks
  app.use("/health", healthRouter);
  app.use("/api/v1/health", healthRouter);

  // Global 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Endpoint ${req.method} ${req.path} not found.`,
        correlationId: (req.headers["x-correlation-id"] as string) || "unknown",
      },
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
