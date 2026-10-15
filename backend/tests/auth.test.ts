import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { UserRole } from "@nexora/contracts";
import { signToken } from "../src/utils/jwt.js";
import { requireRole, requireDepartmentScope, authenticateToken } from "../src/middleware/auth.middleware.js";

describe("Phase 3: Authentication & Scoped Authorization", () => {
  const app = createApp();

  it("should fail login with invalid password", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "coordinator@nexora.edu",
          password: "wrong_password_123",
        }),
      });

      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "INVALID_CREDENTIALS");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should successfully login with valid demo credentials and return token", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "coordinator@nexora.edu",
          password: "nexora2026",
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.data.token);
      assert.equal(data.data.user.role, UserRole.EXAM_COORDINATOR);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject /me when Authorization header is absent", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "UNAUTHORIZED");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should reject /me when token is forged or invalid", async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, {
        headers: { Authorization: "Bearer forged.invalid.token" },
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "INVALID_TOKEN");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should return user profile on /me with valid token", async () => {
    const token = signToken({
      userId: "user-student-1",
      email: "student@nexora.edu",
      name: "Aarav Sharma",
      role: UserRole.STUDENT,
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.email, "student@nexora.edu");
      assert.equal(data.data.role, UserRole.STUDENT);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should return 403 Forbidden when Student attempts coordinator action", async () => {
    const studentToken = signToken({
      userId: "user-student-1",
      email: "student@nexora.edu",
      name: "Aarav Sharma",
      role: UserRole.STUDENT,
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/test/coordinator-only`, {
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

  it("should allow Coordinator on coordinator action", async () => {
    const coordToken = signToken({
      userId: "user-coord-1",
      email: "coord@nexora.edu",
      name: "Coordinator",
      role: UserRole.EXAM_COORDINATOR,
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/test/coordinator-only`, {
        headers: { Authorization: `Bearer ${coordToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should enforce department scope: reject HOD accessing another department", async () => {
    const cseHodToken = signToken({
      userId: "user-hod-cse",
      email: "hod.cse@nexora.edu",
      name: "HOD CSE",
      role: UserRole.HOD,
      departmentId: "dept-cse-1",
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      // Trying to access ECE department records
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/test/departments/dept-ece-2/records`, {
        headers: { Authorization: `Bearer ${cseHodToken}` },
      });
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, "FORBIDDEN_SCOPE");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should allow HOD accessing their own department records", async () => {
    const cseHodToken = signToken({
      userId: "user-hod-cse",
      email: "hod.cse@nexora.edu",
      name: "HOD CSE",
      role: UserRole.HOD,
      departmentId: "dept-cse-1",
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as { port: number };

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1/test/departments/dept-cse-1/records`, {
        headers: { Authorization: `Bearer ${cseHodToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.departmentId, "dept-cse-1");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
