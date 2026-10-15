# UI Workflows and Screen Inventory

## Shared
- Login / session-expired screen.
- Profile and sign-out.
- Notifications center.
- Consistent empty, loading, success, validation, and error states.

## Examination Coordinator
1. Dashboard: upcoming exam cycles, registration gaps, schedule run status, unresolved conflicts.
2. Academic data: students, subjects, cohorts, faculty, rooms, imports.
3. Exam cycle wizard: dates, subjects/offers, duration, candidate slots, policy version.
4. Eligibility and registration monitor: eligible, ineligible with reasons, pending registration, invalid records.
5. Scheduling workspace: input readiness, hard/soft constraints, run progress, solver status, diagnostics.
6. Candidate review: timetable grid, conflict warnings, room/faculty summary, compare candidates.
7. Approval and publication: checklist, approver, version history, publish confirmation.
8. Allocation: room plan, seat list, invigilator roster.
9. Rescheduling: change reason, affected exams/users/resources, proposed alternatives, review and publish.
10. Reports: registration gaps, utilization, workload, export history.

## Student
- Eligibility by subject/exam cycle, with clear reason and last-updated timestamp.
- Registration status and deadline.
- Published personal timetable only; show version/publication time.
- Exam details and permitted room/seat details.

## Faculty / Invigilator
- Availability submission/editing subject to policy.
- Assigned duties, date/time/room, acknowledgement if required.
- Personal schedule and notification history.

## HOD
- Department-scoped student/subject overview.
- Department schedule review and approval if policy requires it.
- Department-level reports.

## UX requirements
- Never show a draft schedule as official; label statuses clearly.
- Warnings must explain what is wrong and how to resolve it.
- Do not use color alone to communicate status.
- Provide a table/list alternative to timetable grids for accessibility.
- Confirm destructive or official actions such as publication.
- Show timestamps in institution-local time and include timezone context where ambiguity exists.
