import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { signToken } from "../src/utils/jwt.js";
import { UserRole } from "@nexora/contracts";
import { MasterDataService } from "../src/services/master-data.service.js";

describe("Academic Master Data Management (Faculty, Students, Blocks/Rooms, Subjects)", () => {
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
    MasterDataService.resetStore();
  });

  // ==========================================
  // 1. FACULTY / TEACHER TESTS
  // ==========================================

  it("should list all faculty members", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/faculty`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.some((f: any) => f.employeeCode === "EMP-1082"));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should permit Coordinator to insert a new faculty member", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/faculty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          name: "Dr. Kavita Nair",
          email: "kavita.nair@nexora.edu",
          employeeCode: "EMP-2099",
          departmentCode: "CSE",
          designation: "Associate Professor",
          maxDutiesPerWeek: 4,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.name, "Dr. Kavita Nair");
      assert.equal(data.data.employeeCode, "EMP-2099");
      assert.equal(data.data.maxDutiesPerWeek, 4);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject student attempting to add faculty with 403 Forbidden", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/faculty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          name: "Hacker Teacher",
          email: "hack@nexora.edu",
          employeeCode: "EMP-HACK",
          departmentCode: "CSE",
        }),
      });

      assert.equal(res.status, 403);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject duplicate faculty employee code with 409 Conflict", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/faculty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          name: "Duplicate Sharma",
          email: "different.sharma@nexora.edu",
          employeeCode: "EMP-1082", // already exists!
          departmentCode: "CSE",
        }),
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.error.code, "DUPLICATE_EMPLOYEE_CODE");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ==========================================
  // 2. STUDENT TESTS
  // ==========================================

  it("should permit Coordinator to insert a new student record", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          name: "Siddhesh More",
          email: "siddhesh.more@nexora.edu",
          rollNumber: "CS2024-001",
          departmentCode: "CSE",
          currentSemester: 5,
          attendancePercentage: 92.5,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.rollNumber, "CS2024-001");
      assert.equal(data.data.attendancePercentage, 92.5);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject duplicate student roll number with 409 Conflict", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          name: "Aarav Clone",
          email: "aarav.clone@nexora.edu",
          rollNumber: "CS2023-042", // already exists!
          departmentCode: "CSE",
        }),
      });

      assert.equal(res.status, 409);
      const data = await res.json();
      assert.equal(data.error.code, "DUPLICATE_ROLL_NUMBER");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ==========================================
  // 3. ROOMS & BLOCKS TESTS
  // ==========================================

  it("should permit Coordinator to create a new examination hall / block", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          code: "AUD-01",
          building: "Central Auditorium Complex",
          floor: 1,
          capacity: 300,
          isAccessible: true,
          hasProjector: true,
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.code, "AUD-01");
      assert.equal(data.data.capacity, 300);
      assert.equal(data.data.building, "Central Auditorium Complex");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ==========================================
  // 4. SUBJECTS TESTS
  // ==========================================

  it("should permit Coordinator to create a new subject course", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${coordinatorToken}`,
        },
        body: JSON.stringify({
          code: "AI801",
          title: "Artificial Intelligence & Reinforcement Learning",
          credits: 4,
          departmentCode: "CSE",
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.code, "AI801");
      assert.equal(data.data.credits, 4);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
