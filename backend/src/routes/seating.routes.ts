import { Router, Request, Response } from "express";
import { SeatingService } from "../services/seating.service.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const seatingRouter = Router();

// Allocate seats for a scheduled exam hall (Coordinator / Admin only)
seatingRouter.post(
  "/allocate",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { scheduledExamId, roomId, roomCode, capacity, students, seatsPerRow } = req.body;

      if (!scheduledExamId || !roomId || !roomCode || capacity === undefined || !Array.isArray(students)) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "Missing required fields: scheduledExamId, roomId, roomCode, capacity, students.",
            correlationId: (req as any).correlationId || "seat-err",
          },
        });
        return;
      }

      const matrix = SeatingService.allocateSeats({
        scheduledExamId,
        roomId,
        roomCode,
        capacity: Number(capacity),
        students,
        seatsPerRow: seatsPerRow ? Number(seatsPerRow) : undefined,
        actorId: req.user?.userId,
        correlationId: (req as any).correlationId,
      });

      res.status(201).json({
        success: true,
        data: matrix,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || "ALLOCATION_FAILED",
          message: err.message,
          correlationId: (req as any).correlationId || "seat-err",
        },
      });
    }
  }
);

// Get seating matrix for a scheduled exam hall
seatingRouter.get(
  "/scheduled-exams/:scheduledExamId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const matrix = SeatingService.getSeatingMatrix(req.params.scheduledExamId);
      if (!matrix) {
        res.status(404).json({
          success: false,
          error: {
            code: "SEATING_NOT_FOUND",
            message: `No seating allocations found for scheduled exam '${req.params.scheduledExamId}'.`,
            correlationId: (req as any).correlationId || "seat-err",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: matrix,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "GET_SEATING_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "seat-err",
        },
      });
    }
  }
);

// Export CSV door roster
seatingRouter.get(
  "/scheduled-exams/:scheduledExamId/export",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const csv = SeatingService.exportSeatingChartCsv(req.params.scheduledExamId);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="seating-${req.params.scheduledExamId}.csv"`
      );
      res.status(200).send(csv);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "EXPORT_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "seat-err",
        },
      });
    }
  }
);

// Student lookup for their own seats
seatingRouter.get(
  "/my-seats",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) {
        res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User not identified." } });
        return;
      }

      const seats = SeatingService.getStudentSeats(studentId);
      res.json({
        success: true,
        data: seats,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "MY_SEATS_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "seat-err",
        },
      });
    }
  }
);
