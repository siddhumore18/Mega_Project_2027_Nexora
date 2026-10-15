import pytest
from optimizer.src.solver import solve_schedule


def test_feasible_schedule_generation():
    snapshot = {
        "snapshotVersion": 1,
        "examCycleId": "cycle-dec-2026",
        "createdAt": "2026-10-15T12:00:00Z",
        "exams": [
            {
                "id": "e-cs101",
                "code": "CS101",
                "title": "Intro to CS",
                "durationMinutes": 180,
                "enrolledStudents": ["alice", "bob"],
            },
            {
                "id": "e-ma101",
                "code": "MA101",
                "title": "Linear Algebra",
                "durationMinutes": 180,
                "enrolledStudents": ["alice", "carol"],  # alice in both
            },
            {
                "id": "e-ph101",
                "code": "PH101",
                "title": "Physics I",
                "durationMinutes": 180,
                "enrolledStudents": ["bob", "dave"],
            },
        ],
        "timeSlots": [
            {
                "id": "ts-d1-morn",
                "name": "Day 1 Morning",
                "date": "2026-12-01",
                "startTime": "09:00",
                "endTime": "12:00",
                "dayIndex": 1,
                "slotIndexInDay": 1,
            },
            {
                "id": "ts-d1-aftn",
                "name": "Day 1 Afternoon",
                "date": "2026-12-01",
                "startTime": "14:00",
                "endTime": "17:00",
                "dayIndex": 1,
                "slotIndexInDay": 2,
            },
            {
                "id": "ts-d2-morn",
                "name": "Day 2 Morning",
                "date": "2026-12-02",
                "startTime": "09:00",
                "endTime": "12:00",
                "dayIndex": 2,
                "slotIndexInDay": 1,
            },
        ],
        "rooms": [
            {
                "id": "r-lh1",
                "code": "LH-1",
                "building": "Academic",
                "capacity": 50,
            },
            {
                "id": "r-lh2",
                "code": "LH-2",
                "building": "Academic",
                "capacity": 50,
            },
        ],
        "weights": {
            "consecutiveExamsPenalty": 10,
            "twoExamsSameDayPenalty": 25,
            "unbalancedRoomPenalty": 5,
        },
    }

    result = solve_schedule(snapshot)

    assert result["status"] in ("OPTIMAL", "FEASIBLE")
    assert len(result["assignments"]) == 3
    assert len(result["hardViolations"]) == 0

    # Ensure Alice's exams (CS101 and MA101) are in different time slots
    slot_map = {a["examId"]: a["timeSlotId"] for a in result["assignments"]}
    assert slot_map["e-cs101"] != slot_map["e-ma101"]

    # Ensure room double booking did not happen
    room_slot_pairs = [(a["roomId"], a["timeSlotId"]) for a in result["assignments"]]
    assert len(room_slot_pairs) == len(set(room_slot_pairs))


def test_infeasible_when_capacity_exceeded():
    snapshot = {
        "snapshotVersion": 1,
        "examCycleId": "cycle-cap-test",
        "exams": [
            {
                "id": "e-big",
                "code": "BIG101",
                "enrolledStudents": [f"stu-{i}" for i in range(120)],
            }
        ],
        "timeSlots": [
            {"id": "ts-1", "dayIndex": 1, "slotIndexInDay": 1}
        ],
        "rooms": [
            {"id": "r-small", "code": "SMALL-1", "capacity": 50}
        ],
    }

    result = solve_schedule(snapshot)
    assert result["status"] == "INFEASIBLE"
    assert len(result["assignments"]) == 0
    assert any("exceeds largest room capacity" in d for d in result["diagnostics"])


def test_infeasible_when_student_has_more_exams_than_slots():
    snapshot = {
        "snapshotVersion": 1,
        "examCycleId": "cycle-slots-test",
        "exams": [
            {"id": "e-1", "code": "EX1", "enrolledStudents": ["alice"]},
            {"id": "e-2", "code": "EX2", "enrolledStudents": ["alice"]},
        ],
        "timeSlots": [
            {"id": "ts-only", "dayIndex": 1, "slotIndexInDay": 1}
        ],
        "rooms": [
            {"id": "r-1", "code": "R1", "capacity": 100}
        ],
    }

    result = solve_schedule(snapshot)
    assert result["status"] == "INFEASIBLE"
    assert len(result["assignments"]) == 0
    assert any("registered for 2 exams, but only 1 time slots exist" in d for d in result["diagnostics"])


def test_optimizer_avoids_same_day_exams_when_alternatives_exist():
    # Student Alice has 2 exams. Day 1 has Slot 1 & 2. Day 2 has Slot 1.
    # Solver should place Alice's exams across Day 1 and Day 2 to minimize same-day penalty!
    snapshot = {
        "snapshotVersion": 1,
        "examCycleId": "cycle-soft-opt",
        "exams": [
            {"id": "e-1", "code": "EX1", "enrolledStudents": ["alice"]},
            {"id": "e-2", "code": "EX2", "enrolledStudents": ["alice"]},
        ],
        "timeSlots": [
            {"id": "ts-d1-1", "dayIndex": 1, "slotIndexInDay": 1},
            {"id": "ts-d1-2", "dayIndex": 1, "slotIndexInDay": 2},
            {"id": "ts-d2-1", "dayIndex": 2, "slotIndexInDay": 1},
        ],
        "rooms": [
            {"id": "r-1", "code": "R1", "capacity": 50}
        ],
        "weights": {
            "twoExamsSameDayPenalty": 50,
            "consecutiveExamsPenalty": 20,
        },
    }

    result = solve_schedule(snapshot)
    assert result["status"] == "OPTIMAL"
    assert result["objectiveScore"] == 0.0

    slot_map = {a["examId"]: a["timeSlotId"] for a in result["assignments"]}
    # One exam must be on Day 2, avoiding same day!
    assigned_slots = set(slot_map.values())
    assert "ts-d2-1" in assigned_slots
