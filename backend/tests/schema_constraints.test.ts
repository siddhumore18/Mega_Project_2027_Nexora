import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Prisma Schema Constraint Verification", () => {
  const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  it("should enforce unique constraint on exam registrations (no duplicate student registrations)", () => {
    assert.ok(
      schemaContent.includes("@@unique([studentId, examOfferingId])"),
      "Schema must enforce @@unique([studentId, examOfferingId])"
    );
  });

  it("should enforce unique constraint on seat allocations per student and per seat label", () => {
    assert.ok(
      schemaContent.includes("@@unique([scheduledExamId, studentId])"),
      "Schema must prevent candidate seated multiple times in one exam"
    );
    assert.ok(
      schemaContent.includes("@@unique([scheduledExamId, roomId, seatLabel])"),
      "Schema must prevent double-booking the exact same desk in the same exam"
    );
  });

  it("should enforce unique constraint on invigilator assignments", () => {
    assert.ok(
      schemaContent.includes("@@unique([scheduledExamId, facultyId])"),
      "Schema must prevent assigning the same faculty twice to the same exam session"
    );
  });

  it("should enforce unique versioning per exam cycle", () => {
    assert.ok(
      schemaContent.includes("@@unique([examCycleId, versionNumber])"),
      "Schema must enforce sequential unique schedule versions per cycle"
    );
  });

  it("should enforce unique subject offering per term and semester", () => {
    assert.ok(
      schemaContent.includes("@@unique([subjectId, academicTermId, semester])"),
      "Schema must prevent duplicate subject offerings in same term and semester"
    );
  });
});
