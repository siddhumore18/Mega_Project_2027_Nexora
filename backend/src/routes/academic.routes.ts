import { Router } from "express";
import {
  getDepartments,
  getRooms,
  getSubjects,
  evaluateEligibilityHandler,
  importStudentsHandler,
} from "../controllers/academic.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const academicRouter = Router();

// Public / Authenticated read routes
academicRouter.get("/departments", getDepartments);
academicRouter.get("/rooms", getRooms);
academicRouter.get("/subjects", getSubjects);

// Eligibility evaluation
academicRouter.post("/evaluate-eligibility", evaluateEligibilityHandler);

// Batch student import (Exam Coordinator & Admin only)
academicRouter.post(
  "/import/students",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  importStudentsHandler
);
