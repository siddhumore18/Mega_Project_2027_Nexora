import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";
import { UserRole } from "@nexora/contracts";
import { SeatingService } from "../src/services/seating.service.js";

describe("Phase 9: Room & Seating Allocation Engine", () => {
  const app = createApp();

  const coordinatorToken = signToken({
    userId: "coord-1",
    email: "coordinator@nexora.edu",
    name: "Dr. Elena Vance",
    role: UserRole.EXAM_COORDINATOR,
  });

  const student1Token = signToken({
    userId: "stu-1",
    email: "student1@nexora.edu",
    name: "Aarav Sharma",
    role: UserRole.STUDENT,
  });

  beforeEach(() => {
    SeatingService.clearStore();
  });

  it("should successfully allocate sequential seats within room capacity", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/seating/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          scheduledExamId: "exam-cs701-session1",
          roomId: "room-lh101",
          roomCode: "LH-101",
          capacity: 30,
          seatsPerRow: 10,
          students: [
            { studentId: "stu-1", studentName: "Aarav Sharma", rollNumber: "CS2023-001", examOfferingId: "off-cs701" },
            { studentId: "stu-2", studentName: "Neha Patel", rollNumber: "CS2023-002", examOfferingId: "off-cs701" },
            { studentId: "stu-3", studentName: "Rohan Verma", rollNumber: "CS2023-003", examOfferingId: "off-cs701" },
          ],
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.allocatedCount, 3);
      assert.equal(data.data.capacity, 30);
      assert.equal(data.data.utilizationPercentage, 10);

      // Verify distinct seat labels assigned
      const labels = data.data.allocations.map((a: any) => a.seatLabel);
      assert.deepEqual(labels, ["A-01", "A-02", "A-03"]);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject seating allocation when student count strictly exceeds room capacity", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/seating/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          scheduledExamId: "exam-overflow",
          roomId: "room-small",
          roomCode: "SEM-01",
          capacity: 2, // capacity is only 2
          students: [
            { studentId: "s-1", rollNumber: "CS-01", examOfferingId: "off-1" },
            { studentId: "s-2", rollNumber: "CS-02", examOfferingId: "off-1" },
            { studentId: "s-3", rollNumber: "CS-03", examOfferingId: "off-1" }, // 3 students!
          ],
        }),
      });

      assert.equal(res.status, 422);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "ROOM_CAPACITY_EXCEEDED");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject duplicate student assignment in the same exam session", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/seating/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          scheduledExamId: "exam-dup",
          roomId: "room-lh",
          roomCode: "LH-1",
          capacity: 20,
          students: [
            { studentId: "s-1", rollNumber: "CS-01", examOfferingId: "off-1" },
            { studentId: "s-1", rollNumber: "CS-01", examOfferingId: "off-1" }, // Duplicate!
          ],
        }),
      });

      assert.equal(res.status, 422);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "DUPLICATE_STUDENT_ALLOCATION");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should permit students to look up their assigned room and seat label", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // 1. Coordinator allocates
      await fetch(`http://127.0.0.1:${port}/api/v1/seating/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          scheduledExamId: "exam-session-lookup",
          roomId: "room-lh201",
          roomCode: "LH-201",
          capacity: 40,
          students: [
            { studentId: "stu-1", studentName: "Aarav Sharma", rollNumber: "CS2023-001", examOfferingId: "off-cs701" },
          ],
        }),
      });

      // 2. Student queries /my-seats
      const lookupRes = await fetch(`http://127.0.0.1:${port}/api/v1/seating/my-seats`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      assert.equal(lookupRes.status, 200);
      const data = await lookupRes.json();
      assert.equal(data.success, true);
      assert.equal(data.data.length, 1);
      assert.equal(data.data[0].studentId, "stu-1");
      assert.equal(data.data[0].roomCode, "LH-201");
      assert.equal(data.data[0].seatLabel, "A-01");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should export CSV door posting roster with valid headers and data", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      await fetch(`http://127.0.0.1:${port}/api/v1/seating/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          scheduledExamId: "exam-csv-test",
          roomId: "room-lh301",
          roomCode: "LH-301",
          capacity: 20,
          students: [
            { studentId: "stu-1", studentName: "Aarav Sharma", rollNumber: "CS2023-001", examOfferingId: "off-cs701" },
          ],
        }),
      });

      const exportRes = await fetch(
        `http://127.0.0.1:${port}/api/v1/seating/scheduled-exams/exam-csv-test/export`,
        {
          headers: { Authorization: `Bearer ${coordinatorToken}` },
        }
      );

      assert.equal(exportRes.status, 200);
      assert.ok(exportRes.headers.get("content-type")?.includes("text/csv"));
      const csv = await exportRes.text();
      assert.ok(csv.startsWith("Seat Label,Roll Number,Student Name,Room"));
      assert.ok(csv.includes('"A-01","CS2023-001","Aarav Sharma","LH-301"'));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
