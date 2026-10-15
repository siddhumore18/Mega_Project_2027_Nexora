"""Nexora Foundational Constraint Optimization Prototype.

Uses Google OR-Tools CP-SAT Solver to schedule exams without conflicts.
Complies with docs/SCHEDULING_ENGINE.md and docs/TEST_STRATEGY.md.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
from ortools.sat.python import cp_model


@dataclass
class Exam:
    id: str
    code: str
    students: List[str]


@dataclass
class Slot:
    id: str
    name: str


@dataclass
class SolverResult:
    status: str  # "OPTIMAL", "FEASIBLE", "INFEASIBLE", "UNKNOWN"
    schedule: Dict[str, str] = field(default_factory=dict)  # exam_id -> slot_id
    conflicts_detected: List[str] = field(default_factory=list)


def solve_exam_schedule(exams: List[Exam], slots: List[Slot]) -> SolverResult:
    """Solves the examination scheduling problem with strict hard constraints:

    1. Each exam assigned to exactly one slot.
    2. No student has overlapping exams in the same slot.
    """
    model = cp_model.CpModel()

    # Decision variables: x[exam, slot] is 1 if exam is scheduled in slot, 0 otherwise
    x: Dict[tuple, cp_model.IntVar] = {}
    for exam in exams:
        for slot in slots:
            x[(exam.id, slot.id)] = model.NewBoolVar(f"x_{exam.id}_{slot.id}")

    # Constraint 1: Every exam must be scheduled in exactly one slot
    for exam in exams:
        model.Add(sum(x[(exam.id, slot.id)] for slot in slots) == 1)

    # Constraint 2: No student can have 2 exams in the same slot
    student_exams: Dict[str, List[str]] = {}
    for exam in exams:
        for student_id in exam.students:
            student_exams.setdefault(student_id, []).append(exam.id)

    conflicts: List[str] = []
    for student_id, enrolled_exam_ids in student_exams.items():
        if len(enrolled_exam_ids) > len(slots):
            conflicts.append(
                f"Student {student_id} is enrolled in {len(enrolled_exam_ids)} exams but only {len(slots)} slots are available."
            )

        if len(enrolled_exam_ids) > 1:
            for slot in slots:
                # Sum of exams for this student in this slot must be <= 1
                model.Add(
                    sum(x[(exam_id, slot.id)] for exam_id in enrolled_exam_ids) <= 1
                )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    solver_status = solver.Solve(model)

    if solver_status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        schedule = {}
        for exam in exams:
            for slot in slots:
                if solver.Value(x[(exam.id, slot.id)]) == 1:
                    schedule[exam.id] = slot.id
        status_name = "OPTIMAL" if solver_status == cp_model.OPTIMAL else "FEASIBLE"
        return SolverResult(status=status_name, schedule=schedule)

    elif solver_status == cp_model.INFEASIBLE:
        return SolverResult(
            status="INFEASIBLE",
            conflicts_detected=conflicts or ["Constraints mutually incompatible."],
        )
    else:
        return SolverResult(status="UNKNOWN")
