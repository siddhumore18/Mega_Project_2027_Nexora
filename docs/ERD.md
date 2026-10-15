# Entity Relationship Diagram (ERD) & Database Schema

## Relational Architecture

```mermaid
erDiagram
    User ||--o| Student : "has profile"
    User ||--o| Faculty : "has profile"
    User ||--o{ AuditLog : "records"
    
    Department ||--o{ Program : "offers"
    Department ||--o{ Faculty : "employs"
    Department ||--o{ Subject : "owns"
    
    Program ||--o{ Student : "enrolls"
    
    AcademicTerm ||--o{ SubjectOffering : "schedules"
    AcademicTerm ||--o{ ExamCycle : "hosts"
    
    Subject ||--o{ SubjectOffering : "offered as"
    SubjectOffering ||--o{ StudentSubjectRecord : "enrollment"
    Student ||--o{ StudentSubjectRecord : "grades/eligibility"
    
    ExamCycle ||--o{ ExamOffering : "contains"
    SubjectOffering ||--o{ ExamOffering : "examined in"
    
    ExamOffering ||--o{ ExamRegistration : "registered for"
    Student ||--o{ ExamRegistration : "registers"
    
    ExamCycle ||--o{ ScheduleRun : "generates"
    ExamCycle ||--o{ ScheduleVersion : "publishes"
    ScheduleRun ||--o{ ScheduleVersion : "produces"
    
    ScheduleVersion ||--o{ ScheduledExam : "schedules"
    ExamOffering ||--o{ ScheduledExam : "assigned to"
    Room ||--o{ ScheduledExam : "hosts"
    
    ScheduledExam ||--o{ SeatAllocation : "seats"
    Student ||--o{ SeatAllocation : "occupies"
    Room ||--o{ SeatAllocation : "allocated in"
    
    ScheduledExam ||--o{ InvigilatorAssignment : "monitored by"
    Faculty ||--o{ InvigilatorAssignment : "invigilates"
```

---

## Key Invariants & Integrity Constraints

1. **Duplicate Registration Prevention**:
   - `ExamRegistration`: `@@unique([studentId, examOfferingId])`
   - *Invariant*: A student can never register for the same examination offering more than once.

2. **Seating Allocation Integrity**:
   - `SeatAllocation`: `@@unique([scheduledExamId, studentId])`
   - *Invariant*: A student cannot be seated in multiple desks for the same examination session.
   - `SeatAllocation`: `@@unique([scheduledExamId, roomId, seatLabel])`
   - *Invariant*: Two candidates cannot be allocated the exact same seat label in the same hall.

3. **Invigilator Collision Prevention**:
   - `InvigilatorAssignment`: `@@unique([scheduledExamId, facultyId])`
   - *Invariant*: A faculty member cannot be assigned twice to the same exam session.

4. **Immutable Published Versions**:
   - `ScheduleVersion`: `@@unique([examCycleId, versionNumber])`
   - *Invariant*: Schedule versions increment strictly (`v1.0`, `v2.0`). Published versions are locked against in-place mutations.

5. **Subject Offering Uniqueness**:
   - `SubjectOffering`: `@@unique([subjectId, academicTermId, semester])`
