import { Router, Request, Response } from "express";
import { OptimizerService } from "../services/optimizer.service.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const scheduleRouter = Router();

// Trigger optimization run (Examination Coordinator / Admin only)
scheduleRouter.post(
  "/runs",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { examCycleId, snapshot } = req.body;
      if (!examCycleId) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_EXAM_CYCLE_ID",
            message: "Field 'examCycleId' is required to run schedule optimization.",
            correlationId: (req as any).correlationId || "opt-err",
          },
        });
        return;
      }

      const result = await OptimizerService.runCycleOptimization(
        examCycleId,
        snapshot,
        req.user?.userId,
        (req as any).correlationId
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "OPTIMIZATION_EXECUTION_ERROR",
          message: err.message || "Failed to execute schedule optimization.",
          correlationId: (req as any).correlationId || "opt-err",
        },
      });
    }
  }
);

// List optimization runs for an exam cycle
scheduleRouter.get(
  "/runs",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const examCycleId = (req.query.examCycleId as string) || "cycle-active-dec-2026";
      const runs = await OptimizerService.listRuns(examCycleId);

      res.json({
        success: true,
        data: runs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "LIST_RUNS_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "opt-err",
        },
      });
    }
  }
);

// Get single run details and candidate schedule
scheduleRouter.get(
  "/runs/:runId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const run = await OptimizerService.getRun(req.params.runId);
      if (!run) {
        res.status(404).json({
          success: false,
          error: {
            code: "RUN_NOT_FOUND",
            message: `Schedule run with ID '${req.params.runId}' was not found.`,
            correlationId: (req as any).correlationId || "opt-err",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: run,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "GET_RUN_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "opt-err",
        },
      });
    }
  }
);
