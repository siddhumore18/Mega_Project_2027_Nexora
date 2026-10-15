import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";
import { UserRole } from "@nexora/contracts";

describe("Phase 12: Analytical Reports, Auditing & Usability Feeds", () => {
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
    name: "Aarav Sharma",
    role: UserRole.STUDENT,
  });

  it("should return reconciled room capacity utilization report with valid aggregates", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/reports/room-utilization?examCycleId=cycle-autumn-2026`, {
        headers: { Authorization: `Bearer ${coordinatorToken}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.totalExaminationHalls, 3);
      assert.equal(data.data.aggregateCapacity, 340);
      assert.equal(data.data.totalSeatsUsed, 685);
      assert.ok(Array.isArray(data.data.rooms));
      assert.equal(data.data.rooms[0].roomCode, "Hall A-101");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should return equitable faculty invigilation workload report", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/reports/faculty-workload?examCycleId=cycle-autumn-2026`, {
        headers: { Authorization: `Bearer ${coordinatorToken}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.totalFacultyDeployed, 3);
      assert.equal(data.data.totalDutySessions, 6);
      assert.equal(data.data.averageDutiesPerFaculty, 2);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject student attempting to access faculty workload reports with 403 Forbidden", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/reports/faculty-workload`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "FORBIDDEN");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should export master examination timetable in tabular CSV format for institutional publishing", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/reports/timetable/export-csv?examCycleId=cycle-autumn-2026`, {
        headers: { Authorization: `Bearer ${coordinatorToken}` },
      });

      assert.equal(res.status, 200);
      assert.ok(res.headers.get("content-type")?.includes("text/csv"));
      const csv = await res.text();
      assert.ok(csv.startsWith("Paper Code,Subject Title,Department,Date,Time Slot,Exam Hall,Building"));
      assert.ok(csv.includes('"CS701","Distributed Systems & Cloud Computing"'));
      assert.ok(csv.includes('"Hall A-101"'));
      assert.ok(csv.includes('"Dr. A. Sharma"'));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
