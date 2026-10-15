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

## Decisions to resolve with the guide / exam cell
- What exactly makes a student eligible for a given exam?
- How are backlogs and repeat attempts represented?
- Are exam registrations student-driven, admin-driven, or imported?
- Are there fixed exam slots or can the solver choose arbitrary start times?
- Are multiple papers allowed in the same room/time under any circumstances?
- What room features and accessibility accommodations must be modeled?
- What are maximum invigilation duties per day and minimum rest intervals?
- Must the HOD approve department schedules?
- Which notification channels are available and approved?
- What data may be shown to each role, and for how long is it retained?
- What is the expected maximum scale (students, papers, rooms, faculty)?
- Is this a prototype for demonstration or intended for real institutional use?

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
