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

// Phase 6 Scheduling Problem Model Schemas

export const ExamInputSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  durationMinutes: z.number().int().positive(),
  enrolledStudents: z.array(z.string()), // student IDs
  requiredFeatures: z.array(z.string()).default([]),
});

export type ExamInput = z.infer<typeof ExamInputSchema>;

export const TimeSlotInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(), // YYYY-MM-DD
  startTime: z.string(), // HH:MM
  endTime: z.string(), // HH:MM
  dayIndex: z.number().int(),
  slotIndexInDay: z.number().int(),
});

export type TimeSlotInput = z.infer<typeof TimeSlotInputSchema>;

export const RoomInputSchema = z.object({
  id: z.string(),
  code: z.string(),
  building: z.string(),
  capacity: z.number().int().positive(),
  isAccessible: z.boolean().default(true),
});

export type RoomInput = z.infer<typeof RoomInputSchema>;

export const SchedulingProblemSnapshotSchema = z.object({
  snapshotVersion: z.number().int().positive(),
  examCycleId: z.string(),
  createdAt: z.string(),
  exams: z.array(ExamInputSchema),
  timeSlots: z.array(TimeSlotInputSchema),
  rooms: z.array(RoomInputSchema),
  weights: z
    .object({
      consecutiveExamsPenalty: z.number().default(10),
      twoExamsSameDayPenalty: z.number().default(25),
      unbalancedRoomPenalty: z.number().default(5),
    })
    .default({}),
});

export type SchedulingProblemSnapshot = z.infer<typeof SchedulingProblemSnapshotSchema>;

// Output Candidate & Independent Validation Schemas

export const ScheduledAssignmentSchema = z.object({
  examId: z.string(),
  timeSlotId: z.string(),
  roomId: z.string(),
});

export type ScheduledAssignment = z.infer<typeof ScheduledAssignmentSchema>;

export const HardViolationType = {
  STUDENT_OVERLAP: "STUDENT_OVERLAP",
  ROOM_DOUBLE_BOOKED: "ROOM_DOUBLE_BOOKED",
  ROOM_CAPACITY_EXCEEDED: "ROOM_CAPACITY_EXCEEDED",
  EXAM_UNSCHEDULED: "EXAM_UNSCHEDULED",
  EXAM_DUPLICATE_SCHEDULED: "EXAM_DUPLICATE_SCHEDULED",
  INVIGILATOR_OVERLAP: "INVIGILATOR_OVERLAP",
} as const;

export type HardViolationType = (typeof HardViolationType)[keyof typeof HardViolationType];

export const HardConstraintViolationSchema = z.object({
  type: z.nativeEnum(HardViolationType),
  description: z.string(),
  details: z.record(z.any()),
});

export type HardConstraintViolation = z.infer<typeof HardConstraintViolationSchema>;

export const SoftPenaltyType = {
  CONSECUTIVE_EXAMS_SAME_DAY: "CONSECUTIVE_EXAMS_SAME_DAY",
  MULTIPLE_EXAMS_SAME_DAY: "MULTIPLE_EXAMS_SAME_DAY",
  ROOM_CAPACITY_UNDERUTILIZED: "ROOM_CAPACITY_UNDERUTILIZED",
} as const;

export type SoftPenaltyType = (typeof SoftPenaltyType)[keyof typeof SoftPenaltyType];

export const SoftConstraintPenaltySchema = z.object({
  type: z.nativeEnum(SoftPenaltyType),
  description: z.string(),
  penaltyScore: z.number(),
});

export type SoftConstraintPenalty = z.infer<typeof SoftConstraintPenaltySchema>;

export const CandidateScheduleSchema = z.object({
  scheduleRunId: z.string(),
  status: z.nativeEnum(SolverStatus),
  objectiveScore: z.number().optional(),
  assignments: z.array(ScheduledAssignmentSchema),
  hardViolations: z.array(HardConstraintViolationSchema),
  softPenalties: z.array(SoftConstraintPenaltySchema),
  diagnostics: z.array(z.string()),
  generatedAt: z.string(),
});

export type CandidateSchedule = z.infer<typeof CandidateScheduleSchema>;

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
