import { Request, Response } from "express";
import { z } from "zod";
import { UserRole, ApiSuccessResponse, ApiErrorResponse } from "@nexora/contracts";
import { prisma } from "../db/prisma.js";
import { verifyPassword, hashPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { logAuditEvent } from "../services/audit.service.js";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Demo accounts for initial preview / offline development
const DEMO_USERS: Record<string, { id: string; name: string; role: UserRole; departmentId?: string }> = {
  "coordinator@nexora.edu": {
    id: "user-coord-1",
    name: "Dr. Elena Vance (Exam Controller)",
    role: UserRole.EXAM_COORDINATOR,
  },
  "student@nexora.edu": {
    id: "user-student-1",
    name: "Aarav Sharma",
    role: UserRole.STUDENT,
    departmentId: "dept-cse-1",
  },
  "faculty@nexora.edu": {
    id: "user-fac-1",
    name: "Dr. A. Sharma",
    role: UserRole.FACULTY,
    departmentId: "dept-cse-1",
  },
  "hod.cse@nexora.edu": {
    id: "user-hod-1",
    name: "Prof. Vikram Sen (HOD CSE)",
    role: UserRole.HOD,
    departmentId: "dept-cse-1",
  },
  "admin@nexora.edu": {
    id: "user-admin-1",
    name: "System Administrator",
    role: UserRole.ADMIN,
  },
};

export async function login(req: Request, res: Response) {
  const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";

  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS_PAYLOAD",
        message: "Email must be valid and password at least 6 characters.",
        correlationId,
        details: parseResult.error.format(),
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  const { email, password } = parseResult.data;

  // 1. Try finding user in database
  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { email },
      include: {
        faculty: true,
        student: { include: { program: true } },
      },
    });
  } catch (err) {
    // If DB is offline or migrating, continue to demo accounts
  }

  if (dbUser) {
    const isValid = await verifyPassword(password, dbUser.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password.", correlationId },
      });
      return;
    }

    const departmentId = dbUser.faculty?.departmentId || dbUser.student?.program?.departmentId;
    const token = signToken({
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      departmentId,
    });

    await logAuditEvent({
      actorId: dbUser.id,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: dbUser.id,
      correlationId,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          departmentId,
        },
        token,
      },
    });
    return;
  }

  // 2. Demo fallback accounts for initial testing
  const demo = DEMO_USERS[email.toLowerCase()];
  if (demo && password === "nexora2026") {
    const token = signToken({
      userId: demo.id,
      email,
      name: demo.name,
      role: demo.role,
      departmentId: demo.departmentId,
    });

    await logAuditEvent({
      actorId: demo.id,
      action: "DEMO_USER_LOGIN",
      entityType: "User",
      entityId: demo.id,
      correlationId,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: demo.id,
          email,
          name: demo.name,
          role: demo.role,
          departmentId: demo.departmentId,
        },
        token,
      },
    });
    return;
  }

  // Not found / Invalid password
  res.status(401).json({
    success: false,
    error: {
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      correlationId,
    },
  });
}

export function getMe(req: Request, res: Response) {
  const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";

  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated.", correlationId },
    });
    return;
  }

  res.json({
    success: true,
    data: req.user,
  });
}

export async function logout(req: Request, res: Response) {
  const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";

  if (req.user) {
    await logAuditEvent({
      actorId: req.user.userId,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: req.user.userId,
      correlationId,
    });
  }

  res.json({
    success: true,
    data: { message: "Signed out successfully." },
  });
}
