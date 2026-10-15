import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../src/app.js";
import { evaluateStudentEligibility, DEFAULT_ELIGIBILITY_POLICY } from "../src/services/eligibility.service.js";
import { validateStudentBatch } from "../src/services/import.service.js";

describe("Phase 4: Academic Data & Eligibility Engine", () => {
  const app = createApp();

  describe("Explainable Eligibility Calculations", () => {
    it("should mark student eligible when all criteria are satisfied", () => {
      const result = evaluateStudentEligibility({
        studentId: "s1",
        rollNumber: "CS2023-001",
        subjectCode: "CS701",
        attendancePercentage: 84.5,
        backlogAttempt: 0,
        feeClearanceStatus: "CLEARED",
      });

      assert.equal(result.isEligible, true);
      assert.equal(result.reasonCodes.length, 0);
      assert.ok(result.reasons[0].includes("Fully eligible"));
    });

    it("should flag attendance shortage with explainable reason when < 75%", () => {
      const result = evaluateStudentEligibility({
        studentId: "s2",
        rollNumber: "CS2023-002",
        subjectCode: "CS701",
        attendancePercentage: 71.0,
        hasMedicalApproved: false,
        backlogAttempt: 0,
      });

      assert.equal(result.isEligible, false);
      assert.ok(result.reasonCodes.includes("ATTENDANCE_SHORTAGE"));
      assert.ok(result.reasons.some((r) => r.includes("71.0% is below the mandatory 75%")));
    });

    it("should permit medical concession when attendance is between 65% and 75%", () => {
      const result = evaluateStudentEligibility({
        studentId: "s3",
        rollNumber: "CS2023-003",
        subjectCode: "CS701",
        attendancePercentage: 68.0,
        hasMedicalApproved: true,
        backlogAttempt: 0,
      });

      assert.equal(result.isEligible, true);
      assert.equal(result.reasonCodes.length, 0);
      assert.ok(result.reasons.some((r) => r.includes("Medical Exemption")));
    });

    it("should reject student exceeding maximum allowed backlog attempts", () => {
      const result = evaluateStudentEligibility({
        studentId: "s4",
        rollNumber: "CS2023-004",
        subjectCode: "CS701",
        attendancePercentage: 80.0,
        backlogAttempt: 4, // Exceeds default policy max of 3
      });

      assert.equal(result.isEligible, false);
      assert.ok(result.reasonCodes.includes("MAX_ATTEMPTS_EXCEEDED"));
    });

    it("should block registration when fee clearance is blocked", () => {
      const result = evaluateStudentEligibility({
        studentId: "s5",
        rollNumber: "CS2023-005",
        subjectCode: "CS701",
        attendancePercentage: 90.0,
        backlogAttempt: 0,
        feeClearanceStatus: "BLOCKED",
      });

      assert.equal(result.isEligible, false);
      assert.ok(result.reasonCodes.includes("FEE_DUE_BLOCK"));
    });
  });

  describe("Batch Import Validation", () => {
    it("should detect duplicate roll numbers and format errors in batch", () => {
      const rawBatch = [
        { rollNumber: "CS101", name: "Alice", email: "alice@nexora.edu", programCode: "BTECH-CSE", currentSemester: 7 },
        { rollNumber: "CS102", name: "Bob", email: "bob@nexora.edu", programCode: "BTECH-CSE", currentSemester: 7 },
        { rollNumber: "CS101", name: "Duplicate Alice", email: "alice2@nexora.edu", programCode: "BTECH-CSE", currentSemester: 7 }, // Duplicate
        { rollNumber: "X", name: "", email: "not-an-email", programCode: "", currentSemester: 99 }, // Invalid
      ];

      const report = validateStudentBatch(rawBatch);
      assert.equal(report.validCount, 2);
      assert.equal(report.invalidCount, 2);
      assert.ok(report.errors.some((e) => e.error.includes("Duplicate roll number")));
    });
  });

  describe("Academic REST Endpoints", () => {
    it("should return list of departments via GET /api/v1/academic/departments", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as { port: number };

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/departments`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.ok(Array.isArray(data.data));
        assert.ok(data.data.length >= 3);
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it("should evaluate eligibility via POST /api/v1/academic/evaluate-eligibility", async () => {
      const server = http.createServer(app);
      await new Promise<void>((resolve) => server.listen(0, resolve));
      const { port } = server.address() as { port: number };

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/academic/evaluate-eligibility`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student: {
              studentId: "s10",
              rollNumber: "CS2023-010",
              subjectCode: "CS701",
              attendancePercentage: 88.0,
              backlogAttempt: 0,
            },
          }),
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.equal(data.data.isEligible, true);
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });
});
