import { Request, Response } from "express";
import { z } from "zod";
import { ExamCycleStatus } from "@prisma/client";
import {
  canTransitionStatus,
  ExamCycleData,
  ExamOfferingData,
} from "../services/exam-cycle.service.js";
import {
  registerStudent,
  getStudentRegistrations,
  computeRegistrationGaps,
} from "../services/registration.service.js";
import { logAuditEvent } from "../services/audit.service.js";

// Stateful store for active cycles & offerings during development/testing
const inMemoryCycles: ExamCycleData[] = [
  {
    id: "cycle-autumn-2026",
    name: "Autumn 2026 Regular & Backlogs",
    academicTermId: "term-autumn-2026",
    registrationStart: "2026-10-01T00:00:00Z",
    registrationEnd: "2026-10-25T23:59:59Z",
    status: ExamCycleStatus.REGISTRATION_OPEN,
  },
];

const inMemoryOfferings: ExamOfferingData[] = [
  {
    id: "offering-cs701",
    examCycleId: "cycle-autumn-2026",
    subjectOfferingId: "sub-off-1",
    subjectCode: "CS701",
    subjectTitle: "Distributed Systems & Cloud Computing",
    durationMinutes: 180,
    isBacklogOffering: false,
  },
  {
    id: "offering-ec702",
    examCycleId: "cycle-autumn-2026",
    subjectOfferingId: "sub-off-2",
    subjectCode: "EC702",
    subjectTitle: "VLSI Architecture & Embedded Logic",
    durationMinutes: 180,
    isBacklogOffering: false,
  },
];

// Sample eligible cohort for gap tracking
const SAMPLE_ELIGIBLE_COHORT = [
  { studentId: "s1", rollNumber: "CS2023-001", name: "Alice", subjectCode: "CS701", examOfferingId: "offering-cs701" },
  { studentId: "s2", rollNumber: "CS2023-002", name: "Bob", subjectCode: "CS701", examOfferingId: "offering-cs701" },
  { studentId: "s3", rollNumber: "CS2023-003", name: "Charlie", subjectCode: "CS701", examOfferingId: "offering-cs701" },
  { studentId: "s4", rollNumber: "CS2023-004", name: "Daisy", subjectCode: "CS701", examOfferingId: "offering-cs701" },
];

const CreateCycleSchema = z.object({
  name: z.string().min(3),
  academicTermId: z.string().min(1),
  registrationStart: z.string(),
  registrationEnd: z.string(),
});

export function getExamCycles(_req: Request, res: Response) {
  res.json({ success: true, data: inMemoryCycles });
}

export function getExamCycleById(req: Request, res: Response) {
  const cycle = inMemoryCycles.find((c) => c.id === req.params.id);
  if (!cycle) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Exam cycle '${req.params.id}' not found.` },
    });
    return;
  }
  const offerings = inMemoryOfferings.filter((o) => o.examCycleId === cycle.id);
  res.json({ success: true, data: { ...cycle, offerings } });
}

export async function createExamCycle(req: Request, res: Response) {
  const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";
  const parsed = CreateCycleSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_CYCLE_PAYLOAD",
        message: "Invalid examination cycle creation fields.",
        details: parsed.error.format(),
        correlationId,
      },
    });
    return;
  }

  const newCycle: ExamCycleData = {
    id: `cycle-${Date.now()}`,
    name: parsed.data.name,
    academicTermId: parsed.data.academicTermId,
    registrationStart: parsed.data.registrationStart,
    registrationEnd: parsed.data.registrationEnd,
    status: ExamCycleStatus.DRAFT,
  };

  inMemoryCycles.push(newCycle);

  await logAuditEvent({
    actorId: req.user?.userId,
    action: "CREATE_EXAM_CYCLE",
    entityType: "ExamCycle",
    entityId: newCycle.id,
    correlationId,
  });

  res.status(201).json({ success: true, data: newCycle });
}

export async function updateCycleStatus(req: Request, res: Response) {
  const correlationId = (req.headers["x-correlation-id"] as string) || "unknown";
  const { targetStatus } = req.body;
  const cycle = inMemoryCycles.find((c) => c.id === req.params.id);

  if (!cycle) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Exam cycle '${req.params.id}' not found.`, correlationId },
    });
    return;
  }

  if (!canTransitionStatus(cycle.status, targetStatus)) {
    res.status(409).json({
      success: false,
      error: {
        code: "INVALID_STATE_TRANSITION",
        message: `Illegal state transition from '${cycle.status}' to '${targetStatus}'.`,
        correlationId,
      },
    });
    return;
  }

  const previousStatus = cycle.status;
  cycle.status = targetStatus;

  await logAuditEvent({
    actorId: req.user?.userId,
    action: "TRANSITION_EXAM_CYCLE_STATUS",
    entityType: "ExamCycle",
    entityId: cycle.id,
    correlationId,
    payload: { previousStatus, newStatus: targetStatus },
  });

  res.json({ success: true, data: cycle });
}

export function getOfferings(req: Request, res: Response) {
  const offerings = inMemoryOfferings.filter((o) => o.examCycleId === req.params.id);
  res.json({ success: true, data: offerings });
}

export function registerOffering(req: Request, res: Response) {
  const { offeringId } = req.params;
  const { studentId, rollNumber, subjectCode, attendancePercentage, backlogAttempt } = req.body;

  const offering = inMemoryOfferings.find((o) => o.id === offeringId);
  if (!offering) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Exam offering '${offeringId}' not found.` },
    });
    return;
  }

  const cycle = inMemoryCycles.find((c) => c.id === offering.examCycleId);
  const cycleStatus = cycle ? cycle.status : ExamCycleStatus.DRAFT;

  const record = registerStudent({
    studentId: studentId || req.user?.userId || "s-default",
    rollNumber: rollNumber || "CS2023-042",
    examOfferingId: offeringId,
    subjectCode: subjectCode || offering.subjectCode,
    attendancePercentage: typeof attendancePercentage === "number" ? attendancePercentage : 85.0,
    backlogAttempt: backlogAttempt || 0,
    cycleStatus,
  });

  res.status(201).json({ success: true, data: record });
}

export function getRegistrationGaps(req: Request, res: Response) {
  const gaps = computeRegistrationGaps(req.params.id, SAMPLE_ELIGIBLE_COHORT);
  res.json({ success: true, data: gaps });
}

export function getMyRegistrations(req: Request, res: Response) {
  const studentId = req.user?.userId || "s1";
  const records = getStudentRegistrations(studentId);
  res.json({ success: true, data: records });
}
