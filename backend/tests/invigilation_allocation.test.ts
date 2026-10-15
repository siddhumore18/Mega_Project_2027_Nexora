import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";
import { UserRole } from "@nexora/contracts";
import { InvigilationService } from "../src/services/invigilation.service.js";

describe("Phase 10: Invigilator Allocation & Workload Governance", () => {
  const app = createApp();

  const coordinatorToken = signToken({
    userId: "coord-1",
    email: "coordinator@nexora.edu",
    name: "Dr. Elena Vance",
    role: UserRole.EXAM_COORDINATOR,
  });

  const faculty1Token = signToken({
    userId: "fac-1",
    email: "sharma@nexora.edu",
    name: "Dr. A. Sharma",
    role: UserRole.FACULTY,
  });

  const studentToken = signToken({
    userId: "stu-1",
    email: "student@nexora.edu",
    name: "Aarav Sharma",
    role: UserRole.STUDENT,
  });

  beforeEach(() => {
    InvigilationService.clearStore();
  });

  const sampleFaculty = [
    { id: "fac-1", name: "Dr. A. Sharma", email: "sharma@nexora.edu", departmentId: "dept-cse", departmentCode: "CSE" },
    { id: "fac-2", name: "Prof. R. Iyer", email: "iyer@nexora.edu", departmentId: "dept-ece", departmentCode: "ECE" },
    { id: "fac-3", name: "Dr. P. Kulkarni", email: "kulkarni@nexora.edu", departmentId: "dept-mech", departmentCode: "MECH" },
  ];

  it("should allocate conflict-free invigilators without time-slot collisions", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // 2 sessions in the EXACT SAME time slot (ts-d1-morn) across 2 halls
      const sessions = [
        {
          id: "session-cs701",
          examOfferingId: "off-cs701",
          subjectCode: "CS701",
          departmentId: "dept-cse",
          timeSlotId: "ts-d1-morn",
          timeSlotName: "Day 1 Morning",
          roomId: "room-lh1",
          roomCode: "LH-1",
          expectedStudents: 30,
        },
        {
          id: "session-ec702",
          examOfferingId: "off-ec702",
          subjectCode: "EC702",
          departmentId: "dept-ece",
          timeSlotId: "ts-d1-morn", // SAME time slot!
          timeSlotName: "Day 1 Morning",
          roomId: "room-lh2",
          roomCode: "LH-2",
          expectedStudents: 30,
        },
      ];

      const res = await fetch(`http://127.0.0.1:${port}/api/v1/invigilation/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-invig-test",
          facultyList: sampleFaculty,
          sessions,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.totalDutiesAllocated, 2);

      const assignedFacultyIds = data.data.assignments.map((a: any) => a.facultyId);
      // STRICT HARD RULE: Both halls in the same slot MUST have different faculty!
      assert.notEqual(
        assignedFacultyIds[0],
        assignedFacultyIds[1],
        "Faculty cannot be assigned to two halls in the same time slot"
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject allocation when available faculty count is less than simultaneous exam halls", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // 3 simultaneous halls, but only 2 faculty available!
      const limitedFaculty = [sampleFaculty[0], sampleFaculty[1]];
      const sessions = [
        {
          id: "sess-1",
          examOfferingId: "off-1",
          subjectCode: "SUB1",
          departmentId: "dept-cse",
          timeSlotId: "ts-only",
          timeSlotName: "Slot 1",
          roomId: "r-1",
          roomCode: "R1",
          expectedStudents: 30,
        },
        {
          id: "sess-2",
          examOfferingId: "off-2",
          subjectCode: "SUB2",
          departmentId: "dept-ece",
          timeSlotId: "ts-only",
          timeSlotName: "Slot 1",
          roomId: "r-2",
          roomCode: "R2",
          expectedStudents: 30,
        },
        {
          id: "sess-3",
          examOfferingId: "off-3",
          subjectCode: "SUB3",
          departmentId: "dept-mech",
          timeSlotId: "ts-only",
          timeSlotName: "Slot 1",
          roomId: "r-3",
          roomCode: "R3",
          expectedStudents: 30,
        },
      ];

      const res = await fetch(`http://127.0.0.1:${port}/api/v1/invigilation/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-shortage-test",
          facultyList: limitedFaculty,
          sessions,
        }),
      });

      assert.equal(res.status, 422);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "INVIGILATOR_SHORTAGE");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should permit faculty members to inspect their assigned invigilation duties", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // 1. Coordinator allocates duty to fac-1
      await fetch(`http://127.0.0.1:${port}/api/v1/invigilation/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-faculty-view",
          facultyList: sampleFaculty,
          sessions: [
            {
              id: "sess-test-fac",
              examOfferingId: "off-cs701",
              subjectCode: "CS701",
              departmentId: "dept-cse",
              timeSlotId: "ts-d1-morn",
              timeSlotName: "Nov 10, 2026 Morning",
              roomId: "room-lh1",
              roomCode: "Hall A-101",
              expectedStudents: 30,
            },
          ],
        }),
      });

      // 2. Faculty member queries /my-duties
      const dutiesRes = await fetch(`http://127.0.0.1:${port}/api/v1/invigilation/my-duties`, {
        headers: { Authorization: `Bearer ${faculty1Token}` },
      });

      assert.equal(dutiesRes.status, 200);
      const data = await dutiesRes.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
