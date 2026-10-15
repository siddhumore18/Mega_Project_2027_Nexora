# Test Strategy

## Test layers
1. **Unit:** eligibility rules, overlap detection, time calculations, permission policies, objective/constraint helpers.
2. **API integration:** authentication, authorization, validation, database transactions, status transitions.
3. **Optimizer tests:** feasible, infeasible, timeout/unknown, capacity edge cases, conflict constraints.
4. **UI tests:** forms, loading/error/empty states, role-specific navigation, validation messages.
5. **End-to-end:** create exam cycle → evaluate eligibility → register → generate → validate → approve → publish → view student timetable → reschedule.
6. **Security:** IDOR, privilege escalation, invalid tokens, brute-force protection, unsafe exports.
7. **Performance:** benchmark using realistic synthetic sizes; record hardware, dataset, solver settings, and timing.

## Essential invariants
- No student has overlapping published exams.
- No room is double-booked.
- Room occupancy never exceeds capacity.
- No invigilator has overlapping assignments or exceeds policy limits.
- Each required exam is scheduled exactly once in a complete published version.
- A published version cannot be mutated in place.
- Every allocation references valid records.
- A failed optimization or validation cannot publish.
- Only authorized roles can access scoped data.
- Eligibility result includes explainable reasons and the rule version.

## Test data
Create a seed script with fake students, subjects, rooms, faculty, registrations, availability, and intentionally conflicting cases. Never use actual institutional records in the default seed.
