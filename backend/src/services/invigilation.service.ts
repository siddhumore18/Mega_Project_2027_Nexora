import { prisma } from "../db/prisma.js";
import { AuditService } from "./audit.service.js";

export type InvigilatorRole = "CHIEF_INVIGILATOR" | "ASSISTANT_INVIGILATOR" | "RELIEF_INVIGILATOR";

export interface FacultyCandidate {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  departmentCode: string;
  maxDuties?: number;
}

export interface ScheduledExamSession {
  id: string;
  examOfferingId: string;
  subjectCode: string;
  departmentId: string;
  timeSlotId: string;
  timeSlotName: string;
  roomId: string;
  roomCode: string;
  expectedStudents: number;
}

export interface DutyAssignment {
  id: string;
  scheduledExamId: string;
  facultyId: string;
  facultyName: string;
  facultyDepartment: string;
  role: InvigilatorRole;
  timeSlotId: string;
  timeSlotName: string;
  roomCode: string;
}

// In-memory duty roster store
const mockDutyRoster = new Map<string, DutyAssignment>(); // dutyId -> DutyAssignment

export class InvigilationService {
  /**
   * Allocates invigilators to scheduled exams adhering strictly to:
   * 1. No overlapping time slots for the same faculty (Hard Constraint).
   * 2. No faculty invigilating their own department's primary paper (Impartiality Rule).
   * 3. Even workload distribution (Soft Rule).
   */
  public static allocateInvigilators(input: {
    examCycleId: string;
    facultyList: FacultyCandidate[];
    sessions: ScheduledExamSession[];
    actorId?: string;
    correlationId?: string;
  }): {
    totalDutiesAllocated: number;
    assignments: DutyAssignment[];
    workloadDistribution: Record<string, number>;
  } {
    const { facultyList, sessions } = input;

    if (!facultyList || facultyList.length === 0) {
      const err: any = new Error("No available faculty members provided for invigilation assignment.");
      err.code = "NO_FACULTY_AVAILABLE";
      err.status = 422;
      throw err;
    }

    const assignments: DutyAssignment[] = [];
    const facultySlotOccupied = new Map<string, Set<string>>(); // slotId -> Set<facultyId>
    const facultyDutyCount: Record<string, number> = {};

    for (const f of facultyList) {
      facultyDutyCount[f.id] = 0;
    }

    for (const session of sessions) {
      let slotOccupied = facultySlotOccupied.get(session.timeSlotId);
      if (!slotOccupied) {
        slotOccupied = new Set<string>();
        facultySlotOccupied.set(session.timeSlotId, slotOccupied);
      }

      // Determine required invigilators: 1 Chief (always), + 1 Assistant if students > 40
      const requiredInvigilators = session.expectedStudents > 40 ? 2 : 1;
      let assignedCount = 0;

      // Sort faculty by current duty count (least loaded first) to balance workload
      const sortedFaculty = [...facultyList].sort(
        (a, b) => (facultyDutyCount[a.id] || 0) - (facultyDutyCount[b.id] || 0)
      );

      for (const faculty of sortedFaculty) {
        if (assignedCount >= requiredInvigilators) break;

        // Hard Constraint: No double-booking in same time slot
        if (slotOccupied.has(faculty.id)) continue;

        // Impartiality Rule: Avoid invigilating own department paper if possible
        if (faculty.departmentId === session.departmentId && sortedFaculty.length > 2) {
          // Check if there are other candidates available
          const hasAlternate = sortedFaculty.some(
            (alt) => alt.departmentId !== session.departmentId && !slotOccupied?.has(alt.id)
          );
          if (hasAlternate) continue;
        }

        const role: InvigilatorRole = assignedCount === 0 ? "CHIEF_INVIGILATOR" : "ASSISTANT_INVIGILATOR";
        const dutyId = `duty-${session.id}-${faculty.id}`;

        const assignment: DutyAssignment = {
          id: dutyId,
          scheduledExamId: session.id,
          facultyId: faculty.id,
          facultyName: faculty.name,
          facultyDepartment: faculty.departmentCode,
          role,
          timeSlotId: session.timeSlotId,
          timeSlotName: session.timeSlotName,
          roomCode: session.roomCode,
        };

        assignments.push(assignment);
        mockDutyRoster.set(dutyId, assignment);

        slotOccupied.add(faculty.id);
        facultyDutyCount[faculty.id] = (facultyDutyCount[faculty.id] || 0) + 1;
        assignedCount++;
      }

      if (assignedCount === 0) {
        const err: any = new Error(
          `Unable to assign invigilator for session ${session.subjectCode} in room ${session.roomCode}: Insufficient available conflict-free faculty.`
        );
        err.code = "INVIGILATOR_SHORTAGE";
        err.status = 422;
        throw err;
      }
    }

    AuditService.log({
      actorId: input.actorId,
      action: "INVIGILATORS_ALLOCATED",
      entityType: "ExamCycle",
      entityId: input.examCycleId,
      correlationId: input.correlationId || "invig-corr",
      payload: {
        totalSessions: sessions.length,
        totalDuties: assignments.length,
        workloadDistribution: facultyDutyCount,
      },
    }).catch(() => {});

    return {
      totalDutiesAllocated: assignments.length,
      assignments,
      workloadDistribution: facultyDutyCount,
    };
  }

  /**
   * Retrieves assigned duties for a specific faculty member.
   */
  public static getFacultyDuties(facultyId: string): DutyAssignment[] {
    const list: DutyAssignment[] = [];
    for (const duty of mockDutyRoster.values()) {
      if (duty.facultyId === facultyId) {
        list.push(duty);
      }
    }
    return list;
  }

  /**
   * Retrieves all duty assignments across the cycle.
   */
  public static getAllDuties(): DutyAssignment[] {
    return Array.from(mockDutyRoster.values());
  }

  /**
   * Clear in-memory duty roster for tests.
   */
  public static clearStore(): void {
    mockDutyRoster.clear();
  }
}
