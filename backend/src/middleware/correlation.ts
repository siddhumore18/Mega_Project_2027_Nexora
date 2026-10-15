import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const correlationId =
    (req.headers["x-correlation-id"] as string) || crypto.randomUUID();
  req.headers["x-correlation-id"] = correlationId;
  res.setHeader("x-correlation-id", correlationId);
  next();
}
