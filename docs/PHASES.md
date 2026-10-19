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

## Phase 4 — Academic data and eligibility (Completed)
**Deliverables:** academic catalog routes (`/api/v1/academic/departments`, `/rooms`, `/subjects`), explainable eligibility engine (`backend/src/services/eligibility.service.ts`), batch student import validation with error reconciliation (`backend/src/services/import.service.ts`), eligibility monitor tab in coordinator dashboard, automated test suite (`backend/tests/eligibility.test.ts`).
**Exit gate:** explainable eligibility rules and edge cases (medical concession, attendance shortage, backlog attempt limits, fee clearance) tested and verified. [PASSED]

## Phase 5 — Examination cycle and registration (Completed)
**Deliverables:** exam cycle state machine (`DRAFT` → `REGISTRATION_OPEN` → `SCHEDULING` → `PUBLISHED` → `ARCHIVED`), offering management, student registration workflow with duplicate rejection, registration gap tracking (`eligible-but-unregistered`), student registration UI, automated test suite (`backend/tests/exam_cycle.test.ts`).
**Exit gate:** duplicate registrations and invalid state transitions are rejected. [PASSED]

## Phase 6 — Scheduling problem model (Completed)
**Deliverables:** time-slot model, formal mathematical specification (`docs/CONSTRAINTS_CATALOGUE.md`), hard constraints (H1: Student collision, H2: Room double-booking, H3: Room capacity, H4: Mandatory exam coverage, H5: Invigilator overlap) and soft constraints (S1: Consecutive exams, S2: Multiple exams same day, S3: Room underutilization), independent Node-side schedule validator service (`backend/src/services/schedule-validator.service.ts`), shared Zod contracts (`packages/contracts/src/schedule.ts`), deterministic unit test fixtures (`backend/tests/schedule_constraints_model.test.ts`).
**Exit gate:** each constraint has an owner, definition, and automated test; independent validator strictly catches all hard conflicts and scores soft penalties. [PASSED]

## Phase 7 — OR-Tools optimization MVP (Completed)
**Deliverables:** enterprise Google OR-Tools CP-SAT scheduling engine (`optimizer/src/solver.py`), isolated Python runner with JSON IPC, dual-validation integration with independent Node validator (`backend/src/services/optimizer.service.ts`), schedule run REST endpoints (`/api/v1/schedules/runs`), diagnostics emission, coordinator workspace live solver trigger & diagnostics tab (`frontend/src/components/CoordinatorDashboard.tsx`), automated test suites (`backend/tests/schedule_optimizer.test.ts`, `optimizer/tests/test_full_solver.py`).
**Exit gate:** solver output passes independent Node-side validation; solver failure strictly cannot alter published data; explicit infeasibility handling with detailed conflict diagnostics. [PASSED]

## Phase 8 — Review, approval, and publication (Completed)
**Deliverables:** schedule version lifecycle (`DRAFT` → `REVIEW` → `APPROVED` → `PUBLISHED` → `ARCHIVED`), formal governance service (`backend/src/services/schedule-version.service.ts`), version comparison diff engine, publication endpoints (`/api/v1/schedules/versions/:versionId/publish`), immutable published timetable locks, coordinator review, approval & diff viewer UI (`frontend/src/components/CoordinatorDashboard.tsx`), automated test suite (`backend/tests/schedule_publication.test.ts`).
**Exit gate:** only validated, formally approved versions can be published; published versions are strictly immutable and archive predecessor versions. [PASSED]

## Phase 9 — Room and seating allocation (Completed)
**Deliverables:** room availability & capacity enforcement, automated sequential and spaced desk allocation engine (`backend/src/services/seating.service.ts`), duplicate student & seat collision prevention, CSV door posting chart export (`/api/v1/seating/scheduled-exams/:id/export`), student personal seat lookup portal (`/api/v1/seating/my-seats`), automated test suite (`backend/tests/seating_allocation.test.ts`).
**Exit gate:** physical room capacity and duplicate-allocation tests strictly pass on boundary cases. [PASSED]

## Phase 10 — Invigilator allocation (Completed)
**Deliverables:** faculty availability tracking, time-slot conflict-free allocation engine (`backend/src/services/invigilation.service.ts`), impartiality / conflict-of-interest enforcement, duty workload fairness balancing, faculty personal duty roster endpoint (`/api/v1/invigilation/my-duties`), automated test suite (`backend/tests/invigilation_allocation.test.ts`).
**Exit gate:** no overlapping or unavailable faculty assignment can be created or published. [PASSED]

## Phase 11 — Rescheduling and notifications (Completed)
**Deliverables:** rescheduling blast-radius impact analysis engine (`backend/src/services/rescheduling.service.ts`), student collision pre-detection in target slots, draft version governance without mutating original published schedules, deduplicated notification outbox queue, automated test suite (`backend/tests/rescheduling_notifications.test.ts`).
**Exit gate:** original published version remains strictly intact; only directly impacted recipients receive deduplicated notifications. [PASSED]

## Phase 12 — Reports and usability (Completed)
**Deliverables:** reconciled room capacity utilization reporting (`/api/v1/reports/room-utilization`), equitable faculty workload distribution reporting (`/api/v1/reports/faculty-workload`), Master Timetable institutional CSV export feed (`/api/v1/reports/timetable/export-csv`), role-scoped RBAC enforcement, WCAG AA compliant light theme design system, automated test suite (`backend/tests/reports_export.test.ts`).
**Exit gate:** report totals reconcile with source data and permissions are strictly enforced. [PASSED]

## Phase 13 — Hardening and release (Completed)
**Deliverables:** end-to-end integration and dual-validation test suite, high-density performance benchmark (50 exams, 1000 students verified in under 50ms, `backend/tests/performance_benchmark.test.ts`), strict input validation and corrupt data resilience, production Vite bundle build, 79 automated tests (72 Node + 7 Python) passing with 0 errors.
**Exit gate:** all phases validated, production build succeeds cleanly, release checklist verified. [PASSED]

## Master Data Management — Institutional Repository (Completed)
**Deliverables:** coordinator master data management for **Faculty / Teachers**, **Students**, **Examination Blocks & Halls**, and **Courses / Subjects** (`backend/src/services/master-data.service.ts`, `backend/src/controllers/academic.controller.ts`, `backend/src/routes/academic.routes.ts`), typed Zod contracts (`packages/contracts/src/academic.ts`), coordinator interface with live search and reactive validation forms (`frontend/src/components/MasterDataManager.tsx`), 8 integration tests (`backend/tests/master_data.test.ts`).
**Exit gate:** all 4 core academic entities support conflict-free CRUD with unique constraints, audit logging, and RBAC enforcement. [PASSED]

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
