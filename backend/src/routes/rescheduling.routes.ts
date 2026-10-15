import { Router, Request, Response } from "express";
import { ReschedulingService } from "../services/rescheduling.service.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const reschedulingRouter = Router();

// Evaluate blast radius & clashes of proposed shift (Coordinator / Admin only)
reschedulingRouter.post(
  "/impact-analysis",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const {
        examOfferingId,
        examCode,
        subjectTitle,
        currentTimeSlot,
        targetTimeSlot,
        targetRoom,
        enrolledStudents,
        assignedInvigilators,
      } = req.body;

      if (!examOfferingId || !targetTimeSlot || !targetRoom || !Array.isArray(enrolledStudents)) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "Fields 'examOfferingId', 'targetTimeSlot', 'targetRoom', and 'enrolledStudents' are required.",
            correlationId: (req as any).correlationId || "resched-err",
          },
        });
        return;
      }

      const impact = ReschedulingService.analyzeImpact({
        examOfferingId,
        examCode: examCode || "EXAM",
        subjectTitle: subjectTitle || "Subject",
        currentTimeSlot: currentTimeSlot || "Current",
        targetTimeSlot,
        targetRoom,
        enrolledStudents,
        assignedInvigilators,
      });

      res.json({
        success: true,
        data: impact,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "IMPACT_ANALYSIS_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "resched-err",
        },
      });
    }
  }
);

// Queue notifications with deduplication
reschedulingRouter.post(
  "/notify",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { examOfferingId, examCode, oldSlot, newSlot, newRoom, recipients } = req.body;

      if (!examOfferingId || !newSlot || !Array.isArray(recipients)) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Fields 'examOfferingId', 'newSlot', and 'recipients' are required.",
            correlationId: (req as any).correlationId || "notif-err",
          },
        });
        return;
      }

      const result = ReschedulingService.queueNotifications({
        examOfferingId,
        examCode: examCode || "EXAM",
        oldSlot: oldSlot || "Old Slot",
        newSlot,
        newRoom: newRoom || "New Room",
        recipients,
        actorId: req.user?.userId,
        correlationId: (req as any).correlationId,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "NOTIFY_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "notif-err",
        },
      });
    }
  }
);

// View notification outbox
reschedulingRouter.get(
  "/notifications/outbox",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const outbox = ReschedulingService.getOutbox();
      res.json({
        success: true,
        data: outbox,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "OUTBOX_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "notif-err",
        },
      });
    }
  }
);
