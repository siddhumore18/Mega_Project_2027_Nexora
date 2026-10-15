import { Request, Response } from "express";
import { HealthStatus, ApiSuccessResponse } from "@nexora/contracts";

const startTime = Date.now();

export function getHealth(_req: Request, res: Response) {
  const healthData: HealthStatus = {
    status: "ok",
    service: "nexora-backend",
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
}
