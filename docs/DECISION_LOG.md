# Architectural & Design Decision Log

## Decision 001: UI Theme — Light & Minimalist
- **Date**: 2026-10-15
- **Status**: Approved
- **Context**: The user specified that the system UI must maintain a clean, high-contrast, minimalist Light Theme.
- **Decision**: 
  - Standardize on a clean light theme using pure white `#FFFFFF` cards, soft background `#F8FAFC`, crisp slate borders `#E2E8F0`, deep charcoal text `#0F172A`, and refined indigo/slate accents.
  - Avoid dark mode defaults or visual clutter.
  - Ensure all tables, time slots, and status badges (Feasible, Draft, Approved, Infeasible) meet WCAG AA 4.5:1+ contrast ratios.

## Decision 002: Monorepo Structure & Workspaces
- **Date**: 2026-10-15
- **Status**: Approved
- **Context**: Need a cohesive repository hosting the React frontend, Express REST API, shared TypeScript schemas, and the Python OR-Tools optimization engine.
- **Decision**:
  - Use npm workspaces for the TypeScript stack: `apps/web`, `apps/api`, and `packages/contracts`.
  - Isolate the solver service into `services/optimizer` with Python 3.12 and Google OR-Tools.
  - The API acts as an orchestration and validation boundary between web clients and the optimizer service.

## Decision 003: Canonical Roles and Scoped Permissions
- **Date**: 2026-10-15
- **Status**: Approved
- **Context**: Reconciling role inconsistencies between synopsis and SRS.
- **Decision**:
  - The system defines 5 canonical roles:
    1. `STUDENT`: View personal eligibility, registration, and published timetables/seating.
    2. `FACULTY`: Submit availability and view assigned invigilation duties.
    3. `HOD`: Department-scoped review of student eligibility, faculty duties, and department schedule.
    4. `EXAM_COORDINATOR`: Manage academic cycles, trigger scheduling runs, review candidate timetables, allocate halls/invigilators, and publish.
    5. `ADMIN`: System-level configuration, user management, and audit logs.

## Decision 004: Immutable Schedule Versioning
- **Date**: 2026-10-15
- **Status**: Approved
- **Context**: Avoid accidentally corrupting published timetables during solver runs or rescheduling.
- **Decision**:
  - Schedules are versioned (`ScheduleVersion`).
  - Published schedules are strictly read-only and immutable.
  - Rescheduling creates a new `DRAFT` version and runs differential impact analysis before approval.
