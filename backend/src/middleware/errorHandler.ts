import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "@nexora/contracts";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";
  const statusCode = typeof err.status === "number" ? err.status : 500;

  // Safe error payload: never leak stack traces to client (as per 00_BUILD_RULES.md & 05_SECURITY.md)
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: err.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR"),
      message: statusCode === 500 ? "An unexpected internal server error occurred." : err.message,
      correlationId,
      details: statusCode !== 500 ? err.details : undefined,
    },
  };

  res.status(statusCode).json(response);
}
