import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";
import { UserRole, ScheduleVersionStatus } from "@nexora/contracts";
import { ScheduleVersionService } from "../src/services/schedule-version.service.js";

describe("Phase 8: Review, Approval & Immutable Timetable Publication", () => {
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

  beforeEach(() => {
    ScheduleVersionService.clearStore();
  });

  async function triggerFeasibleRun(port: number): Promise<string> {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${coordinatorToken}`,
      },
      body: JSON.stringify({
        examCycleId: "cycle-phase8-test",
        snapshot: {
          snapshotVersion: 1,
          examCycleId: "cycle-phase8-test",
          createdAt: new Date().toISOString(),
          exams: [
            {
              id: "exam-cs701",
              code: "CS701",
              title: "Distributed Systems",
              durationMinutes: 180,
              enrolledStudents: ["student-1", "student-2"],
              requiredFeatures: [],
            },
            {
              id: "exam-ec702",
              code: "EC702",
              title: "VLSI Architecture",
              durationMinutes: 180,
              enrolledStudents: ["student-3", "student-4"],
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
              building: "Block A",
              capacity: 50,
              isAccessible: true,
            },
          ],
        },
      }),
    });

    const body = await res.json();
    return body.data.runId;
  }

  it("should create a DRAFT schedule version (v1) from a feasible optimization run", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const runId = await triggerFeasibleRun(port);

      const createRes = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-phase8-test",
          scheduleRunId: runId,
        }),
      });

      assert.equal(createRes.status, 201);
      const data = await createRes.json();
      assert.equal(data.success, true);
      assert.equal(data.data.versionNumber, 1);
      assert.equal(data.data.status, ScheduleVersionStatus.DRAFT);
      assert.equal(data.data.scheduledExamsCount, 2);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject publishing a schedule version that is still in DRAFT or REVIEW status (Exit Gate Enforced)", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const runId = await triggerFeasibleRun(port);

      // Create draft version
      const createRes = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-phase8-test",
          scheduleRunId: runId,
        }),
      });
      const version = (await createRes.json()).data;

      // Attempt to publish draft version directly
      const publishRes = await fetch(
        `http://127.0.0.1:${port}/api/v1/schedules/versions/${version.id}/publish`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${coordinatorToken}` },
        }
      );

      assert.equal(publishRes.status, 409);
      const publishData = await publishRes.json();
      assert.equal(publishData.success, false);
      assert.equal(publishData.error.code, "VERSION_NOT_APPROVED");
      assert.ok(publishData.error.message.includes("Gate check failed"));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should support complete review -> approval -> immutable publication lifecycle", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const runId = await triggerFeasibleRun(port);

      // 1. Create Draft
      const createRes = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-phase8-test",
          scheduleRunId: runId,
        }),
      });
      const version = (await createRes.json()).data;

      // 2. Submit for Review
      const reviewRes = await fetch(
        `http://127.0.0.1:${port}/api/v1/schedules/versions/${version.id}/submit-review`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${coordinatorToken}` },
        }
      );
      assert.equal(reviewRes.status, 200);
      assert.equal((await reviewRes.json()).data.status, ScheduleVersionStatus.REVIEW);

      // 3. Formally Approve
      const approveRes = await fetch(
        `http://127.0.0.1:${port}/api/v1/schedules/versions/${version.id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${coordinatorToken}` },
        }
      );
      assert.equal(approveRes.status, 200);
      const approvedData = await approveRes.json();
      assert.equal(approvedData.data.status, ScheduleVersionStatus.APPROVED);
      assert.equal(approvedData.data.approvedBy, "coord-1");

      // 4. Publish Approved Version
      const publishRes = await fetch(
        `http://127.0.0.1:${port}/api/v1/schedules/versions/${version.id}/publish`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${coordinatorToken}` },
        }
      );
      assert.equal(publishRes.status, 200);
      const publishedData = await publishRes.json();
      assert.equal(publishedData.data.status, ScheduleVersionStatus.PUBLISHED);
      assert.ok(publishedData.data.publishedAt);

      // 5. Test Immutability: attempting to publish again or mutate status is strictly rejected
      const rePublishRes = await fetch(
        `http://127.0.0.1:${port}/api/v1/schedules/versions/${version.id}/publish`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${coordinatorToken}` },
        }
      );
      assert.equal(rePublishRes.status, 409);
      assert.equal((await rePublishRes.json()).error.code, "ALREADY_PUBLISHED");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should accurately compute diffs when comparing two schedule versions", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const runId = await triggerFeasibleRun(port);

      // Create v1
      const res1 = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-phase8-test",
          scheduleRunId: runId,
        }),
      });
      const v1 = (await res1.json()).data;

      // Create v2
      const res2 = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          examCycleId: "cycle-phase8-test",
          scheduleRunId: runId,
        }),
      });
      const v2 = (await res2.json()).data;

      // Manually shift one exam slot in v2 memory to simulate an adjustment
      const v2Details = await ScheduleVersionService.getVersionDetails(v2.id);
      if (v2Details && v2Details.exams.length > 0) {
        v2Details.exams[0].timeSlotId = "ts-d2-morn";
      }

      // Compare v1 and v2
      const compareRes = await fetch(`http://127.0.0.1:${port}/api/v1/schedules/versions/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          versionIdA: v1.id,
          versionIdB: v2.id,
        }),
      });

      assert.equal(compareRes.status, 200);
      const compData = await compareRes.json();
      assert.equal(compData.success, true);
      assert.equal(compData.data.changedCount, 1);
      const moved = compData.data.differences.find((d: any) => d.changeType === "SLOT_CHANGED");
      assert.ok(moved, "Expected a SLOT_CHANGED difference item");
      assert.equal(moved.versionB.timeSlotId, "ts-d2-morn");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
