# Requirements Questions for Examination Cell & Academic Authority

Before finalizing the physical database schema and optimization constraints in Phase 2 & Phase 6, the following institution-specific policies must be signed off by the Examination Cell:

1. **Eligibility Rules & Calculation**:
   - What attendance threshold (e.g. 75%) constitutes mandatory eligibility?
   - How are medical leaves or dean concessions represented and audited?
   - Are fee-due blocks enforced automatically or manually overridden?

2. **Backlog & Attempt Handling**:
   - Are backlog examinations scheduled in the same slots as regular semester examinations, or in a separate session?
   - What is the maximum number of backlogs a student may register for in a single exam cycle?

3. **Time Slots & Session Structure**:
   - What are the standard examination slots per day (e.g., Morning: 09:30–12:30, Afternoon: 14:00–17:00)?
   - Can the solver pick variable start times, or must it assign strictly to discrete predefined session blocks?

4. **Hall & Seating Constraints**:
   - Can students from two different subjects/departments sit in the same examination hall to prevent collusion (alternate bench seating)?
   - What is the safety buffer for hall capacity (e.g., utilize max 50% of nominal room capacity for exams)?

5. **Invigilation Rules**:
   - What is the maximum number of duties a faculty member can be assigned per week / per day?
   - What is the minimum rest gap between invigilation duties?
   - Is a faculty member prohibited from invigilating an exam of their own department or subject?

6. **Publication & Approvals**:
   - Is HOD sign-off mandatory before the Exam Coordinator publishes the final schedule?
   - Is two-person review required for rescheduling an already published timetable?
