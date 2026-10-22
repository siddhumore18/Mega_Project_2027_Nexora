import { Router, Request, Response } from "express";
import { OptimizerService } from "../services/optimizer.service.js";
import { ScheduleVersionService } from "../services/schedule-version.service.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const scheduleRouter = Router();

// ==========================================
// 1. SOLVER RUNS (Phase 7)
// ==========================================

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

// ==========================================
// 2. VERSIONING & PUBLICATION (Phase 8)
// ==========================================

// Create a draft version from a feasible/optimal run
scheduleRouter.post(
  "/versions",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { examCycleId, scheduleRunId } = req.body;
      if (!examCycleId || !scheduleRunId) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Fields 'examCycleId' and 'scheduleRunId' are required.",
            correlationId: (req as any).correlationId || "ver-err",
          },
        });
        return;
      }

      const version = await ScheduleVersionService.createVersionFromRun({
        examCycleId,
        scheduleRunId,
        createdBy: req.user?.userId || "unknown",
        correlationId: (req as any).correlationId,
      });

      res.status(201).json({
        success: true,
        data: version,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || "CREATE_VERSION_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "ver-err",
        },
      });
    }
  }
);

// List schedule versions for an exam cycle
scheduleRouter.get(
  "/versions",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const examCycleId = (req.query.examCycleId as string) || "cycle-active-dec-2026";
      const versions = await ScheduleVersionService.listVersions(examCycleId);

      res.json({
        success: true,
        data: versions,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "LIST_VERSIONS_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "ver-err",
        },
      });
    }
  }
);

// Compare two versions
scheduleRouter.post(
  "/versions/compare",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { versionIdA, versionIdB } = req.body;
      if (!versionIdA || !versionIdB) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_VERSION_IDS",
            message: "Both 'versionIdA' and 'versionIdB' are required for schedule diff.",
            correlationId: (req as any).correlationId || "diff-err",
          },
        });
        return;
      }

      const comparison = await ScheduleVersionService.compareVersions(versionIdA, versionIdB);

      res.json({
        success: true,
        data: comparison,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || "COMPARE_VERSIONS_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "diff-err",
        },
      });
    }
  }
);

// Get single version details
scheduleRouter.get(
  "/versions/:versionId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const version = await ScheduleVersionService.getVersionDetails(req.params.versionId);
      if (!version) {
        res.status(404).json({
          success: false,
          error: {
            code: "VERSION_NOT_FOUND",
            message: `Schedule version '${req.params.versionId}' not found.`,
            correlationId: (req as any).correlationId || "ver-err",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: version,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "GET_VERSION_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "ver-err",
        },
      });
    }
  }
);

// Submit draft version for review
scheduleRouter.post(
  "/versions/:versionId/submit-review",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const version = await ScheduleVersionService.submitForReview(
        req.params.versionId,
        req.user?.userId || "unknown",
        (req as any).correlationId
      );

      res.json({
        success: true,
        data: version,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || "SUBMIT_REVIEW_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "ver-err",
        },
      });
    }
  }
);

// Formally approve a version (Exclusive Authority: Examination Coordinator)
scheduleRouter.post(
  "/versions/:versionId/approve",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR),
  async (req: Request, res: Response) => {
    try {
      const version = await ScheduleVersionService.approveVersion(
        req.params.versionId,
        req.user?.userId || "unknown",
        (req as any).correlationId
      );

      res.json({
        success: true,
        data: version,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || "APPROVE_VERSION_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "ver-err",
        },
      });
    }
  }
);

// Publish approved version (Strict Gate: must be APPROVED, exclusive to Examination Coordinator)
scheduleRouter.post(
  "/versions/:versionId/publish",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR),
  async (req: Request, res: Response) => {
    try {
      const published = await ScheduleVersionService.publishVersion(
        req.params.versionId,
        req.user?.userId || "unknown",
        (req as any).correlationId
      );

      res.json({
        success: true,
        data: published,
      });
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || "PUBLISH_VERSION_ERROR",
          message: err.message,
          correlationId: (req as any).correlationId || "pub-err",
        },
      });
    }
  }
);
