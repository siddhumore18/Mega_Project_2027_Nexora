from services.optimizer.src.solver_prototype import Exam, Slot, solve_exam_schedule


def test_feasible_schedule_with_distinct_slots():
    """Verify that two exams sharing students are successfully separated into distinct slots."""
    exams = [
        Exam(id="exam1", code="CS101", students=["alice", "bob"]),
        Exam(id="exam2", code="CS102", students=["alice", "charlie"]),
    ]
    slots = [
        Slot(id="slot1", name="Morning"),
        Slot(id="slot2", name="Afternoon"),
    ]

    result = solve_exam_schedule(exams, slots)
    assert result.status in ("OPTIMAL", "FEASIBLE")
    assert len(result.schedule) == 2
    # Alice is in both exams, so their assigned slots MUST be different
    assert result.schedule["exam1"] != result.schedule["exam2"]


def test_infeasible_schedule_on_student_overlap():
    """Verify that the solver correctly returns INFEASIBLE when a shared student has fewer slots than exams."""
    exams = [
        Exam(id="exam1", code="CS101", students=["alice"]),
        Exam(id="exam2", code="CS102", students=["alice"]),
    ]
    slots = [
        Slot(id="slot1", name="Only Slot"),
    ]

    result = solve_exam_schedule(exams, slots)
    assert result.status == "INFEASIBLE"
    assert len(result.conflicts_detected) > 0


def test_disjoint_students_can_share_slot():
    """Verify that exams without shared students can share the same time slot if needed."""
    exams = [
        Exam(id="exam1", code="ME101", students=["bob"]),
        Exam(id="exam2", code="EE101", students=["charlie"]),
    ]
    slots = [
        Slot(id="slot1", name="Morning Slot"),
    ]

    result = solve_exam_schedule(exams, slots)
    assert result.status in ("OPTIMAL", "FEASIBLE")
    assert result.schedule["exam1"] == "slot1"
    assert result.schedule["exam2"] == "slot1"
