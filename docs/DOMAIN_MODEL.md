# Domain Model and Data Design

Treat this as an initial logical model. Confirm the institution's actual academic rules before finalizing the physical schema.

## Suggested entities
- `User`: id, email/username, passwordHash or identity-provider subject, status, createdAt.
- `Role` / `UserRole`: role definitions and assignments; consider scoped role assignments by department.
- `Department`: id, code, name.
- `Program`: id, departmentId, code, name.
- `AcademicTerm`: id, name, startDate, endDate, status.
- `Semester` / `Division`: program/term-specific grouping, depending on the institution's structure.
- `Student`: id, userId (optional), institutionalRollNumber, programId, currentTermId, status.
- `Faculty`: id, userId, employeeCode, departmentId, status.
- `Subject`: id, code, title, credits, owning department.
- `SubjectOffering`: subject + term + semester/division + faculty where applicable.
- `StudentSubjectRecord`: student, subject offering, result/status, attempt number, backlog/eligibility inputs.
- `ExamCycle`: id, academicTermId, name, registration window, status.
- `ExamPaper` / `ExamOffering`: cycle, subject offering, duration, allowed cohorts, required resources.
- `ExamRegistration`: student, exam offering, status, registeredAt; unique constraint per relevant student/offering.
- `Room`: id, code, capacity, features, active status.
- `RoomAvailability`: room, time interval, reason/status.
- `FacultyAvailability`: faculty, time interval, availability status.
- `ScheduleRun`: id, inputSnapshotVersion, solverVersion/config, status, startedAt, finishedAt, diagnostics.
- `ScheduleVersion`: id, examCycleId, versionNumber, status (DRAFT/REVIEW/APPROVED/PUBLISHED/ARCHIVED), createdBy, approvedBy, publishedAt.
- `ScheduledExam`: scheduleVersionId, examOfferingId, startAt, endAt, room/session assignment.
- `SeatAllocation`: scheduledExamId, studentId, roomId, seatLabel; unique rules prevent duplicate assignment.
- `InvigilatorAssignment`: scheduledExamId/sessionId, facultyId, assignment role.
- `Notification`: recipient, event type, payload reference, delivery status, idempotency key.
- `AuditLog`: actor, action, entity type/id, timestamp, request/correlation id, safe metadata.
- `EligibilityEvaluation`: student, exam offering, result, reason codes, evaluatedAt, rule version.

## Important design rules
- Use stable generated IDs; roll numbers and subject codes can change and should not be primary keys.
- Add foreign keys and appropriate unique constraints.
- Model time intervals consistently and detect overlaps with a defined interval convention (typically `[start, end)`).
- Store institution timezone in configuration; persist timestamps in UTC and convert at boundaries.
- Do not store an eligibility result without enough information to explain it.
- Preserve schedule input snapshots and solver diagnostics to reproduce decisions.
- Decide whether room assignment is per exam, per session, or per cohort; avoid ambiguous schema.
- Avoid storing sensitive personal details that the workflow does not need.
- Database transactions and constraints are the final integrity boundary; UI checks are not enough.

## Decisions required before final migration
1. Exact academic hierarchy and semester/division model.
2. Whether one subject can have multiple exam offerings in a cycle.
3. Rules for backlog attempts and eligibility.
4. Whether students choose subjects or registrations are imported.
5. Seating strategy: contiguous seats, randomized seats, cohort separation, accommodations.
6. Invigilator rules: qualifications, max duties/day, rest interval, department restrictions.
7. Whether rooms can host multiple separate exams in the same time interval (usually no).
8. Approval workflow and audit retention.
