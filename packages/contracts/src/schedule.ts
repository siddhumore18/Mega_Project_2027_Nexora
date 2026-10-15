import { z } from "zod";

export const SolverStatus = {
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  FEASIBLE: "FEASIBLE",
  OPTIMAL: "OPTIMAL",
  INFEASIBLE: "INFEASIBLE",
  UNKNOWN: "UNKNOWN",
  FAILED: "FAILED",
} as const;

export type SolverStatus = (typeof SolverStatus)[keyof typeof SolverStatus];

export const ScheduleVersionStatus = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type ScheduleVersionStatus =
  (typeof ScheduleVersionStatus)[keyof typeof ScheduleVersionStatus];

export const ScheduleRunSummarySchema = z.object({
  id: z.string(),
  examCycleId: z.string(),
  status: z.nativeEnum(SolverStatus),
  objectiveScore: z.number().optional(),
  violationsCount: z.number(),
  diagnostics: z.array(z.string()).default([]),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export type ScheduleRunSummary = z.infer<typeof ScheduleRunSummarySchema>;
