import { Router, Request, Response } from "express";
import { ReportsService } from "../services/reports.service.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const reportsRouter = Router();

// Room Capacity Utilization Report (Coordinator, Admin, HOD)
reportsRouter.get(
  "/room-utilization",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN, UserRole.HOD),
  async (req: Request, res: Response) => {
    try {
      const examCycleId = (req.query.examCycleId as string) || "cycle-autumn-2026";
      const report = ReportsService.getRoomUtilizationReport(examCycleId);

      res.json({
        success: true,
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "REPORT_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "rep-err",
        },
      });
    }
  }
);

// Faculty Invigilation Workload Balance Report (Coordinator, Admin, HOD)
reportsRouter.get(
  "/faculty-workload",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN, UserRole.HOD),
  async (req: Request, res: Response) => {
    try {
      const examCycleId = (req.query.examCycleId as string) || "cycle-autumn-2026";
      const report = ReportsService.getFacultyWorkloadReport(examCycleId);

      res.json({
        success: true,
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "REPORT_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "rep-err",
        },
      });
    }
  }
);

// Master Examination Timetable CSV Export (All authenticated roles)
reportsRouter.get(
  "/timetable/export-csv",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const examCycleId = (req.query.examCycleId as string) || "cycle-autumn-2026";
      const csv = ReportsService.exportMasterTimetableCsv(examCycleId);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="master-timetable-${examCycleId}.csv"`
      );
      res.status(200).send(csv);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "EXPORT_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "rep-err",
        },
      });
    }
  }
);
