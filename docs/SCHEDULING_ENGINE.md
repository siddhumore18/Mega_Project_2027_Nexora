# Scheduling Engine — OR-Tools Design

## Principle
This is a constraint optimization problem, not automatically a machine-learning problem. OR-Tools is appropriate for expressing hard constraints and optimizing soft preferences. Do not market the system as predicting or learning unless an actual ML model is designed, trained, evaluated, and justified.

## Inputs
- Exam offerings and duration.
- Candidate time slots / allowed windows.
- Student registrations or enrolled cohorts.
- Room capacity and availability.
- Faculty availability and assignment requirements.
- Institution policy and configured hard/soft constraints.
- A versioned input snapshot.

## Hard constraints (illustrative; confirm policy)
- Every required exam is assigned exactly once in a complete schedule.
- No student has overlapping exams.
- No room is double-booked.
- A room meets capacity and required feature constraints.
- No invigilator is assigned to overlapping duties.
- Assigned invigilators are available and meet configured requirements.
- Exam duration fits the assigned slot and operating window.
- No forbidden date/session assignments.

Hard constraints cannot be broken in a published schedule.

## Soft constraints (illustrative)
- Avoid too many exams for a cohort on the same day.
- Avoid consecutive exams or minimize short gaps, according to policy.
- Balance invigilation workload.
- Prefer specific sessions/dates where possible.
- Improve room utilization without sacrificing mandatory constraints.
- Minimize disruption when rescheduling an already-published timetable.

Each soft constraint needs a weight, owner, rationale, and acceptance test. Avoid arbitrary weights without measuring trade-offs.

## Suggested API contract
`POST /api/v1/schedule-runs`
Request: `{ "examCycleId": "...", "inputVersion": 3, "options": { "candidateCount": 3 } }`
Response: `{ "scheduleRunId": "...", "status": "QUEUED" }`

`GET /api/v1/schedule-runs/:id`
Response includes actual status (`QUEUED`, `RUNNING`, `FEASIBLE`, `OPTIMAL`, `INFEASIBLE`, `UNKNOWN`, `FAILED`), timestamps, diagnostics, and candidate references.

`POST /api/v1/schedule-versions/:id/validate`
Runs independent hard-constraint validation and returns structured violations.

`POST /api/v1/schedule-versions/:id/approve`
Authorized human approval, subject to institution policy.

`POST /api/v1/schedule-versions/:id/publish`
Publishes only an approved, validated draft.

Statuses must map to the actual solver and orchestration outcomes; do not label a feasible solution as optimal unless the solver proves optimality.

## Service boundary
Node API validates requests, persists the run and input snapshot, and dispatches the job. Python service solves and returns a candidate plus diagnostics. Node persists the result and independently validates it. The Python service must not directly publish or notify users.

## Failure behavior
- Infeasible: return conflict diagnostics and allow authorized changes to constraints/input.
- Timeout/unknown: report that no conclusion was reached; do not claim infeasible.
- Service failure: preserve existing versions and mark the run failed.
- Input changed while solving: reject stale result or require explicit rebase against the latest input version.

## Testing
Build tiny deterministic fixtures first:
1. Two exams, one shared student, same only slot -> infeasible.
2. Two exams, no shared students, one room -> cannot overlap if room cannot host both.
3. Room capacity lower than registered candidates -> infeasible or split according to policy.
4. Faculty unavailable in all candidate slots -> infeasible if duty is mandatory.
5. Feasible small case -> all hard constraints validated.
6. Rescheduling case -> quantify impacted exams/students and minimize changes without breaking hard constraints.
