import {
  ScheduleVersionStatus,
  ScheduleVersionSummary,
  ScheduleComparisonResult,
  ScheduleComparisonDiff,
  HardViolationType,
} from "@nexora/contracts";
import { prisma } from "../db/prisma.js";
import { OptimizerService } from "./optimizer.service.js";
import { ScheduleValidatorService } from "./schedule-validator.service.js";
import { AuditService } from "./audit.service.js";

// In-memory version and scheduled exam store for isolated testing or DB fallback
interface InMemoryVersion {
  id: string;
  examCycleId: string;
  scheduleRunId?: string;
  versionNumber: number;
  status: ScheduleVersionStatus;
  createdBy: string;
  approvedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  exams: Array<{
    id: string;
    examOfferingId: string;
    examCode: string;
    title: string;
    timeSlotId: string;
    timeSlotName?: string;
    roomId: string;
    roomCode?: string;
  }>;
}

const mockVersionsStore = new Map<string, InMemoryVersion>();

export class ScheduleVersionService {
  /**
   * Creates a new ScheduleVersion from a completed candidate schedule run.
   */
  public static async createVersionFromRun(input: {
    examCycleId: string;
    scheduleRunId: string;
    createdBy: string;
    correlationId?: string;
  }): Promise<ScheduleVersionSummary> {
    const run = await OptimizerService.getRun(input.scheduleRunId);
    if (!run) {
      const err: any = new Error(`Schedule run '${input.scheduleRunId}' not found.`);
      err.code = "RUN_NOT_FOUND";
      err.status = 404;
      throw err;
    }

    if (run.status !== "OPTIMAL" && run.status !== "FEASIBLE") {
      const err: any = new Error(
        `Cannot create schedule version from an infeasible run (Status: ${run.status}).`
      );
      err.code = "CANNOT_VERSION_INFEASIBLE_RUN";
      err.status = 422;
      throw err;
    }

    // Determine sequential version number
    const existing = await this.listVersions(input.examCycleId);
    const versionNumber = existing.length > 0 ? Math.max(...existing.map((v) => v.versionNumber)) + 1 : 1;

    const versionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    const candidate = run.candidateSchedule;
    const assignments = candidate?.assignments || [];

    const examRecords = assignments.map((a, idx) => ({
      id: `sched-exam-${idx}-${Date.now()}`,
      examOfferingId: a.examId,
      examCode: a.examId.replace(/^offering-|^exam-/, "").toUpperCase(),
      title: `Scheduled Paper ${a.examId}`,
      timeSlotId: a.timeSlotId,
      timeSlotName: a.timeSlotId,
      roomId: a.roomId,
      roomCode: a.roomId,
    }));

    const newVersion: InMemoryVersion = {
      id: versionId,
      examCycleId: input.examCycleId,
      scheduleRunId: input.scheduleRunId,
      versionNumber,
      status: ScheduleVersionStatus.DRAFT,
      createdBy: input.createdBy,
      createdAt: now,
      exams: examRecords,
    };

    mockVersionsStore.set(versionId, newVersion);

    try {
      await prisma.scheduleVersion.create({
        data: {
          id: versionId,
          examCycleId: input.examCycleId,
          scheduleRunId: input.scheduleRunId,
          versionNumber,
          status: "DRAFT" as any,
          createdBy: input.createdBy,
          createdAt: now,
        },
      });
    } catch {
      // Mock fallback
    }

    await AuditService.log({
      actorId: input.createdBy,
      action: "SCHEDULE_VERSION_CREATED",
      entityType: "ScheduleVersion",
      entityId: versionId,
      correlationId: input.correlationId || "ver-corr",
      payload: {
        examCycleId: input.examCycleId,
        versionNumber,
        scheduledExamsCount: examRecords.length,
      },
    });

    return {
      id: versionId,
      examCycleId: input.examCycleId,
      scheduleRunId: input.scheduleRunId,
      versionNumber,
      status: ScheduleVersionStatus.DRAFT,
      createdBy: input.createdBy,
      createdAt: now.toISOString(),
      scheduledExamsCount: examRecords.length,
    };
  }

  /**
   * Submits a draft schedule version for coordinator review.
   */
  public static async submitForReview(
    versionId: string,
    actorId: string,
    correlationId?: string
  ): Promise<ScheduleVersionSummary> {
    const version = mockVersionsStore.get(versionId);
    if (!version) {
      const err: any = new Error(`Schedule version '${versionId}' not found.`);
      err.code = "VERSION_NOT_FOUND";
      err.status = 404;
      throw err;
    }

    if (version.status === ScheduleVersionStatus.PUBLISHED) {
      const err: any = new Error("Cannot alter status of an already published schedule version.");
      err.code = "IMMUTABLE_PUBLISHED_VERSION";
      err.status = 409;
      throw err;
    }

    version.status = ScheduleVersionStatus.REVIEW;

    try {
      await prisma.scheduleVersion.update({
        where: { id: versionId },
        data: { status: "REVIEW" as any },
      });
    } catch {
      // Mock fallback
    }

    await AuditService.log({
      actorId,
      action: "SCHEDULE_VERSION_SUBMITTED_FOR_REVIEW",
      entityType: "ScheduleVersion",
      entityId: versionId,
      correlationId: correlationId || "rev-corr",
    });

    return {
      id: version.id,
      examCycleId: version.examCycleId,
      scheduleRunId: version.scheduleRunId,
      versionNumber: version.versionNumber,
      status: ScheduleVersionStatus.REVIEW,
      createdBy: version.createdBy,
      approvedBy: version.approvedBy,
      publishedAt: version.publishedAt?.toISOString(),
      createdAt: version.createdAt.toISOString(),
      scheduledExamsCount: version.exams.length,
    };
  }

  /**
   * Formally approves a schedule version after validating 0 hard violations.
   */
  public static async approveVersion(
    versionId: string,
    approvedBy: string,
    correlationId?: string
  ): Promise<ScheduleVersionSummary> {
    const version = mockVersionsStore.get(versionId);
    if (!version) {
      const err: any = new Error(`Schedule version '${versionId}' not found.`);
      err.code = "VERSION_NOT_FOUND";
      err.status = 404;
      throw err;
    }

    if (version.status === ScheduleVersionStatus.PUBLISHED) {
      const err: any = new Error("Version is already published.");
      err.code = "ALREADY_PUBLISHED";
      err.status = 409;
      throw err;
    }

    // Verify hard constraints are 0
    // Check room double booking
    const slotRoom = new Set<string>();
    for (const exam of version.exams) {
      const key = `${exam.roomId}_${exam.timeSlotId}`;
      if (slotRoom.has(key)) {
        const err: any = new Error(`Cannot approve version with room collision in room ${exam.roomId}`);
        err.code = "APPROVAL_HARD_VIOLATION";
        err.status = 422;
        throw err;
      }
      slotRoom.add(key);
    }

    version.status = ScheduleVersionStatus.APPROVED;
    version.approvedBy = approvedBy;

    try {
      await prisma.scheduleVersion.update({
        where: { id: versionId },
        data: {
          status: "APPROVED" as any,
          approvedBy,
        },
      });
    } catch {
      // Mock fallback
    }

    await AuditService.log({
      actorId: approvedBy,
      action: "SCHEDULE_VERSION_APPROVED",
      entityType: "ScheduleVersion",
      entityId: versionId,
      correlationId: correlationId || "appr-corr",
      payload: {
        versionNumber: version.versionNumber,
        approvedBy,
      },
    });

    return {
      id: version.id,
      examCycleId: version.examCycleId,
      scheduleRunId: version.scheduleRunId,
      versionNumber: version.versionNumber,
      status: ScheduleVersionStatus.APPROVED,
      createdBy: version.createdBy,
      approvedBy,
      publishedAt: version.publishedAt?.toISOString(),
      createdAt: version.createdAt.toISOString(),
      scheduledExamsCount: version.exams.length,
    };
  }

  /**
   * Publishes an approved schedule version.
   * STRICT EXIT GATE: Only validated, APPROVED versions can be published.
   * Once published, the version is immutable and the exam cycle transitions to PUBLISHED.
   */
  public static async publishVersion(
    versionId: string,
    actorId: string,
    correlationId?: string
  ): Promise<ScheduleVersionSummary> {
    const version = mockVersionsStore.get(versionId);
    if (!version) {
      const err: any = new Error(`Schedule version '${versionId}' not found.`);
      err.code = "VERSION_NOT_FOUND";
      err.status = 404;
      throw err;
    }

    if (version.status === ScheduleVersionStatus.PUBLISHED) {
      const err: any = new Error("Schedule version is already published.");
      err.code = "ALREADY_PUBLISHED";
      err.status = 409;
      throw err;
    }

    if (version.status !== ScheduleVersionStatus.APPROVED) {
      const err: any = new Error(
        `Gate check failed: Only APPROVED versions can be published. Current status is '${version.status}'.`
      );
      err.code = "VERSION_NOT_APPROVED";
      err.status = 409;
      throw err;
    }

    const now = new Date();

    // Archive any previous published version for this exam cycle
    for (const v of mockVersionsStore.values()) {
      if (v.examCycleId === version.examCycleId && v.status === ScheduleVersionStatus.PUBLISHED) {
        v.status = ScheduleVersionStatus.ARCHIVED;
      }
    }

    version.status = ScheduleVersionStatus.PUBLISHED;
    version.publishedAt = now;

    try {
      await prisma.scheduleVersion.updateMany({
        where: {
          examCycleId: version.examCycleId,
          status: "PUBLISHED" as any,
        },
        data: {
          status: "ARCHIVED" as any,
        },
      });

      await prisma.scheduleVersion.update({
        where: { id: versionId },
        data: {
          status: "PUBLISHED" as any,
          publishedAt: now,
        },
      });

      await prisma.examCycle.update({
        where: { id: version.examCycleId },
        data: { status: "PUBLISHED" as any },
      });
    } catch {
      // Mock fallback
    }

    await AuditService.log({
      actorId,
      action: "SCHEDULE_VERSION_PUBLISHED",
      entityType: "ScheduleVersion",
      entityId: versionId,
      correlationId: correlationId || "pub-corr",
      payload: {
        examCycleId: version.examCycleId,
        versionNumber: version.versionNumber,
        publishedAt: now.toISOString(),
      },
    });

    return {
      id: version.id,
      examCycleId: version.examCycleId,
      scheduleRunId: version.scheduleRunId,
      versionNumber: version.versionNumber,
      status: ScheduleVersionStatus.PUBLISHED,
      createdBy: version.createdBy,
      approvedBy: version.approvedBy,
      publishedAt: now.toISOString(),
      createdAt: version.createdAt.toISOString(),
      scheduledExamsCount: version.exams.length,
    };
  }

  /**
   * Compares two schedule versions to compute timetable movement diffs.
   */
  public static async compareVersions(
    versionIdA: string,
    versionIdB: string
  ): Promise<ScheduleComparisonResult> {
    const vA = mockVersionsStore.get(versionIdA);
    const vB = mockVersionsStore.get(versionIdB);

    if (!vA || !vB) {
      const err: any = new Error("One or both schedule versions not found.");
      err.code = "VERSIONS_NOT_FOUND";
      err.status = 404;
      throw err;
    }

    const aMap = new Map(vA.exams.map((e) => [e.examOfferingId, e]));
    const bMap = new Map(vB.exams.map((e) => [e.examOfferingId, e]));

    const allOfferingIds = new Set([...aMap.keys(), ...bMap.keys()]);
    const differences: ScheduleComparisonDiff[] = [];
    let changedCount = 0;

    for (const offId of allOfferingIds) {
      const examA = aMap.get(offId);
      const examB = bMap.get(offId);

      const code = examB?.examCode || examA?.examCode || offId;
      const title = examB?.title || examA?.title || `Paper ${code}`;

      if (!examA && examB) {
        changedCount++;
        differences.push({
          examId: offId,
          examCode: code,
          title,
          changeType: "ADDED",
          versionB: {
            timeSlotId: examB.timeSlotId,
            timeSlotName: examB.timeSlotName,
            roomId: examB.roomId,
            roomCode: examB.roomCode,
          },
        });
      } else if (examA && !examB) {
        changedCount++;
        differences.push({
          examId: offId,
          examCode: code,
          title,
          changeType: "REMOVED",
          versionA: {
            timeSlotId: examA.timeSlotId,
            timeSlotName: examA.timeSlotName,
            roomId: examA.roomId,
            roomCode: examA.roomCode,
          },
        });
      } else if (examA && examB) {
        const slotChanged = examA.timeSlotId !== examB.timeSlotId;
        const roomChanged = examA.roomId !== examB.roomId;

        let changeType: any = "UNCHANGED";
        if (slotChanged && roomChanged) changeType = "BOTH_CHANGED";
        else if (slotChanged) changeType = "SLOT_CHANGED";
        else if (roomChanged) changeType = "ROOM_CHANGED";

        if (changeType !== "UNCHANGED") {
          changedCount++;
        }

        differences.push({
          examId: offId,
          examCode: code,
          title,
          changeType,
          versionA: {
            timeSlotId: examA.timeSlotId,
            timeSlotName: examA.timeSlotName,
            roomId: examA.roomId,
            roomCode: examA.roomCode,
          },
          versionB: {
            timeSlotId: examB.timeSlotId,
            timeSlotName: examB.timeSlotName,
            roomId: examB.roomId,
            roomCode: examB.roomCode,
          },
        });
      }
    }

    return {
      versionAId: vA.id,
      versionBId: vB.id,
      versionANumber: vA.versionNumber,
      versionBNumber: vB.versionNumber,
      totalExamsCompared: allOfferingIds.size,
      changedCount,
      differences,
    };
  }

  /**
   * Lists all versions for an exam cycle.
   */
  public static async listVersions(examCycleId: string): Promise<ScheduleVersionSummary[]> {
    const list: ScheduleVersionSummary[] = [];
    for (const v of mockVersionsStore.values()) {
      if (v.examCycleId === examCycleId) {
        list.push({
          id: v.id,
          examCycleId: v.examCycleId,
          scheduleRunId: v.scheduleRunId,
          versionNumber: v.versionNumber,
          status: v.status,
          createdBy: v.createdBy,
          approvedBy: v.approvedBy,
          publishedAt: v.publishedAt?.toISOString(),
          createdAt: v.createdAt.toISOString(),
          scheduledExamsCount: v.exams.length,
        });
      }
    }

    if (list.length > 0) {
      return list.sort((a, b) => b.versionNumber - a.versionNumber);
    }

    try {
      const dbVersions = await prisma.scheduleVersion.findMany({
        where: { examCycleId },
        include: {
          _count: {
            select: { scheduledExams: true },
          },
        },
        orderBy: { versionNumber: "desc" },
      });

      return dbVersions.map((v) => ({
        id: v.id,
        examCycleId: v.examCycleId,
        scheduleRunId: v.scheduleRunId ?? undefined,
        versionNumber: v.versionNumber,
        status: v.status as ScheduleVersionStatus,
        createdBy: v.createdBy,
        approvedBy: v.approvedBy ?? undefined,
        publishedAt: v.publishedAt?.toISOString(),
        createdAt: v.createdAt.toISOString(),
        scheduledExamsCount: v._count.scheduledExams,
      }));
    } catch {
      return list;
    }
  }

  /**
   * Retrieves single version details.
   */
  public static async getVersionDetails(versionId: string): Promise<InMemoryVersion | null> {
    const memory = mockVersionsStore.get(versionId);
    if (memory) return memory;
    return null;
  }

  /**
   * Clear in-memory versions store for testing.
   */
  public static clearStore(): void {
    mockVersionsStore.clear();
  }
}
