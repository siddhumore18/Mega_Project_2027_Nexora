import {
  HardConstraintViolation,
  HardViolationType,
  ScheduledAssignment,
  SchedulingProblemSnapshot,
  SoftConstraintPenalty,
  SoftPenaltyType,
} from "@nexora/contracts";

export interface ScheduleValidationResult {
  isValid: boolean;
  hardViolations: HardConstraintViolation[];
  softPenalties: SoftConstraintPenalty[];
  totalPenaltyScore: number;
  summary: {
    totalExams: number;
    scheduledExams: number;
    unscheduledExams: number;
    hardViolationsCount: number;
    softPenaltiesCount: number;
  };
}

export class ScheduleValidatorService {
  /**
   * Independently validates a candidate set of assignments against a problem snapshot.
   */
  public static validate(
    snapshot: SchedulingProblemSnapshot,
    assignments: ScheduledAssignment[]
  ): ScheduleValidationResult {
    const hardViolations: HardConstraintViolation[] = [];
    const softPenalties: SoftConstraintPenalty[] = [];

    const examMap = new Map(snapshot.exams.map((e) => [e.id, e]));
    const timeSlotMap = new Map(snapshot.timeSlots.map((ts) => [ts.id, ts]));
    const roomMap = new Map(snapshot.rooms.map((r) => [r.id, r]));

    const weights = {
      consecutiveExamsPenalty: snapshot.weights?.consecutiveExamsPenalty ?? 10,
      twoExamsSameDayPenalty: snapshot.weights?.twoExamsSameDayPenalty ?? 25,
      unbalancedRoomPenalty: snapshot.weights?.unbalancedRoomPenalty ?? 5,
    };

    // 1. Check Exam Coverage (H4: Every exam must be scheduled exactly once)
    const examAssignmentCounts = new Map<string, number>();
    for (const exam of snapshot.exams) {
      examAssignmentCounts.set(exam.id, 0);
    }

    for (const assignment of assignments) {
      const current = examAssignmentCounts.get(assignment.examId);
      if (current === undefined) {
        hardViolations.push({
          type: HardViolationType.EXAM_UNSCHEDULED,
          description: `Assignment references unknown exam ID: ${assignment.examId}`,
          details: { assignment },
        });
      } else {
        examAssignmentCounts.set(assignment.examId, current + 1);
      }

      if (!timeSlotMap.has(assignment.timeSlotId)) {
        hardViolations.push({
          type: HardViolationType.EXAM_UNSCHEDULED,
          description: `Assignment references unknown timeSlot ID: ${assignment.timeSlotId}`,
          details: { assignment },
        });
      }

      if (!roomMap.has(assignment.roomId)) {
        hardViolations.push({
          type: HardViolationType.ROOM_CAPACITY_EXCEEDED,
          description: `Assignment references unknown room ID: ${assignment.roomId}`,
          details: { assignment },
        });
      }
    }

    let unscheduledCount = 0;
    for (const [examId, count] of examAssignmentCounts.entries()) {
      const exam = examMap.get(examId);
      const examLabel = exam ? `${exam.code} (${exam.title})` : examId;

      if (count === 0) {
        unscheduledCount++;
        hardViolations.push({
          type: HardViolationType.EXAM_UNSCHEDULED,
          description: `Mandatory exam is not scheduled: ${examLabel}`,
          details: { examId, examCode: exam?.code },
        });
      } else if (count > 1) {
        hardViolations.push({
          type: HardViolationType.EXAM_DUPLICATE_SCHEDULED,
          description: `Exam is scheduled multiple times (${count} times): ${examLabel}`,
          details: { examId, count, examCode: exam?.code },
        });
      }
    }

    // 2. Check Room Double-Booking (H2: Max 1 exam per room per time slot)
    const roomSlotUsage = new Map<string, string[]>(); // key: `${roomId}__${timeSlotId}` -> examIds
    for (const assignment of assignments) {
      const key = `${assignment.roomId}__${assignment.timeSlotId}`;
      const existing = roomSlotUsage.get(key) || [];
      existing.push(assignment.examId);
      roomSlotUsage.set(key, existing);
    }

    for (const [key, examIds] of roomSlotUsage.entries()) {
      if (examIds.length > 1) {
        const [roomId, timeSlotId] = key.split("__");
        const room = roomMap.get(roomId);
        const slot = timeSlotMap.get(timeSlotId);
        hardViolations.push({
          type: HardViolationType.ROOM_DOUBLE_BOOKED,
          description: `Room ${room?.code ?? roomId} is double-booked during slot ${slot?.name ?? timeSlotId} for ${examIds.length} exams.`,
          details: { roomId, roomCode: room?.code, timeSlotId, examIds },
        });
      }
    }

    // 3. Check Room Capacity (H3: Enrolled students <= room capacity)
    for (const assignment of assignments) {
      const exam = examMap.get(assignment.examId);
      const room = roomMap.get(assignment.roomId);
      if (exam && room) {
        const enrolledCount = exam.enrolledStudents.length;
        if (enrolledCount > room.capacity) {
          hardViolations.push({
            type: HardViolationType.ROOM_CAPACITY_EXCEEDED,
            description: `Room ${room.code} capacity (${room.capacity}) exceeded by exam ${exam.code} (${enrolledCount} students).`,
            details: {
              examId: exam.id,
              examCode: exam.code,
              enrolledCount,
              roomId: room.id,
              roomCode: room.code,
              capacity: room.capacity,
              deficit: enrolledCount - room.capacity,
            },
          });
        }
      }
    }

    // 4. Check Student Collisions (H1: No student in two exams at the same time)
    // Map timeSlotId -> Set of (studentId -> examIds)
    const slotStudentExams = new Map<string, Map<string, string[]>>();
    for (const assignment of assignments) {
      const exam = examMap.get(assignment.examId);
      if (!exam) continue;

      let studentMap = slotStudentExams.get(assignment.timeSlotId);
      if (!studentMap) {
        studentMap = new Map<string, string[]>();
        slotStudentExams.set(assignment.timeSlotId, studentMap);
      }

      for (const studentId of exam.enrolledStudents) {
        const studentExams = studentMap.get(studentId) || [];
        studentExams.push(exam.id);
        studentMap.set(studentId, studentExams);
      }
    }

    for (const [timeSlotId, studentMap] of slotStudentExams.entries()) {
      const slot = timeSlotMap.get(timeSlotId);
      for (const [studentId, examIds] of studentMap.entries()) {
        if (examIds.length > 1) {
          hardViolations.push({
            type: HardViolationType.STUDENT_OVERLAP,
            description: `Student ${studentId} has ${examIds.length} exams at the same time in slot ${slot?.name ?? timeSlotId}.`,
            details: {
              studentId,
              timeSlotId,
              timeSlotName: slot?.name,
              examIds,
            },
          });
        }
      }
    }

    // 5. Evaluate Soft Constraints
    // Student Exam Schedule by Day: studentId -> dayIndex -> sorted list of { slotIndexInDay, examId }
    const studentDaySlots = new Map<string, Map<number, Array<{ slotIndex: number; examId: string }>>>();

    for (const assignment of assignments) {
      const exam = examMap.get(assignment.examId);
      const slot = timeSlotMap.get(assignment.timeSlotId);
      if (!exam || !slot) continue;

      for (const studentId of exam.enrolledStudents) {
        let dayMap = studentDaySlots.get(studentId);
        if (!dayMap) {
          dayMap = new Map();
          studentDaySlots.set(studentId, dayMap);
        }

        const slotList = dayMap.get(slot.dayIndex) || [];
        slotList.push({ slotIndex: slot.slotIndexInDay, examId: exam.id });
        dayMap.set(slot.dayIndex, slotList);
      }
    }

    let consecutiveOccurrences = 0;
    let multipleSameDayOccurrences = 0;

    for (const [, dayMap] of studentDaySlots.entries()) {
      for (const [, rawSlots] of dayMap.entries()) {
        // S2: Multiple Exams Same Day penalty: if a student has > 1 exam on the same day
        if (rawSlots.length > 1) {
          multipleSameDayOccurrences += rawSlots.length - 1;
        }

        // S1: Consecutive Exams Same Day
        // Sort by slotIndex
        const sorted = [...rawSlots].sort((a, b) => a.slotIndex - b.slotIndex);
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i + 1].slotIndex === sorted[i].slotIndex + 1) {
            consecutiveOccurrences++;
          }
        }
      }
    }

    if (consecutiveOccurrences > 0) {
      const score = consecutiveOccurrences * weights.consecutiveExamsPenalty;
      softPenalties.push({
        type: SoftPenaltyType.CONSECUTIVE_EXAMS_SAME_DAY,
        description: `${consecutiveOccurrences} occurrences of students taking back-to-back exams on the same day.`,
        penaltyScore: score,
      });
    }

    if (multipleSameDayOccurrences > 0) {
      const score = multipleSameDayOccurrences * weights.twoExamsSameDayPenalty;
      softPenalties.push({
        type: SoftPenaltyType.MULTIPLE_EXAMS_SAME_DAY,
        description: `${multipleSameDayOccurrences} student occurrences of multiple exams scheduled on the same calendar day.`,
        penaltyScore: score,
      });
    }

    // S3: Room Capacity Underutilized
    let underutilizedScore = 0;
    let underutilizedHalls = 0;
    for (const assignment of assignments) {
      const exam = examMap.get(assignment.examId);
      const room = roomMap.get(assignment.roomId);
      if (exam && room && exam.enrolledStudents.length > 0) {
        // e.g. using a 200 seat hall for 10 students
        const wastedSeats = room.capacity - 2 * exam.enrolledStudents.length;
        if (wastedSeats > 50) {
          underutilizedHalls++;
          underutilizedScore += Math.floor(wastedSeats / 10) * weights.unbalancedRoomPenalty;
        }
      }
    }

    if (underutilizedScore > 0) {
      softPenalties.push({
        type: SoftPenaltyType.ROOM_CAPACITY_UNDERUTILIZED,
        description: `${underutilizedHalls} exam sessions allocated to rooms with excessive empty capacity (>50 unused buffer seats).`,
        penaltyScore: underutilizedScore,
      });
    }

    const totalPenaltyScore = softPenalties.reduce((sum, p) => sum + p.penaltyScore, 0);

    return {
      isValid: hardViolations.length === 0,
      hardViolations,
      softPenalties,
      totalPenaltyScore,
      summary: {
        totalExams: snapshot.exams.length,
        scheduledExams: assignments.length,
        unscheduledExams: unscheduledCount,
        hardViolationsCount: hardViolations.length,
        softPenaltiesCount: softPenalties.length,
      },
    };
  }
}
