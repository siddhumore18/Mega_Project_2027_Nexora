import { Router } from "express";
import {
  getExamCycles,
  getExamCycleById,
  createExamCycle,
  updateCycleStatus,
  getOfferings,
  registerOffering,
  getRegistrationGaps,
  getMyRegistrations,
} from "../controllers/exam-cycle.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const examCycleRouter = Router();

// Cycle list & details
examCycleRouter.get("/", getExamCycles);
examCycleRouter.get("/:id", getExamCycleById);

// Cycle administrative actions (Coordinator / Admin only)
examCycleRouter.post(
  "/",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  createExamCycle
);

examCycleRouter.patch(
  "/:id/status",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  updateCycleStatus
);

// Offerings & Gaps
examCycleRouter.get("/:id/offerings", getOfferings);
examCycleRouter.get(
  "/:id/registration-gaps",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN, UserRole.HOD),
  getRegistrationGaps
);

// Student paper registration
examCycleRouter.post("/offerings/:offeringId/registrations", registerOffering);
examCycleRouter.get("/me/registrations", authenticateToken, getMyRegistrations);
