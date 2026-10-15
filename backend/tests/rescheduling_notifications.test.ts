import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";
import { UserRole } from "@nexora/contracts";
import { ReschedulingService } from "../src/services/rescheduling.service.js";

describe("Phase 11: Rescheduling Impact Analysis & Notification Outbox", () => {
  const app = createApp();

  const coordinatorToken = signToken({
    userId: "coord-1",
    email: "coordinator@nexora.edu",
    name: "Dr. Elena Vance",
    role: UserRole.EXAM_COORDINATOR,
  });

  beforeEach(() => {
    ReschedulingService.clearOutbox();
  });

  it("should detect student conflicts and recommend BLOCKED_BY_CONFLICT when target slot creates overlap", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // Alice is enrolled in CS701 (being rescheduled from slot-1 to slot-2)
      // and Alice ALREADY has MA101 in slot-2!
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/rescheduling/impact-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examOfferingId: "off-cs701",
          examCode: "CS701",
          subjectTitle: "Distributed Systems",
          currentTimeSlot: "ts-slot-1",
          targetTimeSlot: "ts-slot-2",
          targetRoom: "room-lh101",
          enrolledStudents: [
            {
              studentId: "student-alice",
              otherEnrolledExams: [
                { examId: "off-ma101", examCode: "MA101", timeSlotId: "ts-slot-2" }, // CLASH in target slot!
              ],
            },
          ],
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.conflictDetected, true);
      assert.equal(data.data.recommendation, "BLOCKED_BY_CONFLICT");
      assert.equal(data.data.conflicts.length, 1);
      assert.equal(data.data.conflicts[0].studentId, "student-alice");
      assert.equal(data.data.conflicts[0].conflictingExamCode, "MA101");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should approve FEASIBLE recommendation when target slot is conflict-free", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/rescheduling/impact-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examOfferingId: "off-cs701",
          examCode: "CS701",
          currentTimeSlot: "ts-slot-1",
          targetTimeSlot: "ts-slot-3", // Conflict free slot!
          targetRoom: "room-lh101",
          enrolledStudents: [
            {
              studentId: "student-bob",
              otherEnrolledExams: [
                { examId: "off-ma101", examCode: "MA101", timeSlotId: "ts-slot-2" },
              ],
            },
          ],
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.conflictDetected, false);
      assert.equal(data.data.recommendation, "FEASIBLE");
      assert.equal(data.data.conflicts.length, 0);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should queue notifications and strictly deduplicate redundant alerts", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const payload = {
        examOfferingId: "off-cs701",
        examCode: "CS701",
        oldSlot: "Nov 10 Morning",
        newSlot: "Nov 11 Morning",
        newRoom: "Hall A-101",
        recipients: [
          { recipientId: "stu-1", recipientType: "STUDENT", recipientEmail: "stu1@nexora.edu" },
          { recipientId: "stu-2", recipientType: "STUDENT", recipientEmail: "stu2@nexora.edu" },
          { recipientId: "fac-1", recipientType: "FACULTY", recipientEmail: "fac1@nexora.edu" },
        ],
      };

      // 1. Initial notification dispatch
      const res1 = await fetch(`http://127.0.0.1:${port}/api/v1/rescheduling/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify(payload),
      });

      assert.equal(res1.status, 201);
      const data1 = await res1.json();
      assert.equal(data1.data.queuedCount, 3);
      assert.equal(data1.data.duplicateSkippedCount, 0);

      // 2. Duplicate dispatch attempt with identical recipients and newSlot
      const res2 = await fetch(`http://127.0.0.1:${port}/api/v1/rescheduling/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify(payload),
      });

      assert.equal(res2.status, 201);
      const data2 = await res2.json();
      assert.equal(data2.data.queuedCount, 0);
      assert.equal(data2.data.duplicateSkippedCount, 3); // All 3 skipped as duplicates!

      // 3. Inspect outbox queue
      const outboxRes = await fetch(
        `http://127.0.0.1:${port}/api/v1/rescheduling/notifications/outbox`,
        {
          headers: { Authorization: `Bearer ${coordinatorToken}` },
        }
      );
      assert.equal(outboxRes.status, 200);
      const outbox = await outboxRes.json();
      assert.equal(outbox.data.length, 3);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
