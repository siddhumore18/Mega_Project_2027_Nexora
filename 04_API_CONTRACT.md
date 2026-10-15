# API Contract — Initial Proposal

Prefix: `/api/v1`. Use a consistent error envelope and schema validation. These are proposed endpoints, not implemented APIs.

## Authentication and profile
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh` (only if refresh-token design is selected)
- `GET /me`

## Academic setup
- `GET/POST /departments`
- `GET/POST /programs`
- `GET/POST /academic-terms`
- `GET/POST /subjects`
- `GET/POST /students`
- `GET/POST /faculty`
- `GET/POST /rooms`
- `GET/POST /faculty-availability`

## Examination workflow
- `GET/POST /exam-cycles`
- `GET/POST /exam-cycles/:id/exam-offerings`
- `POST /exam-offerings/:id/eligibility-evaluations`
- `GET /exam-cycles/:id/registration-status`
- `POST /exam-offerings/:id/registrations`
- `GET /me/exam-registrations`
- `GET /me/timetable`

## Scheduling and allocation
- `POST /schedule-runs`
- `GET /schedule-runs/:id`
- `GET /schedule-runs/:id/candidates`
- `POST /schedule-versions/:id/validate`
- `POST /schedule-versions/:id/approve`
- `POST /schedule-versions/:id/publish`
- `POST /schedule-versions/:id/reschedule-draft`
- `POST /schedule-versions/:id/room-allocations`
- `POST /schedule-versions/:id/invigilator-allocations`

## Reporting and audit
- `GET /reports/registration-gaps`
- `GET /reports/room-utilization`
- `GET /reports/invigilator-workload`
- `GET /audit-logs` (strictly restricted)

## API conventions
- List endpoints: pagination, sorting allowlist, filters allowlist.
- Use `400` for invalid input, `401` for unauthenticated, `403` for unauthorized, `404` for inaccessible/not found according to disclosure policy, `409` for state/constraint conflicts, `422` for semantically invalid input where useful, `429` for rate limiting, `500` for unexpected failures.
- Errors should include a stable code, safe message, and request ID; do not expose stack traces.
- Use idempotency keys for retryable actions such as publishing/notification dispatch where appropriate.
- State-changing actions must check current workflow status and authorization.
- Do not expose cross-department data through filters or object IDs.
