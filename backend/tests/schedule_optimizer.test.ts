import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";
import { UserRole, SolverStatus } from "@nexora/contracts";

describe("Phase 7: OR-Tools Optimization Engine & Solver Pipeline", () => {
  const app = createApp();

  const coordinatorToken = signToken({
    userId: "coord-1",
    email: "coordinator@nexora.edu",
    name: "Dr. Elena Vance",
    role: UserRole.EXAM_COORDINATOR,
  });

  const studentToken = signToken({
    userId: "stu-1",
    email: "student@nexora.edu",
    name: "Alex Mercer",
    role: UserRole.STUDENT,
  });

  it("should reject unauthenticated caller attempting to trigger an optimization run", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examCycleId: "cycle-test" }),
      });

      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject student role attempting to trigger an optimization run with 403 Forbidden", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({ examCycleId: "cycle-test" }),
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should successfully trigger optimization for a feasible problem snapshot and produce valid assignments", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const snapshot = {
        snapshotVersion: 1,
        examCycleId: "cycle-dec-2026",
        createdAt: new Date().toISOString(),
        exams: [
          {
            id: "exam-cs101",
            code: "CS101",
            title: "Computer Programming",
            durationMinutes: 180,
            enrolledStudents: ["student-1", "student-2"],
            requiredFeatures: [],
          },
          {
            id: "exam-ma101",
            code: "MA101",
            title: "Engineering Mathematics",
            durationMinutes: 180,
            enrolledStudents: ["student-2", "student-3"], // student-2 in both
            requiredFeatures: [],
          },
        ],
        timeSlots: [
          {
            id: "ts-d1-morn",
            name: "Day 1 Morning",
            date: "2026-12-01",
            startTime: "09:00",
            endTime: "12:00",
            dayIndex: 1,
            slotIndexInDay: 1,
          },
          {
            id: "ts-d1-aftn",
            name: "Day 1 Afternoon",
            date: "2026-12-01",
            startTime: "14:00",
            endTime: "17:00",
            dayIndex: 1,
            slotIndexInDay: 2,
          },
        ],
        rooms: [
          {
            id: "hall-1",
            code: "LH-1",
            building: "Academic",
            capacity: 40,
            isAccessible: true,
          },
        ],
        weights: {
          consecutiveExamsPenalty: 10,
          twoExamsSameDayPenalty: 25,
        },
      };

      const res = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-dec-2026",
          snapshot,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.runId);

      const { candidate, validation } = data.data;
      assert.ok(
        candidate.status === SolverStatus.OPTIMAL ||
        candidate.status === SolverStatus.FEASIBLE
      );
      assert.equal(candidate.assignments.length, 2);
      assert.equal(validation.isValid, true);
      assert.equal(validation.hardViolations.length, 0);

      // Ensure student-2's exams are scheduled in different slots
      const csSlot = candidate.assignments.find((a: any) => a.examId === "exam-cs101")?.timeSlotId;
      const maSlot = candidate.assignments.find((a: any) => a.examId === "exam-ma101")?.timeSlotId;
      assert.notEqual(csSlot, maSlot, "Exams sharing student-2 must be separated into distinct time slots");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should explicitly identify and safely report INFEASIBLE when hard constraints cannot be satisfied", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const infeasibleSnapshot = {
        snapshotVersion: 1,
        examCycleId: "cycle-infeasible-test",
        createdAt: new Date().toISOString(),
        exams: [
          {
            id: "e-1",
            code: "EX1",
            title: "Exam 1",
            durationMinutes: 180,
            enrolledStudents: ["alice"],
            requiredFeatures: [],
          },
          {
            id: "e-2",
            code: "EX2",
            title: "Exam 2",
            durationMinutes: 180,
            enrolledStudents: ["alice"],
            requiredFeatures: [],
          },
        ],
        timeSlots: [
          {
            id: "ts-only",
            name: "Single Time Slot",
            date: "2026-12-01",
            startTime: "09:00",
            endTime: "12:00",
            dayIndex: 1,
            slotIndexInDay: 1,
          },
        ],
        rooms: [
          {
            id: "hall-1",
            code: "LH-1",
            building: "Academic",
            capacity: 50,
            isAccessible: true,
          },
        ],
      };

      const res = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-infeasible-test",
          snapshot: infeasibleSnapshot,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.candidate.status, SolverStatus.INFEASIBLE);
      assert.equal(data.data.validation.isValid, false);
      assert.ok(data.data.candidate.diagnostics.length > 0);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should retrieve run details via GET /api/v1/schedules/runs/:runId", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // Trigger run first
      const triggerRes = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({ examCycleId: "cycle-fetch-test" }),
      });

      const triggerData = await triggerRes.json();
      const runId = triggerData.data.runId;

      const fetchRes = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${coordinatorToken}`,
        },
      });

      assert.equal(fetchRes.status, 200);
      const fetchBody = await fetchRes.json();
      assert.equal(fetchBody.success, true);
      assert.equal(fetchBody.data.id, runId);
      assert.equal(fetchBody.data.examCycleId, "cycle-fetch-test");
      assert.ok(fetchBody.data.diagnostics);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
