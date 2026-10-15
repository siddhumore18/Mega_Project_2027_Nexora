import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { correlationMiddleware } from "./middleware/correlation.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.routes.js";
import { academicRouter } from "./routes/academic.routes.js";
import { examCycleRouter } from "./routes/exam-cycle.routes.js";
import { scheduleRouter } from "./routes/schedule.routes.js";
import { seatingRouter } from "./routes/seating.routes.js";
import { invigilationRouter } from "./routes/invigilation.routes.js";
import { reschedulingRouter } from "./routes/rescheduling.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { testRouter } from "./routes/test.routes.js";

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

  // Auth routes
  app.use("/api/v1/auth", authRouter);

  // Academic & eligibility routes
  app.use("/api/v1/academic", academicRouter);

  // Exam cycle & registration routes
  app.use("/api/v1/exam-cycles", examCycleRouter);

  // Scheduling & optimization routes
  app.use("/api/v1/schedules", scheduleRouter);

  // Seating allocation routes
  app.use("/api/v1/seating", seatingRouter);

  // Invigilator allocation routes
  app.use("/api/v1/invigilation", invigilationRouter);

  // Rescheduling & notifications routes
  app.use("/api/v1/rescheduling", reschedulingRouter);

  // Analytical reports & timetable exports
  app.use("/api/v1/reports", reportsRouter);

  // Scoped authorization test routes
  app.use("/api/v1/test", testRouter);

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
