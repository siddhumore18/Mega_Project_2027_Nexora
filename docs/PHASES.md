# Development Phases and Exit Gates

The synopsis proposes a 16-week plan. The phases below preserve its major modules but add explicit gates and risk controls. Calendar duration is a planning estimate; do not promise dates until team capacity and institutional rules are confirmed.

## Phase 0 — Discovery and decisions (Completed)
**Deliverables:** stakeholder questions (`docs/EXAM_CELL_QUESTIONS.md`), glossary (`docs/GLOSSARY.md`), agreed MVP, role/permission matrix, hard/soft constraint catalogue, success measures, risk register (`docs/DECISIONS_AND_RISKS.md`), decision log (`docs/DECISION_LOG.md`).
**Exit gate:** institution-specific rules are documented; unresolved policy decisions have owners. [PASSED]

## Phase 1 — Repository foundation (Completed)
**Deliverables:** repository structure (`apps/web`, `apps/api`, `services/optimizer`, `packages/contracts`), TypeScript/Python setup, npm workspaces scripts (`build`, `test`, `lint`), GitHub Actions CI (`.github/workflows/ci.yml`), environment examples (`.env.example`), Express health endpoints (`/health`, `/api/v1/health`), minimal light theme React client, OR-Tools solver prototype & pytest suite.
**Exit gate:** clean install, all checks pass, build and tests executed successfully. [PASSED]

## Phase 2 — Data model and database (Completed)
**Deliverables:** reviewed ERD (`docs/ERD.md`), Prisma schema (`backend/prisma/schema.prisma`), Prisma client singleton (`backend/src/db/prisma.ts`), synthetic seed data (`backend/prisma/seed.ts`), automated schema constraint verification tests (`backend/tests/schema_constraints.test.ts`).
**Exit gate:** Prisma schema validated, client generated, key foreign keys and composite unique constraints tested. [PASSED]

## Phase 3 — Authentication, authorization, and audit (Completed)
**Deliverables:** login/logout endpoints (`/api/v1/auth/login`, `/logout`, `/me`), JWT token issuance & verification (`backend/src/utils/jwt.ts`), password hashing (`backend/src/utils/password.ts`), role & department-scoped permission middleware (`backend/src/middleware/auth.middleware.ts`), audit events service (`backend/src/services/audit.service.ts`), frontend auth state synchronization & demo accounts (`frontend/src/services/auth.ts`).
**Exit gate:** positive and negative authorization tests pass for each role and department scope. [PASSED]

## Phase 4 — Academic data and eligibility
**Deliverables:** departments/programs/terms/subjects/students/faculty, import validation, configurable eligibility/backlog rules, explainable results.
**Exit gate:** edge cases are signed off by the domain owner; no undocumented eligibility assumptions.

## Phase 5 — Examination cycle and registration
**Deliverables:** exam cycle setup, offerings, registration windows, registration workflow, eligible-but-unregistered dashboard.
**Exit gate:** duplicate registrations and invalid state transitions are rejected.

## Phase 6 — Scheduling problem model
**Deliverables:** time-slot model, hard/soft constraints catalogue, optimizer input/output contracts, small fixture datasets.
**Exit gate:** each constraint has an owner, definition, and automated test.

## Phase 7 — OR-Tools optimization MVP
**Deliverables:** isolated Python service, asynchronous schedule runs, statuses/diagnostics, one feasible candidate and explicit infeasibility handling.
**Exit gate:** solver output passes independent Node-side validation; solver failure cannot change published data.

## Phase 8 — Review, approval, and publication
**Deliverables:** candidate comparison, warnings, approval workflow, immutable schedule versions, publication history.
**Exit gate:** only validated approved versions can be published.

## Phase 9 — Room and seating allocation
**Deliverables:** room availability, capacity checks, seat allocation strategy, duplicate-prevention constraints, seating-list export.
**Exit gate:** capacity and duplicate-allocation tests pass on boundary cases.

## Phase 10 — Invigilator allocation
**Deliverables:** availability, duty requirements, workload rules, conflict validation, duty roster.
**Exit gate:** no overlapping/unavailable assignment can be published.

## Phase 11 — Rescheduling and notifications
**Deliverables:** change request, draft version, impact analysis, alternative slots, notification outbox/retry and deduplication.
**Exit gate:** original published version remains intact; only impacted recipients are notified after publication.

## Phase 12 — Reports and usability
**Deliverables:** registration gaps, timetable exports, room utilization, workload reports, accessibility review.
**Exit gate:** report totals reconcile with source data and permissions are enforced.

## Phase 13 — Hardening and release
**Deliverables:** integration/E2E tests, performance benchmark, security review, backups/restore test, deployment, monitoring, user guide, demo dataset.
**Exit gate:** release checklist signed off; known limitations documented.

## Suggested 16-week mapping (adjust after Phase 0)
- Weeks 1–2: Phase 0–1
- Weeks 3–4: Phase 2
- Weeks 5–6: Phase 3
- Week 7: Phase 4
- Week 8: Phase 5
- Weeks 9–10: Phase 6–7
- Week 11: Phase 8
- Week 12: Phase 9
- Week 13: Phase 10
- Week 14: Phase 11–12
- Weeks 15–16: Phase 13

**Risk note:** this schedule is aggressive for a student team. Build a thin end-to-end vertical slice first, and reduce scope if the optimizer, institutional policy discovery, or data cleanup takes longer than expected.
