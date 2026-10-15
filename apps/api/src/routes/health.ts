import { Router } from "express";
import { HealthStatus, ApiSuccessResponse } from "@nexora/contracts";

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get("/", (_req, res) => {
  const healthData: HealthStatus = {
    status: "ok",
    service: "nexora-api",
    version: "0.1.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };

  const response: ApiSuccessResponse<HealthStatus> = {
    success: true,
    data: healthData,
  };

  res.json(response);
});
