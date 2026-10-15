import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SchedulingProblemSnapshot,
  ScheduledAssignment,
  HardViolationType,
  SoftPenaltyType,
} from "@nexora/contracts";
import { ScheduleValidatorService } from "../src/services/schedule-validator.service.js";

describe("Phase 6: Scheduling Problem Model & Constraints Validator", () => {
  const baseSnapshot: SchedulingProblemSnapshot = {
    snapshotVersion: 1,
    examCycleId: "cycle-test-2026",
    createdAt: new Date().toISOString(),
    exams: [
      {
        id: "exam-cs101",
        code: "CS101",
        title: "Introduction to Computer Science",
        durationMinutes: 180,
        enrolledStudents: ["student-1", "student-2", "student-3"],
        requiredFeatures: [],
      },
      {
        id: "exam-ma101",
        code: "MA101",
        title: "Calculus & Linear Algebra",
        durationMinutes: 180,
        enrolledStudents: ["student-3", "student-4", "student-5"], // student-3 common
        requiredFeatures: [],
      },
      {
        id: "exam-ph101",
        code: "PH101",
        title: "Engineering Physics",
        durationMinutes: 180,
        enrolledStudents: ["student-6", "student-7"],
        requiredFeatures: [],
      },
    ],
    timeSlots: [
      {
        id: "slot-day1-morn",
        name: "Day 1 Morning (09:00 - 12:00)",
        date: "2026-12-01",
        startTime: "09:00",
        endTime: "12:00",
        dayIndex: 1,
        slotIndexInDay: 1,
      },
      {
        id: "slot-day1-aftn",
        name: "Day 1 Afternoon (14:00 - 17:00)",
        date: "2026-12-01",
        startTime: "14:00",
        endTime: "17:00",
        dayIndex: 1,
        slotIndexInDay: 2,
      },
      {
        id: "slot-day2-morn",
        name: "Day 2 Morning (09:00 - 12:00)",
        date: "2026-12-02",
        startTime: "09:00",
        endTime: "12:00",
        dayIndex: 2,
        slotIndexInDay: 1,
      },
    ],
    rooms: [
      {
        id: "room-lh101",
        code: "LH-101",
        building: "Main Academic Block",
        capacity: 50,
        isAccessible: true,
      },
      {
        id: "room-lh102",
        code: "LH-102",
        building: "Main Academic Block",
        capacity: 50,
        isAccessible: true,
      },
      {
        id: "room-small10",
        code: "SEM-01",
        building: "Annex",
        capacity: 2, // very small capacity to test room capacity violations
        isAccessible: true,
      },
    ],
    weights: {
      consecutiveExamsPenalty: 10,
      twoExamsSameDayPenalty: 25,
      unbalancedRoomPenalty: 5,
    },
  };

  it("validates a completely feasible schedule with zero violations", () => {
    // CS101 on Day 1 Morn in LH101
    // MA101 on Day 2 Morn in LH101 (Student-3 sits on Day 1 Morn and Day 2 Morn - no clash, no consecutive)
    // PH101 on Day 1 Aftn in LH102 (no student overlap with CS101)
    const assignments: ScheduledAssignment[] = [
      { examId: "exam-cs101", timeSlotId: "slot-day1-morn", roomId: "room-lh101" },
      { examId: "exam-ma101", timeSlotId: "slot-day2-morn", roomId: "room-lh101" },
      { examId: "exam-ph101", timeSlotId: "slot-day1-aftn", roomId: "room-lh102" },
    ];

    const result = ScheduleValidatorService.validate(baseSnapshot, assignments);

    assert.equal(result.isValid, true);
    assert.equal(result.hardViolations.length, 0);
    assert.equal(result.summary.scheduledExams, 3);
    assert.equal(result.summary.unscheduledExams, 0);
    assert.equal(result.totalPenaltyScore, 0);
  });

  it("detects H1: Student overlap violation when student has two exams at the same time", () => {
    // Both CS101 and MA101 scheduled on Day 1 Morning in different rooms.
    // Student-3 is enrolled in both CS101 and MA101!
    const assignments: ScheduledAssignment[] = [
      { examId: "exam-cs101", timeSlotId: "slot-day1-morn", roomId: "room-lh101" },
      { examId: "exam-ma101", timeSlotId: "slot-day1-morn", roomId: "room-lh102" },
      { examId: "exam-ph101", timeSlotId: "slot-day2-morn", roomId: "room-lh101" },
    ];

    const result = ScheduleValidatorService.validate(baseSnapshot, assignments);

    assert.equal(result.isValid, false);
    const studentOverlap = result.hardViolations.find(
      (v) => v.type === HardViolationType.STUDENT_OVERLAP
    );
    assert.ok(studentOverlap, "Expected STUDENT_OVERLAP violation");
    assert.equal(studentOverlap?.details.studentId, "student-3");
    assert.equal(studentOverlap?.details.timeSlotId, "slot-day1-morn");
  });

  it("detects H2: Room double-booking violation when two exams share a room in the same slot", () => {
    // Both CS101 and PH101 scheduled in room-lh101 at the same slot
    const assignments: ScheduledAssignment[] = [
      { examId: "exam-cs101", timeSlotId: "slot-day1-morn", roomId: "room-lh101" },
      { examId: "exam-ph101", timeSlotId: "slot-day1-morn", roomId: "room-lh101" },
      { examId: "exam-ma101", timeSlotId: "slot-day2-morn", roomId: "room-lh102" },
    ];

    const result = ScheduleValidatorService.validate(baseSnapshot, assignments);

    assert.equal(result.isValid, false);
    const roomOverlap = result.hardViolations.find(
      (v) => v.type === HardViolationType.ROOM_DOUBLE_BOOKED
    );
    assert.ok(roomOverlap, "Expected ROOM_DOUBLE_BOOKED violation");
    assert.equal(roomOverlap?.details.roomId, "room-lh101");
    assert.equal(roomOverlap?.details.timeSlotId, "slot-day1-morn");
  });

  it("detects H3: Room capacity violation when student count exceeds room capacity", () => {
    // CS101 has 3 students, but assigned to room-small10 which has capacity 2
    const assignments: ScheduledAssignment[] = [
      { examId: "exam-cs101", timeSlotId: "slot-day1-morn", roomId: "room-small10" },
      { examId: "exam-ma101", timeSlotId: "slot-day2-morn", roomId: "room-lh101" },
      { examId: "exam-ph101", timeSlotId: "slot-day1-aftn", roomId: "room-lh102" },
    ];

    const result = ScheduleValidatorService.validate(baseSnapshot, assignments);

    assert.equal(result.isValid, false);
    const capacityViolation = result.hardViolations.find(
      (v) => v.type === HardViolationType.ROOM_CAPACITY_EXCEEDED
    );
    assert.ok(capacityViolation, "Expected ROOM_CAPACITY_EXCEEDED violation");
    assert.equal(capacityViolation?.details.enrolledCount, 3);
    assert.equal(capacityViolation?.details.capacity, 2);
    assert.equal(capacityViolation?.details.deficit, 1);
  });

  it("detects H4: Exam unscheduled violation when an exam is omitted", () => {
    // Omit PH101 completely
    const assignments: ScheduledAssignment[] = [
      { examId: "exam-cs101", timeSlotId: "slot-day1-morn", roomId: "room-lh101" },
      { examId: "exam-ma101", timeSlotId: "slot-day2-morn", roomId: "room-lh101" },
    ];

    const result = ScheduleValidatorService.validate(baseSnapshot, assignments);

    assert.equal(result.isValid, false);
    const unscheduled = result.hardViolations.find(
      (v) => v.type === HardViolationType.EXAM_UNSCHEDULED
    );
    assert.ok(unscheduled, "Expected EXAM_UNSCHEDULED violation");
    assert.equal(unscheduled?.details.examId, "exam-ph101");
    assert.equal(result.summary.unscheduledExams, 1);
  });

  it("detects H4: Duplicate exam scheduled violation", () => {
    // CS101 scheduled twice, PH101 scheduled once, MA101 omitted
    const assignments: ScheduledAssignment[] = [
      { examId: "exam-cs101", timeSlotId: "slot-day1-morn", roomId: "room-lh101" },
      { examId: "exam-cs101", timeSlotId: "slot-day2-morn", roomId: "room-lh102" },
      { examId: "exam-ph101", timeSlotId: "slot-day1-aftn", roomId: "room-lh101" },
    ];

    const result = ScheduleValidatorService.validate(baseSnapshot, assignments);

    assert.equal(result.isValid, false);
    const duplicate = result.hardViolations.find(
      (v) => v.type === HardViolationType.EXAM_DUPLICATE_SCHEDULED
    );
    assert.ok(duplicate, "Expected EXAM_DUPLICATE_SCHEDULED violation");
    assert.equal(duplicate?.details.examId, "exam-cs101");
    assert.equal(duplicate?.details.count, 2);
  });

  it("calculates soft penalties for consecutive and multiple exams on the same day", () => {
    // Student-3 is enrolled in CS101 and MA101.
    // Schedule CS101 on Day 1 Morning (Slot 1) and MA101 on Day 1 Afternoon (Slot 2).
    // This is feasible (no same-slot clash), but induces:
    // - S1: Consecutive exams penalty (weight = 10)
    // - S2: Multiple exams same day penalty (weight = 25)
    // Total penalty for student-3 = 10 + 25 = 35
    const assignments: ScheduledAssignment[] = [
      { examId: "exam-cs101", timeSlotId: "slot-day1-morn", roomId: "room-lh101" },
      { examId: "exam-ma101", timeSlotId: "slot-day1-aftn", roomId: "room-lh101" },
      { examId: "exam-ph101", timeSlotId: "slot-day2-morn", roomId: "room-lh102" },
    ];

    const result = ScheduleValidatorService.validate(baseSnapshot, assignments);

    assert.equal(result.isValid, true);
    assert.equal(result.hardViolations.length, 0);

    const consecPenalty = result.softPenalties.find(
      (p) => p.type === SoftPenaltyType.CONSECUTIVE_EXAMS_SAME_DAY
    );
    const sameDayPenalty = result.softPenalties.find(
      (p) => p.type === SoftPenaltyType.MULTIPLE_EXAMS_SAME_DAY
    );

    assert.ok(consecPenalty, "Expected CONSECUTIVE_EXAMS_SAME_DAY penalty");
    assert.equal(consecPenalty?.penaltyScore, 10);

    assert.ok(sameDayPenalty, "Expected MULTIPLE_EXAMS_SAME_DAY penalty");
    assert.equal(sameDayPenalty?.penaltyScore, 25);

    assert.equal(result.totalPenaltyScore, 35);
  });
});
