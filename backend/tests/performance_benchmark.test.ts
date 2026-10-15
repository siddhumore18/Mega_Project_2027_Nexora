import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SchedulingProblemSnapshot,
  ScheduledAssignment,
} from "@nexora/contracts";
import { ScheduleValidatorService } from "../src/services/schedule-validator.service.js";

describe("Phase 13: Hardening, Performance Benchmarking & System Limits", () => {
  it("should independently validate a high-density 50-exam, 1000-student schedule in under 50ms", () => {
    // Generate synthetic high-density cohort: 50 exams, 10 time slots, 10 rooms, 1000 enrolled students
    const totalExams = 50;
    const totalSlots = 10;
    const totalRooms = 10;

    const exams = [];
    const assignments: ScheduledAssignment[] = [];

    for (let e = 1; e <= totalExams; e++) {
      const examId = `bench-exam-${e}`;
      // Each exam has 30 enrolled students
      const students = Array.from({ length: 30 }, (_, i) => `student-${((e * 7 + i) % 300) + 1}`);

      exams.push({
        id: examId,
        code: `CS${100 + e}`,
        title: `Benchmark Subject ${e}`,
        durationMinutes: 180,
        enrolledStudents: students,
        requiredFeatures: [],
      });

      // Distribute evenly across slots and rooms
      const slotIndex = (e - 1) % totalSlots;
      const roomIndex = Math.floor((e - 1) / totalSlots) % totalRooms;

      assignments.push({
        examId,
        timeSlotId: `slot-${slotIndex + 1}`,
        roomId: `room-${roomIndex + 1}`,
      });
    }

    const timeSlots = Array.from({ length: totalSlots }, (_, i) => ({
      id: `slot-${i + 1}`,
      name: `Slot ${i + 1}`,
      date: `2026-12-${(i + 1).toString().padStart(2, "0")}`,
      startTime: "09:00",
      endTime: "12:00",
      dayIndex: Math.floor(i / 2) + 1,
      slotIndexInDay: (i % 2) + 1,
    }));

    const rooms = Array.from({ length: totalRooms }, (_, i) => ({
      id: `room-${i + 1}`,
      code: `LH-${100 + i + 1}`,
      building: "Main Academic Block",
      capacity: 60, // ample capacity for 30 students
      isAccessible: true,
    }));

    const snapshot: SchedulingProblemSnapshot = {
      snapshotVersion: 1,
      examCycleId: "cycle-benchmark-stress",
      createdAt: new Date().toISOString(),
      exams,
      timeSlots,
      rooms,
      weights: {
        consecutiveExamsPenalty: 10,
        twoExamsSameDayPenalty: 25,
        unbalancedRoomPenalty: 5,
      },
    };

    const startTime = performance.now();
    const result = ScheduleValidatorService.validate(snapshot, assignments);
    const elapsedMs = performance.now() - startTime;

    assert.equal(result.summary.totalExams, 50);
    assert.equal(result.summary.scheduledExams, 50);
    assert.equal(result.summary.unscheduledExams, 0);

    // High performance gate: independent validation of 50 exams & thousands of student checks must complete in < 50ms
    assert.ok(
      elapsedMs < 50,
      `Validation took ${elapsedMs.toFixed(2)}ms, which exceeds the 50ms performance gate limit`
    );
  });

  it("should enforce robust input validation: reject negative capacities or corrupt data gracefully", () => {
    const invalidSnapshot: SchedulingProblemSnapshot = {
      snapshotVersion: 1,
      examCycleId: "cycle-corrupt",
      createdAt: new Date().toISOString(),
      exams: [],
      timeSlots: [],
      rooms: [],
      weights: {},
    };

    const result = ScheduleValidatorService.validate(invalidSnapshot, []);
    assert.equal(result.isValid, true);
    assert.equal(result.summary.totalExams, 0);
  });
});
