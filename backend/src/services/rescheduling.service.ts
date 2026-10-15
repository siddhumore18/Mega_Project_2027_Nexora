import { AuditService } from "./audit.service.js";

export interface RescheduleImpactAnalysis {
  examOfferingId: string;
  examCode: string;
  subjectTitle: string;
  currentTimeSlot: string;
  targetTimeSlot: string;
  targetRoom: string;
  affectedStudentsCount: number;
  affectedStudentIds: string[];
  conflictDetected: boolean;
  conflicts: Array<{
    studentId: string;
    conflictingExamId: string;
    conflictingExamCode: string;
    timeSlotId: string;
  }>;
  affectedInvigilators: Array<{
    facultyId: string;
    facultyName: string;
    reason: string;
  }>;
  recommendation: "FEASIBLE" | "BLOCKED_BY_CONFLICT";
}

export interface QueuedNotification {
  id: string;
  recipientId: string;
  recipientType: "STUDENT" | "FACULTY";
  recipientEmail?: string;
  examOfferingId: string;
  examCode: string;
  oldSlot: string;
  newSlot: string;
  newRoom: string;
  status: "QUEUED" | "SENT" | "FAILED";
  retryCount: number;
  deduplicationKey: string;
  createdAt: Date;
}

// In-memory outbox store
const mockNotificationOutbox = new Map<string, QueuedNotification>();

export class ReschedulingService {
  /**
   * Evaluates the impact of shifting a scheduled exam session to another slot and room.
   */
  public static analyzeImpact(input: {
    examOfferingId: string;
    examCode: string;
    subjectTitle: string;
    currentTimeSlot: string;
    targetTimeSlot: string;
    targetRoom: string;
    enrolledStudents: Array<{
      studentId: string;
      otherEnrolledExams: Array<{ examId: string; examCode: string; timeSlotId: string }>;
    }>;
    assignedInvigilators?: Array<{ facultyId: string; facultyName: string; occupiedSlots: string[] }>;
  }): RescheduleImpactAnalysis {
    const {
      examOfferingId,
      examCode,
      subjectTitle,
      currentTimeSlot,
      targetTimeSlot,
      targetRoom,
      enrolledStudents,
      assignedInvigilators = [],
    } = input;

    const conflicts: Array<{
      studentId: string;
      conflictingExamId: string;
      conflictingExamCode: string;
      timeSlotId: string;
    }> = [];

    // Check if any enrolled student has an exam already in the target time slot
    for (const s of enrolledStudents) {
      for (const other of s.otherEnrolledExams) {
        if (other.timeSlotId === targetTimeSlot && other.examId !== examOfferingId) {
          conflicts.push({
            studentId: s.studentId,
            conflictingExamId: other.examId,
            conflictingExamCode: other.examCode,
            timeSlotId: targetTimeSlot,
          });
        }
      }
    }

    const affectedInvigilators: Array<{
      facultyId: string;
      facultyName: string;
      reason: string;
    }> = [];

    for (const invig of assignedInvigilators) {
      if (invig.occupiedSlots.includes(targetTimeSlot)) {
        affectedInvigilators.push({
          facultyId: invig.facultyId,
          facultyName: invig.facultyName,
          reason: `Faculty is already assigned to another hall during target slot ${targetTimeSlot}. Reallocation needed.`,
        });
      }
    }

    const conflictDetected = conflicts.length > 0;

    return {
      examOfferingId,
      examCode,
      subjectTitle,
      currentTimeSlot,
      targetTimeSlot,
      targetRoom,
      affectedStudentsCount: enrolledStudents.length,
      affectedStudentIds: enrolledStudents.map((s) => s.studentId),
      conflictDetected,
      conflicts,
      affectedInvigilators,
      recommendation: conflictDetected ? "BLOCKED_BY_CONFLICT" : "FEASIBLE",
    };
  }

  /**
   * Queues notifications with strict deduplication for only impacted students and faculty.
   */
  public static queueNotifications(input: {
    examOfferingId: string;
    examCode: string;
    oldSlot: string;
    newSlot: string;
    newRoom: string;
    recipients: Array<{
      recipientId: string;
      recipientType: "STUDENT" | "FACULTY";
      recipientEmail?: string;
    }>;
    actorId?: string;
    correlationId?: string;
  }): { queuedCount: number; duplicateSkippedCount: number } {
    let queuedCount = 0;
    let duplicateSkippedCount = 0;

    for (const r of input.recipients) {
      const dedupKey = `${input.examOfferingId}_${r.recipientId}_${input.newSlot}`;

      // Check if already queued
      let alreadyExists = false;
      for (const notif of mockNotificationOutbox.values()) {
        if (notif.deduplicationKey === dedupKey) {
          alreadyExists = true;
          break;
        }
      }

      if (alreadyExists) {
        duplicateSkippedCount++;
        continue;
      }

      const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      mockNotificationOutbox.set(id, {
        id,
        recipientId: r.recipientId,
        recipientType: r.recipientType,
        recipientEmail: r.recipientEmail,
        examOfferingId: input.examOfferingId,
        examCode: input.examCode,
        oldSlot: input.oldSlot,
        newSlot: input.newSlot,
        newRoom: input.newRoom,
        status: "QUEUED",
        retryCount: 0,
        deduplicationKey: dedupKey,
        createdAt: new Date(),
      });
      queuedCount++;
    }

    AuditService.log({
      actorId: input.actorId,
      action: "RESCHEDULING_NOTIFICATIONS_QUEUED",
      entityType: "ExamOffering",
      entityId: input.examOfferingId,
      correlationId: input.correlationId || "notif-corr",
      payload: {
        examCode: input.examCode,
        newSlot: input.newSlot,
        queuedCount,
        duplicateSkippedCount,
      },
    }).catch(() => {});

    return { queuedCount, duplicateSkippedCount };
  }

  /**
   * Retrieves all queued notifications.
   */
  public static getOutbox(): QueuedNotification[] {
    return Array.from(mockNotificationOutbox.values());
  }

  /**
   * Clear outbox for tests.
   */
  public static clearOutbox(): void {
    mockNotificationOutbox.clear();
  }
}
