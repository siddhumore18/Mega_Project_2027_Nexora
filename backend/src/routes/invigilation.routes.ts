import { Router, Request, Response } from "express";
import { InvigilationService } from "../services/invigilation.service.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const invigilationRouter = Router();

// Auto-allocate invigilators (Coordinator / Admin only)
invigilationRouter.post(
  "/allocate",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { examCycleId, facultyList, sessions } = req.body;

      if (!examCycleId || !Array.isArray(facultyList) || !Array.isArray(sessions)) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "Fields 'examCycleId', 'facultyList', and 'sessions' are required.",
            correlationId: (req as any).correlationId || "invig-err",
          },
        });
        return;
      }

      const result = InvigilationService.allocateInvigilators({
        examCycleId,
        facultyList,
        sessions,
        actorId: req.user?.userId,
        correlationId: (req as any).correlationId,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || "ALLOCATION_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "invig-err",
        },
      });
    }
  }
);

// Get complete duty roster
invigilationRouter.get(
  "/roster",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const roster = InvigilationService.getAllDuties();
      res.json({
        success: true,
        data: roster,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "GET_ROSTER_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "invig-err",
        },
      });
    }
  }
);

// Faculty personal duty roster lookup
invigilationRouter.get(
  "/my-duties",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.user?.userId;
      if (!facultyId) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated." } });
        return;
      }

      const duties = InvigilationService.getFacultyDuties(facultyId);
      res.json({
        success: true,
        data: duties,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "MY_DUTIES_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "invig-err",
        },
      });
    }
  }
);
