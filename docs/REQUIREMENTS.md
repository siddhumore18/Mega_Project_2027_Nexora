# Requirements and Acceptance Criteria

## Actors and permissions
| Capability | Student | Faculty | HOD | Exam Coordinator | System Admin |
|---|---:|---:|---:|---:|---:|
| View own published timetable | Yes | N/A | N/A | Yes | Yes |
| View own registration/eligibility | Yes | N/A | N/A | Yes | Yes |
| Manage own availability | No | Policy-based | Policy-based | Yes | Yes |
| View assigned invigilation | No | Yes | Yes, scoped | Yes | Yes |
| Manage department data | No | No | Scoped | Yes | Yes |
| Create exam cycle/configuration | No | No | Request/review | Yes | Yes |
| Generate candidate timetable | No | No | Review | Yes | Yes |
| Approve/publish timetable | No | No | Optional approval | Yes, subject to policy | Yes |
| Manage users/global settings | No | No | No | Limited | Yes |

**Policy decision required:** whether HOD approval is mandatory before publication and whether coordinators can publish without a second approver. Enforce the final policy in the API.

## Functional requirements
- FR-01: Users can authenticate and sign out securely.
- FR-02: Protected operations enforce role and data scope on the server.
- FR-03: Authorized staff can manage academic structure and records.
- FR-04: An examination cycle can be created, edited, closed, and archived.
- FR-05: Eligibility is calculated from configurable rules and recorded with reasons.
- FR-06: Registration records are unique per student, examination cycle, and subject where policy requires.
- FR-07: The system reports eligible-but-unregistered students and invalid records.
- FR-08: Rooms have capacity, availability, and optional features.
- FR-09: Faculty availability and invigilation eligibility can be managed.
- FR-10: A scheduling input snapshot is validated before optimization.
- FR-11: The optimizer returns a candidate schedule, status, objective score, and diagnostics.
- FR-12: The API independently validates all hard constraints.
- FR-13: Coordinator can review, adjust where permitted, and approve a candidate.
- FR-14: Room and seating allocation respects room capacity and student/subject rules.
- FR-15: Invigilator allocation respects availability, qualification/policy, conflicts, and workload bounds.
- FR-16: Publication creates an immutable version and a publication timestamp.
- FR-17: Rescheduling creates a draft version and identifies impacted users/resources.
- FR-18: Notifications are generated only for relevant affected users and can be retried safely.
- FR-19: Authorized users can export approved reports.
- FR-20: Important administrative and scheduling actions are audit logged.

## Non-functional requirements
- Security: least privilege, password hashing, server-side validation, rate limiting, secure cookies/token handling, safe error responses.
- Integrity: no double booking of rooms or invigilators; no student exam overlap in a published schedule.
- Reliability: failed optimization must not damage existing/published schedules.
- Performance: define benchmark dataset and target after collecting institutional scale data.
- Accessibility: keyboard navigation, readable contrast, form labels, meaningful error messages.
- Maintainability: modular services, typed contracts, documented API, repeatable migrations.
- Privacy: minimum necessary personal data, scoped access, retention policy, backups protected.
- Availability: define an operational target only after deployment requirements are known.

## Key acceptance scenarios
1. A student assigned two exams in overlapping time slots is flagged; no invalid candidate can be published.
2. A room allocation exceeding capacity is rejected by independent validation.
3. An unavailable invigilator cannot be assigned to a session.
4. If no feasible timetable exists, the UI shows `INFEASIBLE` (or the solver's actual status), diagnostics, and no publish action.
5. A user without permission receives 403 and cannot access the record by changing an ID in the URL.
6. Publishing creates a version; a later change creates another version and preserves the original.
7. Retrying a notification job does not create duplicate logical notifications.
8. A failed database transaction leaves no partial allocation records.
9. Eligibility results include the rule/reason that produced them.
10. CSV/PDF exports contain only fields the requesting role is allowed to access.
