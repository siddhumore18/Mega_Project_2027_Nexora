import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext.js";
import {
  AcademicDataStore,
  ExamCycleRecord,
  CoordinatorExamEntry,
  ExamHallRecord,
  InvigilatorRosterRecord,
  StudentRegistrationRecord,
  ConflictItem,
  YearOfStudy,
} from "../services/academicDataStore.js";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Building2,
  Users,
  CheckCircle2,
  Send,
  Plus,
  Search,
  Download,
  Check,
  X,
  Sparkles,
  Cpu,
  AlertTriangle,
  UserCheck,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  Globe,
  SlidersHorizontal,
  RefreshCw,
  Printer,
  Info,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface CoordinatorDashboardProps {
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  onSwitchToAdmin,
  onLogout,
}) => {
  const auth = useAuth();
  const coordinatorName = auth?.currentUser?.name || "Dr. Sarah Jenkins";

  // 1. Navigation State — 14 Functional Sections
  const [activeMenu, setActiveMenu] = useState<string>("overview");

  // 2. Live Store State Subscription
  const [storeState, setStoreState] = useState(() => AcademicDataStore.getState());

  useEffect(() => {
    const unsubscribe = AcademicDataStore.subscribe(() => {
      setStoreState({ ...AcademicDataStore.getState() });
    });
    return () => unsubscribe();
  }, []);

  // 3. Global Toast Notifications
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info" | "warning"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 4. Active Cycle Selection
  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    storeState.examCycles[0]?.id || "cycle-1"
  );

  const activeCycle: ExamCycleRecord = useMemo(() => {
    return storeState.examCycles.find((c) => c.id === selectedCycleId) || storeState.examCycles[0] || {
      id: "cycle-1",
      name: "Winter 2026 Examination",
      academicYear: "2025-26",
      semesterType: "Odd Semester",
      examType: "MSE",
      department: "Computer Science & Engineering",
      yearLevel: "4th Year",
      division: "All Divisions",
      startDate: "2026-11-10",
      endDate: "2026-11-25",
      registrationDeadline: "2026-10-31",
      sessionWindow: "Both Sessions",
      durationMinutes: 180,
      status: "In Progress",
      applicableSubjectsCount: 8,
      createdAt: "2026-09-01",
    };
  }, [storeState.examCycles, selectedCycleId]);

  // Global search query
  const [globalSearch, setGlobalSearch] = useState("");

  // ==========================================
  // VIEW 2: Academic & Exam Setup State
  // ==========================================
  const [setupAcademicYear, setSetupAcademicYear] = useState(activeCycle.academicYear || "2026-27");
  const [setupDept, setSetupDept] = useState(activeCycle.department || "Computer Science & Engineering");
  const [setupYearOfStudy, setSetupYearOfStudy] = useState<YearOfStudy>("Fourth");
  const [setupDivision, setSetupDivision] = useState<"Division A" | "Division B" | "All Divisions">("All Divisions");
  const [setupSemester, setSetupSemester] = useState<number>(7);
  const [setupExamType, setSetupExamType] = useState<"MSE" | "ESE" | "Makeup Examination" | "Lab-Practical Examination">("MSE");
  const [setupCycleName, setSetupCycleName] = useState(activeCycle.name || "Winter 2026 Examination");
  const [setupStartDate, setSetupStartDate] = useState(activeCycle.startDate || "2026-11-10");
  const [setupEndDate, setSetupEndDate] = useState(activeCycle.endDate || "2026-11-25");
  const [setupDuration, setSetupDuration] = useState<number>(activeCycle.durationMinutes || 180);
  const [setupSessionWindow, setSetupSessionWindow] = useState<"Morning (09:30 - 12:30 IST)" | "Afternoon (14:00 - 17:00 IST)" | "Both Sessions">("Both Sessions");

  // Dependent Program list based on selected department
  const availableProgramsForDept = useMemo(() => {
    const deptRecord = storeState.departments.find((d) => d.name === setupDept || d.code === setupDept);
    if (!deptRecord) return storeState.programs;
    return storeState.programs.filter((p) => p.departmentCode === deptRecord.code);
  }, [storeState.departments, storeState.programs, setupDept]);

  const [setupProgramCode, setSetupProgramCode] = useState<string>(availableProgramsForDept[0]?.code || "BTECH-CSE");

  useEffect(() => {
    if (availableProgramsForDept.length > 0 && !availableProgramsForDept.some((p) => p.code === setupProgramCode)) {
      setSetupProgramCode(availableProgramsForDept[0].code);
    }
  }, [availableProgramsForDept, setupProgramCode]);

  // Semesters valid for chosen YearOfStudy
  const validSemestersForYear = useMemo(() => {
    if (setupYearOfStudy === "First") return [1, 2];
    if (setupYearOfStudy === "Second") return [3, 4];
    if (setupYearOfStudy === "Third") return [5, 6];
    return [7, 8];
  }, [setupYearOfStudy]);

  useEffect(() => {
    if (!validSemestersForYear.includes(setupSemester)) {
      setSetupSemester(validSemestersForYear[0]);
    }
  }, [validSemestersForYear, setupSemester]);

  // Semester Category: Odd or Even
  const setupSemesterCategory = setupSemester % 2 === 1 ? "Odd Semester" : "Even Semester";

  const handleSaveAcademicSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(setupStartDate) > new Date(setupEndDate)) {
      showToast("Start Date cannot be after End Date.", "error");
      return;
    }
    const res = AcademicDataStore.updateExamCycle(activeCycle.id, {
      name: setupCycleName,
      academicYear: setupAcademicYear,
      department: setupDept,
      semesterType: setupSemesterCategory,
      examType: setupExamType,
      startDate: setupStartDate,
      endDate: setupEndDate,
      durationMinutes: Number(setupDuration),
      sessionWindow: setupSessionWindow,
    });
    if (res.success) {
      showToast("Academic & Exam Configuration saved and validated successfully.");
    } else {
      showToast(res.error || "Failed to update configuration.", "error");
    }
  };

  // ==========================================
  // VIEW 3: Student Registration & Eligibility State
  // ==========================================
  const [regSearch, setRegSearch] = useState("");
  const [regDeptFilter, setRegDeptFilter] = useState("ALL");
  const [regYearFilter, setRegYearFilter] = useState("ALL");
  const [regTypeFilter, setRegTypeFilter] = useState("ALL");
  const [regStatusFilter, setRegStatusFilter] = useState("ALL");
  const [regEligibilityFilter, setRegEligibilityFilter] = useState("ALL");
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentRegistrationRecord | null>(null);
  const [overrideModalReason, setOverrideModalReason] = useState("");

  const filteredRegistrations = useMemo(() => {
    return storeState.studentRegistrations.filter((r) => {
      const matchSearch =
        !regSearch ||
        r.name.toLowerCase().includes(regSearch.toLowerCase()) ||
        r.rollNo.toLowerCase().includes(regSearch.toLowerCase()) ||
        r.subjectCode.toLowerCase().includes(regSearch.toLowerCase());
      const matchDept = regDeptFilter === "ALL" || r.departmentCode === regDeptFilter;
      const matchYear = regYearFilter === "ALL" || r.yearOfStudy === regYearFilter;
      const matchType = regTypeFilter === "ALL" || r.registrationType === regTypeFilter;
      const matchStatus = regStatusFilter === "ALL" || r.registrationStatus === regStatusFilter;
      const matchElig = regEligibilityFilter === "ALL" || r.eligibilityStatus === regEligibilityFilter;
      return matchSearch && matchDept && matchYear && matchType && matchStatus && matchElig;
    });
  }, [
    storeState.studentRegistrations,
    regSearch,
    regDeptFilter,
    regYearFilter,
    regTypeFilter,
    regStatusFilter,
    regEligibilityFilter,
  ]);

  const handleUpdateStudentEligibility = (newElig: "Eligible" | "Ineligible") => {
    if (!selectedStudentForModal) return;
    if (newElig === "Eligible" && !overrideModalReason.trim()) {
      showToast("Please provide an institutional waiver reason to approve eligibility.", "warning");
      return;
    }
    AcademicDataStore.updateStudentRegistration(selectedStudentForModal.id, {
      eligibilityStatus: newElig,
      ineligibilityReason: newElig === "Eligible" ? `Approved waiver: ${overrideModalReason}` : "Attendance or administrative dues unmet",
    });
    showToast(`Eligibility updated for ${selectedStudentForModal.name} (${selectedStudentForModal.rollNo}).`);
    setSelectedStudentForModal(null);
    setOverrideModalReason("");
  };

  // ==========================================
  // VIEW 4: Subjects & Exam Entries State
  // ==========================================
  const [subSearch, setSubSearch] = useState("");
  const [subDeptFilter, setSubDeptFilter] = useState("ALL");
  const [subTypeFilter, setSubTypeFilter] = useState("ALL");

  const filteredSubjects = useMemo(() => {
    return storeState.subjects.filter((s) => {
      const matchSearch =
        !subSearch ||
        s.title.toLowerCase().includes(subSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(subSearch.toLowerCase());
      const matchDept = subDeptFilter === "ALL" || s.departmentCode === subDeptFilter;
      const matchType = subTypeFilter === "ALL" || s.type === subTypeFilter;
      return matchSearch && matchDept && matchType;
    });
  }, [storeState.subjects, subSearch, subDeptFilter, subTypeFilter]);

  // ==========================================
  // VIEW 5: Exam Rooms & Capacity State
  // ==========================================
  const [showAddHallModal, setShowAddHallModal] = useState(false);
  const [hallStatusModal, setHallStatusModal] = useState<ExamHallRecord | null>(null);
  const [hallMaintenanceReason, setHallMaintenanceReason] = useState("Scheduled AC overhaul and electrical testing");
  const [newHallData, setNewHallData] = useState({
    name: "",
    code: "",
    building: "Academic Block A",
    capacity: 100,
    examCapacity: 80,
    allocatedStudents: 0,
    type: "Lecture Hall" as const,
    hasAC: true,
    isAccessible: true,
    floor: "Ground Floor",
    status: "Available" as const,
  });

  const handleCreateHall = (e: React.FormEvent) => {
    e.preventDefault();
    const res = AcademicDataStore.addExamHall(newHallData);
    if (res.success) {
      showToast(`Venue ${newHallData.name} registered successfully.`);
      setShowAddHallModal(false);
      setNewHallData({
        name: "",
        code: "",
        building: "Academic Block A",
        capacity: 100,
        examCapacity: 80,
        allocatedStudents: 0,
        type: "Lecture Hall",
        hasAC: true,
        isAccessible: true,
        floor: "Ground Floor",
        status: "Available",
      });
    } else {
      showToast(res.error || "Failed to create hall.", "error");
    }
  };

  const handleToggleRoomStatus = (hall: ExamHallRecord) => {
    const nextStatus = hall.status === "Available" ? "Maintenance" : "Available";
    AcademicDataStore.toggleRoomAvailability(hall.id, nextStatus, nextStatus === "Maintenance" ? hallMaintenanceReason : undefined);
    showToast(`Room ${hall.code} status updated to ${nextStatus}.`);
    setHallStatusModal(null);
  };

  // ==========================================
  // VIEW 6: College Holidays & Calendar State
  // ==========================================
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [newHolidayData, setNewHolidayData] = useState({
    name: "",
    date: "2026-11-26",
    dayOfWeek: "Thursday",
    type: "Institutional Holiday" as const,
    description: "",
  });

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    const res = AcademicDataStore.addCollegeHoliday(newHolidayData);
    if (res.success) {
      showToast(`Holiday "${newHolidayData.name}" added to examination calendar.`);
      setShowAddHolidayModal(false);
      setNewHolidayData({
        name: "",
        date: "2026-11-26",
        dayOfWeek: "Thursday",
        type: "Institutional Holiday",
        description: "",
      });
    } else {
      showToast(res.error || "Failed to add holiday.", "error");
    }
  };

  // ==========================================
  // VIEW 7: Faculty & Invigilator Availability State
  // ==========================================
  const [facSearch, setFacSearch] = useState("");
  const [facDeptFilter, setFacDeptFilter] = useState("ALL");

  const filteredFaculty = useMemo(() => {
    return storeState.invigilators.filter((f) => {
      const matchSearch =
        !facSearch ||
        f.name.toLowerCase().includes(facSearch.toLowerCase()) ||
        f.identifier.toLowerCase().includes(facSearch.toLowerCase());
      const matchDept = facDeptFilter === "ALL" || f.departmentCode === facDeptFilter;
      return matchSearch && matchDept;
    });
  }, [storeState.invigilators, facSearch, facDeptFilter]);

  const handleToggleFacultyLeave = (f: InvigilatorRosterRecord) => {
    const nextStatus = f.status === "On Leave" ? "Available" : "On Leave";
    AcademicDataStore.toggleFacultyAvailability(f.id, nextStatus);
    showToast(`${f.name} marked as ${nextStatus}.`);
  };

  // ==========================================
  // VIEW 8: Timetable Generator State
  // ==========================================
  const [isSolving, setIsSolving] = useState(false);
  const [solverProgress, setSolverProgress] = useState(0);
  const [enforceHolidaysRule, setEnforceHolidaysRule] = useState(true);
  const [enforceAlternatingRule, setEnforceAlternatingRule] = useState(true);
  const [latestSolverResult, setLatestSolverResult] = useState<any>(null);

  const handleRunDeterministicSolver = () => {
    setIsSolving(true);
    setSolverProgress(15);

    setTimeout(() => setSolverProgress(45), 300);
    setTimeout(() => setSolverProgress(80), 700);

    setTimeout(() => {
      const result = AcademicDataStore.runConstraintSolver(activeCycle.id, {
        enforceHolidays: enforceHolidaysRule,
        enforceAlternatingBranches: enforceAlternatingRule,
      });
      setSolverProgress(100);
      setIsSolving(false);
      setLatestSolverResult(result);
      if (result.status === "OPTIMAL") {
        showToast("Constraint Optimization Optimal: 0 room clashes, 0 student overlaps, all constraints satisfied!");
      } else {
        showToast("Timetable generated with warnings. Review Conflict Resolution.", "warning");
      }
    }, 1100);
  };

  // ==========================================
  // VIEW 9: Student Seating Plan State
  // ==========================================
  const [seatingRoomFilter, setSeatingRoomFilter] = useState("ALL");
  const [seatingDateFilter, setSeatingDateFilter] = useState("ALL");

  const filteredSeating = useMemo(() => {
    return storeState.seatingRecords.filter((s) => {
      const matchRoom = seatingRoomFilter === "ALL" || s.roomCode === seatingRoomFilter;
      const matchDate = seatingDateFilter === "ALL" || s.date === seatingDateFilter;
      return matchRoom && matchDate;
    });
  }, [storeState.seatingRecords, seatingRoomFilter, seatingDateFilter]);

  // ==========================================
  // VIEW 10: Invigilator Duty Allocation State
  // ==========================================
  const [reassignModalExam, setReassignModalExam] = useState<CoordinatorExamEntry | null>(null);
  const [selectedNewFaculty, setSelectedNewFaculty] = useState<string>("");

  const handleConfirmReassignment = () => {
    if (!reassignModalExam || !selectedNewFaculty) return;
    const res = AcademicDataStore.reassignInvigilator(reassignModalExam.id, selectedNewFaculty);
    if (res.success) {
      showToast(`Invigilator for ${reassignModalExam.code} successfully updated to ${selectedNewFaculty}.`);
      setReassignModalExam(null);
      setSelectedNewFaculty("");
    } else {
      showToast(res.error || "Cannot reassign invigilator.", "error");
    }
  };

  // ==========================================
  // VIEW 11: Conflict Resolution State
  // ==========================================
  const handleResolveConflictItem = (c: ConflictItem, alt: string) => {
    AcademicDataStore.resolveConflict(c.id, alt);
    showToast(`Conflict resolved: ${alt}`);
  };

  // ==========================================
  // VIEW 12: Timetable Review & Submission State
  // ==========================================
  const activeSubmission = useMemo(() => {
    return storeState.timetables.find((t) => t.cycleId === activeCycle.id) || storeState.timetables[0];
  }, [storeState.timetables, activeCycle]);

  const handleSubmitForAdminApproval = () => {
    AcademicDataStore.submitTimetable({
      cycleId: activeCycle.id,
      cycleName: `${activeCycle.name} - ${activeCycle.department.split(" ")[0]}`,
      department: activeCycle.department,
      program: `${activeCycle.department} (${activeCycle.yearLevel})`,
      submittedBy: "Dr. Sarah Jenkins (Coordinator)",
      solverStatus: "OPTIMAL",
      clashesCount: storeState.conflicts.filter((c) => !c.resolved).length,
      roomUtilization: "84.2%",
      exams: storeState.coordinatorExams.map((e) => ({
        id: e.id,
        code: e.code,
        subject: e.subject,
        date: e.date,
        slot: e.slot,
        room: e.room,
        invigilator: e.invigilator,
        enrolled: e.enrolled,
      })),
    });
    showToast("Timetable successfully submitted to Administrator Approvals Queue.");
  };

  const handlePublishTimetable = () => {
    if (!activeSubmission) return;
    const res = AcademicDataStore.publishApprovedTimetable(activeSubmission.id);
    if (res.success) {
      showToast("Official Examination Timetable Published across University Portals!");
    } else {
      showToast(res.error || "Failed to publish timetable.", "error");
    }
  };

  // Rescheduling modal
  const [rescheduleModalExam, setRescheduleModalExam] = useState<CoordinatorExamEntry | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("2026-11-18");
  const [rescheduleSlot, setRescheduleSlot] = useState("09:30 - 12:30 IST");
  const [rescheduleRoom, setRescheduleRoom] = useState("Examination Hall A-101");
  const [rescheduleReason, setRescheduleReason] = useState("Urgent infrastructure maintenance");

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalExam) return;
    const res = AcademicDataStore.rescheduleCoordinatorExam(
      rescheduleModalExam.id,
      rescheduleDate,
      rescheduleSlot,
      rescheduleRoom,
      rescheduleReason
    );
    if (res.success) {
      showToast(`Exam ${rescheduleModalExam.code} rescheduled to ${rescheduleDate} (${rescheduleSlot}).`);
      setRescheduleModalExam(null);
    } else {
      showToast(res.error || "Cannot reschedule examination.", "error");
    }
  };

  // ==========================================
  // VIEW 14: Reports & Export State
  // ==========================================
  const [selectedReportTab, setSelectedReportTab] = useState<number>(1);

  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}.csv successfully.`);
  };

  const handlePrintCurrentView = () => {
    window.print();
  };

  return (
    <div className="dash-shell">
      {/* =========================================================
          1. VERTICAL LEFT SIDEBAR — Original NEXORA Light Theme
          ========================================================= */}
      <aside className="dash-sidebar" aria-label="Coordinator Sidebar Navigation">
        <div className="dash-brand">
          <div className="dash-brand-icon-box" style={{ background: "var(--brand-primary, #2563eb)" }}>
            N
          </div>
          <div className="dash-brand-titles">
            <span className="dash-brand-title">NEXORA</span>
            <span className="dash-brand-subtitle">Exam Coordinator Cell</span>
          </div>
        </div>

        <nav className="dash-nav" aria-label="Coordinator Workspaces">
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "overview" ? "active" : ""}`}
            onClick={() => setActiveMenu("overview")}
          >
            <LayoutDashboard size={16} className="dash-nav-item-icon" />
            <span>1. Overview</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "academic-setup" ? "active" : ""}`}
            onClick={() => setActiveMenu("academic-setup")}
          >
            <SlidersHorizontal size={16} className="dash-nav-item-icon" />
            <span>2. Academic & Exam Setup</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "student-registration" ? "active" : ""}`}
            onClick={() => setActiveMenu("student-registration")}
          >
            <UserCheck size={16} className="dash-nav-item-icon" />
            <span>3. Student Registration</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "subjects-catalog" ? "active" : ""}`}
            onClick={() => setActiveMenu("subjects-catalog")}
          >
            <BookOpen size={16} className="dash-nav-item-icon" />
            <span>4. Subjects & Exam Entries</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "rooms-capacity" ? "active" : ""}`}
            onClick={() => setActiveMenu("rooms-capacity")}
          >
            <Building2 size={16} className="dash-nav-item-icon" />
            <span>5. Rooms & Capacity</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "calendar-holidays" ? "active" : ""}`}
            onClick={() => setActiveMenu("calendar-holidays")}
          >
            <Calendar size={16} className="dash-nav-item-icon" />
            <span>6. Holidays & Calendar</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "faculty-availability" ? "active" : ""}`}
            onClick={() => setActiveMenu("faculty-availability")}
          >
            <Users size={16} className="dash-nav-item-icon" />
            <span>7. Faculty & Invigilators</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "timetable-generator" ? "active" : ""}`}
            onClick={() => setActiveMenu("timetable-generator")}
          >
            <Cpu size={16} className="dash-nav-item-icon" />
            <span>8. Timetable Generator</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "seating-plan" ? "active" : ""}`}
            onClick={() => setActiveMenu("seating-plan")}
          >
            <Layers size={16} className="dash-nav-item-icon" />
            <span>9. Student Seating Plan</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "duty-allocation" ? "active" : ""}`}
            onClick={() => setActiveMenu("duty-allocation")}
          >
            <ClipboardCheck size={16} className="dash-nav-item-icon" />
            <span>10. Invigilator Duties</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "conflict-resolution" ? "active" : ""}`}
            onClick={() => setActiveMenu("conflict-resolution")}
          >
            <AlertTriangle size={16} className="dash-nav-item-icon" />
            <span>11. Conflict Resolution</span>
            {storeState.conflicts.filter((c) => !c.resolved).length > 0 && (
              <span className="dash-badge dash-badge-danger" style={{ marginLeft: "auto", fontSize: "10px", padding: "1px 6px" }}>
                {storeState.conflicts.filter((c) => !c.resolved).length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "review-submission" ? "active" : ""}`}
            onClick={() => setActiveMenu("review-submission")}
          >
            <Send size={16} className="dash-nav-item-icon" />
            <span>12. Review & Submit</span>
            {activeSubmission?.status === "Revision Requested" && (
              <span className="dash-badge dash-badge-warning" style={{ marginLeft: "auto", fontSize: "10px", padding: "1px 6px" }}>
                Action
              </span>
            )}
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "published-timetables" ? "active" : ""}`}
            onClick={() => setActiveMenu("published-timetables")}
          >
            <Globe size={16} className="dash-nav-item-icon" />
            <span>13. Published Timetables</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "reports-export" ? "active" : ""}`}
            onClick={() => setActiveMenu("reports-export")}
          >
            <FileSpreadsheet size={16} className="dash-nav-item-icon" />
            <span>14. Reports & Export</span>
          </button>
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-status-indicator">
            <span className="dash-pulse-dot" />
            <span>Coordinator Mode</span>
          </div>
          <span className="dash-version-caption">NEXORA Engine v3.1</span>
        </div>
      </aside>

      {/* =========================================================
          2. MAIN CONTENT AREA — Matching Admin Dashboard Header & Cards
          ========================================================= */}
      <div className="dash-main">
        {/* Horizontal Top Navbar */}
        <header className="dash-topbar">
          <div className="dash-search-box">
            <Search size={15} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search subjects, rooms, faculty, or registrations..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              aria-label="Global Coordinator Search"
            />
          </div>

          <div className="dash-topbar-actions">
            {/* Active Cycle Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Active Cycle:</span>
              <select
                className="dash-select"
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                style={{ padding: "5px 10px", fontSize: "12.5px", minWidth: "220px", height: "34px" }}
              >
                {storeState.examCycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.academicYear})
                  </option>
                ))}
              </select>
            </div>

            {/* Switch to Admin Dashboard button */}
            {onSwitchToAdmin && (
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                onClick={onSwitchToAdmin}
                style={{ height: "34px", fontSize: "12.5px" }}
                title="Switch back to Central Admin Dashboard"
              >
                <ArrowRight size={14} />
                <span>Switch to Admin</span>
              </button>
            )}

            {/* Coordinator User Badge */}
            <div className="dash-user-chip">
              <div className="dash-avatar" style={{ background: "var(--brand-primary, #2563eb)" }}>
                {coordinatorName.charAt(0).toUpperCase()}
              </div>
              <div className="dash-user-meta">
                <span className="dash-user-name">{coordinatorName}</span>
                <span className="dash-user-role">Exam Coordinator</span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                onClick={onLogout}
                style={{ height: "34px", padding: "0 10px", fontSize: "12px" }}
                title="Log out of session"
              >
                Sign Out
              </button>
            )}
          </div>
        </header>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              top: "70px",
              right: "24px",
              zIndex: 9999,
              padding: "12px 18px",
              borderRadius: "8px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13.5px",
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor:
                toastMessage.type === "success"
                  ? "#10B981"
                  : toastMessage.type === "error"
                  ? "#EF4444"
                  : toastMessage.type === "warning"
                  ? "#F59E0B"
                  : "#3B82F6",
            }}
          >
            {toastMessage.type === "success" && <Check size={16} />}
            {toastMessage.type === "error" && <AlertCircle size={16} />}
            {toastMessage.type === "warning" && <AlertTriangle size={16} />}
            {toastMessage.type === "info" && <Info size={16} />}
            <span>{toastMessage.message}</span>
            <button
              onClick={() => setToastMessage(null)}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: "8px" }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* =========================================================
            SECTION CONTENT SWITCHER (14 Distinct Functional Views)
            ========================================================= */}
        <main className="dash-content">
          {/* =====================================================
              VIEW 1: OVERVIEW DASHBOARD
              ===================================================== */}
          {activeMenu === "overview" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Coordinator Operations Overview</h1>
                  <p className="dash-view-subtitle">
                    Live metrics for {activeCycle.name} ({activeCycle.academicYear}) · {activeCycle.department}
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={() => setActiveMenu("timetable-generator")}
                  >
                    <Cpu size={15} />
                    <span>Run Timetable Optimizer</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() => setActiveMenu("review-submission")}
                  >
                    <Send size={15} />
                    <span>Review & Submit</span>
                  </button>
                </div>
              </div>

              {/* 11 Operational Summary Metric Cards */}
              <div className="dash-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                <div className="dash-stat-card">
                  <div className="dash-stat-label">Total Departments</div>
                  <div className="dash-stat-value">{storeState.departments.length}</div>
                  <div className="dash-stat-sub">Central engineering divisions</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Enrolled Candidates</div>
                  <div className="dash-stat-value">{storeState.studentRegistrations.length}</div>
                  <div className="dash-stat-sub">Registered student records</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Scheduled Papers</div>
                  <div className="dash-stat-value">{storeState.coordinatorExams.length}</div>
                  <div className="dash-stat-sub">Theory & laboratory entries</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Backlog Candidates</div>
                  <div className="dash-stat-value" style={{ color: "var(--brand-primary, #2563eb)" }}>
                    {storeState.studentRegistrations.filter((r) => r.registrationType === "Backlog").length}
                  </div>
                  <div className="dash-stat-sub">Cross-term re-evaluations</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Makeup Registrations</div>
                  <div className="dash-stat-value" style={{ color: "#8b5cf6" }}>
                    {storeState.studentRegistrations.filter((r) => r.registrationType === "Makeup").length}
                  </div>
                  <div className="dash-stat-sub">Special authorized sittings</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Venues & Total Capacity</div>
                  <div className="dash-stat-value">
                    {storeState.examHalls.filter((h) => h.status === "Available").length}
                    <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500, marginLeft: "4px" }}>
                      ({storeState.examHalls.filter((h) => h.status === "Available").reduce((acc, h) => acc + h.examCapacity, 0)} seats)
                    </span>
                  </div>
                  <div className="dash-stat-sub">Available examination halls</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Active Invigilators</div>
                  <div className="dash-stat-value">
                    {storeState.invigilators.filter((f) => f.status === "Available").length}
                    <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500, marginLeft: "4px" }}>
                      / {storeState.invigilators.length}
                    </span>
                  </div>
                  <div className="dash-stat-sub">Faculty ready for allocation</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Solver Status</div>
                  <div className="dash-stat-value" style={{ color: "#10b981", fontSize: "18px" }}>
                    {activeSubmission?.solverStatus || "OPTIMAL"}
                  </div>
                  <div className="dash-stat-sub">CP-SAT deterministic run</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Unresolved Conflicts</div>
                  <div
                    className="dash-stat-value"
                    style={{ color: storeState.conflicts.filter((c) => !c.resolved).length > 0 ? "#ef4444" : "#10b981" }}
                  >
                    {storeState.conflicts.filter((c) => !c.resolved).length}
                  </div>
                  <div className="dash-stat-sub">Hard / Soft constraint flags</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Awaiting Admin Approval</div>
                  <div className="dash-stat-value" style={{ color: "#f59e0b" }}>
                    {storeState.timetables.filter((t) => t.status === "Submitted").length}
                  </div>
                  <div className="dash-stat-sub">In Admin review queue</div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-label">Approved & Published</div>
                  <div className="dash-stat-value" style={{ color: "#10b981" }}>
                    {storeState.timetables.filter((t) => t.status === "Approved" || t.status === "Published").length}
                  </div>
                  <div className="dash-stat-sub">Live student circulars</div>
                </div>
              </div>

              {/* Operational Sections Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", marginTop: "24px" }}>
                {/* Upcoming Examination Papers */}
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Upcoming Examination Papers</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                        Immediate sessions in active cycle ({activeCycle.startDate} to {activeCycle.endDate})
                      </p>
                    </div>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() => setActiveMenu("subjects-catalog")}
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                    >
                      View All
                    </button>
                  </div>

                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Date & Slot</th>
                          <th>Venue</th>
                          <th>Enrolled</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.coordinatorExams.slice(0, 5).map((ex) => (
                          <tr key={ex.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{ex.code}</div>
                              <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{ex.subject}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: "12.5px", fontWeight: 500 }}>{ex.date}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ex.slot}</div>
                            </td>
                            <td>
                              <span className="dash-badge dash-badge-default">{ex.room}</span>
                            </td>
                            <td>{ex.enrolled}</td>
                            <td>
                              <span
                                className={`dash-badge ${
                                  ex.status === "Published"
                                    ? "dash-badge-success"
                                    : ex.status === "Approved"
                                    ? "dash-badge-success"
                                    : ex.status === "Submitted"
                                    ? "dash-badge-info"
                                    : ex.status === "Revision Requested"
                                    ? "dash-badge-warning"
                                    : "dash-badge-default"
                                }`}
                              >
                                {ex.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Coordinator Pending Tasks Checklist */}
                <div className="dash-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px" }}>Coordinator Action Queue</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-app)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <UserCheck size={18} style={{ color: "var(--brand-primary)", marginTop: "2px", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>Verify Backlog & Makeup Eligibility</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          2 candidates flagged with prerequisite & fee clearance conditions.
                        </div>
                        <button
                          type="button"
                          className="dash-btn dash-btn-outline"
                          onClick={() => setActiveMenu("student-registration")}
                          style={{ fontSize: "11.5px", padding: "3px 8px", marginTop: "8px" }}
                        >
                          Review Registrations
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-app)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <Building2 size={18} style={{ color: "#f59e0b", marginTop: "2px", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>Venue Maintenance Inspection</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Hall F-102 is marked Under Maintenance. Ensure alternate rooms are allocated.
                        </div>
                        <button
                          type="button"
                          className="dash-btn dash-btn-outline"
                          onClick={() => setActiveMenu("rooms-capacity")}
                          style={{ fontSize: "11.5px", padding: "3px 8px", marginTop: "8px" }}
                        >
                          Manage Halls
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-app)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <Send size={18} style={{ color: "#10b981", marginTop: "2px", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>Submit Timetable for Admin Approval</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Current status: <strong>{activeSubmission?.status || "Draft"}</strong>.
                        </div>
                        <button
                          type="button"
                          className="dash-btn dash-btn-outline"
                          onClick={() => setActiveMenu("review-submission")}
                          style={{ fontSize: "11.5px", padding: "3px 8px", marginTop: "8px" }}
                        >
                          Open Review Portal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Audit & Scheduling Activity */}
              <div className="dash-card" style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>Recent Coordinator & Scheduling Activity</h3>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeState.auditLogs.slice(0, 6).map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{log.timestamp}</td>
                          <td style={{ fontWeight: 600 }}>{log.actor}</td>
                          <td>
                            <span className="dash-badge dash-badge-default" style={{ fontSize: "11px" }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ fontSize: "12.5px" }}>{log.details}</td>
                          <td>
                            <span
                              className={`dash-badge ${
                                log.status === "SUCCESS"
                                  ? "dash-badge-success"
                                  : log.status === "WARNING"
                                  ? "dash-badge-warning"
                                  : "dash-badge-info"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 2: ACADEMIC & EXAM SETUP
              ===================================================== */}
          {activeMenu === "academic-setup" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Academic & Examination Setup</h1>
                  <p className="dash-view-subtitle">
                    Configure institutional parameters, dependent academic hierarchy, and calendar boundaries
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveAcademicSetup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Dependent Academic Selection Hierarchy */}
                <div className="dash-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 16px" }}>
                    1. Academic Hierarchy & Scope (Dependent Validations)
                  </h3>

                  <div className="dash-form-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Academic Year *</label>
                      <select
                        className="dash-select"
                        value={setupAcademicYear}
                        onChange={(e) => setSetupAcademicYear(e.target.value)}
                      >
                        <option value="2026-27">2026-27 (Current Term)</option>
                        <option value="2025-26">2025-26 (Prior Term)</option>
                        <option value="2027-28">2027-28 (Upcoming)</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Department *</label>
                      <select
                        className="dash-select"
                        value={setupDept}
                        onChange={(e) => setSetupDept(e.target.value)}
                      >
                        {storeState.departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Program / Course (Dependent) *</label>
                      <select
                        className="dash-select"
                        value={setupProgramCode}
                        onChange={(e) => setSetupProgramCode(e.target.value)}
                      >
                        {availableProgramsForDept.map((p) => (
                          <option key={p.id} value={p.code}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Year of Study *</label>
                      <select
                        className="dash-select"
                        value={setupYearOfStudy}
                        onChange={(e) => setSetupYearOfStudy(e.target.value as YearOfStudy)}
                      >
                        <option value="First">First Year</option>
                        <option value="Second">Second Year</option>
                        <option value="Third">Third Year</option>
                        <option value="Fourth">Fourth Year</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Division *</label>
                      <select
                        className="dash-select"
                        value={setupDivision}
                        onChange={(e) => setSetupDivision(e.target.value as any)}
                      >
                        <option value="All Divisions">All Divisions (A & B)</option>
                        <option value="Division A">Division A</option>
                        <option value="Division B">Division B</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Semester (Valid for {setupYearOfStudy} Year) *</label>
                      <select
                        className="dash-select"
                        value={setupSemester}
                        onChange={(e) => setSetupSemester(Number(e.target.value))}
                      >
                        {validSemestersForYear.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem} ({sem % 2 === 1 ? "Odd" : "Even"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      background: "var(--bg-app)",
                      border: "1px solid var(--border-default)",
                      fontSize: "12.5px",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Info size={16} style={{ color: "var(--brand-primary)" }} />
                    <span>
                      Selected Scope: <strong>{setupProgramCode}</strong> · <strong>{setupYearOfStudy} Year</strong> ·{" "}
                      <strong>Semester {setupSemester} ({setupSemesterCategory})</strong> · {setupDivision}.
                    </span>
                  </div>
                </div>

                {/* Examination Type & Timing Parameters */}
                <div className="dash-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 16px" }}>
                    2. Examination Cycle Boundaries & Timings
                  </h3>

                  <div className="dash-form-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Examination Type *</label>
                      <select
                        className="dash-select"
                        value={setupExamType}
                        onChange={(e) => setSetupExamType(e.target.value as any)}
                      >
                        <option value="MSE">Mid-Semester Examination (MSE)</option>
                        <option value="ESE">End-Semester Examination (ESE)</option>
                        <option value="Backlog Examination">Backlog Examination</option>
                        <option value="Makeup Examination">Makeup Assessment</option>
                        <option value="Lab-Practical Examination">Lab / Practical Evaluation</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Cycle Name *</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={setupCycleName}
                        onChange={(e) => setSetupCycleName(e.target.value)}
                        placeholder="e.g. Winter 2026 Examination"
                        required
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Subject Exam Duration *</label>
                      <select
                        className="dash-select"
                        value={setupDuration}
                        onChange={(e) => setSetupDuration(Number(e.target.value))}
                      >
                        <option value={180}>180 Minutes (3.0 Hours)</option>
                        <option value={120}>120 Minutes (2.0 Hours)</option>
                        <option value={90}>90 Minutes (1.5 Hours)</option>
                        <option value={60}>60 Minutes (1.0 Hour)</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Exam Start Date *</label>
                      <input
                        type="date"
                        className="dash-input"
                        value={setupStartDate}
                        onChange={(e) => setSetupStartDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Exam End Date *</label>
                      <input
                        type="date"
                        className="dash-input"
                        value={setupEndDate}
                        onChange={(e) => setSetupEndDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Session Windows *</label>
                      <select
                        className="dash-select"
                        value={setupSessionWindow}
                        onChange={(e) => setSetupSessionWindow(e.target.value as any)}
                      >
                        <option value="Both Sessions">Both Sessions (Morning & Afternoon)</option>
                        <option value="Morning (09:30 - 12:30 IST)">Morning Session Only (09:30 - 12:30 IST)</option>
                        <option value="Afternoon (14:00 - 17:00 IST)">Afternoon Session Only (14:00 - 17:00 IST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Holiday Exclusions & Institutional Constraints */}
                <div className="dash-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px" }}>
                    3. Holiday Calendar Rules & Malpractice Prevention
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-app)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "6px" }}>
                        Applicable College Holidays in Selected Window:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {storeState.collegeHolidays
                          .filter((h) => h.date >= setupStartDate && h.date <= setupEndDate)
                          .map((h) => (
                            <div
                              key={h.id}
                              style={{
                                fontSize: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "4px 0",
                                borderBottom: "1px solid var(--border-default)",
                              }}
                            >
                              <span>
                                <strong>{h.date}</strong> · {h.name}
                              </span>
                              <span className="dash-badge dash-badge-warning" style={{ fontSize: "10.5px" }}>
                                {h.type}
                              </span>
                            </div>
                          ))}
                        {storeState.collegeHolidays.filter((h) => h.date >= setupStartDate && h.date <= setupEndDate).length === 0 && (
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            No college holidays fall inside this date window.
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-app)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px" }}>
                        Governance Policy Verification:
                      </div>
                      <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                          <span>Strict Holiday Protection: Zero examinations on official holidays</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                          <span>Alternating Department Seating mandatory for anti-copying</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                          <span>Faculty maximum invigilation duties: 3 per exam cycle</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                    <button type="submit" className="dash-btn dash-btn-primary">
                      <Check size={15} />
                      <span>Save & Enforce Academic Setup</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* =====================================================
              VIEW 3: STUDENT REGISTRATION & ELIGIBILITY
              ===================================================== */}
          {activeMenu === "student-registration" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Student Registration & Examination Eligibility</h1>
                  <p className="dash-view-subtitle">
                    Examine regular enrollment, backlog clearance, makeup approvals, attendance criteria, and fee status
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() =>
                      handleExportCSV(
                        "Student_Registration_Eligibility",
                        ["Roll No", "Student Name", "Department", "Semester", "Subject Code", "Subject Title", "Registration Type", "Status", "Eligibility", "Attendance %", "Fee Cleared"],
                        filteredRegistrations.map((r) => [
                          r.rollNo,
                          r.name,
                          r.departmentCode,
                          r.semester,
                          r.subjectCode,
                          r.subjectTitle,
                          r.registrationType,
                          r.registrationStatus,
                          r.eligibilityStatus,
                          `${r.attendancePercentage}%`,
                          r.feesCleared ? "Cleared" : "Pending",
                        ])
                      )
                    }
                  >
                    <Download size={15} />
                    <span>Export Registrations (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="dash-card" style={{ padding: "16px", marginBottom: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(5, 1fr)", gap: "12px" }}>
                  <div>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="Search candidate name, roll no, or subject..."
                      value={regSearch}
                      onChange={(e) => setRegSearch(e.target.value)}
                    />
                  </div>

                  <div>
                    <select
                      className="dash-select"
                      value={regDeptFilter}
                      onChange={(e) => setRegDeptFilter(e.target.value)}
                    >
                      <option value="ALL">All Departments</option>
                      {storeState.departments.map((d) => (
                        <option key={d.id} value={d.code}>
                          {d.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      className="dash-select"
                      value={regYearFilter}
                      onChange={(e) => setRegYearFilter(e.target.value)}
                    >
                      <option value="ALL">All Years</option>
                      <option value="First">First Year</option>
                      <option value="Second">Second Year</option>
                      <option value="Third">Third Year</option>
                      <option value="Fourth">Fourth Year</option>
                    </select>
                  </div>

                  <div>
                    <select
                      className="dash-select"
                      value={regTypeFilter}
                      onChange={(e) => setRegTypeFilter(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="Regular">Regular</option>
                      <option value="Backlog">Backlog</option>
                      <option value="Makeup">Makeup</option>
                    </select>
                  </div>

                  <div>
                    <select
                      className="dash-select"
                      value={regStatusFilter}
                      onChange={(e) => setRegStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Registered">Registered</option>
                      <option value="Not Registered">Not Registered</option>
                      <option value="Pending Payment">Pending Payment</option>
                    </select>
                  </div>

                  <div>
                    <select
                      className="dash-select"
                      value={regEligibilityFilter}
                      onChange={(e) => setRegEligibilityFilter(e.target.value)}
                    >
                      <option value="ALL">All Eligibility</option>
                      <option value="Eligible">Eligible Only</option>
                      <option value="Ineligible">Ineligible Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Registrations Table */}
              <div className="dash-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>
                    Showing {filteredRegistrations.length} student examination records
                  </div>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Candidate / Roll No</th>
                        <th>Dept & Term</th>
                        <th>Subject Code & Paper</th>
                        <th>Type</th>
                        <th>Registration Status</th>
                        <th>Eligibility Criteria</th>
                        <th>Attendance</th>
                        <th>Fee Clearance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{reg.name}</div>
                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{reg.rollNo}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: "12.5px" }}>{reg.departmentCode}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              Sem {reg.semester} ({reg.division})
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{reg.subjectCode}</div>
                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{reg.subjectTitle}</div>
                          </td>
                          <td>
                            <span
                              className={`dash-badge ${
                                reg.registrationType === "Regular"
                                  ? "dash-badge-default"
                                  : reg.registrationType === "Backlog"
                                  ? "dash-badge-warning"
                                  : "dash-badge-info"
                              }`}
                            >
                              {reg.registrationType}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`dash-badge ${
                                reg.registrationStatus === "Registered"
                                  ? "dash-badge-success"
                                  : reg.registrationStatus === "Pending Payment"
                                  ? "dash-badge-warning"
                                  : "dash-badge-danger"
                              }`}
                            >
                              {reg.registrationStatus}
                            </span>
                          </td>
                          <td>
                            {reg.eligibilityStatus === "Eligible" ? (
                              <span className="dash-badge dash-badge-success">
                                <Check size={11} style={{ marginRight: "3px" }} />
                                Eligible
                              </span>
                            ) : (
                              <span
                                className="dash-badge dash-badge-danger"
                                title={reg.ineligibilityReason}
                                style={{ cursor: "help" }}
                              >
                                <X size={11} style={{ marginRight: "3px" }} />
                                Ineligible
                              </span>
                            )}
                            {reg.ineligibilityReason && (
                              <div style={{ fontSize: "10.5px", color: "#ef4444", marginTop: "2px" }}>
                                {reg.ineligibilityReason}
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color: reg.attendancePercentage < 75 ? "#ef4444" : "var(--text-primary)",
                              }}
                            >
                              {reg.attendancePercentage}%
                            </span>
                          </td>
                          <td>
                            <span
                              className={`dash-badge ${reg.feesCleared ? "dash-badge-success" : "dash-badge-danger"}`}
                              style={{ fontSize: "11px" }}
                            >
                              {reg.feesCleared ? "Cleared" : "Fee Dues"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline"
                              onClick={() => setSelectedStudentForModal(reg)}
                              style={{ fontSize: "11.5px", padding: "4px 8px" }}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRegistrations.length === 0 && (
                        <tr>
                          <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                            No student registration records match the selected scope filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Student Detail & Correction Modal */}
              {selectedStudentForModal && (
                <div className="dash-modal-backdrop" onClick={() => setSelectedStudentForModal(null)}>
                  <div className="dash-modal" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
                    <div className="dash-modal-header">
                      <h3 className="dash-modal-title">Student Examination Dossier</h3>
                      <button
                        type="button"
                        className="dash-modal-close"
                        onClick={() => setSelectedStudentForModal(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ padding: "12px", background: "var(--bg-app)", borderRadius: "6px" }}>
                        <div style={{ fontSize: "16px", fontWeight: 700 }}>{selectedStudentForModal.name}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          Roll No: <strong>{selectedStudentForModal.rollNo}</strong> · {selectedStudentForModal.departmentCode} ({selectedStudentForModal.division})
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          Subject: {selectedStudentForModal.subjectCode} — {selectedStudentForModal.subjectTitle}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                        <div>
                          <strong>Attendance:</strong>{" "}
                          <span style={{ color: selectedStudentForModal.attendancePercentage < 75 ? "#ef4444" : "#10b981", fontWeight: 700 }}>
                            {selectedStudentForModal.attendancePercentage}%
                          </span>
                        </div>
                        <div>
                          <strong>Tuition Fees:</strong> {selectedStudentForModal.feesCleared ? "Cleared" : "Outstanding Dues"}
                        </div>
                        <div>
                          <strong>Registration Type:</strong> {selectedStudentForModal.registrationType}
                        </div>
                        <div>
                          <strong>Status:</strong> {selectedStudentForModal.registrationStatus}
                        </div>
                      </div>

                      {selectedStudentForModal.ineligibilityReason && (
                        <div style={{ padding: "10px", borderRadius: "6px", background: "#fef2f2", color: "#991b1b", fontSize: "12px" }}>
                          <strong>Disqualification Note:</strong> {selectedStudentForModal.ineligibilityReason}
                        </div>
                      )}

                      <div className="dash-form-group">
                        <label className="dash-label">Coordinator Eligibility Review & Waiver Note</label>
                        <textarea
                          className="dash-input"
                          rows={2}
                          placeholder="e.g. Approved institutional medical certificate, attendance shortage waived by HOD..."
                          value={overrideModalReason}
                          onChange={(e) => setOverrideModalReason(e.target.value)}
                        />
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                        <button
                          type="button"
                          className="dash-btn dash-btn-outline"
                          onClick={() => handleUpdateStudentEligibility("Ineligible")}
                        >
                          Mark Ineligible
                        </button>
                        <button
                          type="button"
                          className="dash-btn dash-btn-primary"
                          onClick={() => handleUpdateStudentEligibility("Eligible")}
                        >
                          Grant Eligibility Waiver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              VIEW 4: SUBJECTS & EXAM ENTRIES
              ===================================================== */}
          {activeMenu === "subjects-catalog" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Curriculum Subjects & Examination Entries</h1>
                  <p className="dash-view-subtitle">
                    Select eligible subjects, view enrollment counts, credits, and schedule inclusion for active cycle
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() =>
                      handleExportCSV(
                        "Exam_Subjects_Catalog",
                        ["Code", "Title", "Department", "Program", "Semester", "Type", "Credits", "Enrolled"],
                        filteredSubjects.map((s) => [s.code, s.title, s.departmentCode, s.programCode, s.semester, s.type, s.credits, s.enrolledStudents])
                      )
                    }
                  >
                    <Download size={15} />
                    <span>Export Subjects</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="dash-card" style={{ padding: "16px", marginBottom: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: "12px" }}>
                  <input
                    type="text"
                    className="dash-input"
                    placeholder="Search subject code or curriculum title..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                  />

                  <select
                    className="dash-select"
                    value={subDeptFilter}
                    onChange={(e) => setSubDeptFilter(e.target.value)}
                  >
                    <option value="ALL">All Departments</option>
                    {storeState.departments.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>

                  <select
                    className="dash-select"
                    value={subTypeFilter}
                    onChange={(e) => setSubTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All Course Types</option>
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Lab">Lab</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Subject Title</th>
                        <th>Dept & Program</th>
                        <th>Semester</th>
                        <th>Type</th>
                        <th>Credits</th>
                        <th>Enrolled Students</th>
                        <th>Exam Duration</th>
                        <th>Cycle Inclusion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.map((sub) => {
                        const isIncluded = !storeState.coordinatorExams.some((e) => e.code === sub.code && e.isIncluded === false);
                        return (
                          <tr key={sub.id}>
                            <td style={{ fontWeight: 700 }}>{sub.code}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{sub.title}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                L-T-P: {sub.lectureHours}-{sub.tutorialHours}-{sub.practicalHours}
                              </div>
                            </td>
                            <td>
                              <span className="dash-badge dash-badge-default">{sub.departmentCode}</span>
                            </td>
                            <td>Sem {sub.semester}</td>
                            <td>
                              <span
                                className={`dash-badge ${
                                  sub.type === "Theory"
                                    ? "dash-badge-default"
                                    : sub.type === "Lab"
                                    ? "dash-badge-info"
                                    : "dash-badge-warning"
                                }`}
                              >
                                {sub.type}
                              </span>
                            </td>
                            <td>{sub.credits}</td>
                            <td>
                              <strong>{sub.enrolledStudents}</strong> candidates
                            </td>
                            <td>180 mins</td>
                            <td>
                              <button
                                type="button"
                                className={`dash-btn ${isIncluded ? "dash-btn-outline" : "dash-btn-primary"}`}
                                onClick={() => {
                                  AcademicDataStore.toggleSubjectInclusion(sub.code, !isIncluded);
                                  showToast(`${sub.code} ${isIncluded ? "excluded from" : "included in"} cycle schedule.`);
                                }}
                                style={{ fontSize: "11.5px", padding: "3px 8px" }}
                              >
                                {isIncluded ? "Included in Cycle" : "Excluded"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 5: EXAM ROOMS & CAPACITY
              ===================================================== */}
          {activeMenu === "rooms-capacity" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Examination Rooms & Seating Capacity</h1>
                  <p className="dash-view-subtitle">
                    Manage testing halls, AC ventilation, barrier-free accessibility, maintenance reservations, and safe capacities
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={() => setShowAddHallModal(true)}
                  >
                    <Plus size={15} />
                    <span>Register Venue</span>
                  </button>
                </div>
              </div>

              {/* Halls Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "16px" }}>
                {storeState.examHalls.map((hall) => (
                  <div key={hall.id} className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 700 }}>{hall.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {hall.building} · {hall.floor}
                        </div>
                      </div>
                      <span
                        className={`dash-badge ${
                          hall.status === "Available"
                            ? "dash-badge-success"
                            : hall.status === "Maintenance"
                            ? "dash-badge-danger"
                            : "dash-badge-warning"
                        }`}
                      >
                        {hall.status}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12.5px" }}>
                      <div>
                        Total Capacity: <strong>{hall.capacity}</strong>
                      </div>
                      <div>
                        Exam Safe Capacity: <strong>{hall.examCapacity}</strong>
                      </div>
                      <div>
                        Venue Type: <strong>{hall.type}</strong>
                      </div>
                      <div>
                        AC Fitted: <strong>{hall.hasAC ? "Yes" : "No"}</strong>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        Accessibility:{" "}
                        <strong style={{ color: hall.isAccessible ? "#10b981" : "#f59e0b" }}>
                          {hall.isAccessible ? "Wheelchair Accessible (Ground/Lift)" : "Staircase Access Only"}
                        </strong>
                      </div>
                    </div>

                    {hall.maintenanceReason && (
                      <div style={{ padding: "8px", borderRadius: "6px", background: "#fef2f2", color: "#991b1b", fontSize: "11.5px" }}>
                        <strong>Blocked:</strong> {hall.maintenanceReason}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
                      <button
                        type="button"
                        className="dash-btn dash-btn-outline"
                        onClick={() => setHallStatusModal(hall)}
                        style={{ fontSize: "11.5px", padding: "4px 8px" }}
                      >
                        {hall.status === "Available" ? "Block for Maintenance" : "Mark Available"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Hall Modal */}
              {showAddHallModal && (
                <div className="dash-modal-backdrop" onClick={() => setShowAddHallModal(false)}>
                  <div className="dash-modal" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
                    <div className="dash-modal-header">
                      <h3 className="dash-modal-title">Register Examination Venue</h3>
                      <button type="button" className="dash-modal-close" onClick={() => setShowAddHallModal(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={handleCreateHall} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div className="dash-form-group">
                        <label className="dash-label">Hall Name *</label>
                        <input
                          type="text"
                          className="dash-input"
                          required
                          value={newHallData.name}
                          onChange={(e) => setNewHallData({ ...newHallData, name: e.target.value })}
                          placeholder="e.g. Examination Hall G-102"
                        />
                      </div>
                      <div className="dash-form-group">
                        <label className="dash-label">Room Code *</label>
                        <input
                          type="text"
                          className="dash-input"
                          required
                          value={newHallData.code}
                          onChange={(e) => setNewHallData({ ...newHallData, code: e.target.value })}
                          placeholder="e.g. G-102"
                        />
                      </div>
                      <div className="dash-form-group">
                        <label className="dash-label">Building / Block *</label>
                        <input
                          type="text"
                          className="dash-input"
                          required
                          value={newHallData.building}
                          onChange={(e) => setNewHallData({ ...newHallData, building: e.target.value })}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div className="dash-form-group">
                          <label className="dash-label">Total Capacity *</label>
                          <input
                            type="number"
                            className="dash-input"
                            required
                            min={10}
                            value={newHallData.capacity}
                            onChange={(e) =>
                              setNewHallData({
                                ...newHallData,
                                capacity: Number(e.target.value),
                                examCapacity: Math.floor(Number(e.target.value) * 0.8),
                              })
                            }
                          />
                        </div>
                        <div className="dash-form-group">
                          <label className="dash-label">Safe Exam Capacity *</label>
                          <input
                            type="number"
                            className="dash-input"
                            required
                            value={newHallData.examCapacity}
                            onChange={(e) => setNewHallData({ ...newHallData, examCapacity: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                        <button type="button" className="dash-btn dash-btn-outline" onClick={() => setShowAddHallModal(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="dash-btn dash-btn-primary">
                          Save Venue
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Maintenance Toggle Confirmation Modal */}
              {hallStatusModal && (
                <div className="dash-modal-backdrop" onClick={() => setHallStatusModal(null)}>
                  <div className="dash-modal" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
                    <div className="dash-modal-header">
                      <h3 className="dash-modal-title">
                        {hallStatusModal.status === "Available" ? "Block Room for Maintenance" : "Restore Room Availability"}
                      </h3>
                      <button type="button" className="dash-modal-close" onClick={() => setHallStatusModal(null)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                      <p>
                        Are you sure you want to change <strong>{hallStatusModal.name}</strong> to{" "}
                        <strong>{hallStatusModal.status === "Available" ? "Maintenance" : "Available"}</strong>?
                      </p>
                      {hallStatusModal.status === "Available" && (
                        <div className="dash-form-group">
                          <label className="dash-label">Recorded Reason for Maintenance *</label>
                          <input
                            type="text"
                            className="dash-input"
                            value={hallMaintenanceReason}
                            onChange={(e) => setHallMaintenanceReason(e.target.value)}
                          />
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                        <button type="button" className="dash-btn dash-btn-outline" onClick={() => setHallStatusModal(null)}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="dash-btn dash-btn-primary"
                          onClick={() => handleToggleRoomStatus(hallStatusModal)}
                        >
                          Confirm Status Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              VIEW 6: COLLEGE HOLIDAYS & CALENDAR
              ===================================================== */}
          {activeMenu === "calendar-holidays" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">College Holidays & Examination Calendar</h1>
                  <p className="dash-view-subtitle">
                    Gazetted public holidays, institutional preparation breaks, and calendar exclusion rules
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={() => setShowAddHolidayModal(true)}
                  >
                    <Plus size={15} />
                    <span>Add Holiday</span>
                  </button>
                </div>
              </div>

              {/* Optimizer Exclusion Rule Banner */}
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <CheckCircle2 size={20} style={{ color: "#2563eb", flexShrink: 0 }} />
                <div style={{ fontSize: "13px", color: "#1e3a8a" }}>
                  <strong>Deterministic Exclusion Guarantee:</strong> The NEXORA CP-SAT scheduler automatically treats all Gazetted & Institutional holidays below as hard zero-capacity blocks. No student or invigilator can be scheduled on these dates.
                </div>
              </div>

              {/* Holidays Table */}
              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Date & Day</th>
                        <th>Holiday Name</th>
                        <th>Category</th>
                        <th>Description / Impact</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeState.collegeHolidays.map((hol) => (
                        <tr key={hol.id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{hol.date}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{hol.dayOfWeek}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{hol.name}</td>
                          <td>
                            <span
                              className={`dash-badge ${
                                hol.type === "Gazetted Holiday"
                                  ? "dash-badge-danger"
                                  : "dash-badge-warning"
                              }`}
                            >
                              {hol.type}
                            </span>
                          </td>
                          <td style={{ fontSize: "12.5px" }}>{hol.description}</td>
                          <td>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline"
                              onClick={() => {
                                AcademicDataStore.deleteCollegeHoliday(hol.id);
                                showToast(`Holiday ${hol.name} removed from calendar.`);
                              }}
                              style={{ fontSize: "11px", padding: "3px 8px", color: "#ef4444" }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Holiday Modal */}
              {showAddHolidayModal && (
                <div className="dash-modal-backdrop" onClick={() => setShowAddHolidayModal(false)}>
                  <div className="dash-modal" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
                    <div className="dash-modal-header">
                      <h3 className="dash-modal-title">Record Academic Holiday</h3>
                      <button type="button" className="dash-modal-close" onClick={() => setShowAddHolidayModal(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={handleAddHoliday} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div className="dash-form-group">
                        <label className="dash-label">Holiday Title *</label>
                        <input
                          type="text"
                          className="dash-input"
                          required
                          value={newHolidayData.name}
                          onChange={(e) => setNewHolidayData({ ...newHolidayData, name: e.target.value })}
                          placeholder="e.g. Guru Nanak Jayanti"
                        />
                      </div>
                      <div className="dash-form-group">
                        <label className="dash-label">Date *</label>
                        <input
                          type="date"
                          className="dash-input"
                          required
                          value={newHolidayData.date}
                          onChange={(e) => setNewHolidayData({ ...newHolidayData, date: e.target.value })}
                        />
                      </div>
                      <div className="dash-form-group">
                        <label className="dash-label">Category *</label>
                        <select
                          className="dash-select"
                          value={newHolidayData.type}
                          onChange={(e) => setNewHolidayData({ ...newHolidayData, type: e.target.value as any })}
                        >
                          <option value="Gazetted Holiday">Gazetted Public Holiday</option>
                          <option value="Institutional Holiday">Institutional Holiday</option>
                          <option value="Restricted Holiday">Restricted Holiday</option>
                        </select>
                      </div>
                      <div className="dash-form-group">
                        <label className="dash-label">Description</label>
                        <textarea
                          className="dash-input"
                          rows={2}
                          value={newHolidayData.description}
                          onChange={(e) => setNewHolidayData({ ...newHolidayData, description: e.target.value })}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                        <button type="button" className="dash-btn dash-btn-outline" onClick={() => setShowAddHolidayModal(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="dash-btn dash-btn-primary">
                          Save Holiday
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              VIEW 7: FACULTY & INVIGILATOR AVAILABILITY
              ===================================================== */}
          {activeMenu === "faculty-availability" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Faculty Roster & Invigilator Workload</h1>
                  <p className="dash-view-subtitle">
                    Track maximum duty quotas (max 3), approved academic leave, and cross-department assignments
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() =>
                      handleExportCSV(
                        "Faculty_Invigilation_Roster",
                        ["Identifier", "Name", "Department", "Assigned Duties", "Max Quota", "Status"],
                        filteredFaculty.map((f) => [f.identifier, f.name, f.departmentCode, f.assignedDuties, f.maxDuties, f.status])
                      )
                    }
                  >
                    <Download size={15} />
                    <span>Export Roster</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="dash-card" style={{ padding: "16px", marginBottom: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
                  <input
                    type="text"
                    className="dash-input"
                    placeholder="Search faculty name or employee code..."
                    value={facSearch}
                    onChange={(e) => setFacSearch(e.target.value)}
                  />

                  <select
                    className="dash-select"
                    value={facDeptFilter}
                    onChange={(e) => setFacDeptFilter(e.target.value)}
                  >
                    <option value="ALL">All Departments</option>
                    {storeState.departments.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Faculty / Code</th>
                        <th>Department</th>
                        <th>Duty Quota Utilization</th>
                        <th>Availability Status</th>
                        <th>Leave Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFaculty.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{f.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{f.identifier}</div>
                          </td>
                          <td>
                            <span className="dash-badge dash-badge-default">{f.departmentCode}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "90px",
                                  height: "8px",
                                  background: "var(--border-default)",
                                  borderRadius: "4px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${(f.assignedDuties / f.maxDuties) * 100}%`,
                                    height: "100%",
                                    background:
                                      f.assignedDuties >= f.maxDuties
                                        ? "#ef4444"
                                        : f.assignedDuties === 2
                                        ? "#f59e0b"
                                        : "#10b981",
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: "12px", fontWeight: 600 }}>
                                {f.assignedDuties} / {f.maxDuties}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`dash-badge ${
                                f.status === "Available"
                                  ? "dash-badge-success"
                                  : f.status === "Max Assigned"
                                  ? "dash-badge-warning"
                                  : "dash-badge-danger"
                              }`}
                            >
                              {f.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {f.leaveDates && f.leaveDates.length > 0
                              ? `On leave: ${f.leaveDates.join(", ")}`
                              : "Fully available for active cycle"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline"
                              onClick={() => handleToggleFacultyLeave(f)}
                              style={{ fontSize: "11px", padding: "3px 8px" }}
                            >
                              {f.status === "On Leave" ? "Clear Leave" : "Mark On Leave"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 8: TIMETABLE GENERATOR (CP-SAT Scheduling Engine)
              ===================================================== */}
          {activeMenu === "timetable-generator" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Deterministic Timetable Scheduling Engine</h1>
                  <p className="dash-view-subtitle">
                    Execute constraint satisfaction optimization avoiding holidays, room clashes, and faculty overload
                  </p>
                </div>
              </div>

              {/* 5-Step Solver Guided Workflow */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Step 1 & 2: Pre-flight Verification */}
                <div className="dash-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px" }}>
                    Pre-Generation Resource & Constraint Checklist
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500 }}>Active Cycle Window</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>{activeCycle.name}</div>
                      <div style={{ fontSize: "11px", color: "#10b981", marginTop: "2px" }}>
                        {activeCycle.startDate} to {activeCycle.endDate}
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500 }}>Holidays Excluded</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
                        {storeState.collegeHolidays.filter((h) => h.date >= activeCycle.startDate && h.date <= activeCycle.endDate).length} Holidays
                      </div>
                      <div style={{ fontSize: "11px", color: "#10b981", marginTop: "2px" }}>Diwali & Recess Blocked</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500 }}>Available Halls</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
                        {storeState.examHalls.filter((h) => h.status === "Available").length} Venues
                      </div>
                      <div style={{ fontSize: "11px", color: "#10b981", marginTop: "2px" }}>
                        {storeState.examHalls.filter((h) => h.status === "Available").reduce((a, b) => a + b.examCapacity, 0)} Safe Seats
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500 }}>Available Invigilators</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
                        {storeState.invigilators.filter((f) => f.status === "Available").length} Faculty
                      </div>
                      <div style={{ fontSize: "11px", color: "#10b981", marginTop: "2px" }}>Max 3 duties/faculty limit</div>
                    </div>
                  </div>

                  {/* Constraint Switches */}
                  <div style={{ display: "flex", gap: "24px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-default)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={enforceHolidaysRule}
                        onChange={(e) => setEnforceHolidaysRule(e.target.checked)}
                      />
                      <span>Enforce Strict Holiday Blocking</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={enforceAlternatingRule}
                        onChange={(e) => setEnforceAlternatingRule(e.target.checked)}
                      />
                      <span>Enforce Alternating Department Seating (Malpractice Prevention)</span>
                    </label>
                  </div>
                </div>

                {/* Generator Trigger Card */}
                <div className="dash-card" style={{ textAlign: "center", padding: "28px" }}>
                  <Cpu size={36} style={{ color: "var(--brand-primary)", margin: "0 auto 12px" }} />
                  <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>
                    Run Deterministic Optimization Engine
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "540px", margin: "0 auto 20px" }}>
                    Assigns optimal non-clashing dates, session slots, venues, and invigilator duties using mathematical constraint optimization.
                  </p>

                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    disabled={isSolving}
                    onClick={handleRunDeterministicSolver}
                    style={{ padding: "10px 24px", fontSize: "14px", margin: "0 auto" }}
                  >
                    {isSolving ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        <span>Solving Constraints ({solverProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate & Optimize Timetable</span>
                      </>
                    )}
                  </button>

                  {isSolving && (
                    <div style={{ maxWidth: "400px", margin: "20px auto 0" }}>
                      <div style={{ height: "6px", background: "var(--border-default)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${solverProgress}%`, height: "100%", background: "var(--brand-primary)", transition: "width 0.3s" }} />
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "6px" }}>
                        Evaluating room capacities, student slots, and invigilator availability...
                      </div>
                    </div>
                  )}
                </div>

                {/* Latest Solver Output Preview */}
                {latestSolverResult && (
                  <div className="dash-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
                          Optimization Run Results: {latestSolverResult.runId}
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                          Execution Time: {latestSolverResult.stats.executionTimeMs} ms · Venues Allocated:{" "}
                          {latestSolverResult.stats.roomsUsed} · Faculty Assigned: {latestSolverResult.stats.invigilatorsAssigned}
                        </p>
                      </div>
                      <span
                        className={`dash-badge ${
                          latestSolverResult.status === "OPTIMAL" ? "dash-badge-success" : "dash-badge-warning"
                        }`}
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                      >
                        {latestSolverResult.status}
                      </span>
                    </div>

                    <div className="dash-table-wrap">
                      <table className="dash-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Date & Session</th>
                            <th>Assigned Venue</th>
                            <th>Assigned Invigilator</th>
                            <th>Enrolled</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestSolverResult.scheduledExams.map((ex: CoordinatorExamEntry) => (
                            <tr key={ex.id}>
                              <td>
                                <div style={{ fontWeight: 700 }}>{ex.code}</div>
                                <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{ex.subject}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{ex.date}</div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ex.slot}</div>
                              </td>
                              <td>
                                <span className="dash-badge dash-badge-default">{ex.room}</span>
                              </td>
                              <td>
                                <div style={{ fontSize: "12.5px" }}>{ex.invigilator}</div>
                              </td>
                              <td>{ex.enrolled}</td>
                              <td>
                                <button
                                  type="button"
                                  className="dash-btn dash-btn-outline"
                                  onClick={() => {
                                    setRescheduleModalExam(ex);
                                    setRescheduleDate(ex.date);
                                    setRescheduleSlot(ex.slot);
                                    setRescheduleRoom(ex.room);
                                  }}
                                  style={{ fontSize: "11.5px", padding: "3px 8px" }}
                                >
                                  Reschedule
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                      <button
                        type="button"
                        className="dash-btn dash-btn-outline"
                        onClick={() => setActiveMenu("seating-plan")}
                      >
                        <span>View Seating Plan</span>
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        className="dash-btn dash-btn-primary"
                        onClick={() => setActiveMenu("review-submission")}
                      >
                        <span>Submit for Admin Approval</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 9: STUDENT SEATING PLAN
              ===================================================== */}
          {activeMenu === "seating-plan" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Student Desk & Seating Allocations</h1>
                  <p className="dash-view-subtitle">
                    Automated alternating-branch seating matrix, desk allotments, and door slips
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={handlePrintCurrentView}
                  >
                    <Printer size={15} />
                    <span>Print Door Slips</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() =>
                      handleExportCSV(
                        "Seating_Plan_Door_Slips",
                        ["Desk No", "Roll No", "Student Name", "Branch", "Subject", "Venue", "Date", "Slot"],
                        filteredSeating.map((s) => [s.deskNo, s.studentRoll, s.studentName, s.departmentCode, s.subjectCode, s.roomCode, s.date, s.slot])
                      )
                    }
                  >
                    <Download size={15} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Seating Room Filter */}
              <div className="dash-card" style={{ padding: "14px", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>Filter by Venue / Hall:</span>
                  <select
                    className="dash-select"
                    value={seatingRoomFilter}
                    onChange={(e) => setSeatingRoomFilter(e.target.value)}
                    style={{ maxWidth: "220px" }}
                  >
                    <option value="ALL">All Examination Halls</option>
                    <option value="A-101">Examination Hall A-101</option>
                    <option value="B-204">Examination Hall B-204</option>
                    <option value="C-301">Engineering Hall C-301</option>
                    <option value="D-105">Computing Lab D-105</option>
                  </select>

                  <span style={{ fontSize: "13px", fontWeight: 600, marginLeft: "8px" }}>Filter by Date:</span>
                  <select
                    className="dash-select"
                    value={seatingDateFilter}
                    onChange={(e) => setSeatingDateFilter(e.target.value)}
                    style={{ maxWidth: "180px" }}
                  >
                    <option value="ALL">All Dates</option>
                    {Array.from(new Set(storeState.seatingRecords.map((s) => s.date))).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <span
                    className="dash-badge dash-badge-info"
                    style={{ marginLeft: "auto", fontSize: "12px", padding: "4px 10px" }}
                  >
                    Alternating Department Layout Active
                  </span>
                </div>
              </div>

              {/* Seating Desks Table */}
              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Desk No</th>
                        <th>Student Candidate</th>
                        <th>Roll Number</th>
                        <th>Branch</th>
                        <th>Subject Paper</th>
                        <th>Assigned Venue</th>
                        <th>Date & Session</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSeating.map((seat) => (
                        <tr key={seat.id}>
                          <td style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{seat.deskNo}</td>
                          <td style={{ fontWeight: 600 }}>{seat.studentName}</td>
                          <td>{seat.studentRoll}</td>
                          <td>
                            <span
                              className={`dash-badge ${
                                seat.departmentCode === "CSE" ? "dash-badge-default" : "dash-badge-info"
                              }`}
                            >
                              {seat.departmentCode}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{seat.subjectCode}</td>
                          <td>Hall {seat.roomCode}</td>
                          <td>
                            {seat.date} ({seat.slot})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 10: INVIGILATOR DUTY ALLOCATION
              ===================================================== */}
          {activeMenu === "duty-allocation" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Invigilator Duty Allocation Roster</h1>
                  <p className="dash-view-subtitle">
                    Faculty session assignments, room supervision duties, and clash-free reallocations
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() =>
                      handleExportCSV(
                        "Invigilator_Duties_Schedule",
                        ["Course", "Subject", "Date", "Slot", "Hall", "Assigned Faculty"],
                        storeState.coordinatorExams.map((e) => [e.code, e.subject, e.date, e.slot, e.room, e.invigilator])
                      )
                    }
                  >
                    <Download size={15} />
                    <span>Export Duty Chart</span>
                  </button>
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Subject Paper</th>
                        <th>Date & Session Slot</th>
                        <th>Examination Hall</th>
                        <th>Enrolled Count</th>
                        <th>Assigned Invigilator</th>
                        <th>Workload</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeState.coordinatorExams.map((ex) => (
                        <tr key={ex.id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{ex.code}</div>
                            <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{ex.subject}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ex.date}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ex.slot}</div>
                          </td>
                          <td>
                            <span className="dash-badge dash-badge-default">{ex.room}</span>
                          </td>
                          <td>{ex.enrolled} candidates</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ex.invigilator}</div>
                          </td>
                          <td>
                            <span className="dash-badge dash-badge-success">Within Quota</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline"
                              onClick={() => {
                                setReassignModalExam(ex);
                                setSelectedNewFaculty(ex.invigilator);
                              }}
                              style={{ fontSize: "11.5px", padding: "3px 8px" }}
                            >
                              Reassign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reassignment Modal */}
              {reassignModalExam && (
                <div className="dash-modal-backdrop" onClick={() => setReassignModalExam(null)}>
                  <div className="dash-modal" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
                    <div className="dash-modal-header">
                      <h3 className="dash-modal-title">Reassign Paper Invigilation</h3>
                      <button type="button" className="dash-modal-close" onClick={() => setReassignModalExam(null)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ padding: "10px", background: "var(--bg-app)", borderRadius: "6px", fontSize: "13px" }}>
                        Paper: <strong>{reassignModalExam.code}</strong> ({reassignModalExam.subject})<br />
                        Date & Slot: <strong>{reassignModalExam.date}</strong> ({reassignModalExam.slot})<br />
                        Venue: <strong>{reassignModalExam.room}</strong>
                      </div>

                      <div className="dash-form-group">
                        <label className="dash-label">Select Available Faculty Member *</label>
                        <select
                          className="dash-select"
                          value={selectedNewFaculty}
                          onChange={(e) => setSelectedNewFaculty(e.target.value)}
                        >
                          {storeState.invigilators
                            .filter((f) => f.status !== "On Leave" && f.assignedDuties < f.maxDuties)
                            .map((f) => (
                              <option key={f.id} value={`${f.name} (${f.departmentCode})`}>
                                {f.name} ({f.departmentCode}) — {f.assignedDuties}/{f.maxDuties} Duties Assigned
                              </option>
                            ))}
                        </select>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                        <button type="button" className="dash-btn dash-btn-outline" onClick={() => setReassignModalExam(null)}>
                          Cancel
                        </button>
                        <button type="button" className="dash-btn dash-btn-primary" onClick={handleConfirmReassignment}>
                          Confirm Reassignment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              VIEW 11: CONFLICT RESOLUTION
              ===================================================== */}
          {activeMenu === "conflict-resolution" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Automated Conflict Resolution Cell</h1>
                  <p className="dash-view-subtitle">
                    Detected room overflows, faculty double-bookings, holiday clashes, and suggested deterministic alternatives
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={handleRunDeterministicSolver}
                  >
                    <RefreshCw size={15} />
                    <span>Re-run Constraint Optimization</span>
                  </button>
                </div>
              </div>

              {/* Conflict Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {storeState.conflicts.map((conf) => (
                  <div
                    key={conf.id}
                    className="dash-card"
                    style={{
                      borderLeft: conf.resolved
                        ? "4px solid #10b981"
                        : conf.severity === "CRITICAL"
                        ? "4px solid #ef4444"
                        : "4px solid #f59e0b",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <AlertTriangle
                          size={18}
                          style={{
                            color: conf.resolved ? "#10b981" : conf.severity === "CRITICAL" ? "#ef4444" : "#f59e0b",
                          }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>
                          {conf.type} · {conf.subjectCode} ({conf.date} {conf.slot})
                        </span>
                      </div>
                      <span
                        className={`dash-badge ${
                          conf.resolved
                            ? "dash-badge-success"
                            : conf.severity === "CRITICAL"
                            ? "dash-badge-danger"
                            : "dash-badge-warning"
                        }`}
                      >
                        {conf.resolved ? "Resolved" : conf.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: "13px", color: "var(--text-primary)", margin: "0 0 12px" }}>
                      {conf.description}
                    </p>

                    <div style={{ background: "var(--bg-app)", padding: "12px", borderRadius: "6px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                        Suggested Valid Constraint Alternatives:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {conf.suggestedAlternatives.map((alt, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "12.5px",
                            }}
                          >
                            <span>
                              {idx + 1}. {alt}
                            </span>
                            {!conf.resolved && (
                              <button
                                type="button"
                                className="dash-btn dash-btn-outline"
                                onClick={() => handleResolveConflictItem(conf, alt)}
                                style={{ fontSize: "11px", padding: "2px 8px" }}
                              >
                                Apply Alternative
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {storeState.conflicts.length === 0 && (
                  <div className="dash-card" style={{ textAlign: "center", padding: "40px" }}>
                    <CheckCircle2 size={36} style={{ color: "#10b981", margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Zero Conflicts Detected</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                      All subject dates, room capacities, holidays, and faculty limits meet institutional standards.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 12: TIMETABLE REVIEW & SUBMISSION
              ===================================================== */}
          {activeMenu === "review-submission" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Timetable Review & Approval Submission</h1>
                  <p className="dash-view-subtitle">
                    Official submission pipeline to Administrator with real persisted statuses
                  </p>
                </div>
              </div>

              {/* Status Alert Banner */}
              {activeSubmission?.status === "Revision Requested" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#991b1b", fontWeight: 700, fontSize: "14px" }}>
                    <AlertTriangle size={18} />
                    <span>Administrator Requested Revision on this Schedule</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#7f1d1d", marginTop: "6px" }}>
                    <strong>Admin Review Notes:</strong> "{activeSubmission.reviewNotes}"
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#b91c1c", marginTop: "4px" }}>
                    Decision recorded by {activeSubmission.decidedBy || "Sanika Patil (Admin)"} on {activeSubmission.decisionTimestamp}
                  </div>
                </div>
              )}

              {activeSubmission?.status === "Approved" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#065f46", fontWeight: 700, fontSize: "14px" }}>
                      <CheckCircle2 size={18} />
                      <span>Timetable Officially Approved by Administrator</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#047857", marginTop: "2px" }}>
                      Approved by {activeSubmission.decidedBy || "Sanika Patil (Admin)"} on {activeSubmission.decisionTimestamp}. Ready for public distribution.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={handlePublishTimetable}
                  >
                    <Globe size={15} />
                    <span>Publish Official Schedule Now</span>
                  </button>
                </div>
              )}

              {activeSubmission?.status === "Submitted" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1e40af", fontWeight: 700, fontSize: "14px" }}>
                    <Info size={18} />
                    <span>Schedule Submitted — Currently Under Review in Admin Approvals Queue</span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#1d4ed8", marginTop: "2px" }}>
                    Submitted by {activeSubmission.submittedBy} on {activeSubmission.submittedDate}. You will receive immediate notification once approved.
                  </div>
                </div>
              )}

              {/* Review Summary Cards */}
              <div className="dash-card">
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 16px" }}>
                  Schedule Review Dossier: {activeSubmission?.cycleName || activeCycle.name}
                </h3>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Exam Date</th>
                        <th>Slot</th>
                        <th>Allocated Room</th>
                        <th>Invigilator</th>
                        <th>Enrolled</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeState.coordinatorExams.map((ex) => (
                        <tr key={ex.id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{ex.code}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ex.subject}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{ex.date}</td>
                          <td>{ex.slot}</td>
                          <td>
                            <span className="dash-badge dash-badge-default">{ex.room}</span>
                          </td>
                          <td>{ex.invigilator}</td>
                          <td>{ex.enrolled}</td>
                          <td>
                            <span className="dash-badge dash-badge-default">{ex.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={handleSubmitForAdminApproval}
                    disabled={activeSubmission?.status === "Submitted" || activeSubmission?.status === "Published"}
                  >
                    <Send size={15} />
                    <span>Submit Schedule for Admin Approval</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 13: PUBLISHED TIMETABLES
              ===================================================== */}
          {activeMenu === "published-timetables" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Officially Published Examination Timetables</h1>
                  <p className="dash-view-subtitle">
                    Verified schedules released to students, faculty, and departments
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {storeState.timetables
                  .filter((t) => t.status === "Published" || t.status === "Approved")
                  .map((t) => (
                    <div key={t.id} className="dash-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 700 }}>{t.cycleName}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {t.department} · {t.program}
                          </div>
                        </div>
                        <span className="dash-badge dash-badge-success" style={{ fontSize: "12px", padding: "4px 10px" }}>
                          Published & Active
                        </span>
                      </div>

                      <div className="dash-table-wrap">
                        <table className="dash-table">
                          <thead>
                            <tr>
                              <th>Course Code</th>
                              <th>Subject</th>
                              <th>Date</th>
                              <th>Session Window</th>
                              <th>Venue</th>
                              <th>Supervising Faculty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {t.exams.map((ex) => (
                              <tr key={ex.id}>
                                <td style={{ fontWeight: 700 }}>{ex.code}</td>
                                <td>{ex.subject}</td>
                                <td style={{ fontWeight: 600 }}>{ex.date}</td>
                                <td>{ex.slot}</td>
                                <td>
                                  <span className="dash-badge dash-badge-default">{ex.room}</span>
                                </td>
                                <td>{ex.invigilator}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                        <button
                          type="button"
                          className="dash-btn dash-btn-outline"
                          onClick={() =>
                            handleExportCSV(
                              `Official_Timetable_${t.cycleName.replace(/\s+/g, "_")}`,
                              ["Course Code", "Subject Title", "Exam Date", "Slot", "Hall", "Invigilator"],
                              t.exams.map((e) => [e.code, e.subject, e.date, e.slot, e.room, e.invigilator])
                            )
                          }
                        >
                          <Download size={14} />
                          <span>Export Official Circular</span>
                        </button>
                      </div>
                    </div>
                  ))}

                {storeState.timetables.filter((t) => t.status === "Published" || t.status === "Approved").length === 0 && (
                  <div className="dash-card" style={{ textAlign: "center", padding: "40px" }}>
                    <Globe size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>No Published Schedules Yet</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                      Once a submitted schedule is approved by the Administrator, it can be published here for campus view.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 14: REPORTS & EXPORT
              ===================================================== */}
          {activeMenu === "reports-export" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Examination Reports & Audit Exports</h1>
                  <p className="dash-view-subtitle">
                    Generate authentic university examination reports in CSV and print formats
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={handlePrintCurrentView}
                  >
                    <Printer size={15} />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* 8 Report Tabs */}
              <div className="dash-card" style={{ padding: "12px", marginBottom: "18px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { id: 1, name: "1. Master Schedule" },
                    { id: 2, name: "2. Subject-wise Roster" },
                    { id: 3, name: "3. Room Seating Plan" },
                    { id: 4, name: "4. Student Schedule" },
                    { id: 5, name: "5. Faculty Duties" },
                    { id: 6, name: "6. Backlog Summary" },
                    { id: 7, name: "7. Conflict Audit" },
                    { id: 8, name: "8. Approval History" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`dash-btn ${selectedReportTab === tab.id ? "dash-btn-primary" : "dash-btn-outline"}`}
                      onClick={() => setSelectedReportTab(tab.id)}
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Report 1: Master Schedule */}
              {selectedReportTab === 1 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 1: Master Examination Timetable</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_1_Master_Timetable",
                          ["Paper Code", "Subject Title", "Department", "Date", "Slot", "Hall", "Invigilator", "Enrolled"],
                          storeState.coordinatorExams.map((e) => [e.code, e.subject, e.department, e.date, e.slot, e.room, e.invigilator, e.enrolled])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Subject</th>
                          <th>Dept</th>
                          <th>Date</th>
                          <th>Slot</th>
                          <th>Hall</th>
                          <th>Invigilator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.coordinatorExams.map((e) => (
                          <tr key={e.id}>
                            <td style={{ fontWeight: 700 }}>{e.code}</td>
                            <td>{e.subject}</td>
                            <td>{e.department}</td>
                            <td>{e.date}</td>
                            <td>{e.slot}</td>
                            <td>{e.room}</td>
                            <td>{e.invigilator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 2: Subject-wise Roster */}
              {selectedReportTab === 2 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 2: Subject-wise Examination Schedule</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_2_Subject_Roster",
                          ["Code", "Title", "Semester", "Type", "Credits", "Enrolled"],
                          storeState.subjects.map((s) => [s.code, s.title, s.semester, s.type, s.credits, s.enrolledStudents])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Title</th>
                          <th>Semester</th>
                          <th>Type</th>
                          <th>Credits</th>
                          <th>Enrolled Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.subjects.slice(0, 10).map((s) => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 700 }}>{s.code}</td>
                            <td>{s.title}</td>
                            <td>Sem {s.semester}</td>
                            <td>{s.type}</td>
                            <td>{s.credits}</td>
                            <td>{s.enrolledStudents}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 3: Room Seating Plan */}
              {selectedReportTab === 3 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 3: Room Seating Allocation & Door Slips</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_3_Room_Seating",
                          ["Desk No", "Roll No", "Student Name", "Branch", "Subject", "Hall", "Date", "Slot"],
                          storeState.seatingRecords.map((s) => [s.deskNo, s.studentRoll, s.studentName, s.departmentCode, s.subjectCode, s.roomCode, s.date, s.slot])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Desk</th>
                          <th>Student Roll No</th>
                          <th>Name</th>
                          <th>Branch</th>
                          <th>Paper</th>
                          <th>Venue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.seatingRecords.slice(0, 12).map((s) => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 700 }}>{s.deskNo}</td>
                            <td>{s.studentRoll}</td>
                            <td>{s.studentName}</td>
                            <td>{s.departmentCode}</td>
                            <td>{s.subjectCode}</td>
                            <td>Hall {s.roomCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 4: Student Schedule */}
              {selectedReportTab === 4 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 4: Student-wise Exam Timetable</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_4_Student_Schedule",
                          ["Roll No", "Name", "Subject", "Date", "Slot", "Eligibility"],
                          storeState.studentRegistrations.map((r) => [r.rollNo, r.name, r.subjectCode, "2026-11-10", "09:30 - 12:30 IST", r.eligibilityStatus])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Subject Code</th>
                          <th>Eligibility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.studentRegistrations.slice(0, 10).map((r) => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 700 }}>{r.rollNo}</td>
                            <td>{r.name}</td>
                            <td>{r.departmentCode}</td>
                            <td>{r.subjectCode}</td>
                            <td>
                              <span
                                className={`dash-badge ${
                                  r.eligibilityStatus === "Eligible" ? "dash-badge-success" : "dash-badge-danger"
                                }`}
                              >
                                {r.eligibilityStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 5: Faculty Duties */}
              {selectedReportTab === 5 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 5: Faculty Invigilation Duty Chart</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_5_Faculty_Duties",
                          ["Faculty Name", "Department", "Assigned Duties", "Max Quota", "Status"],
                          storeState.invigilators.map((f) => [f.name, f.departmentCode, f.assignedDuties, f.maxDuties, f.status])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Faculty Name</th>
                          <th>Department</th>
                          <th>Assigned Duties</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.invigilators.map((f) => (
                          <tr key={f.id}>
                            <td style={{ fontWeight: 600 }}>{f.name}</td>
                            <td>{f.departmentCode}</td>
                            <td>
                              {f.assignedDuties} of {f.maxDuties}
                            </td>
                            <td>
                              <span className="dash-badge dash-badge-default">{f.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 6: Backlog Summary */}
              {selectedReportTab === 6 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 6: Backlog & Makeup Eligibility Summary</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_6_Backlog_Summary",
                          ["Roll No", "Name", "Subject", "Type", "Attendance %", "Fee Cleared", "Eligibility"],
                          storeState.studentRegistrations
                            .filter((r) => r.registrationType !== "Regular")
                            .map((r) => [r.rollNo, r.name, r.subjectCode, r.registrationType, `${r.attendancePercentage}%`, r.feesCleared ? "Yes" : "No", r.eligibilityStatus])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Name</th>
                          <th>Subject Code</th>
                          <th>Registration Type</th>
                          <th>Eligibility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.studentRegistrations
                          .filter((r) => r.registrationType !== "Regular")
                          .map((r) => (
                            <tr key={r.id}>
                              <td style={{ fontWeight: 700 }}>{r.rollNo}</td>
                              <td>{r.name}</td>
                              <td>{r.subjectCode}</td>
                              <td>
                                <span className="dash-badge dash-badge-warning">{r.registrationType}</span>
                              </td>
                              <td>
                                <span className="dash-badge dash-badge-success">{r.eligibilityStatus}</span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 7: Conflict Audit */}
              {selectedReportTab === 7 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 7: Conflict Resolution & Audit Trail</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_7_Conflict_Audit",
                          ["Type", "Severity", "Subject", "Date", "Slot", "Resource", "Resolved"],
                          storeState.conflicts.map((c) => [c.type, c.severity, c.subjectCode, c.date, c.slot, c.resourceName, c.resolved ? "Yes" : "No"])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Severity</th>
                          <th>Subject Code</th>
                          <th>Resource</th>
                          <th>Resolution Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.conflicts.map((c) => (
                          <tr key={c.id}>
                            <td>{c.type}</td>
                            <td>
                              <span className="dash-badge dash-badge-warning">{c.severity}</span>
                            </td>
                            <td style={{ fontWeight: 700 }}>{c.subjectCode}</td>
                            <td>{c.resourceName}</td>
                            <td>
                              <span className={`dash-badge ${c.resolved ? "dash-badge-success" : "dash-badge-danger"}`}>
                                {c.resolved ? "Resolved" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 8: Approval History */}
              {selectedReportTab === 8 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 8: Timetable Approval & Version History</h3>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      onClick={() =>
                        handleExportCSV(
                          "Report_8_Approval_History",
                          ["Submission ID", "Cycle Name", "Department", "Status", "Solver Status", "Submitted Date"],
                          storeState.timetables.map((t) => [t.id, t.cycleName, t.department, t.status, t.solverStatus, t.submittedDate])
                        )
                      }
                    >
                      <Download size={14} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Cycle Name</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th>Solver Feasibility</th>
                          <th>Submission Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.timetables.map((t) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600 }}>{t.cycleName}</td>
                            <td>{t.department}</td>
                            <td>
                              <span className="dash-badge dash-badge-default">{t.status}</span>
                            </td>
                            <td>{t.solverStatus}</td>
                            <td>{t.submittedDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reschedule Exam Modal (Used from multiple sections) */}
          {rescheduleModalExam && (
            <div className="dash-modal-backdrop" onClick={() => setRescheduleModalExam(null)}>
              <div className="dash-modal" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
                <div className="dash-modal-header">
                  <h3 className="dash-modal-title">Reschedule Examination Paper</h3>
                  <button type="button" className="dash-modal-close" onClick={() => setRescheduleModalExam(null)}>
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleConfirmReschedule} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "10px", background: "var(--bg-app)", borderRadius: "6px", fontSize: "13px" }}>
                    Paper: <strong>{rescheduleModalExam.code}</strong> ({rescheduleModalExam.subject})<br />
                    Current: {rescheduleModalExam.date} ({rescheduleModalExam.slot}) in {rescheduleModalExam.room}
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">New Examination Date *</label>
                    <input
                      type="date"
                      className="dash-input"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Session Slot *</label>
                    <select
                      className="dash-select"
                      value={rescheduleSlot}
                      onChange={(e) => setRescheduleSlot(e.target.value)}
                    >
                      <option value="09:30 - 12:30 IST">Morning (09:30 - 12:30 IST)</option>
                      <option value="14:00 - 17:00 IST">Afternoon (14:00 - 17:00 IST)</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Assigned Examination Hall *</label>
                    <select
                      className="dash-select"
                      value={rescheduleRoom}
                      onChange={(e) => setRescheduleRoom(e.target.value)}
                    >
                      {storeState.examHalls
                        .filter((h) => h.status === "Available")
                        .map((h) => (
                          <option key={h.id} value={h.name}>
                            {h.name} (Exam Cap: {h.examCapacity})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Mandatory Rescheduling Reason *</label>
                    <input
                      type="text"
                      className="dash-input"
                      required
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder="e.g. Wing acoustics testing, elective conflict resolution..."
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                    <button type="button" className="dash-btn dash-btn-outline" onClick={() => setRescheduleModalExam(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="dash-btn dash-btn-primary">
                      Confirm Reschedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
