# Open Decisions, Risks, and Corrections

## Important corrections / gaps in the synopsis
1. **Role inconsistency:** the architecture mentions student/faculty/admin, while the SRS also includes HOD and Examination Coordinator. Agree on canonical roles and exact permissions.
2. **Redis is listed without a defined responsibility:** use it only if needed for a job queue, caching, rate limiting, or ephemeral coordination. PostgreSQL remains the source of truth.
3. **“Intelligent” / “AI” terminology:** OR-Tools constraint optimization is optimization, not necessarily machine learning. Describe the actual approach accurately.
4. **Eligibility policy is underspecified:** backlog rules, attempt limits, registration rules, and edge cases must come from institution policy, not developer assumptions.
5. **Scheduling constraints need formal definitions:** hard vs soft, objective weights, tie-breaking, time-slot boundaries, room rules, faculty duty limits, and infeasibility reporting.
6. **Schedule publication/versioning is missing at data-model level:** a published timetable should be immutable; rescheduling should create a new version with impact analysis.
7. **No clear async job lifecycle:** optimization may take time. Define queued/running/feasible/optimal/infeasible/unknown/failed statuses and retry behavior.
8. **Independent validation is essential:** do not trust the optimizer output alone; validate hard constraints in the API/domain layer before approval and publication.
9. **Security design is too high-level:** define token/session storage, refresh/revocation, CSRF where applicable, rate limits, scoped authorization, audit events, secrets, and data retention.
10. **Data import and quality are missing:** institutional records will likely contain duplicates, missing IDs, stale subject mappings, and inconsistent formats. Validate imports and provide a rejection report.
11. **Notifications need delivery semantics:** decide channels (in-app/email/SMS), retries, deduplication, and whether notifications are sent only after publication.
12. **Performance targets are vague:** define dataset size and measurable response/solver targets before claiming scalability.
13. **Testing is not sufficiently specified:** add unit, integration, optimizer, E2E, security, and performance tests with synthetic fixtures.
14. **Deployment needs operational detail:** environments, database migrations, backups, restore drills, logs, health checks, monitoring, and rollback.
15. **References require verification:** confirm cited papers, dates, bibliographic metadata, and official OR-Tools documentation before academic submission.

## Decisions Resolved with Exam Cell & Institutional Practice (October 2026)
- **Canonical Roles & Governance Boundaries:**
  1. `ADMIN`: Institutional system admin. Manages user provisioning (authorized to create and manage accounts for **Students**, **Faculty**, **Departmental Coordinators**, and **Exam Coordinators**). Supervises institutional health statistics, room capacity utilization, system policies, and immutable audit logs. *Admin does not approve, publish, or download examination timetables.*
  2. `EXAM_COORDINATOR`: Chief Controller of Examinations. **Sole institutional authority** to configure examination cycles, manage holiday calendars and study preparation recesses, run the CP-SAT optimization solver, formally verify, **approve**, **publish**, and **download/print** the official Autonomous Examination Circular PDF.
  3. `DEPARTMENTAL_COORDINATOR`: Faculty member designated for their academic department (CSE, CVL, MECH, ELE, ETC, etc.) — registers & manages department faculty, students across all undergraduate tiers (F.Y., S.Y., T.Y., Final Year), course syllabi with curriculum structures (**NEP**, **CYCLE 1**, **CYCLE 2**, **CYCLE 3**), and backlog student registrations.
  4. `HOD`: Department Head — reviews department course syllabi and verifies equitable faculty invigilation assignments.
  5. `FACULTY`: Faculty member / invigilator — reviews individual invigilation duties, assigned examination halls, and logs unavailability.
  6. `STUDENT`: Candidate — views personalized multi-year/backlog exam schedule, hall ticket, seating hall, and desk allocations.

- **Exam Structure & Multi-Year/Cycle Support:**
  - Years: First Year (`F.Y.B.TECH`), Second Year (`S.Y.B.TECH`), Third Year (`T.Y.B.TECH`), Final Year (`FINAL YR B.TECH`).
  - Curriculum Structures: `NEP` (Regular curriculum) alongside `CYCLE 1`, `CYCLE 2`, `CYCLE 3` (autonomous backlog curriculums).
  - Daily Slots:
    - Morning (`M`): 10:00 AM – 11:30 AM (F.Y. & S.Y. in separate designated halls)
    - Afternoon (`A`): 12:30 PM – 02:00 PM (T.Y.)
    - Evening (`E`): 03:00 PM – 04:30 PM (Final Year)

- **Backlog No-Collision Hard Constraint (Strict H6):**
  - **No student can have more than one examination on the same calendar day.**
  - If a 2nd-year student is registered for a 1st-year backlog in Cycle 1/2/3, the solver strictly forbids scheduling both exams on the same calendar date, preventing fatigue and exam clashes.

- **Holiday & Recess Handling (Hard Constraint H7):**
  - Academic calendar pre-populates official gazetted and institutional holidays (Sundays + festival/national holidays + study recesses).
  - Exam Coordinator can sync the official academic calendar or add local holidays.
  - The scheduling engine strictly excludes all holiday dates from generated exam dates.

- **Timetable Approval, Publication & Circular PDF Generation (Sole Authority: Exam Coordinator):**
  - Timetable verification, locking, formal approval, publication, and circular generation are performed exclusively by the Examination Coordinator.
  - Complete digital replica of institutional exam circular (KIT College of Engineering Autonomous format).
  - Includes college header logo, circular metadata, Date, Day, Year, Programme, Structure (NEP/Cycle), Time, M/A/E, Sem, Course Code, Course Name.
  - Includes 9 standardized student examination instructions and 5 administrative signatory blocks (Dy. Registrars Pre/On/Post Exam, Dean Examinations, Director).
  - Provides in-app interactive printable circular preview with one-click browser print-to-PDF, plus direct PDF/CSV downloads.

## Risk register
| Risk | Impact | Mitigation |
|---|---|---|
| Incorrect policy assumptions | Invalid eligibility/schedules | Sign-off by exam-cell owner; version rules |
| Solver infeasibility | No schedule can be produced | Diagnostics, relaxable soft constraints, input checks |
| Poor source data | Incorrect allocation | Import validation and reconciliation reports |
| Authorization bug | Exposure of student/faculty data | Default deny, scoped queries, automated negative tests |
| Last-minute changes | Confusing schedules | Immutable versions and impact analysis |
| Scope too large for 16 weeks | Incomplete product | MVP prioritization and phase exit gates |
| Unverified dependencies | Build failures/security issues | Pin versions, CI, dependency review |
