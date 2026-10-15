import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { UserRole } from "@nexora/contracts";
import { signToken } from "../src/utils/jwt.js";
import { ExamCycleStatus } from "@prisma/client";
import { clearInMemoryRegistrations } from "../src/services/registration.service.js";

describe("Phase 5: Examination Cycle & Registration Workflow", () => {
  const app = createApp();
  const coordToken = signToken({
    userId: "coord-1",
    email: "coordinator@nexora.edu",
    name: "Dr. Elena Vance",
    role: UserRole.EXAM_COORDINATOR,
  });

  beforeEach(() => {
    clearInMemoryRegistrations();
  });

  it("should list active exam cycles via GET /api/v1/exam-cycles", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/exam-cycles`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.some((c: any) => c.id === "cycle-autumn-2026"));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should permit valid state transition: REGISTRATION_OPEN -> SCHEDULING", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/exam-cycles/cycle-autumn-2026/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordToken}`,
        },
        body: JSON.stringify({ targetStatus: ExamCycleStatus.SCHEDULING }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.status, ExamCycleStatus.SCHEDULING);

      // Revert back to REGISTRATION_OPEN for subsequent tests
      await fetch(`http://127.0.0.1:${port}/api/v1/exam-cycles/cycle-autumn-2026/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordToken}`,
        },
        body: JSON.stringify({ targetStatus: ExamCycleStatus.REGISTRATION_OPEN }),
      });
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject invalid state transition: DRAFT -> PUBLISHED", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // First create a DRAFT cycle
      const createRes = await fetch(`http://127.0.0.1:${port}/api/v1/exam-cycles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordToken}`,
        },
        body: JSON.stringify({
          name: "Spring 2027",
          academicTermId: "term-spring-2027",
          registrationStart: "2027-01-01T00:00:00Z",
          registrationEnd: "2027-01-20T00:00:00Z",
        }),
      });

      const cycle = (await createRes.json()).data;

      // Attempt invalid transition directly to PUBLISHED
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/exam-cycles/${cycle.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordToken}`,
        },
        body: JSON.stringify({ targetStatus: ExamCycleStatus.PUBLISHED }),
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "INVALID_STATE_TRANSITION");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should successfully register an eligible student for an exam offering", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/v1/exam-cycles/offerings/offering-cs701/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: "s1",
            rollNumber: "CS2023-001",
            attendancePercentage: 88.0,
            backlogAttempt: 0,
          }),
        }
      );

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.studentId, "s1");
      assert.equal(data.data.status, "REGISTERED");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject duplicate registration for the same offering with 409 Conflict", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const payload = {
        studentId: "s2",
        rollNumber: "CS2023-002",
        attendancePercentage: 85.0,
        backlogAttempt: 0,
      };

      // 1. Initial registration
      await fetch(
        `http://127.0.0.1:${port}/api/v1/exam-cycles/offerings/offering-cs701/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // 2. Duplicate registration attempt
      const res = await fetch(
        `http://127.0.0.1:${port}/api/v1/exam-cycles/offerings/offering-cs701/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "DUPLICATE_REGISTRATION");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject registration for ineligible student (low attendance) with 403 Forbidden", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(
        `http://127.0.0.1:${port}/api/v1/exam-cycles/offerings/offering-cs701/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: "s3",
            rollNumber: "CS2023-003",
            attendancePercentage: 62.0, // Ineligible (<75%)
            backlogAttempt: 0,
          }),
        }
      );

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "STUDENT_INELIGIBLE");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should report eligible-but-unregistered students via registration-gaps endpoint", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // Register only 1 student out of the 4 eligible students in SAMPLE_ELIGIBLE_COHORT
      await fetch(
        `http://127.0.0.1:${port}/api/v1/exam-cycles/offerings/offering-cs701/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: "s1",
            rollNumber: "CS2023-001",
            attendancePercentage: 90.0,
          }),
        }
      );

      const res = await fetch(
        `http://127.0.0.1:${port}/api/v1/exam-cycles/cycle-autumn-2026/registration-gaps`,
        {
          headers: { Authorization: `Bearer ${coordToken}` },
        }
      );

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.totalEligibleStudents, 4);
      assert.equal(data.data.totalRegisteredStudents, 1);
      assert.equal(data.data.unregisteredCount, 3);
      assert.equal(data.data.gapPercentage, 75.0);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
