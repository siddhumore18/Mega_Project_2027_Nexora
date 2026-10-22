"""Nexora Enterprise Constraint Scheduling Engine.

Uses Google OR-Tools CP-SAT to solve university examination timetabling,
hall allocation, and soft preference optimization.
"""

from __future__ import annotations
import json
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from ortools.sat.python import cp_model


def solve_schedule(snapshot: Dict[str, Any], max_time_seconds: float = 15.0) -> Dict[str, Any]:
    """Solves the examination scheduling problem specified in the snapshot dictionary."""
    start_time = time.time()
    exams = snapshot.get("exams", [])
    time_slots = snapshot.get("timeSlots", [])
    rooms = snapshot.get("rooms", [])
    weights = snapshot.get("weights", {})

    w_consec = weights.get("consecutiveExamsPenalty", 10)
    w_sameday = weights.get("twoExamsSameDayPenalty", 25)
    w_unbal = weights.get("unbalancedRoomPenalty", 5)

    diagnostics: List[str] = []

    # Pre-validation & quick infeasibility checks
    if not exams:
        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-empty"),
            "status": "FEASIBLE",
            "objectiveScore": 0,
            "assignments": [],
            "hardViolations": [],
            "softPenalties": [],
            "diagnostics": ["No exams provided in problem snapshot."],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

    if not time_slots:
        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-no-slots"),
            "status": "INFEASIBLE",
            "objectiveScore": None,
            "assignments": [],
            "hardViolations": [
                {
                    "type": "EXAM_UNSCHEDULED",
                    "description": "Zero time slots available for scheduling.",
                    "details": {},
                }
            ],
            "softPenalties": [],
            "diagnostics": ["Infeasible: No time slots defined for this examination cycle."],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

    if not rooms:
        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-no-rooms"),
            "status": "INFEASIBLE",
            "objectiveScore": None,
            "assignments": [],
            "hardViolations": [
                {
                    "type": "ROOM_CAPACITY_EXCEEDED",
                    "description": "Zero examination rooms available.",
                    "details": {},
                }
            ],
            "softPenalties": [],
            "diagnostics": ["Infeasible: No rooms available for this examination cycle."],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

    # Check maximum room capacity against largest exam
    max_room_capacity = max(r.get("capacity", 0) for r in rooms)
    capacity_failures = []
    for exam in exams:
        count = len(exam.get("enrolledStudents", []))
        if count > max_room_capacity:
            capacity_failures.append(
                f"Exam {exam.get('code')} ({count} students) exceeds largest room capacity ({max_room_capacity})."
            )

    if capacity_failures:
        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-capacity-fail"),
            "status": "INFEASIBLE",
            "objectiveScore": None,
            "assignments": [],
            "hardViolations": [
                {
                    "type": "ROOM_CAPACITY_EXCEEDED",
                    "description": msg,
                    "details": {"maxRoomCapacity": max_room_capacity},
                }
                for msg in capacity_failures
            ],
            "softPenalties": [],
            "diagnostics": capacity_failures,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

    strict_daily_limit = snapshot.get("strictDailyLimit", False)
    holidays = set(snapshot.get("holidays", []))

    # Student conflict feasibility check (Pigeonhole: student exams > total slots)
    student_exams_map: Dict[str, List[str]] = {}
    for exam in exams:
        e_id = exam.get("id")
        for s_id in exam.get("enrolledStudents", []):
            student_exams_map.setdefault(s_id, []).append(e_id)

    student_pigeonhole_failures = []
    for s_id, e_list in student_exams_map.items():
        if len(e_list) > len(time_slots):
            student_pigeonhole_failures.append(
                f"Student {s_id} is registered for {len(e_list)} exams, but only {len(time_slots)} time slots exist."
            )

    if student_pigeonhole_failures:
        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-slot-pigeonhole"),
            "status": "INFEASIBLE",
            "objectiveScore": None,
            "assignments": [],
            "hardViolations": [
                {
                    "type": "STUDENT_OVERLAP",
                    "description": msg,
                    "details": {"timeSlotsCount": len(time_slots)},
                }
                for msg in student_pigeonhole_failures
            ],
            "softPenalties": [],
            "diagnostics": student_pigeonhole_failures,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

    # Group time slots by dayIndex
    day_slots_map: Dict[int, List[Dict[str, Any]]] = {}
    for slot in time_slots:
        # Exclude declared holiday slots from valid exam scheduling days
        if slot.get("date") not in holidays:
            d_idx = slot.get("dayIndex", 1)
            day_slots_map.setdefault(d_idx, []).append(slot)

    # Pigeonhole check for strict daily limit (Max 1 exam per student per calendar day)
    if strict_daily_limit:
        day_pigeonhole_failures = []
        for s_id, e_list in student_exams_map.items():
            if len(e_list) > len(day_slots_map):
                day_pigeonhole_failures.append(
                    f"Student {s_id} is registered for {len(e_list)} exams, but only {len(day_slots_map)} non-holiday examination days exist. Maximum 1 exam per student per day is enforced."
                )
        if day_pigeonhole_failures:
            return {
                "scheduleRunId": snapshot.get("examCycleId", "run-day-pigeonhole"),
                "status": "INFEASIBLE",
                "objectiveScore": None,
                "assignments": [],
                "hardViolations": [
                    {
                        "type": "STUDENT_SAME_DAY_CONFLICT",
                        "description": msg,
                        "details": {"availableDays": len(day_slots_map)},
                    }
                    for msg in day_pigeonhole_failures
                ],
                "softPenalties": [],
                "diagnostics": day_pigeonhole_failures,
                "generatedAt": datetime.now(timezone.utc).isoformat(),
            }

    # Build CP-SAT Model
    model = cp_model.CpModel()

    # Domain filtering for valid rooms: enrolledStudents <= room.capacity
    valid_rooms_per_exam: Dict[str, List[Dict[str, Any]]] = {}
    for exam in exams:
        count = len(exam.get("enrolledStudents", []))
        valid_rooms_per_exam[exam["id"]] = [
            r for r in rooms if r.get("capacity", 0) >= count
        ]

    # Decision variables: x[exam_id, slot_id, room_id] in {0, 1}
    x: Dict[tuple, cp_model.IntVar] = {}
    y: Dict[tuple, cp_model.IntVar] = {}  # y[exam_id, slot_id] = exam is in slot

    for exam in exams:
        e_id = exam["id"]
        v_rooms = valid_rooms_per_exam[e_id]
        for slot in time_slots:
            s_id = slot["id"]
            slot_vars = []
            for room in v_rooms:
                r_id = room["id"]
                var = model.NewBoolVar(f"x_{e_id}_{s_id}_{r_id}")
                x[(e_id, s_id, r_id)] = var
                slot_vars.append(var)

            y_var = model.NewBoolVar(f"y_{e_id}_{s_id}")
            y[(e_id, s_id)] = y_var
            # y[e, s] is 1 if any x[e, s, r] == 1, 0 otherwise
            model.Add(sum(slot_vars) == y_var)

            # Hard Constraint H7: Blackout declared holidays
            if slot.get("date") in holidays:
                model.Add(y_var == 0)

    # Hard Constraint H4: Each exam must be scheduled in exactly one time slot and room
    for exam in exams:
        e_id = exam["id"]
        model.Add(sum(y[(e_id, slot["id"])] for slot in time_slots) == 1)

    # Hard Constraint H2: Room conflict-free (At most one exam per room per slot)
    for slot in time_slots:
        s_id = slot["id"]
        for room in rooms:
            r_id = room["id"]
            active_vars = [
                x[(exam["id"], s_id, r_id)]
                for exam in exams
                if (exam["id"], s_id, r_id) in x
            ]
            if active_vars:
                model.Add(sum(active_vars) <= 1)

    # Hard Constraint H1: Student conflict-free (At most one exam per student per slot)
    for s_id, e_list in student_exams_map.items():
        if len(e_list) > 1:
            for slot in time_slots:
                s_id_slot = slot["id"]
                model.Add(sum(y[(e_id, s_id_slot)] for e_id in e_list) <= 1)

    # Hard Constraint H6 / Soft Constraint S2: Student Same-Day Limits
    objective_terms = []

    for s_id, e_list in student_exams_map.items():
        if len(e_list) > 1:
            for d_idx, d_slots in day_slots_map.items():
                day_exam_vars = [
                    y[(e_id, sl["id"])]
                    for e_id in e_list
                    for sl in d_slots
                    if (e_id, sl["id"]) in y
                ]
                if day_exam_vars:
                    if strict_daily_limit:
                        # Hard Constraint H6: Max 1 exam per student per calendar day (backlog paper protection)
                        model.Add(sum(day_exam_vars) <= 1)
                    else:
                        # Soft Penalty S2
                        excess_var = model.NewIntVar(0, len(day_exam_vars), f"excess_{s_id}_d{d_idx}")
                        model.Add(excess_var >= sum(day_exam_vars) - 1)
                        objective_terms.append(excess_var * w_sameday)

    # Soft Constraint S1: Consecutive Exams Same Day
    for s_id, e_list in student_exams_map.items():
        if len(e_list) > 1:
            for d_idx, d_slots in day_slots_map.items():
                sorted_slots = sorted(d_slots, key=lambda s: s.get("slotIndexInDay", 1))
                for i in range(len(sorted_slots) - 1):
                    s1 = sorted_slots[i]
                    s2 = sorted_slots[i + 1]
                    if s2.get("slotIndexInDay", 1) == s1.get("slotIndexInDay", 1) + 1:
                        # consecutive slot pair
                        has_s1 = model.NewBoolVar(f"has_{s_id}_{s1['id']}")
                        has_s2 = model.NewBoolVar(f"has_{s_id}_{s2['id']}")
                        model.Add(sum(y[(e_id, s1["id"])] for e_id in e_list) == has_s1)
                        model.Add(sum(y[(e_id, s2["id"])] for e_id in e_list) == has_s2)

                        is_consec = model.NewBoolVar(f"consec_{s_id}_{s1['id']}_{s2['id']}")
                        model.Add(is_consec >= has_s1 + has_s2 - 1)
                        objective_terms.append(is_consec * w_consec)

    # Soft Constraint S3: Room Underutilization
    for exam in exams:
        e_id = exam["id"]
        enrolled_count = len(exam.get("enrolledStudents", []))
        for room in valid_rooms_per_exam[e_id]:
            r_id = room["id"]
            wasted = room.get("capacity", 0) - (2 * enrolled_count)
            if wasted > 50:
                cost = (wasted // 10) * w_unbal
                for slot in time_slots:
                    s_id = slot["id"]
                    if (e_id, s_id, r_id) in x:
                        objective_terms.append(x[(e_id, s_id, r_id)] * cost)

    if objective_terms:
        model.Minimize(sum(objective_terms))

    # Solver invocation
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(max_time_seconds)
    solver.parameters.num_workers = 4

    solve_status = solver.Solve(model)
    elapsed_time = round(time.time() - start_time, 4)

    if solve_status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        status_name = "OPTIMAL" if solve_status == cp_model.OPTIMAL else "FEASIBLE"
        assignments = []
        for exam in exams:
            e_id = exam["id"]
            for slot in time_slots:
                s_id = slot["id"]
                for room in valid_rooms_per_exam[e_id]:
                    r_id = room["id"]
                    if (e_id, s_id, r_id) in x and solver.Value(x[(e_id, s_id, r_id)]) == 1:
                        assignments.append(
                            {
                                "examId": e_id,
                                "timeSlotId": s_id,
                                "roomId": r_id,
                            }
                        )

        obj_score = float(solver.ObjectiveValue()) if objective_terms else 0.0

        diagnostics.append(
            f"CP-SAT solver achieved status {status_name} in {elapsed_time}s."
        )
        diagnostics.append(
            f"Scheduled all {len(assignments)}/{len(exams)} exams with 0 hard violations."
        )
        diagnostics.append(f"Soft penalty score: {obj_score}")

        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-success"),
            "status": status_name,
            "objectiveScore": obj_score,
            "assignments": assignments,
            "hardViolations": [],
            "softPenalties": [],
            "diagnostics": diagnostics,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }

    elif solve_status == cp_model.INFEASIBLE:
        diagnostics.append(
            f"CP-SAT solver determined the model is strictly INFEASIBLE in {elapsed_time}s."
        )
        diagnostics.append(
            "Hard constraints (student non-overlap, room capacity, room non-collision) cannot be satisfied simultaneously."
        )
        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-infeasible"),
            "status": "INFEASIBLE",
            "objectiveScore": None,
            "assignments": [],
            "hardViolations": [
                {
                    "type": "STUDENT_OVERLAP",
                    "description": "Constraints are mutually incompatible with available time slots and halls.",
                    "details": {},
                }
            ],
            "softPenalties": [],
            "diagnostics": diagnostics,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }
    else:
        return {
            "scheduleRunId": snapshot.get("examCycleId", "run-timeout"),
            "status": "UNKNOWN",
            "objectiveScore": None,
            "assignments": [],
            "hardViolations": [],
            "softPenalties": [],
            "diagnostics": [
                f"Solver terminated with non-conclusive status in {elapsed_time}s."
            ],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }


def main():
    """CLI Entrypoint reading problem snapshot JSON from stdin and emitting CandidateSchedule JSON to stdout."""
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            sys.stderr.write("Error: Expected problem snapshot JSON on stdin.\n")
            sys.exit(1)
        snapshot = json.loads(raw_input)
        result = solve_schedule(snapshot)
        print(json.dumps(result, indent=2))
    except Exception as e:
        sys.stderr.write(f"Solver Error: {str(e)}\n")
        error_res = {
            "status": "FAILED",
            "assignments": [],
            "hardViolations": [],
            "softPenalties": [],
            "diagnostics": [f"Fatal exception: {str(e)}"],
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }
        print(json.dumps(error_res, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
