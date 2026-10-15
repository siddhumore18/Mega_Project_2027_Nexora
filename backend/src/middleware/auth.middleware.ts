import { Request, Response, NextFunction } from "express";
import { UserRole, ApiErrorResponse } from "@nexora/contracts";
import { verifyToken, JwtTokenPayload } from "../utils/jwt.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtTokenPayload;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or malformed Authorization header. Bearer token required.",
        correlationId,
      },
    };
    res.status(401).json(errorResponse);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code || "UNAUTHORIZED",
        message: err.message || "Invalid authentication token.",
        correlationId,
      },
    };
    res.status(401).json(errorResponse);
    return;
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";

    if (!req.user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required before checking role permissions.",
          correlationId,
        },
      };
      res.status(401).json(errorResponse);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Role '${req.user.role}' is not authorized for this action.`,
          correlationId,
        },
      };
      res.status(403).json(errorResponse);
      return;
    }

    next();
  };
}

export function requireDepartmentScope(paramKey = "departmentId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";
    const requestedDeptId = req.params[paramKey] || req.body[paramKey] || req.query[paramKey];

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required.", correlationId },
      });
      return;
    }

    // Admins and Exam Coordinators have institution-wide scope
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.EXAM_COORDINATOR) {
      next();
      return;
    }

    // HODs or departmental faculty must match their assigned department
    if (requestedDeptId && req.user.departmentId !== requestedDeptId) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN_SCOPE",
          message: "You are not authorized to view or mutate data outside your department scope.",
          correlationId,
        },
      });
      return;
    }

    next();
  };
}
