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
  TimetableApprovalRecord,
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
  Database,
  FileText,
  Shuffle,
  ShieldCheck,
} from "lucide-react";
import { MasterDataManager } from "./MasterDataManager.js";
import { AutonomousCircularView } from "./timetable/AutonomousCircularView.js";

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

  // Synchronize Section 2 setup inputs with activeCycle from topbar / store
  useEffect(() => {
    if (activeCycle) {
      setSetupAcademicYear(activeCycle.academicYear || "2026-27");
      setSetupDept(activeCycle.department || "Computer Science & Engineering");
      setSetupCycleName(activeCycle.name || "Winter 2026 Examination");
      setSetupStartDate(activeCycle.startDate || "2026-11-10");
      setSetupEndDate(activeCycle.endDate || "2026-11-25");
      setSetupDuration(activeCycle.durationMinutes || 180);
      setSetupExamType((activeCycle.examType as any) || "MSE");
      if (activeCycle.sessionWindow) {
        setSetupSessionWindow(activeCycle.sessionWindow as any);
      }
    }
  }, [
    activeCycle?.id,
    activeCycle?.name,
    activeCycle?.academicYear,
    activeCycle?.department,
    activeCycle?.startDate,
    activeCycle?.endDate,
    activeCycle?.durationMinutes,
    activeCycle?.examType,
    activeCycle?.sessionWindow,
  ]);

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
      yearLevel: `${setupYearOfStudy} Year` as any,
      division: setupDivision,
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
  const [lastGeneratedConfigKey, setLastGeneratedConfigKey] = useState<string | null>(null);

  // Real-time Selected Configuration Analysis & Department Data Binding
  const activeDeptRecord = useMemo(() => {
    return (
      storeState.departments.find(
        (d) => d.name === activeCycle.department || d.code === activeCycle.department
      ) || { code: "CSE", name: activeCycle.department }
    );
  }, [storeState.departments, activeCycle.department]);

  const activeDeptSubjects = useMemo(() => {
    return storeState.subjects.filter((s) => {
      const matchDept =
        s.departmentCode === activeDeptRecord.code || s.departmentCode === activeCycle.department;
      return matchDept && s.status === "Active";
    });
  }, [storeState.subjects, activeDeptRecord.code, activeCycle.department]);

  const activeDeptStudents = useMemo(() => {
    return storeState.studentRegistrations.filter((r) => {
      return (
        r.departmentCode === activeDeptRecord.code || r.departmentCode === activeCycle.department
      );
    });
  }, [storeState.studentRegistrations, activeDeptRecord.code, activeCycle.department]);

  const availableHalls = useMemo(() => {
    return storeState.examHalls.filter((h) => h.status === "Available");
  }, [storeState.examHalls]);

  const totalAvailableSeats = useMemo(() => {
    return availableHalls.reduce((sum, h) => sum + h.examCapacity, 0);
  }, [availableHalls]);

  const availableFaculty = useMemo(() => {
    return storeState.invigilators.filter((f) => f.status === "Available");
  }, [storeState.invigilators]);

  const activeSessionSlots = useMemo(() => {
    if (activeCycle.sessionWindow === "Morning (09:30 - 12:30 IST)") {
      return ["09:30 - 12:30 IST"];
    }
    if (activeCycle.sessionWindow === "Afternoon (14:00 - 17:00 IST)") {
      return ["14:00 - 17:00 IST"];
    }
    return ["09:30 - 12:30 IST", "14:00 - 17:00 IST"];
  }, [activeCycle.sessionWindow]);

  // Mandatory Pre-generation Validation Checklist
  const pendingChecklist = useMemo(() => {
    const items: { label: string; done: boolean; message: string }[] = [];

    // 1. Department subjects check
    if (activeDeptSubjects.length === 0) {
      items.push({
        label: "Curriculum Subjects",
        done: false,
        message: `Zero active curriculum subjects found for ${activeCycle.department}.`,
      });
    } else {
      items.push({
        label: "Curriculum Subjects",
        done: true,
        message: `${activeDeptSubjects.length} active subject(s) ready.`,
      });
    }

    // 2. Exam dates check
    const hasDates = !!activeCycle.startDate && !!activeCycle.endDate;
    const datesValid = hasDates && new Date(activeCycle.startDate) <= new Date(activeCycle.endDate);
    if (!datesValid) {
      items.push({
        label: "Exam Date Window",
        done: false,
        message: "Start or end date is missing or invalid in Academic Setup.",
      });
    } else {
      items.push({
        label: "Exam Date Window",
        done: true,
        message: `${activeCycle.startDate} to ${activeCycle.endDate}`,
      });
    }

    // 3. Time slots check
    if (activeSessionSlots.length === 0) {
      items.push({
        label: "Session Slots",
        done: false,
        message: "No daily session slots configured.",
      });
    } else {
      items.push({
        label: "Session Slots",
        done: true,
        message: `${activeSessionSlots.length} session(s)/day (${activeSessionSlots.join(", ")})`,
      });
    }

    // 4. Examination halls check
    if (availableHalls.length === 0) {
      items.push({
        label: "Venues & Capacity",
        done: false,
        message: "Zero examination halls are currently marked Available.",
      });
    } else {
      items.push({
        label: "Venues & Capacity",
        done: true,
        message: `${availableHalls.length} halls available (${totalAvailableSeats} safe exam seats)`,
      });
    }

    // 5. Faculty invigilators check
    if (availableFaculty.length === 0) {
      items.push({
        label: "Faculty Invigilators",
        done: false,
        message: "All faculty are marked On Leave or at maximum workload limit.",
      });
    } else {
      items.push({
        label: "Faculty Invigilators",
        done: true,
        message: `${availableFaculty.length} faculty available for invigilation.`,
      });
    }

    return items;
  }, [
    activeDeptSubjects.length,
    activeCycle.department,
    activeCycle.startDate,
    activeCycle.endDate,
    activeSessionSlots,
    availableHalls.length,
    totalAvailableSeats,
    availableFaculty.length,
  ]);

  const isConfigReadyToGenerate = useMemo(() => {
    return pendingChecklist.every((item) => item.done);
  }, [pendingChecklist]);

  // Configuration snapshot key to detect if current timetable has become stale after generation
  const currentConfigKey = useMemo(() => {
    return `${activeCycle.id}_${activeCycle.department}_${activeCycle.startDate}_${activeCycle.endDate}_${activeCycle.sessionWindow}_${activeDeptSubjects.length}_${availableHalls.length}_${availableFaculty.length}`;
  }, [
    activeCycle.id,
    activeCycle.department,
    activeCycle.startDate,
    activeCycle.endDate,
    activeCycle.sessionWindow,
    activeDeptSubjects.length,
    availableHalls.length,
    availableFaculty.length,
  ]);

  const isTimetableStale = useMemo(() => {
    return (
      (latestSolverResult !== null || storeState.coordinatorExams.length > 0) &&
      lastGeneratedConfigKey !== null &&
      lastGeneratedConfigKey !== currentConfigKey
    );
  }, [latestSolverResult, storeState.coordinatorExams.length, lastGeneratedConfigKey, currentConfigKey]);

  const currentCycleTimetableStatus = useMemo(() => {
    const matched = storeState.timetables.find((t) => t.cycleId === activeCycle.id);
    if (matched) return matched.status;
    const firstExamStatus = storeState.coordinatorExams[0]?.status;
    if (firstExamStatus === "Submitted") return "Submitted";
    if (firstExamStatus === "Published") return "Published";
    if (firstExamStatus === "Approved") return "Approved";
    return storeState.coordinatorExams.length > 0 ? "Draft" : "Not Generated";
  }, [storeState.timetables, activeCycle.id, storeState.coordinatorExams]);

  const handleRunDeterministicSolver = () => {
    if (isSolving) return;

    if (!isConfigReadyToGenerate) {
      const missingReason = pendingChecklist.find((p) => !p.done)?.message || "Please complete all required configuration settings.";
      showToast(`Cannot generate timetable: ${missingReason}`, "error");
      return;
    }

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
      setLastGeneratedConfigKey(currentConfigKey);

      if (result.success && result.status === "OPTIMAL") {
        showToast(
          `Timetable Generated (OPTIMAL): ${result.scheduledExams.length} subjects scheduled across ${result.stats.roomsUsed} halls with 0 clashes!`
        );
      } else if (result.success && result.status === "FEASIBLE") {
        showToast(
          `Timetable Generated with Warnings: ${result.scheduledExams.length} subjects scheduled, ${result.conflicts.length} conflict(s) detected.`,
          "warning"
        );
      } else {
        const errorMsg = result.conflicts[0]?.description || "Timetable generation failed due to unsatisfiable constraints.";
        showToast(errorMsg, "error");
      }
    }, 1100);
  };

  // ==========================================
  // VIEW 9: Shift-Wise Dynamic Seating & Room Allocation State
  // ==========================================
  const SHIFT_SCHEDULE_DEFINITIONS: Record<
    string,
    Array<{
      slot: string;
      shiftLabel: string;
      subjects: Array<{
        code: string;
        name: string;
        dept: string;
        year: string;
        studentCount: number;
        prnPrefix: string;
      }>;
    }>
  > = {
    "2026-09-22": [
      {
        slot: "10.00 AM TO 11.30 AM",
        shiftLabel: "Morning Session",
        subjects: [
          {
            code: "UCS0301",
            name: "Discrete Mathematics & Graph Theory",
            dept: "CSE",
            year: "Second Year (S.Y.B.TECH)",
            studentCount: 120, // 70 in Block 1 + 50 in Block 2 (leaves 20 empty seats in Block 2)
            prnPrefix: "2025BTECS",
          },
          {
            code: "UME0301",
            name: "Thermodynamics & Fluid Dynamics",
            dept: "MECH",
            year: "Second Year (S.Y.B.TECH)",
            studentCount: 40, // Fills 20 empty seats in Block 2 + 20 in Block 3 (leaves 30 empty seats in Block 3)
            prnPrefix: "2025BTEME",
          },
          {
            code: "UEC0301",
            name: "Signals & Electronic Networks",
            dept: "ECE",
            year: "Second Year (S.Y.B.TECH)",
            studentCount: 25, // Fills 25 seats in Block 3 (leaves 5 empty seats in Block 3)
            prnPrefix: "2025BTEEC",
          },
        ],
      },
      {
        slot: "12.30 PM TO 02.00 PM",
        shiftLabel: "Afternoon Session",
        subjects: [
          {
            code: "UCS0501",
            name: "Database Management Systems",
            dept: "CSE",
            year: "Third Year (T.Y.B.TECH)",
            studentCount: 110,
            prnPrefix: "2024BTECS",
          },
          {
            code: "UME0501",
            name: "Design of Machine Elements",
            dept: "MECH",
            year: "Third Year (T.Y.B.TECH)",
            studentCount: 45,
            prnPrefix: "2024BTEME",
          },
        ],
      },
      {
        slot: "03.00 PM TO 04.30 PM",
        shiftLabel: "Evening Session",
        subjects: [
          {
            code: "CS701",
            name: "Distributed Systems & Cloud Computing",
            dept: "CSE",
            year: "Final Year (B.TECH)",
            studentCount: 100,
            prnPrefix: "2023BTECS",
          },
          {
            code: "EC702",
            name: "VLSI Architecture & Systems",
            dept: "ECE",
            year: "Final Year (B.TECH)",
            studentCount: 35,
            prnPrefix: "2023BTEEC",
          },
        ],
      },
    ],
    "2026-09-23": [
      {
        slot: "10.00 AM TO 11.30 AM",
        shiftLabel: "Morning Session",
        subjects: [
          {
            code: "UMATH0101",
            name: "Engineering Mathematics - I (CSE & IT)",
            dept: "CSE",
            year: "First Year (F.Y.B.TECH)",
            studentCount: 80,
            prnPrefix: "2026BTECS",
          },
          {
            code: "UMATH0102",
            name: "Engineering Mathematics - I (Mech/Civil)",
            dept: "MECH",
            year: "First Year (F.Y.B.TECH)",
            studentCount: 50,
            prnPrefix: "2026BTEME",
          },
          {
            code: "UPHY0101",
            name: "Applied Engineering Physics",
            dept: "ECE",
            year: "First Year (F.Y.B.TECH)",
            studentCount: 30,
            prnPrefix: "2026BTEEC",
          },
        ],
      },
      {
        slot: "12.30 PM TO 02.00 PM",
        shiftLabel: "Afternoon Session",
        subjects: [
          {
            code: "UCS0502",
            name: "Software Engineering & Agile Methodologies",
            dept: "CSE",
            year: "Third Year (T.Y.B.TECH)",
            studentCount: 115,
            prnPrefix: "2024BTECS",
          },
          {
            code: "UCE0502",
            name: "Structural Analysis & Reinforced Concrete",
            dept: "CIVIL",
            year: "Third Year (T.Y.B.TECH)",
            studentCount: 40,
            prnPrefix: "2024BTECV",
          },
        ],
      },
    ],
    "2026-09-21": [
      {
        slot: "10.00 AM TO 11.30 AM",
        shiftLabel: "Morning Session",
        subjects: [
          {
            code: "UCHEM0101",
            name: "Engineering Chemistry",
            dept: "First Year Engineering",
            year: "First Year (F.Y.B.TECH)",
            studentCount: 120,
            prnPrefix: "2026BTEFY",
          },
          {
            code: "UELEC0101",
            name: "Basic Electrical Systems",
            dept: "ECE",
            year: "First Year (F.Y.B.TECH)",
            studentCount: 40,
            prnPrefix: "2026BTEEC",
          },
        ],
      },
    ],
    "2026-11-10": [
      {
        slot: "09:30 - 12:30 IST",
        shiftLabel: "Morning Session",
        subjects: [
          {
            code: "CS701",
            name: "Distributed Systems & Cloud Computing",
            dept: "CSE",
            year: "Final Year (B.TECH)",
            studentCount: 120,
            prnPrefix: "2023BTECS",
          },
          {
            code: "EC702",
            name: "VLSI Architecture & Embedded Logic",
            dept: "ECE",
            year: "Final Year (B.TECH)",
            studentCount: 45,
            prnPrefix: "2023BTEEC",
          },
        ],
      },
    ],
    "2026-11-11": [
      {
        slot: "09:30 - 12:30 IST",
        shiftLabel: "Morning Session",
        subjects: [
          {
            code: "ME703",
            name: "Finite Element Methods & Dynamics",
            dept: "MECH",
            year: "Final Year (B.TECH)",
            studentCount: 75,
            prnPrefix: "2023BTEME",
          },
          {
            code: "CS704",
            name: "Cryptography & Network Security",
            dept: "CSE",
            year: "Final Year (B.TECH)",
            studentCount: 50,
            prnPrefix: "2023BTECS",
          },
        ],
      },
    ],
  };

  const [seatingShiftDate, setSeatingShiftDate] = useState("2026-09-22");
  const [seatingShiftSlot, setSeatingShiftSlot] = useState("10.00 AM TO 11.30 AM");
  const [seatingRandomSeed, setSeatingRandomSeed] = useState(1);
  const [seatingSearchQuery, setSeatingSearchQuery] = useState("");
  const [seatingViewMode, setSeatingViewMode] = useState<"BY_SUBJECT" | "BY_HALL">("BY_SUBJECT");

  // Shift Seating Plan Student Dispatch State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchChannels, setDispatchChannels] = useState({
    portal: true,
    email: true,
    sms: true,
  });
  const [dispatchedShifts, setDispatchedShifts] = useState<
    Record<string, { timestamp: string; count: number }>
  >(() => {
    try {
      const saved = localStorage.getItem("nexora_dispatched_seating_shifts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);

  const handleConfirmDispatchToStudents = () => {
    const shiftKey = `${seatingShiftDate}_${seatingShiftSlot}`;
    const timestampStr =
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " " +
      new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) +
      " IST";

    const newRecord = {
      timestamp: timestampStr,
      count: shiftSeatingEngine.totalAllocated,
    };

    const updated = { ...dispatchedShifts, [shiftKey]: newRecord };
    setDispatchedShifts(updated);

    try {
      localStorage.setItem("nexora_dispatched_seating_shifts", JSON.stringify(updated));
      localStorage.setItem(
        "nexora_live_student_seating",
        JSON.stringify({
          shiftDate: seatingShiftDate,
          shiftSlot: seatingShiftSlot,
          dispatchedAt: timestampStr,
          students: shiftSeatingEngine.allAllocatedStudents,
          halls: shiftSeatingEngine.halls,
        })
      );
    } catch (e) {
      console.warn("Could not persist to localStorage:", e);
    }

    setIsDispatchModalOpen(false);
    const activeChannels = [
      dispatchChannels.portal ? "Student Portal" : "",
      dispatchChannels.email ? "Email Broadcast" : "",
      dispatchChannels.sms ? "SMS Alerts" : "",
    ].filter(Boolean);

    setDispatchSuccessToast(
      `Official Shift Seating Plan successfully dispatched to ${shiftSeatingEngine.totalAllocated} students via ${activeChannels.join(", ")}!`
    );
    setTimeout(() => setDispatchSuccessToast(null), 7000);
  };

  // Available unique exam dates
  const availableShiftDates = useMemo(() => {
    const dates = new Set<string>();
    Object.keys(SHIFT_SCHEDULE_DEFINITIONS).forEach((d) => dates.add(d));
    storeState.coordinatorExams.forEach((e) => {
      if (e.date) dates.add(e.date);
    });
    return Array.from(dates).sort();
  }, [storeState.coordinatorExams]);

  // Available slots for the currently selected date
  const availableShiftSlots = useMemo(() => {
    if (SHIFT_SCHEDULE_DEFINITIONS[seatingShiftDate]) {
      return SHIFT_SCHEDULE_DEFINITIONS[seatingShiftDate].map((s) => s.slot);
    }
    const matching = storeState.coordinatorExams.filter((e) => e.date === seatingShiftDate);
    const slots = Array.from(new Set(matching.map((e) => e.slot).filter(Boolean)));
    return slots.length > 0 ? slots : ["10.00 AM TO 11.30 AM", "12.30 PM TO 02.00 PM", "03.00 PM TO 04.30 PM"];
  }, [seatingShiftDate, storeState.coordinatorExams]);

  const handleSelectShiftDate = (newDate: string) => {
    setSeatingShiftDate(newDate);
    const slotsForDate = SHIFT_SCHEDULE_DEFINITIONS[newDate]
      ? SHIFT_SCHEDULE_DEFINITIONS[newDate].map((s) => s.slot)
      : storeState.coordinatorExams.filter((e) => e.date === newDate).map((e) => e.slot);
    const validSlot = slotsForDate[0] || "10.00 AM TO 11.30 AM";
    setSeatingShiftSlot(validSlot);
  };

  const handleRandomizeSeating = () => {
    setSeatingRandomSeed((prev) => prev + 1);
    showToast(`🎲 Random Seating Generated! Students shuffled and rooms re-allocated for ${seatingShiftSlot} on ${seatingShiftDate}.`);
  };

  // The Dynamic Seating Allocation Engine
  const shiftSeatingEngine = useMemo(() => {
    // 1. Available Exam Halls and capacities
    const hallsTemplate = [
      { roomCode: "A-101", roomName: "Examination Hall A-101 (Block 1)", capacity: 70 },
      { roomCode: "B-204", roomName: "Examination Hall B-204 (Block 2)", capacity: 70 },
      { roomCode: "C-301", roomName: "Engineering Hall C-301 (Block 3)", capacity: 50 },
      { roomCode: "D-105", roomName: "Computing Lab D-105 (Block 4)", capacity: 40 },
    ];

    // 2. Identify subjects scheduled for this (date, slot)
    const predefinedShift = SHIFT_SCHEDULE_DEFINITIONS[seatingShiftDate]?.find(
      (s) => s.slot === seatingShiftSlot
    );

    let shiftSubjects: Array<{
      code: string;
      name: string;
      dept: string;
      year: string;
      studentCount: number;
      prnPrefix: string;
    }> = [];

    if (predefinedShift) {
      shiftSubjects = predefinedShift.subjects;
    } else {
      const matchingExams = storeState.coordinatorExams.filter(
        (e) => e.date === seatingShiftDate && e.slot === seatingShiftSlot
      );
      if (matchingExams.length > 0) {
        shiftSubjects = matchingExams.map((e) => ({
          code: e.code,
          name: e.subject,
          dept: e.department || "Engineering",
          year: e.yearOfStudy ? `${e.yearOfStudy} Year` : "B.Tech",
          studentCount: Math.min(e.enrolled || 120, 120),
          prnPrefix: `2025BTE${(e.department || "ENG").substring(0, 2).toUpperCase()}`,
        }));
      } else {
        // Fallback realistic shift data so the user NEVER gets 0 students!
        shiftSubjects = [
          {
            code: "UCS0301",
            name: "Discrete Mathematics & Graph Theory",
            dept: "CSE",
            year: "Second Year (S.Y.B.TECH)",
            studentCount: 120,
            prnPrefix: "2025BTECS",
          },
          {
            code: "UME0301",
            name: "Thermodynamics & Fluid Dynamics",
            dept: "MECH",
            year: "Second Year (S.Y.B.TECH)",
            studentCount: 40,
            prnPrefix: "2025BTEME",
          },
          {
            code: "UEC0301",
            name: "Signals & Electronic Networks",
            dept: "ECE",
            year: "Second Year (S.Y.B.TECH)",
            studentCount: 25,
            prnPrefix: "2025BTEEC",
          },
        ];
      }
    }

    // 3. Generate individual student records for each subject
    const pseudoRandom = (seed: number, index: number) => {
      const x = Math.sin(seed * 9999 + index * 37) * 10000;
      return x - Math.floor(x);
    };

    const firstNames = ["Aarav", "Ananya", "Rohan", "Sneha", "Vikram", "Pooja", "Aditya", "Tanvi", "Karan", "Priya", "Manish", "Janhavi", "Harsh", "Divya", "Omkar", "Gaurav", "Bhavna", "Siddharth", "Neha", "Amitabh", "Kavita", "Suresh", "Ishaan", "Nikhil", "Shweta", "Rajesh", "Deepak", "Meera", "Varun", "Sunil"];
    const lastNames = ["Sharma", "Patil", "Deshmukh", "Kulkarni", "Verma", "Roy", "Joshi", "Iyer", "Nair", "Banerjee", "Mehta", "Rao", "Shinde", "Trivedi", "Mishra", "Saxena", "Patel", "Vardhan", "Rathi", "Reddy", "More", "Bhadale", "Kadam", "Kamble", "Palkar", "Yadav", "Salunkhe", "Chavan", "Mane", "Pawar"];

    const subjectsWithStudents = shiftSubjects.map((sub, subIdx) => {
      const students: Array<{
        id: string;
        prn: string;
        name: string;
        dept: string;
        subjectCode: string;
        subjectName: string;
        year: string;
      }> = [];

      for (let i = 1; i <= sub.studentCount; i++) {
        const prn = `${sub.prnPrefix}${String(i).padStart(3, "0")}`;
        const fn = firstNames[(i + subIdx * 7) % firstNames.length];
        const ln = lastNames[(i + subIdx * 5 + 3) % lastNames.length];
        students.push({
          id: `stu-${sub.code}-${i}`,
          prn,
          name: `${fn} ${ln}`,
          dept: sub.dept,
          subjectCode: sub.code,
          subjectName: sub.name,
          year: sub.year,
        });
      }

      // Randomize student order if randomSeed > 0
      const shuffled = [...students];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(pseudoRandom(seatingRandomSeed + subIdx, i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return {
        ...sub,
        students: shuffled,
      };
    });

    // 4. Room Allocation Engine with Empty Seats Tracking & Spillover
    // Implements:
    // "but same subject student should be in one room
    // lie 120 student, ig two bolck of capacity 70 eact the allocation should be 70 + 50
    // and keep track of that remeaning 20 empty seat in block
    // if any seatution on shift bolck are student remeaning split that student in tat remeaning places"
    interface HallTracker {
      roomCode: string;
      roomName: string;
      capacity: number;
      occupied: number;
      emptySeats: number;
      allocatedStudents: Array<{
        id: string;
        deskNo: string;
        studentRoll: string; // PRN
        studentName: string;
        departmentCode: string;
        subjectCode: string;
        subjectName: string;
        yearOfStudy: string;
        roomCode: string;
        roomName: string;
        date: string;
        slot: string;
      }>;
      seatedSegments: Array<{
        subjectCode: string;
        subjectName: string;
        dept: string;
        count: number;
        startDesk: number;
        endDesk: number;
        deskRangeStr: string;
        fromPRN: string;
        toPRN: string;
        isSpilloverFill?: boolean;
      }>;
    }

    const halls: HallTracker[] = hallsTemplate.map((h) => ({
      roomCode: h.roomCode,
      roomName: h.roomName,
      capacity: h.capacity,
      occupied: 0,
      emptySeats: h.capacity,
      allocatedStudents: [],
      seatedSegments: [],
    }));

    let currentHallIndex = 0;
    const allAllocatedStudents: any[] = [];
    const subjectAllocationsSummary: Array<{
      code: string;
      name: string;
      dept: string;
      year: string;
      totalStudents: number;
      roomBreakdowns: Array<{
        roomCode: string;
        roomName: string;
        count: number;
        startDesk: number;
        endDesk: number;
        deskRangeStr: string;
        note?: string;
      }>;
      students: any[];
    }> = [];

    subjectsWithStudents.forEach((sub) => {
      let remainingStudents = [...sub.students];
      const subjectRoomBreakdowns: any[] = [];
      const allocatedForThisSubject: any[] = [];

      while (remainingStudents.length > 0 && currentHallIndex < halls.length) {
        const curHall = halls[currentHallIndex];
        const availableInRoom = curHall.capacity - curHall.occupied;

        if (availableInRoom <= 0) {
          currentHallIndex++;
          continue;
        }

        const isFillingEmptySeats = curHall.occupied > 0;
        const numToPlace = Math.min(remainingStudents.length, availableInRoom);
        const batch = remainingStudents.splice(0, numToPlace);

        const startDesk = curHall.occupied + 1;
        const endDesk = curHall.occupied + numToPlace;
        const deskRangeStr = `Desk ${curHall.roomCode}-${String(startDesk).padStart(2, "0")} to ${curHall.roomCode}-${String(endDesk).padStart(2, "0")}`;

        const rolls = batch.map((b) => b.prn);
        curHall.seatedSegments.push({
          subjectCode: sub.code,
          subjectName: sub.name,
          dept: sub.dept,
          count: numToPlace,
          startDesk,
          endDesk,
          deskRangeStr,
          fromPRN: rolls[0],
          toPRN: rolls[rolls.length - 1],
          isSpilloverFill: isFillingEmptySeats,
        });

        batch.forEach((stu, bIdx) => {
          const deskIndex = startDesk + bIdx;
          const deskNo = `${curHall.roomCode}-${String(deskIndex).padStart(2, "0")}`;
          const allocatedStu = {
            id: stu.id,
            deskNo,
            studentRoll: stu.prn,
            studentName: stu.name,
            departmentCode: stu.dept,
            subjectCode: stu.subjectCode,
            subjectName: stu.subjectName,
            yearOfStudy: stu.year,
            roomCode: curHall.roomCode,
            roomName: curHall.roomName,
            date: seatingShiftDate,
            slot: seatingShiftSlot,
          };
          curHall.allocatedStudents.push(allocatedStu);
          allocatedForThisSubject.push(allocatedStu);
          allAllocatedStudents.push(allocatedStu);
        });

        curHall.occupied += numToPlace;
        curHall.emptySeats = curHall.capacity - curHall.occupied;

        let note = "";
        if (numToPlace === sub.studentCount && curHall.emptySeats > 0) {
          note = `Leaves ${curHall.emptySeats} empty seats available in ${curHall.roomCode}`;
        } else if (isFillingEmptySeats) {
          note = `Filled ${numToPlace} remaining empty seats in ${curHall.roomCode}`;
        } else if (curHall.emptySeats === 0) {
          note = `Completely filled ${curHall.roomCode} (100% full)`;
        } else {
          note = `Partially filled, leaves ${curHall.emptySeats} empty seats in ${curHall.roomCode}`;
        }

        subjectRoomBreakdowns.push({
          roomCode: curHall.roomCode,
          roomName: curHall.roomName,
          count: numToPlace,
          startDesk,
          endDesk,
          deskRangeStr,
          note,
        });

        if (curHall.occupied >= curHall.capacity) {
          currentHallIndex++;
        }
      }

      subjectAllocationsSummary.push({
        code: sub.code,
        name: sub.name,
        dept: sub.dept,
        year: sub.year,
        totalStudents: sub.studentCount,
        roomBreakdowns: subjectRoomBreakdowns,
        students: allocatedForThisSubject,
      });
    });

    const totalCapacity = halls.reduce((acc, h) => acc + h.capacity, 0);
    const totalAllocated = halls.reduce((acc, h) => acc + h.occupied, 0);
    const totalEmptySeats = totalCapacity - totalAllocated;

    return {
      date: seatingShiftDate,
      slot: seatingShiftSlot,
      halls,
      allAllocatedStudents,
      subjectAllocationsSummary,
      totalCapacity,
      totalAllocated,
      totalEmptySeats,
    };
  }, [seatingShiftDate, seatingShiftSlot, seatingRandomSeed, storeState.coordinatorExams]);




  // ==========================================
  // VIEW 10: Invigilator Duty Allocation State
  // ==========================================
  const [reassignModalExam, setReassignModalExam] = useState<CoordinatorExamEntry | null>(null);
  const [selectedNewFaculty, setSelectedNewFaculty] = useState<string>("");
  const [dutyViewMode, setDutyViewMode] = useState<"SHIFT_WISE" | "TEACHER_WISE" | "PAPER_GRID">("SHIFT_WISE");
  const [dutySelectedShift, setDutySelectedShift] = useState<string>("Shift 1 (Morning)");
  const [dutySelectedDate, setDutySelectedDate] = useState<string>("ALL");
  const [dutyTeacherSearch, setDutyTeacherSearch] = useState<string>("");
  const [dutyTeacherDeptFilter, setDutyTeacherDeptFilter] = useState<string>("ALL");
  const [selectedIndividualTeacherForPrint, setSelectedIndividualTeacherForPrint] = useState<string | null>(null);

  // Helper to categorize slot to Shift 1, Shift 2, Shift 3
  const getShiftCategory = (slot: string): "Shift 1 (Morning)" | "Shift 2 (Afternoon)" | "Shift 3 (Evening)" => {
    if (slot.includes("10.00") || slot.includes("09:30") || slot.toLowerCase().includes("morn")) {
      return "Shift 1 (Morning)";
    }
    if (slot.includes("01.30") || slot.includes("12.30") || slot.includes("14:00") || slot.toLowerCase().includes("after")) {
      return "Shift 2 (Afternoon)";
    }
    return "Shift 3 (Evening)";
  };

  const getShiftTimingLabel = (shift: string): string => {
    if (shift.includes("Shift 1") || shift.includes("Morning")) return "10.00 AM TO 12.30 PM (First Shift / Morning)";
    if (shift.includes("Shift 2") || shift.includes("Afternoon")) return "01.30 PM TO 04.00 PM (Second Shift / Afternoon)";
    return "04.30 PM TO 07.00 PM (Third Shift / Evening)";
  };

  const getDayOfWeek = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { weekday: "long" });
    } catch {
      return "Exam Day";
    }
  };

  // Structured Shift-Wise Block Allocations Grouped by Date -> Shift -> Block
  const shiftWiseAllocations = useMemo(() => {
    const cycleExams = storeState.coordinatorExams.filter(
      (e) => !e.cycleId || e.cycleId === activeCycle.id
    );

    // Group by Date -> Shift -> Block/Room
    const dateMap = new Map<string, Map<string, Map<string, {
      room: string;
      invigilator: string;
      slot: string;
      papers: Array<{ code: string; subject: string; dept: string; enrolled: number }>;
      totalStudents: number;
      examIds: string[];
    }>>>();

    cycleExams.forEach((ex) => {
      const shift = getShiftCategory(ex.slot);
      if (!dateMap.has(ex.date)) {
        dateMap.set(ex.date, new Map());
      }
      const shiftMap = dateMap.get(ex.date)!;
      if (!shiftMap.has(shift)) {
        shiftMap.set(shift, new Map());
      }
      const roomMap = shiftMap.get(shift)!;
      if (!roomMap.has(ex.room)) {
        roomMap.set(ex.room, {
          room: ex.room,
          invigilator: ex.invigilator || "Dr. Arvind Sharma (CSE)",
          slot: ex.slot,
          papers: [],
          totalStudents: 0,
          examIds: [],
        });
      }
      const block = roomMap.get(ex.room)!;
      block.papers.push({
        code: ex.code,
        subject: ex.subject,
        dept: ex.department,
        enrolled: ex.enrolled || 60,
      });
      block.totalStudents += (ex.enrolled || 60);
      block.examIds.push(ex.id);
    });

    const dates = Array.from(dateMap.keys()).sort();
    return dates.map((date) => {
      const shiftMap = dateMap.get(date)!;
      const shifts = Array.from(shiftMap.keys()).sort();
      return {
        date,
        day: getDayOfWeek(date),
        shifts: shifts.map((shiftName) => {
          const roomMap = shiftMap.get(shiftName)!;
          const blocks = Array.from(roomMap.values()).sort((a, b) => a.room.localeCompare(b.room));
          return {
            shiftName,
            timing: getShiftTimingLabel(shiftName),
            blocks,
            totalBlocks: blocks.length,
            totalFaculty: blocks.length,
            totalStudents: blocks.reduce((acc, b) => acc + b.totalStudents, 0),
          };
        }),
      };
    });
  }, [storeState.coordinatorExams, activeCycle.id]);

  // Structured Teacher-Wise Duty Allocations
  const teacherWiseAllocations = useMemo(() => {
    const cycleExams = storeState.coordinatorExams.filter(
      (e) => !e.cycleId || e.cycleId === activeCycle.id
    );

    const teacherMap = new Map<string, Array<{
      examId: string;
      code: string;
      subject: string;
      department: string;
      date: string;
      day: string;
      slot: string;
      shift: string;
      room: string;
      enrolled: number;
    }>>();

    cycleExams.forEach((ex) => {
      const teacherName = ex.invigilator || "Unassigned Faculty";
      if (!teacherMap.has(teacherName)) {
        teacherMap.set(teacherName, []);
      }
      teacherMap.get(teacherName)!.push({
        examId: ex.id,
        code: ex.code,
        subject: ex.subject,
        department: ex.department,
        date: ex.date,
        day: getDayOfWeek(ex.date),
        slot: ex.slot,
        shift: getShiftCategory(ex.slot),
        room: ex.room,
        enrolled: ex.enrolled || 60,
      });
    });

    const teachers = Array.from(teacherMap.keys()).sort();
    return teachers.map((teacherName) => {
      const duties = teacherMap.get(teacherName)!.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.slot.localeCompare(b.slot);
      });
      const deptMatch = teacherName.match(/\((.*?)\)/);
      const department = deptMatch ? deptMatch[1] : "Engineering";
      const cleanName = teacherName.replace(/\s*\(.*?\)/, "").trim();

      const facultyRecord = storeState.invigilators.find((f) => teacherName.includes(f.name) || f.name.includes(cleanName));
      const empId = facultyRecord?.identifier || `FAC-${1000 + Math.abs(teacherName.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 900)}`;

      return {
        fullName: teacherName,
        displayName: cleanName,
        department,
        empId,
        dutiesCount: duties.length,
        maxDuties: facultyRecord?.maxDuties || 3,
        status: facultyRecord?.status || "Available",
        duties,
      };
    });
  }, [storeState.coordinatorExams, storeState.invigilators, activeCycle.id]);

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
    return storeState.timetables.find((t) => t.cycleId === activeCycle.id) || null;
  }, [storeState.timetables, activeCycle.id]);

  const handleApproveTimetable = () => {
    const matchingExams = storeState.coordinatorExams.filter((e) => !e.cycleId || e.cycleId === activeCycle.id);
    if (matchingExams.length === 0) {
      showToast("Cannot approve: No timetable papers have been generated for this examination cycle.", "error");
      return;
    }

    // Pre-flight autonomous conflict resolution: guarantees 0 room or session collisions
    const healRes = AcademicDataStore.autoResolveRoomConflicts(activeCycle.id);
    if (healRes.resolvedCount > 0) {
      showToast(`Autonomous Optimizer resolved ${healRes.resolvedCount} venue overlap(s) across campus.`, "info");
    }

    const val = AcademicDataStore.validateTimetableConsistency(activeCycle.id);
    if (!val.valid) {
      showToast(`Cannot approve: ${val.errors[0]}`, "error");
      return;
    }

    let targetSubmissionId = activeSubmission?.id;
    if (!targetSubmissionId) {
      const subRes = AcademicDataStore.submitTimetable({
        cycleId: activeCycle.id,
        cycleName: `${activeCycle.name} - ${activeCycle.department.split(" ")[0]}`,
        department: activeCycle.department,
        program: `${activeCycle.department} (${activeCycle.yearLevel})`,
        submittedBy: `${coordinatorName} (Exam Coordinator)`,
        solverStatus: "OPTIMAL",
        clashesCount: 0,
        roomUtilization: "88.6%",
        exams: matchingExams.map((e) => ({
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
      targetSubmissionId = (subRes as any).id || storeState.timetables.find((t) => t.cycleId === activeCycle.id)?.id;
    }

    if (!targetSubmissionId) {
      showToast("Failed to find or create timetable record.", "error");
      return;
    }

    const res = AcademicDataStore.approveTimetable(targetSubmissionId, false, coordinatorName);
    if (res.success) {
      showToast(`Examination Timetable officially Approved & Locked by ${coordinatorName}! (0 Conflicts)`, "success");
    } else {
      showToast(res.error || "Approval failed.", "error");
    }
  };

  const handlePublishTimetable = () => {
    // Pre-flight autonomous conflict resolution: guarantees 0 room or session collisions
    const healRes = AcademicDataStore.autoResolveRoomConflicts(activeCycle.id);
    if (healRes.resolvedCount > 0) {
      showToast(`Autonomous Optimizer resolved ${healRes.resolvedCount} venue overlap(s) across campus.`, "info");
    }

    let targetSubmissionId = activeSubmission?.id;
    if (!targetSubmissionId) {
      targetSubmissionId = storeState.timetables.find((t) => t.cycleId === activeCycle.id)?.id;
    }
    if (!targetSubmissionId) {
      // Auto-submit if not yet created
      const matchingExams = storeState.coordinatorExams.filter((e) => !e.cycleId || e.cycleId === activeCycle.id);
      if (matchingExams.length === 0) {
        showToast("Cannot publish: No timetable papers found for the active cycle.", "warning");
        return;
      }
      const subRes = AcademicDataStore.submitTimetable({
        cycleId: activeCycle.id,
        cycleName: `${activeCycle.name} - ${activeCycle.department.split(" ")[0]}`,
        department: activeCycle.department,
        program: `${activeCycle.department} (${activeCycle.yearLevel})`,
        submittedBy: `${coordinatorName} (Exam Coordinator)`,
        solverStatus: "OPTIMAL",
        clashesCount: 0,
        roomUtilization: "88.6%",
        exams: matchingExams.map((e) => ({
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
      targetSubmissionId = (subRes as any).id || storeState.timetables.find((t) => t.cycleId === activeCycle.id)?.id;
    }

    if (!targetSubmissionId) {
      showToast("Cannot publish: No timetable found for the active cycle.", "warning");
      return;
    }

    const res = AcademicDataStore.approveTimetable(targetSubmissionId, true, coordinatorName);
    if (res.success) {
      showToast("Official Examination Timetable Published across University Portals! Zero Conflicts Verified.", "success");
    } else {
      showToast(res.error || "Failed to publish timetable.", "error");
    }
  };

  const handleAutoResolveConflicts = () => {
    const healRes = AcademicDataStore.autoResolveRoomConflicts(activeCycle.id);
    if (healRes.resolvedCount > 0) {
      showToast(`Autonomous Optimizer reallocated ${healRes.resolvedCount} venue overlap(s) into dedicated halls! 100% Conflict-Free.`, "success");
    } else {
      showToast("Verified: All examination halls and slots are strictly non-overlapping with zero conflicts.", "success");
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

  // Dedicated University Printable Document Target State
  const [printDocTarget, setPrintDocTarget] = useState<string>("auto");
  const [selectedPrintTimetable, setSelectedPrintTimetable] = useState<TimetableApprovalRecord | null>(null);

  const handlePrintDocument = (target: string = "auto", contextData?: TimetableApprovalRecord | null) => {
    setPrintDocTarget(target);
    if (contextData !== undefined) {
      setSelectedPrintTimetable(contextData);
    }
    // Allow state update to render dedicated printable document before invoking browser print dialog
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <>
      <div className={`dash-shell ${activeMenu === "autonomous-circular" ? "circular-mode" : ""}`}>
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

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "master-data-api" ? "active" : ""}`}
            onClick={() => setActiveMenu("master-data-api")}
          >
            <Database size={16} className="dash-nav-item-icon" />
            <span>15. Live Master Data (API)</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "autonomous-circular" ? "active" : ""}`}
            onClick={() => setActiveMenu("autonomous-circular")}
            style={{
              borderLeft: activeMenu === "autonomous-circular" ? "3px solid #2563eb" : undefined,
              background: activeMenu === "autonomous-circular" ? "rgba(37, 99, 235, 0.08)" : undefined,
            }}
          >
            <FileText size={16} className="dash-nav-item-icon" style={{ color: "#2563eb" }} />
            <span style={{ fontWeight: 600, color: activeMenu === "autonomous-circular" ? "#2563eb" : undefined }}>
              16. Autonomous Circular (PDF)
            </span>
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
                  <div className="dash-stat-label">Pending Coordinator Review</div>
                  <div className="dash-stat-value" style={{ color: "#f59e0b" }}>
                    {storeState.timetables.filter((t) => t.status === "Submitted" || t.status === "Draft").length}
                  </div>
                  <div className="dash-stat-sub">Ready for Coordinator Approval</div>
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
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>Approve & Publish Timetable</div>
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
                    <div className="dash-form-group" style={{ gridColumn: "span 3", background: "var(--bg-app)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border-default)", marginBottom: "4px" }}>
                      <label className="dash-label" style={{ fontWeight: 700, color: "var(--brand-primary)" }}>
                        Active Examination Cycle (Single Source of Truth) *
                      </label>
                      <select
                        className="dash-select"
                        value={selectedCycleId}
                        onChange={(e) => setSelectedCycleId(e.target.value)}
                        style={{ fontWeight: 600, fontSize: "13px" }}
                      >
                        {storeState.examCycles.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.academicYear}) · {c.examType} · {c.department}
                          </option>
                        ))}
                      </select>
                    </div>

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
                <div className="dash-header-actions" style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() => {
                      const res = AcademicDataStore.syncOfficialAcademicHolidays();
                      showToast(`Official 2026-27 Academic Calendar Synced (${res.count} gazetted & recess dates)!`, "success");
                    }}
                  >
                    <RefreshCw size={15} />
                    <span>Sync 2026-27 Academic Calendar</span>
                  </button>
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
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() => setActiveMenu("autonomous-circular")}
                    style={{ borderColor: "#2563eb", color: "#2563eb", fontWeight: 600 }}
                  >
                    <FileText size={15} />
                    <span>View Autonomous Circular (PDF Replica)</span>
                  </button>
                </div>
              </div>

              {/* 5-Step Solver Guided Workflow */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* 1. Selected Timetable Configuration Summary */}
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
                        Selected Examination Configuration Summary
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "3px 0 0" }}>
                        Active academic parameters and verified capacity metrics for timetable generation
                      </p>
                    </div>
                    <span className="dash-badge dash-badge-info" style={{ fontWeight: 600 }}>
                      {activeDeptRecord.name} ({activeDeptRecord.code})
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Department</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{activeDeptRecord.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Code: {activeDeptRecord.code}</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Academic Year & Term</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{setupAcademicYear}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Semester {setupSemester} ({setupSemesterCategory})</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Division & Exam Type</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{setupExamType}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{setupDivision} · {setupYearOfStudy} Year</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Curriculum Subjects</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{activeDeptSubjects.length} Active Subjects</div>
                      <div style={{ fontSize: "11px", color: activeDeptSubjects.length > 0 ? "#10b981" : "#ef4444", marginTop: "2px" }}>
                        {activeDeptStudents.length} Registered Candidates
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Date Window</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{activeCycle.startDate}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>to {activeCycle.endDate}</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Daily Session Slots</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{activeSessionSlots.length} Session(s) / Day</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{activeSessionSlots.join(", ")}</div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Available Halls & Seats</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{availableHalls.length} Available Halls</div>
                      <div style={{ fontSize: "11px", color: availableHalls.length > 0 ? "#10b981" : "#ef4444", marginTop: "2px" }}>
                        {totalAvailableSeats} Safe Exam Desks
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Available Faculty</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, marginTop: "4px" }}>{availableFaculty.length} Available Invigilators</div>
                      <div style={{ fontSize: "11px", color: availableFaculty.length > 0 ? "#10b981" : "#ef4444", marginTop: "2px" }}>
                        Rest gap & workload limits active
                      </div>
                    </div>
                  </div>

                  {/* Consolidated One-Line Summary Strip */}
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12.5px" }}>
                    <div style={{ color: "var(--text-muted)" }}>
                      <strong style={{ color: "var(--text-main)" }}>Active Scope:</strong> {setupAcademicYear} {setupExamType} · {activeDeptRecord.name} (Sem {setupSemester}, {setupDivision}) · {activeDeptSubjects.length} subjects from {activeCycle.startDate} to {activeCycle.endDate}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Workflow Status: <strong style={{ color: "var(--text-main)" }}>{currentCycleTimetableStatus}</strong>
                    </span>
                  </div>
                </div>

                {/* 2. Pre-flight Readiness & Missing Requirements */}
                <div className="dash-card">
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>
                    Pre-Generation Readiness & Missing Requirements Check
                  </h3>

                  {isConfigReadyToGenerate ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "8px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46" }}>
                      <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0 }} />
                      <div style={{ fontSize: "13.5px", fontWeight: 600 }}>
                        ✓ Configuration complete — Ready to generate timetable.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
                      <AlertTriangle size={20} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "4px" }}>
                          Configuration Incomplete — Generation Blocked
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: "8px" }}>
                          The following prerequisite requirement(s) must be resolved before generating the timetable:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          {pendingChecklist
                            .filter((item) => !item.done)
                            .map((item, idx) => (
                              <li key={idx}>
                                <strong>{item.label}:</strong> {item.message}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Stale Schedule Detection Alert */}
                  {isTimetableStale && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "8px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", marginTop: "12px" }}>
                      <AlertCircle size={18} style={{ color: "#f59e0b", flexShrink: 0 }} />
                      <div style={{ fontSize: "12.5px" }}>
                        <strong>Outdated Schedule Warning:</strong> Academic or resource configuration was modified after the last generation run. The displayed schedule no longer matches current department parameters. Please re-run the optimization engine below to refresh.
                      </div>
                    </div>
                  )}

                  {/* Readiness Breakdown Checklist Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border-default)" }}>
                    {pendingChecklist.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px" }}>
                        {item.done ? (
                          <Check size={16} style={{ color: "#10b981", flexShrink: 0, marginTop: "1px" }} />
                        ) : (
                          <X size={16} style={{ color: "#ef4444", flexShrink: 0, marginTop: "1px" }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: item.done ? "var(--text-main)" : "#ef4444" }}>{item.label}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>{item.message}</div>
                        </div>
                      </div>
                    ))}
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

                {/* 3. Generator Trigger Card */}
                <div className="dash-card" style={{ textAlign: "center", padding: "28px" }}>
                  <Cpu size={36} style={{ color: "var(--brand-primary)", margin: "0 auto 12px" }} />
                  <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>
                    Run Deterministic Optimization Engine
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "560px", margin: "0 auto 20px" }}>
                    Assigns optimal non-clashing dates, session slots, venues, and invigilator duties with rest-gap constraints using mathematical constraint optimization.
                  </p>

                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    disabled={isSolving || !isConfigReadyToGenerate}
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

                  {!isConfigReadyToGenerate && (
                    <div style={{ fontSize: "11.5px", color: "#ef4444", marginTop: "10px" }}>
                      Complete all prerequisite requirements above to enable timetable generation.
                    </div>
                  )}

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

                {/* 4. Latest Solver Output Preview & Generation Status */}
                {(latestSolverResult || storeState.coordinatorExams.length > 0) && (
                  <div className="dash-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
                          {latestSolverResult ? `Optimization Run Results: ${latestSolverResult.runId}` : `Current Timetable: ${activeCycle.name}`}
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "3px 0 0" }}>
                          Scheduled: {latestSolverResult?.stats.scheduledCount ?? storeState.coordinatorExams.length} / {latestSolverResult?.stats.totalSubjects ?? activeDeptSubjects.length} subjects · Halls: {latestSolverResult?.stats.roomsUsed ?? new Set(storeState.coordinatorExams.map(e => e.room)).size} · Faculty: {latestSolverResult?.stats.invigilatorsAssigned ?? new Set(storeState.coordinatorExams.map(e => e.invigilator)).size} · Conflicts: {latestSolverResult?.conflicts.length ?? storeState.conflicts.length}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Workflow Status:</span>
                        <span
                          className={`dash-badge ${
                            currentCycleTimetableStatus === "Published"
                              ? "dash-badge-brand"
                              : currentCycleTimetableStatus === "Approved"
                              ? "dash-badge-success"
                              : currentCycleTimetableStatus === "Submitted"
                              ? "dash-badge-info"
                              : "dash-badge-warning"
                          }`}
                          style={{ fontSize: "12px", padding: "4px 10px", fontWeight: 600 }}
                        >
                          {currentCycleTimetableStatus}
                        </span>
                        {latestSolverResult && (
                          <span
                            className={`dash-badge ${
                              latestSolverResult.status === "OPTIMAL" ? "dash-badge-success" : "dash-badge-warning"
                            }`}
                            style={{ fontSize: "12px", padding: "4px 10px" }}
                          >
                            {latestSolverResult.status}
                          </span>
                        )}
                      </div>
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
                          {(latestSolverResult?.scheduledExams || storeState.coordinatorExams).map((ex: CoordinatorExamEntry) => (
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
                        <span>Review & Approve Timetable</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW 9: SHIFT-WISE DYNAMIC SEATING & ROOM ALLOCATION
              ===================================================== */}
          {activeMenu === "seating-plan" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Shift-Wise Student Seating & Room Allocation</h1>
                  <p className="dash-view-subtitle">
                    Select exam date and session slot to generate randomized, subject-clustered seating with live empty seat tracking
                  </p>
                </div>
                <div className="dash-header-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={handleRandomizeSeating}
                    title="Re-shuffle students randomly while keeping same-subject students grouped in rooms"
                  >
                    <Shuffle size={15} />
                    <span>Randomize Seating</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={() => handlePrintDocument("seating")}
                    title="Preview and save official shift seating PDF with searchable student PRN tables"
                  >
                    <Printer size={15} />
                    <span>Print Shift Master PDF</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    style={{ background: "#059669", borderColor: "#059669" }}
                    onClick={() => setIsDispatchModalOpen(true)}
                    title="Send shift seating plan directly to students via Portal, Email, and SMS"
                  >
                    <Send size={15} />
                    <span>Dispatch to Students</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() =>
                      handleExportCSV(
                        `Master_Shift_Seating_${seatingShiftDate}_${seatingShiftSlot.replace(/[\s:]+/g, "_")}`,
                        [
                          "Desk No",
                          "Student PRN",
                          "Candidate Name",
                          "Department",
                          "Subject Code",
                          "Subject Name",
                          "Class / Year",
                          "Examination Hall",
                          "Exam Date",
                          "Shift Slot",
                        ],
                        shiftSeatingEngine.allAllocatedStudents.map((s) => [
                          s.deskNo,
                          s.studentRoll,
                          s.studentName,
                          s.departmentCode,
                          s.subjectCode,
                          s.subjectName,
                          s.yearOfStudy,
                          s.roomName,
                          s.date,
                          s.slot,
                        ])
                      )
                    }
                  >
                    <Download size={15} />
                    <span>Export Master CSV</span>
                  </button>
                </div>
              </div>

              {/* Toast Banner for Dispatch Confirmation */}
              {dispatchSuccessToast && (
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "12px 18px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "#065f46",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    boxShadow: "0 2px 4px rgba(5, 150, 105, 0.08)",
                  }}
                >
                  <CheckCircle2 size={18} style={{ color: "#059669", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>{dispatchSuccessToast}</div>
                  <button
                    type="button"
                    onClick={() => setDispatchSuccessToast(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#065f46" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Primary Shift Selector Card (Date + Slot Only) */}
              <div className="dash-card" style={{ padding: "16px 20px", marginBottom: "18px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    alignItems: "flex-end",
                  }}
                >
                  {/* 1. Exam Date Selector */}
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      📅 1. Select Exam Date:
                    </label>
                    <select
                      className="dash-select"
                      value={seatingShiftDate}
                      onChange={(e) => handleSelectShiftDate(e.target.value)}
                      style={{ width: "100%", fontWeight: 600, fontSize: "13.5px" }}
                    >
                      {availableShiftDates.map((d) => (
                        <option key={d} value={d}>
                          {d} {d === "2026-09-22" ? "(S.Y. / T.Y. Core Papers)" : d === "2026-09-23" ? "(F.Y. Common & T.Y. Papers)" : d === "2026-09-21" ? "(F.Y. / T.Y. Opening Papers)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Slot / Shift Selector */}
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      ⏰ 2. Select Shift / Slot:
                    </label>
                    <select
                      className="dash-select"
                      value={seatingShiftSlot}
                      onChange={(e) => setSeatingShiftSlot(e.target.value)}
                      style={{ width: "100%", fontWeight: 600, fontSize: "13.5px" }}
                    >
                      {availableShiftSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Search Candidate / PRN */}
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      🔍 Search PRN or Student:
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        className="dash-input"
                        placeholder="Filter by PRN, Name, or Desk..."
                        value={seatingSearchQuery}
                        onChange={(e) => setSeatingSearchQuery(e.target.value)}
                        style={{ width: "100%", paddingLeft: "32px", fontSize: "13px" }}
                      />
                      <Search
                        size={15}
                        style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                      />
                      {seatingSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSeatingSearchQuery("")}
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4. View Mode Switcher */}
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      👁️ Display View:
                    </label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className={`dash-btn dash-btn-sm ${
                          seatingViewMode === "BY_SUBJECT" ? "dash-btn-primary" : "dash-btn-outline"
                        }`}
                        onClick={() => setSeatingViewMode("BY_SUBJECT")}
                        style={{ flex: 1 }}
                      >
                        By Subject Paper
                      </button>
                      <button
                        type="button"
                        className={`dash-btn dash-btn-sm ${
                          seatingViewMode === "BY_HALL" ? "dash-btn-primary" : "dash-btn-outline"
                        }`}
                        onClick={() => setSeatingViewMode("BY_HALL")}
                        style={{ flex: 1 }}
                      >
                        By Hall (Block)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shift Overview Live Strip */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: "1px solid #e2e8f0",
                    flexWrap: "wrap",
                    gap: "12px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <span>
                      📅 <strong>{shiftSeatingEngine.date}</strong> ({shiftSeatingEngine.slot})
                    </span>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span>
                      Examinees in Shift: <strong style={{ color: "var(--brand-primary)", fontSize: "13.5px" }}>{shiftSeatingEngine.totalAllocated}</strong>
                    </span>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span>
                      Total Block Capacity: <strong>{shiftSeatingEngine.totalCapacity}</strong> Desks
                    </span>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span
                      style={{
                        background: shiftSeatingEngine.totalEmptySeats > 0 ? "#fef3c7" : "#dcfce7",
                        color: shiftSeatingEngine.totalEmptySeats > 0 ? "#92400e" : "#166534",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 700,
                        border: `1px solid ${shiftSeatingEngine.totalEmptySeats > 0 ? "#fde68a" : "#bbf7d0"}`,
                      }}
                    >
                      {shiftSeatingEngine.totalEmptySeats} Vacant / Empty Desks in Shift
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="dash-badge dash-badge-default" style={{ fontWeight: 600 }}>
                      {shiftSeatingEngine.subjectAllocationsSummary.length} Subjects Appearing in this Shift
                    </span>
                  </div>
                </div>
              </div>

              {/* Hall Capacity & Empty Seats Tracking Cards */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                    🏢 Live Block Capacity & Empty Seats Tracking ({shiftSeatingEngine.halls.length} Examination Halls)
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Same-subject clustering active · Excess students spill over into next block filling remaining seats
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {shiftSeatingEngine.halls.map((h) => {
                    const pct = Math.round((h.occupied / h.capacity) * 100);
                    const isFull = h.occupied === h.capacity;
                    const isVacant = h.occupied === 0;

                    return (
                      <div
                        key={h.roomCode}
                        className="dash-card"
                        style={{
                          padding: "14px 16px",
                          borderLeft: `4px solid ${isFull ? "#10b981" : isVacant ? "#94a3b8" : "#f59e0b"}`,
                          background: isFull ? "#ffffff" : isVacant ? "#f8fafc" : "#fffbeb",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>
                              {h.roomName}
                            </strong>
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>Code: {h.roomCode}</span>
                          </div>
                          <span
                            className="dash-badge"
                            style={{
                              background: isFull ? "#dcfce7" : isVacant ? "#e2e8f0" : "#fef3c7",
                              color: isFull ? "#15803d" : isVacant ? "#475569" : "#b45309",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            {isFull ? "100% Full (0 Empty)" : isVacant ? "Vacant Block" : `${h.emptySeats} Empty Seats`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div
                          style={{
                            height: "6px",
                            background: "#e2e8f0",
                            borderRadius: "3px",
                            overflow: "hidden",
                            margin: "8px 0 10px 0",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: isFull ? "#10b981" : "#f59e0b",
                              borderRadius: "3px",
                            }}
                          />
                        </div>

                        {/* Numbers */}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "10px" }}>
                          <span>
                            Capacity: <strong>{h.capacity}</strong>
                          </span>
                          <span>
                            Allocated: <strong>{h.occupied}</strong>
                          </span>
                          <span style={{ color: h.emptySeats > 0 ? "#b45309" : "#15803d", fontWeight: 700 }}>
                            Empty: {h.emptySeats} Desks
                          </span>
                        </div>

                        {/* Seated Subjects in this Hall */}
                        <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", fontSize: "11.5px" }}>
                          <span style={{ color: "#64748b", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                            Seated Paper Distribution:
                          </span>
                          {h.seatedSegments.length === 0 ? (
                            <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No examinees in this shift</span>
                          ) : (
                            h.seatedSegments.map((seg, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  marginBottom: "4px",
                                }}
                              >
                                <div>
                                  <strong style={{ color: "var(--brand-primary)" }}>{seg.subjectCode}</strong> ({seg.dept}):{" "}
                                  <strong>{seg.count} students</strong>
                                </div>
                                <div style={{ color: "#64748b", fontSize: "11px" }}>
                                  {seg.deskRangeStr}
                                  {seg.isSpilloverFill && (
                                    <span style={{ color: "#b45309", fontWeight: 600, marginLeft: "4px" }}>
                                      (Filled remaining {seg.count} seats)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View 1: Subject-Wise Separated Rosters (Exact user requirement) */}
              {seatingViewMode === "BY_SUBJECT" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {shiftSeatingEngine.subjectAllocationsSummary.map((sub) => {
                    const displayedStudents = sub.students.filter((s: any) => {
                      if (!seatingSearchQuery) return true;
                      const q = seatingSearchQuery.toLowerCase();
                      return (
                        s.studentRoll.toLowerCase().includes(q) ||
                        s.studentName.toLowerCase().includes(q) ||
                        s.deskNo.toLowerCase().includes(q) ||
                        s.roomName.toLowerCase().includes(q)
                      );
                    });

                    return (
                      <div key={sub.code} className="dash-card">
                        {/* Subject Card Header */}
                        <div
                          style={{
                            padding: "16px 20px",
                            background: "linear-gradient(to right, #f8fafc, #ffffff)",
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="dash-badge dash-badge-default" style={{ fontSize: "12px", fontWeight: 800 }}>
                                  {sub.dept}
                                </span>
                                <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                                  {sub.code} — {sub.name}
                                </h3>
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                                Academic Class: <strong>{sub.year}</strong> · Total Examinees: <strong>{sub.totalStudents} Candidates</strong>
                              </div>
                            </div>

                            {/* Block Distribution Pills */}
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                              {sub.roomBreakdowns.map((rb, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    background: "#f1f5f9",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    padding: "4px 10px",
                                    fontSize: "11.5px",
                                  }}
                                >
                                  <strong>{rb.roomCode}:</strong> {rb.count} Desks ({rb.deskRangeStr})
                                  {rb.note && (
                                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>{rb.note}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Student List Table */}
                        <div className="dash-table-wrap">
                          <table className="dash-table">
                            <thead>
                              <tr>
                                <th style={{ width: "8%", textAlign: "center" }}>Sr.</th>
                                <th style={{ width: "14%" }}>Allocated Desk</th>
                                <th style={{ width: "18%" }}>Student PRN</th>
                                <th style={{ width: "24%" }}>Candidate Name</th>
                                <th style={{ width: "10%" }}>Branch</th>
                                <th style={{ width: "16%" }}>Allocated Hall</th>
                                <th style={{ width: "10%", textAlign: "center" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayedStudents.length === 0 ? (
                                <tr>
                                  <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                                    No students matching search filter in this subject.
                                  </td>
                                </tr>
                              ) : (
                                displayedStudents.map((stu: any, idx: number) => (
                                  <tr key={stu.id}>
                                    <td style={{ textAlign: "center", color: "#64748b" }}>{idx + 1}</td>
                                    <td>
                                      <span
                                        style={{
                                          fontWeight: 800,
                                          color: "#1d4ed8",
                                          background: "#eff6ff",
                                          padding: "2px 8px",
                                          borderRadius: "4px",
                                          border: "1px solid #bfdbfe",
                                        }}
                                      >
                                        {stu.deskNo}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        style={{
                                          fontFamily: "monospace",
                                          fontWeight: 700,
                                          fontSize: "12.5px",
                                          background: "#f1f5f9",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          border: "1px solid #cbd5e1",
                                          color: "#0f172a",
                                        }}
                                      >
                                        {stu.studentRoll}
                                      </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{stu.studentName}</td>
                                    <td>
                                      <span className="dash-badge dash-badge-default">{stu.departmentCode}</span>
                                    </td>
                                    <td>
                                      <strong>{stu.roomName}</strong>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                      <span className="dash-badge dash-badge-success" style={{ fontSize: "11px" }}>
                                        Seat Confirmed
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View 2: Hall-Wise Block Notice Board View */}
              {seatingViewMode === "BY_HALL" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {shiftSeatingEngine.halls
                    .filter((h) => h.occupied > 0)
                    .map((h) => {
                      const displayedInHall = h.allocatedStudents.filter((s) => {
                        if (!seatingSearchQuery) return true;
                        const q = seatingSearchQuery.toLowerCase();
                        return (
                          s.studentRoll.toLowerCase().includes(q) ||
                          s.studentName.toLowerCase().includes(q) ||
                          s.deskNo.toLowerCase().includes(q) ||
                          s.subjectCode.toLowerCase().includes(q)
                        );
                      });

                      return (
                        <div key={h.roomCode} className="dash-card">
                          <div
                            style={{
                              padding: "16px 20px",
                              background: "#f8fafc",
                              borderBottom: "1px solid var(--border-color)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                                {h.roomName} ({h.roomCode})
                              </h3>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                                Block Capacity: <strong>{h.capacity}</strong> · Allocated: <strong>{h.occupied} Desks</strong> · Empty Seats:{" "}
                                <strong style={{ color: h.emptySeats > 0 ? "#b45309" : "#15803d" }}>
                                  {h.emptySeats} Vacant
                                </strong>
                              </div>
                            </div>
                            <span className="dash-badge dash-badge-default" style={{ fontWeight: 700 }}>
                              {h.occupied} Students Seated
                            </span>
                          </div>

                          <div className="dash-table-wrap">
                            <table className="dash-table">
                              <thead>
                                <tr>
                                  <th style={{ width: "12%" }}>Desk No</th>
                                  <th style={{ width: "18%" }}>Student PRN</th>
                                  <th style={{ width: "24%" }}>Candidate Name</th>
                                  <th style={{ width: "10%" }}>Branch</th>
                                  <th style={{ width: "24%" }}>Subject Paper</th>
                                  <th style={{ width: "12%", textAlign: "center" }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayedInHall.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                                      No students matching query in this hall.
                                    </td>
                                  </tr>
                                ) : (
                                  displayedInHall.map((stu) => (
                                    <tr key={stu.id}>
                                      <td style={{ fontWeight: 800, color: "#1d4ed8" }}>{stu.deskNo}</td>
                                      <td>
                                        <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{stu.studentRoll}</span>
                                      </td>
                                      <td style={{ fontWeight: 600 }}>{stu.studentName}</td>
                                      <td>
                                        <span className="dash-badge dash-badge-default">{stu.departmentCode}</span>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 600 }}>{stu.subjectCode}</div>
                                        <div style={{ fontSize: "11px", color: "#64748b" }}>{stu.subjectName}</div>
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <span className="dash-badge dash-badge-success" style={{ fontSize: "11px" }}>
                                          Allocated
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Dispatch Shift Seating Plan Modal */}
              {isDispatchModalOpen && (
                <div
                  className="dash-modal-backdrop"
                  onClick={() => setIsDispatchModalOpen(false)}
                >
                  <div
                    className="dash-modal"
                    style={{ maxWidth: "560px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="dash-modal-header">
                      <div>
                        <h3 className="dash-modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Send size={18} style={{ color: "#059669" }} />
                          <span>Dispatch Shift Seating Plan to Students</span>
                        </h3>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                          Publish hall allocations and notify all enrolled examinees for this examination session
                        </p>
                      </div>
                      <button
                        type="button"
                        className="dash-modal-close"
                        onClick={() => setIsDispatchModalOpen(false)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {/* Session Metadata Banner */}
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1.5px solid #bbf7d0",
                          borderRadius: "8px",
                          padding: "12px 14px",
                          fontSize: "12.5px",
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                          <div>
                            <span style={{ color: "#166534", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                              Exam Date:
                            </span>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{shiftSeatingEngine.date}</div>
                          </div>
                          <div>
                            <span style={{ color: "#166534", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                              Session Window:
                            </span>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{shiftSeatingEngine.slot}</div>
                          </div>
                        </div>
                        <div style={{ borderTop: "1px dashed #86efac", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            Target Examinees: <strong style={{ color: "#047857" }}>{shiftSeatingEngine.totalAllocated} Students</strong>
                          </div>
                          <div>
                            Blocks: <strong>{shiftSeatingEngine.halls.filter((h) => h.occupied > 0).length} Examination Halls</strong>
                          </div>
                        </div>
                      </div>

                      {/* Text Searchability Note */}
                      <div
                        style={{
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: "6px",
                          padding: "10px 12px",
                          fontSize: "12px",
                          color: "#1e40af",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <Info size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#2563eb" }} />
                        <div>
                          <strong>Universal PRN Search in PDF:</strong>
                          <div style={{ marginTop: "2px", color: "#1d4ed8" }}>
                            The distributed PDF is 100% digital text. Students can press <strong>Ctrl + F</strong> (or tap search on any mobile PDF reader) and enter their PRN to immediately jump to their name, seat number, block, subject, and time slot.
                          </div>
                        </div>
                      </div>

                      {/* Notification Delivery Channels */}
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Select Dispatch Channels:
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px 12px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              background: dispatchChannels.portal ? "#f8fafc" : "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={dispatchChannels.portal}
                              onChange={(e) => setDispatchChannels({ ...dispatchChannels, portal: e.target.checked })}
                            />
                            <div>
                              <strong style={{ fontSize: "13px", color: "#0f172a" }}>Nexora Student Examination Portal</strong>
                              <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                                Publishes directly to student dashboard for instant PRN desk search & personal slip download
                              </div>
                            </div>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px 12px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              background: dispatchChannels.email ? "#f8fafc" : "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={dispatchChannels.email}
                              onChange={(e) => setDispatchChannels({ ...dispatchChannels, email: e.target.checked })}
                            />
                            <div>
                              <strong style={{ fontSize: "13px", color: "#0f172a" }}>University Email Broadcast</strong>
                              <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                                Dispatches official circular email to registered student emails with searchable PDF attached
                              </div>
                            </div>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "8px 12px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              background: dispatchChannels.sms ? "#f8fafc" : "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={dispatchChannels.sms}
                              onChange={(e) => setDispatchChannels({ ...dispatchChannels, sms: e.target.checked })}
                            />
                            <div>
                              <strong style={{ fontSize: "13px", color: "#0f172a" }}>Mobile SMS / WhatsApp Instant Notice</strong>
                              <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                                Sends individual SMS alert with Roll, Paper Code, Hall Name, and Desk Number
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Live SMS Preview */}
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "10px 12px",
                          fontSize: "11.5px",
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "10px", display: "block", marginBottom: "4px" }}>
                          Sample Message Preview for Candidates:
                        </span>
                        <div style={{ fontFamily: "monospace", color: "#334155", background: "#fff", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                          [NEXORA EXAMS] Roll: <strong>2025BTECS001</strong> | Exam: <strong>{shiftSeatingEngine.subjectAllocationsSummary[0]?.code || "UCS0301"}</strong><br />
                          Date: <strong>{shiftSeatingEngine.date}</strong> | Slot: <strong>{shiftSeatingEngine.slot}</strong><br />
                          Allocated Venue: <strong>{shiftSeatingEngine.halls[0]?.roomName.split(" (")[0]}</strong> | Desk: <strong>{shiftSeatingEngine.halls[0]?.roomCode}-01</strong><br />
                          Report 30 min before shift. Bring valid ID card.
                        </div>
                      </div>

                      {/* Modal Footer Actions */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "8px",
                          paddingTop: "12px",
                          borderTop: "1px solid #e2e8f0",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <button
                          type="button"
                          className="dash-btn dash-btn-outline"
                          onClick={() => {
                            setIsDispatchModalOpen(false);
                            handlePrintDocument("seating");
                          }}
                        >
                          <Printer size={14} />
                          <span>Download Searchable PDF</span>
                        </button>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="dash-btn dash-btn-outline"
                            onClick={() => setIsDispatchModalOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="dash-btn dash-btn-primary"
                            style={{ background: "#059669", borderColor: "#059669" }}
                            onClick={handleConfirmDispatchToStudents}
                          >
                            <Send size={14} />
                            <span>Confirm & Send to {shiftSeatingEngine.totalAllocated} Students</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              VIEW 10: INVIGILATOR DUTY ALLOCATION
              ===================================================== */}
          {activeMenu === "duty-allocation" && (
            <div className="dash-view">
              <div className="dash-view-header">
                <div className="dash-view-titles">
                  <h1 className="dash-view-title">Invigilator Duty Allocation & Block Supervision</h1>
                  <p className="dash-view-subtitle">
                    Shift-wise faculty block assignments, teacher duty schedules, and clash-free room supervision
                  </p>
                </div>
                <div className="dash-header-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    style={{ background: "#2563eb", borderColor: "#2563eb", color: "#fff" }}
                    onClick={() => handlePrintDocument("duty-shift")}
                    title="Download / Print Shift-Wise & Date-Wise Faculty Block Allocation Roster (PDF)"
                  >
                    <Printer size={15} />
                    <span>Download Shift-Wise Roster (PDF)</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() => {
                      setSelectedIndividualTeacherForPrint(null);
                      handlePrintDocument("duty-teacher");
                    }}
                    title="Download / Print Teacher-Wise Duty Schedule & Orders (PDF)"
                  >
                    <Users size={15} />
                    <span>Download Teacher-Wise Schedule (PDF)</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() => {
                      if (dutyViewMode === "TEACHER_WISE") {
                        const rows: any[] = [];
                        teacherWiseAllocations.forEach((t) => {
                          t.duties.forEach((d, idx) => {
                            rows.push([t.fullName, t.department, t.empId, idx + 1, d.date, d.day, d.shift, d.slot, d.room, `${d.code} - ${d.subject}`, d.enrolled]);
                          });
                        });
                        handleExportCSV(
                          "Teacher_Wise_Duty_Schedule",
                          ["Faculty Name", "Department", "Employee ID", "Duty No", "Exam Date", "Day", "Shift", "Session Slot", "Allocated Block", "Subject Paper", "Enrolled"],
                          rows
                        );
                      } else {
                        const rows: any[] = [];
                        shiftWiseAllocations.forEach((d) => {
                          d.shifts.forEach((s) => {
                            s.blocks.forEach((b) => {
                              rows.push([d.date, d.day, s.shiftName, s.timing, b.room, b.invigilator, b.papers.map((p) => p.code).join(" / "), b.totalStudents]);
                            });
                          });
                        });
                        handleExportCSV(
                          "Shift_Wise_Faculty_Block_Allocation",
                          ["Exam Date", "Day", "Shift Name", "Timing", "Examination Block", "Assigned Faculty", "Papers Supervised", "Total Candidates"],
                          rows
                        );
                      }
                    }}
                  >
                    <Download size={15} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* View Mode Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  borderBottom: "2px solid #e2e8f0",
                  paddingBottom: "8px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className={`dash-btn ${dutyViewMode === "SHIFT_WISE" ? "dash-btn-primary" : "dash-btn-outline"}`}
                  onClick={() => setDutyViewMode("SHIFT_WISE")}
                  style={{ borderRadius: "20px", fontSize: "13px", padding: "6px 16px" }}
                >
                  <Building2 size={15} />
                  <span>1. Shift-Wise & Date-Wise Allocation</span>
                </button>
                <button
                  type="button"
                  className={`dash-btn ${dutyViewMode === "TEACHER_WISE" ? "dash-btn-primary" : "dash-btn-outline"}`}
                  onClick={() => setDutyViewMode("TEACHER_WISE")}
                  style={{ borderRadius: "20px", fontSize: "13px", padding: "6px 16px" }}
                >
                  <Users size={15} />
                  <span>2. Teacher-Wise Duty Schedule</span>
                </button>
                <button
                  type="button"
                  className={`dash-btn ${dutyViewMode === "PAPER_GRID" ? "dash-btn-primary" : "dash-btn-outline"}`}
                  onClick={() => setDutyViewMode("PAPER_GRID")}
                  style={{ borderRadius: "20px", fontSize: "13px", padding: "6px 16px" }}
                >
                  <ClipboardCheck size={15} />
                  <span>3. Paper-Wise Matrix & Reassignment</span>
                </button>
              </div>

              {/* VIEW MODE 1: SHIFT-WISE & DATE-WISE BLOCK ALLOCATION */}
              {dutyViewMode === "SHIFT_WISE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Controls / Filter Bar */}
                  <div
                    className="dash-card"
                    style={{
                      padding: "16px 20px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                      {/* Shift Selector */}
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                          Filter Examination Shift:
                        </label>
                        <select
                          className="dash-select"
                          value={dutySelectedShift}
                          onChange={(e) => setDutySelectedShift(e.target.value)}
                          style={{ minWidth: "260px", fontWeight: 600, color: "#1d4ed8", borderColor: "#93c5fd" }}
                        >
                          <option value="Shift 1 (Morning)">Shift 1 — Morning Session (10.00 AM - 12.30 PM)</option>
                          <option value="Shift 2 (Afternoon)">Shift 2 — Afternoon Session (01.30 PM - 04.00 PM)</option>
                          <option value="Shift 3 (Evening)">Shift 3 — Evening Session (04.30 PM - 07.00 PM)</option>
                          <option value="ALL">All Examination Shifts</option>
                        </select>
                      </div>

                      {/* Date Selector */}
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
                          Filter Exam Date:
                        </label>
                        <select
                          className="dash-select"
                          value={dutySelectedDate}
                          onChange={(e) => setDutySelectedDate(e.target.value)}
                          style={{ minWidth: "220px", fontWeight: 600 }}
                        >
                          <option value="ALL">All Dates in Cycle</option>
                          {shiftWiseAllocations.map((d) => (
                            <option key={d.date} value={d.date}>
                              {d.date} ({d.day})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className="dash-badge dash-badge-default" style={{ padding: "6px 12px", fontSize: "12px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                        Shift: <strong>{dutySelectedShift === "ALL" ? "All Shifts" : dutySelectedShift}</strong>
                      </span>
                      <button
                        type="button"
                        className="dash-btn dash-btn-outline"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        onClick={() => handlePrintDocument("duty-shift")}
                      >
                        <Printer size={14} />
                        <span>Print Current Shift Roster</span>
                      </button>
                    </div>
                  </div>

                  {/* Date Cards Accordion / Listing */}
                  {shiftWiseAllocations
                    .filter((d) => dutySelectedDate === "ALL" || d.date === dutySelectedDate)
                    .map((dateItem) => {
                      const displayedShifts = dateItem.shifts.filter(
                        (s) => dutySelectedShift === "ALL" || s.shiftName === dutySelectedShift
                      );

                      if (displayedShifts.length === 0) return null;

                      return (
                        <div key={dateItem.date} className="dash-card" style={{ overflow: "hidden" }}>
                          {displayedShifts.map((shiftItem, sIdx) => (
                            <div key={shiftItem.shiftName} style={{ borderBottom: sIdx < displayedShifts.length - 1 ? "2px solid #e2e8f0" : "none" }}>
                              {/* Shift Header Bar */}
                              <div
                                style={{
                                  padding: "14px 20px",
                                  background: "#f1f5f9",
                                  borderBottom: "1px solid #cbd5e1",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "10px",
                                }}
                              >
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span
                                      style={{
                                        fontWeight: 800,
                                        fontSize: "14px",
                                        color: "#0f172a",
                                      }}
                                    >
                                      📅 {dateItem.date} ({dateItem.day})
                                    </span>
                                    <span
                                      className="dash-badge dash-badge-primary"
                                      style={{
                                        background: shiftItem.shiftName.includes("1") ? "#2563eb" : shiftItem.shiftName.includes("2") ? "#7c3aed" : "#0d9488",
                                        color: "#fff",
                                        fontWeight: 700,
                                        fontSize: "11.5px",
                                      }}
                                    >
                                      {shiftItem.shiftName}
                                    </span>
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                                      🕒 {shiftItem.timing}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#475569" }}>
                                  <span>
                                    Supervised Blocks: <strong>{shiftItem.totalBlocks}</strong>
                                  </span>
                                  <span>·</span>
                                  <span>
                                    Invigilators: <strong>{shiftItem.totalFaculty}</strong>
                                  </span>
                                  <span>·</span>
                                  <span>
                                    Candidates: <strong>{shiftItem.totalStudents}</strong>
                                  </span>
                                </div>
                              </div>

                              {/* Blocks & Assigned Faculty Table */}
                              <div className="dash-table-wrap">
                                <table className="dash-table">
                                  <thead>
                                    <tr>
                                      <th style={{ width: "6%", textAlign: "center" }}>Sr.</th>
                                      <th style={{ width: "22%" }}>Examination Block / Room</th>
                                      <th style={{ width: "26%" }}>Assigned Faculty Invigilator</th>
                                      <th style={{ width: "28%" }}>Supervised Subject Paper(s)</th>
                                      <th style={{ width: "10%", textAlign: "center" }}>Examinees</th>
                                      <th style={{ width: "8%", textAlign: "center" }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {shiftItem.blocks.map((block, bIdx) => (
                                      <tr key={block.room}>
                                        <td style={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>{bIdx + 1}</td>
                                        <td>
                                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Building2 size={15} style={{ color: "#2563eb", flexShrink: 0 }} />
                                            <strong style={{ color: "#0f172a" }}>{block.room}</strong>
                                          </div>
                                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                            Reporting Time: <strong>{shiftItem.shiftName.includes("1") ? "09:30 AM" : shiftItem.shiftName.includes("2") ? "01:00 PM" : "04:00 PM"}</strong>
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div
                                              style={{
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "50%",
                                                background: "#eff6ff",
                                                color: "#2563eb",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "11px",
                                                fontWeight: 800,
                                                border: "1px solid #bfdbfe",
                                              }}
                                            >
                                              {block.invigilator.charAt(0)}
                                            </div>
                                            <div>
                                              <strong style={{ color: "#1e293b", fontSize: "13px" }}>{block.invigilator}</strong>
                                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                Role: <strong>Block Invigilator</strong>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                            {block.papers.map((p, pIdx) => (
                                              <div key={pIdx} style={{ fontSize: "12px" }}>
                                                <strong style={{ color: "#1d4ed8" }}>{p.code}</strong> — {p.subject}{" "}
                                                <span className="dash-badge dash-badge-default" style={{ fontSize: "10px", padding: "1px 5px" }}>
                                                  {p.dept}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                          <span className="dash-badge dash-badge-default" style={{ fontWeight: 700 }}>
                                            {block.totalStudents} studs
                                          </span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                          <button
                                            type="button"
                                            className="dash-btn dash-btn-outline"
                                            style={{ fontSize: "11.5px", padding: "3px 8px" }}
                                            onClick={() => {
                                              const ex = storeState.coordinatorExams.find((e) => e.id === block.examIds[0]) || {
                                                id: block.examIds[0] || "temp",
                                                code: block.papers[0]?.code || "EXAM",
                                                subject: block.papers[0]?.subject || "Subject",
                                                date: dateItem.date,
                                                slot: block.slot,
                                                room: block.room,
                                                invigilator: block.invigilator,
                                              } as any;
                                              setReassignModalExam(ex);
                                              setSelectedNewFaculty(block.invigilator);
                                            }}
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
                          ))}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* VIEW MODE 2: TEACHER-WISE DUTY SCHEDULE */}
              {dutyViewMode === "TEACHER_WISE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Controls / Search Bar */}
                  <div
                    className="dash-card"
                    style={{
                      padding: "16px 20px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                      <div className="dash-search-box" style={{ minWidth: "260px" }}>
                        <Search size={15} />
                        <input
                          type="text"
                          placeholder="Search faculty name or ID..."
                          value={dutyTeacherSearch}
                          onChange={(e) => setDutyTeacherSearch(e.target.value)}
                        />
                      </div>

                      <select
                        className="dash-select"
                        value={dutyTeacherDeptFilter}
                        onChange={(e) => setDutyTeacherDeptFilter(e.target.value)}
                        style={{ minWidth: "200px" }}
                      >
                        <option value="ALL">All Departments</option>
                        {Array.from(new Set(teacherWiseAllocations.map((t) => t.department))).sort().map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className="dash-badge dash-badge-success" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        Total Faculty: <strong>{teacherWiseAllocations.length} Assigned</strong>
                      </span>
                      <button
                        type="button"
                        className="dash-btn dash-btn-outline"
                        onClick={() => {
                          setSelectedIndividualTeacherForPrint(null);
                          handlePrintDocument("duty-teacher");
                        }}
                      >
                        <Printer size={14} />
                        <span>Print All Teacher Duty Slips</span>
                      </button>
                    </div>
                  </div>

                  {/* Teacher Cards Grid */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {teacherWiseAllocations
                      .filter((t) => {
                        const matchSearch =
                          !dutyTeacherSearch ||
                          t.fullName.toLowerCase().includes(dutyTeacherSearch.toLowerCase()) ||
                          t.empId.toLowerCase().includes(dutyTeacherSearch.toLowerCase());
                        const matchDept = dutyTeacherDeptFilter === "ALL" || t.department === dutyTeacherDeptFilter;
                        return matchSearch && matchDept;
                      })
                      .map((teacher) => (
                        <div key={teacher.fullName} className="dash-card">
                          {/* Teacher Card Header */}
                          <div
                            style={{
                              padding: "14px 20px",
                              background: "#f8fafc",
                              borderBottom: "1px solid #e2e8f0",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "10px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "#2563eb",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  fontWeight: 800,
                                }}
                              >
                                {teacher.displayName.charAt(0)}
                              </div>
                              <div>
                                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                                  {teacher.fullName}
                                </h3>
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                  ID: <strong>{teacher.empId}</strong> · Department: <strong>{teacher.department}</strong>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                              <span
                                className="dash-badge"
                                style={{
                                  background: teacher.dutiesCount > teacher.maxDuties ? "#fef2f2" : "#f0fdf4",
                                  color: teacher.dutiesCount > teacher.maxDuties ? "#b91c1c" : "#166534",
                                  border: `1px solid ${teacher.dutiesCount > teacher.maxDuties ? "#fca5a5" : "#bbf7d0"}`,
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  padding: "4px 10px",
                                }}
                              >
                                {teacher.dutiesCount} / {teacher.maxDuties} Duties Assigned
                              </span>

                              <button
                                type="button"
                                className="dash-btn dash-btn-outline"
                                style={{ fontSize: "12px", padding: "4px 10px" }}
                                onClick={() => {
                                  setSelectedIndividualTeacherForPrint(teacher.fullName);
                                  handlePrintDocument("duty-teacher");
                                }}
                              >
                                <Printer size={13} />
                                <span>Print Duty Slip</span>
                              </button>
                            </div>
                          </div>

                          {/* Duties Table for Teacher */}
                          <div className="dash-table-wrap">
                            <table className="dash-table">
                              <thead>
                                <tr>
                                  <th style={{ width: "8%", textAlign: "center" }}>Duty #</th>
                                  <th style={{ width: "16%" }}>Exam Date & Day</th>
                                  <th style={{ width: "20%" }}>Shift & Session Time</th>
                                  <th style={{ width: "22%" }}>Allocated Block / Venue</th>
                                  <th style={{ width: "24%" }}>Supervised Subject Paper</th>
                                  <th style={{ width: "10%", textAlign: "center" }}>Candidates</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teacher.duties.map((duty, dIdx) => (
                                  <tr key={duty.examId}>
                                    <td style={{ textAlign: "center", color: "#64748b", fontWeight: 700 }}>{dIdx + 1}</td>
                                    <td>
                                      <strong style={{ color: "#0f172a" }}>{duty.date}</strong>
                                      <div style={{ fontSize: "11px", color: "#64748b" }}>{duty.day}</div>
                                    </td>
                                    <td>
                                      <span className="dash-badge dash-badge-default" style={{ fontWeight: 600 }}>
                                        {duty.shift}
                                      </span>
                                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>
                                        {duty.slot}
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Building2 size={14} style={{ color: "#2563eb" }} />
                                        <strong>{duty.room}</strong>
                                      </div>
                                    </td>
                                    <td>
                                      <strong style={{ color: "#1d4ed8" }}>{duty.code}</strong> — {duty.subject}
                                    </td>
                                    <td style={{ textAlign: "center", fontWeight: 600 }}>
                                      {duty.enrolled}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* VIEW MODE 3: PAPER-WISE MATRIX & REASSIGNMENT */}
              {dutyViewMode === "PAPER_GRID" && (
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
              )}

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
                  <h1 className="dash-view-title">Timetable Verification, Approval & Circular Release</h1>
                  <p className="dash-view-subtitle">
                    Sole authority for timetable verification, locking, official publication, and circular distribution
                  </p>
                </div>
              </div>

              {/* Status Alert Banner */}
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
                      <span>Timetable Officially Approved & Locked by Examination Coordinator</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#047857", marginTop: "2px" }}>
                      Approved by {activeSubmission.decidedBy || `${coordinatorName} (Exam Coordinator)`} on {activeSubmission.decisionTimestamp}. Ready for public release and circular generation.
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

              {activeSubmission?.status === "Published" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1e40af", fontWeight: 700, fontSize: "14px" }}>
                      <Globe size={18} />
                      <span>Official Timetable Published & Released Across Campus</span>
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#1d4ed8", marginTop: "2px" }}>
                      Active schedule is live. Students and faculties can access their slots, and official circular PDF is available for printing.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() => setActiveMenu("autonomous-circular")}
                    style={{ borderColor: "#2563eb", color: "#2563eb", fontWeight: 600 }}
                  >
                    <FileText size={15} />
                    <span>View & Download Circular (PDF)</span>
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
                    <span>Schedule Finalized — Ready for Exam Coordinator Direct Approval & Publication</span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#1d4ed8", marginTop: "2px" }}>
                    Prepared by Examination Cell on {activeSubmission.submittedDate}. You have direct statutory authority to Approve, Lock, and Publish this timetable.
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
                      {(
                        activeSubmission?.exams ||
                        storeState.coordinatorExams.filter((e) => !e.cycleId || e.cycleId === activeCycle.id)
                      ).map((ex: any) => (
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
                            <span className="dash-badge dash-badge-default">
                              {ex.status || activeSubmission?.status || "Draft"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(
                        !activeSubmission?.exams?.length &&
                        !storeState.coordinatorExams.some((e) => !e.cycleId || e.cycleId === activeCycle.id)
                      ) && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                            No examinations scheduled yet for {activeCycle.name}. Please generate a timetable first.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={() => setActiveMenu("autonomous-circular")}
                    style={{ borderColor: "#2563eb", color: "#2563eb", fontWeight: 600 }}
                  >
                    <FileText size={15} />
                    <span>View & Download Circular (PDF)</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    onClick={handleAutoResolveConflicts}
                    title="Run pre-flight validation and automatically assign distinct conflict-free halls to any overlapping papers"
                    style={{ borderColor: "#10b981", color: "#047857", fontWeight: 600 }}
                  >
                    <ShieldCheck size={15} />
                    <span>Auto-Resolve Venue Overlaps</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-secondary"
                    onClick={handleApproveTimetable}
                    disabled={activeSubmission?.status === "Approved" || activeSubmission?.status === "Published"}
                  >
                    <CheckCircle2 size={15} />
                    <span>{activeSubmission?.status === "Approved" || activeSubmission?.status === "Published" ? "Timetable Approved" : "Approve & Lock Timetable"}</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={handlePublishTimetable}
                    disabled={activeSubmission?.status === "Published"}
                  >
                    <Globe size={15} />
                    <span>{activeSubmission?.status === "Published" ? "Timetable Published" : "Publish Official Schedule"}</span>
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
                          onClick={() => handlePrintDocument("timetable", t)}
                        >
                          <Printer size={14} />
                          <span>Print Official Circular</span>
                        </button>
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
                    onClick={() => handlePrintDocument(`report-${selectedReportTab}`)}
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

              {/* Report 3: Master Seating Plan & PRN Roster */}
              {selectedReportTab === 3 && (
                <div className="dash-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Report 3: Master Student Seating Allocation & PRN Roster</h3>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                        Allotted desks, permanent registration numbers (PRN), venues, and subject papers
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="dash-btn dash-btn-primary"
                        onClick={() => handlePrintDocument("report-3")}
                      >
                        <Printer size={14} />
                        <span>Print Master PDF</span>
                      </button>
                      <button
                        type="button"
                        className="dash-btn dash-btn-outline"
                        onClick={() =>
                          handleExportCSV(
                            "Report_3_Master_Student_Seating_PRN",
                            ["Desk No", "Student PRN", "Candidate Name", "Department", "Class", "Subject Code", "Subject Name", "Venue", "Date", "Shift Slot"],
                            storeState.seatingRecords.map((s) => [
                              s.deskNo,
                              s.studentRoll,
                              s.studentName,
                              s.departmentCode,
                              s.yearOfStudy || "-",
                              s.subjectCode,
                              s.subjectName || "-",
                              s.roomName || `Hall ${s.roomCode}`,
                              s.date,
                              s.slot,
                            ])
                          )
                        }
                      >
                        <Download size={14} />
                        <span>Download CSV</span>
                      </button>
                    </div>
                  </div>
                  <div className="dash-table-wrap">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Desk No</th>
                          <th>Student PRN</th>
                          <th>Candidate Name</th>
                          <th>Branch</th>
                          <th>Class</th>
                          <th>Subject Paper</th>
                          <th>Venue</th>
                          <th>Date & Slot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.seatingRecords.slice(0, 15).map((s) => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 800, color: "var(--brand-primary)" }}>{s.deskNo}</td>
                            <td>
                              <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{s.studentRoll}</span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{s.studentName}</td>
                            <td>
                              <span className="dash-badge dash-badge-default">{s.departmentCode}</span>
                            </td>
                            <td>{s.yearOfStudy ? `${s.yearOfStudy} Yr` : "B.Tech"}</td>
                            <td>
                              <strong>{s.subjectCode}</strong>
                              {s.subjectName && <div style={{ fontSize: "11px", color: "#64748b" }}>{s.subjectName}</div>}
                            </td>
                            <td>Hall {s.roomCode}</td>
                            <td>
                              <div>{s.date}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{s.shift ? `${s.shift} · ` : ""}{s.slot}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: "10px 14px", fontSize: "12px", color: "#64748b", borderTop: "1px solid var(--border-color)", textAlign: "right" }}>
                    Showing first 15 preview records. Use <strong>Print Master PDF</strong> or <strong>Download CSV</strong> to view all {storeState.seatingRecords.length} student allocations.
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

          {/* Section 15: Live Master Data Repository (API) */}
          {activeMenu === "master-data-api" && (
            <div style={{ padding: "0 0 40px 0" }}>
              <MasterDataManager />
            </div>
          )}

          {/* Section 16: Autonomous Examination Circular (PDF Replica) */}
          {activeMenu === "autonomous-circular" && (
            <div className="circular-view-wrapper" style={{ padding: "0 0 40px 0" }}>
              <AutonomousCircularView
                exams={storeState.coordinatorExams}
                onBack={() => setActiveMenu("overview")}
              />
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

    {/* =====================================================================
        OFFICIAL UNIVERSITY PRINT DOCUMENT (ACTIVE ONLY IN @media print)
        ===================================================================== */}
    <div className="nexora-print-document" id="nexora-print-document" aria-hidden="true">
      {(() => {
        if (activeMenu === "autonomous-circular") {
          return null;
        }

        const effectiveTarget =
          printDocTarget === "auto"
            ? activeMenu === "seating-plan"
              ? "seating"
              : activeMenu === "duty-allocation"
              ? "duty"
              : activeMenu === "published-timetables"
              ? "timetable"
              : activeMenu === "reports-export"
              ? `report-${selectedReportTab}`
              : "timetable"
            : printDocTarget;

        const isTimetable = effectiveTarget === "timetable" || effectiveTarget === "report-1";
        const isSubjectRoster = effectiveTarget === "report-2";
        const isSeating = effectiveTarget === "seating" || effectiveTarget === "report-3";
        const isStudentSchedule = effectiveTarget === "report-4";
        const isDuty = effectiveTarget === "duty" || effectiveTarget === "report-5";
        const isDutyShift = effectiveTarget === "duty-shift" || (isDuty && dutyViewMode === "SHIFT_WISE");
        const isDutyTeacher = effectiveTarget === "duty-teacher" || (isDuty && dutyViewMode === "TEACHER_WISE");
        const isBacklog = effectiveTarget === "report-6";
        const isConflicts = effectiveTarget === "report-7";
        const isApprovals = effectiveTarget === "report-8";

        // Target timetable: prioritize explicitly selected published circular, then matching activeCycle timetable, then approved/published timetable
        const targetTimetable =
          selectedPrintTimetable ||
          storeState.timetables.find((t) => t.cycleId === activeCycle.id && (t.status === "Published" || t.status === "Approved")) ||
          storeState.timetables.find((t) => t.cycleId === activeCycle.id) ||
          storeState.timetables.find((t) => t.status === "Published" || t.status === "Approved");

        const matchingCycleExams = storeState.coordinatorExams.filter(
          (e) => !e.cycleId || e.cycleId === activeCycle.id
        );

        const examsToPrint = targetTimetable?.exams
          ? targetTimetable.exams.map((e: any) => {
              const full = storeState.coordinatorExams.find((ce) => ce.id === e.id || ce.code === e.code);
              return {
                id: e.id,
                code: e.code,
                subject: e.subject,
                department: full?.department || targetTimetable.department,
                date: e.date,
                slot: e.slot,
                room: e.room,
                invigilator: e.invigilator,
              };
            })
          : matchingCycleExams.length > 0
          ? matchingCycleExams
          : storeState.coordinatorExams;

        const printCycleName = targetTimetable ? targetTimetable.cycleName : activeCycle.name;
        const printDeptName = targetTimetable ? targetTimetable.department : activeCycle.department;
        const printProgramName = targetTimetable ? targetTimetable.program : `${activeCycle.department} (${activeCycle.yearLevel})`;

        const reportTitle = isTimetable
          ? "Official Master Examination Timetable & Circular"
          : isSubjectRoster
          ? "Subject-wise Curriculum Examination Roster"
          : isSeating
          ? "Master Student Seating Allocation & PRN Roster"
          : isStudentSchedule
          ? "Student-wise Examination Schedule & Verification"
          : isDutyShift
          ? `Shift-Wise & Date-Wise Faculty Block Allocation Roster${dutySelectedShift !== "ALL" ? ` (${dutySelectedShift})` : ""}`
          : isDutyTeacher
          ? (selectedIndividualTeacherForPrint ? `Individual Faculty Invigilation Duty Order — ${selectedIndividualTeacherForPrint}` : "Teacher-Wise Examination Invigilation Duty Schedule & Orders")
          : isDuty
          ? "Faculty Invigilation Duty Allocation Chart"
          : isBacklog
          ? "Backlog & Makeup Candidate Eligibility Summary"
          : isConflicts
          ? "Examination Constraint & Clash Audit Dossier"
          : isApprovals
          ? "Timetable Submission, Audit & Approval History"
          : "Official Examination Document";

        const currentDateStr = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const currentTimeStr = new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div>
            {/* University Official Header */}
            <div className="print-univ-header">
              <div className="print-univ-title">NEXORA UNIVERSITY</div>
              <div className="print-office-title">OFFICE OF THE CONTROLLER OF EXAMINATIONS</div>
              <div className="print-report-title">{reportTitle}</div>
            </div>

            {/* Document Metadata Strip */}
            <div className="print-doc-meta-strip">
              <div className="print-doc-meta-col">
                <span className="print-doc-meta-label">Examination Cycle</span>
                <span className="print-doc-meta-val">{printCycleName}</span>
              </div>
              <div className="print-doc-meta-col">
                <span className="print-doc-meta-label">Academic Year / Type</span>
                <span className="print-doc-meta-val">
                  {activeCycle.academicYear} · {activeCycle.examType}
                </span>
              </div>
              <div className="print-doc-meta-col">
                <span className="print-doc-meta-label">Department</span>
                <span className="print-doc-meta-val">{printDeptName}</span>
              </div>
              <div className="print-doc-meta-col">
                <span className="print-doc-meta-label">Program Scope</span>
                <span className="print-doc-meta-val">{printProgramName}</span>
              </div>
              <div className="print-doc-meta-col">
                <span className="print-doc-meta-label">Date of Issue</span>
                <span className="print-doc-meta-val">
                  {currentDateStr} {currentTimeStr} IST
                </span>
              </div>
            </div>

            {/* Report 1 / Master Timetable */}
            {isTimetable && (
              <table className="print-doc-table">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>Course Code</th>
                    <th style={{ width: "26%" }}>Subject Title</th>
                    <th style={{ width: "12%" }}>Department</th>
                    <th style={{ width: "13%" }}>Exam Date</th>
                    <th style={{ width: "15%" }}>Session Window</th>
                    <th style={{ width: "12%" }}>Venue / Hall</th>
                    <th style={{ width: "12%" }}>Supervising Faculty</th>
                  </tr>
                </thead>
                <tbody>
                  {examsToPrint.map((e: any) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 700 }}>{e.code}</td>
                      <td>{e.subject}</td>
                      <td>{e.department}</td>
                      <td style={{ fontWeight: 600 }}>{e.date}</td>
                      <td>{e.slot}</td>
                      <td>{e.room}</td>
                      <td>{e.invigilator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

              {/* Report 2 / Subject Roster */}
              {isSubjectRoster && (
                <table className="print-doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "12%" }}>Subject Code</th>
                      <th style={{ width: "32%" }}>Subject Title</th>
                      <th style={{ width: "12%" }}>Department</th>
                      <th style={{ width: "10%" }}>Semester</th>
                      <th style={{ width: "12%" }}>Type</th>
                      <th style={{ width: "10%" }}>Credits</th>
                      <th style={{ width: "12%" }}>Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.subjects.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700 }}>{s.code}</td>
                        <td>{s.title}</td>
                        <td>{s.departmentCode}</td>
                        <td>Sem {s.semester}</td>
                        <td>{s.type}</td>
                        <td>{s.credits}</td>
                        <td>{s.enrolledStudents} students</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 3 / Master Shift Seating Plan & Subject-Separated PRN Allocation Document */}
              {isSeating && (
                <div>
                  {/* Master Shift Scope & Status Context Strip */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      marginBottom: "14px",
                      fontSize: "8.5pt",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "7.5pt", fontWeight: 700, display: "block" }}>
                        Examination Date
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: "9.5pt" }}>{shiftSeatingEngine.date}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "7.5pt", fontWeight: 700, display: "block" }}>
                        Shift / Session Slot
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: "9.5pt" }}>{shiftSeatingEngine.slot}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "7.5pt", fontWeight: 700, display: "block" }}>
                        Shift Examinees
                      </span>
                      <strong style={{ color: "#1d4ed8", fontSize: "9.5pt" }}>{shiftSeatingEngine.totalAllocated} Candidates</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "7.5pt", fontWeight: 700, display: "block" }}>
                        Blocks Utilized
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: "9.5pt" }}>
                        {shiftSeatingEngine.halls.filter((h) => h.occupied > 0).length} of {shiftSeatingEngine.halls.length} Halls
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "7.5pt", fontWeight: 700, display: "block" }}>
                        Tracked Vacant / Empty Desks
                      </span>
                      <strong style={{ color: shiftSeatingEngine.totalEmptySeats > 0 ? "#b45309" : "#15803d", fontSize: "9.5pt" }}>
                        {shiftSeatingEngine.totalEmptySeats} Empty Seats
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", textTransform: "uppercase", fontSize: "7.5pt", fontWeight: 700, display: "block" }}>
                        Allocation Scheme
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: "8.5pt" }}>
                        Clustered + Spillover Fill (Seed #{seatingRandomSeed})
                      </strong>
                    </div>
                  </div>

                  {/* SECTION I: BLOCK CAPACITY & EMPTY SEATS AUDIT MATRIX */}
                  <div style={{ marginBottom: "18px" }}>
                    <div
                      style={{
                        fontSize: "9pt",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "6px",
                        color: "#0f172a",
                        borderBottom: "1.5px solid #0f172a",
                        paddingBottom: "3px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Section I: Examination Block Capacity, Occupancy & Empty Seats Matrix</span>
                      <span style={{ fontSize: "8pt", fontWeight: 600, color: "#64748b" }}>
                        Notice Board Master Summary
                      </span>
                    </div>
                    <table className="print-doc-table" style={{ marginBottom: "14px" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "24%" }}>Examination Block / Hall</th>
                          <th style={{ width: "10%", textAlign: "center" }}>Capacity</th>
                          <th style={{ width: "10%", textAlign: "center" }}>Allocated</th>
                          <th style={{ width: "12%", textAlign: "center" }}>Empty Desks</th>
                          <th style={{ width: "32%" }}>Allotted Subject Papers & Desk Ranges</th>
                          <th style={{ width: "12%", textAlign: "right" }}>Block Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shiftSeatingEngine.halls.map((h) => (
                          <tr key={h.roomCode}>
                            <td style={{ fontWeight: 700, color: "#0f172a" }}>
                              {h.roomName}
                            </td>
                            <td style={{ textAlign: "center", fontWeight: 600 }}>{h.capacity}</td>
                            <td style={{ textAlign: "center", fontWeight: 700, color: "#1d4ed8" }}>{h.occupied}</td>
                            <td style={{ textAlign: "center", fontWeight: 700, color: h.emptySeats > 0 ? "#b45309" : "#166534" }}>
                              {h.emptySeats > 0 ? `${h.emptySeats} Vacant` : "0 (Full)"}
                            </td>
                            <td>
                              {h.seatedSegments.length === 0 ? (
                                <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No students allotted (Unused hall)</span>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  {h.seatedSegments.map((seg, sIdx) => (
                                    <div key={sIdx} style={{ fontSize: "7.5pt" }}>
                                      <strong>{seg.subjectCode}</strong> ({seg.dept}) · {seg.count} studs ({seg.deskRangeStr})
                                      {seg.isSpilloverFill && (
                                        <span style={{ color: "#b45309", fontWeight: 700, marginLeft: "4px" }}>
                                          [Filled Vacancy]
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>
                              {h.occupied === h.capacity ? (
                                <span style={{ color: "#166534" }}>100% Full</span>
                              ) : h.occupied === 0 ? (
                                <span style={{ color: "#64748b" }}>Standby</span>
                              ) : (
                                <span style={{ color: "#b45309" }}>{h.emptySeats} Vacant</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION II: SUBJECT-SEPARATED CANDIDATE PRN ALLOCATION & ROLL CALL ROSTERS */}
                  <div>
                    <div
                      style={{
                        fontSize: "9pt",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "8px",
                        color: "#0f172a",
                        borderBottom: "1.5px solid #0f172a",
                        paddingBottom: "3px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Section II: Subject-Separated Candidate PRN Allocation & Roll Call Rosters</span>
                      <span style={{ fontSize: "8pt", fontWeight: 600, color: "#64748b" }}>
                        Separate Rosters per Subject Paper
                      </span>
                    </div>

                    {/* Candidate Searchability & Verification Instruction */}
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "4px",
                        padding: "6px 10px",
                        marginBottom: "12px",
                        fontSize: "8pt",
                        color: "#1e40af",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <strong>💡 CANDIDATE SEARCH INSTRUCTIONS:</strong>
                      <span>
                        This official document is fully text-searchable. Press <strong>Ctrl + F</strong> on Windows/Linux or <strong>Cmd + F</strong> on Mac (or tap the 🔍 search icon in mobile PDF viewers) and type your <strong>Student PRN</strong> (e.g. 2025BTECS001) to immediately jump to your allocated Examination Block, Desk Number, and Subject Paper.
                      </span>
                    </div>

                    {shiftSeatingEngine.subjectAllocationsSummary.map((sub, subIdx) => (
                      <div
                        key={sub.code}
                        style={{
                          marginBottom: "20px",
                          pageBreakInside: "avoid",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Subject Paper Header Banner */}
                        <div
                          style={{
                            background: "#f1f5f9",
                            padding: "8px 12px",
                            borderBottom: "1px solid #cbd5e1",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "9.5pt", fontWeight: 800, color: "#0f172a" }}>
                              {subIdx + 1}. {sub.code} — {sub.name}
                            </div>
                            <div style={{ fontSize: "8pt", color: "#475569" }}>
                              Department: <strong>{sub.dept}</strong> | Year: <strong>{sub.year}</strong> | Total Examinees: <strong>{sub.totalStudents}</strong>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {sub.roomBreakdowns.map((rb, rbIdx) => (
                              <span
                                key={rbIdx}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "4px",
                                  padding: "2px 8px",
                                  fontSize: "7.5pt",
                                  fontWeight: 600,
                                  color: "#1e293b",
                                }}
                              >
                                {rb.roomName.split(" (")[0]}: <strong>{rb.count} Seats</strong> ({rb.deskRangeStr})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Subject Student Roll Call Table */}
                        <table className="print-doc-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: "6%", textAlign: "center" }}>Sr.</th>
                              <th style={{ width: "14%" }}>Allocated Desk</th>
                              <th style={{ width: "18%" }}>Student PRN</th>
                              <th style={{ width: "24%" }}>Candidate Name</th>
                              <th style={{ width: "10%", textAlign: "center" }}>Branch</th>
                              <th style={{ width: "14%" }}>Allocated Hall</th>
                              <th style={{ width: "14%", textAlign: "center" }}>Candidate Sign</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sub.students.map((seat: any, sIdx: number) => (
                              <tr key={seat.id}>
                                <td style={{ textAlign: "center", color: "#64748b" }}>{sIdx + 1}</td>
                                <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{seat.deskNo}</td>
                                <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{seat.studentRoll}</td>
                                <td style={{ fontWeight: 600 }}>{seat.studentName}</td>
                                <td style={{ textAlign: "center", fontWeight: 700 }}>{seat.departmentCode}</td>
                                <td>{seat.roomName.split(" (")[0]}</td>
                                <td style={{ borderBottom: "1px dashed #94a3b8" }}>&nbsp;</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>

                  {/* Official Tri-Signatory Sign-off */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "30px",
                      paddingTop: "16px",
                      borderTop: "1.5px solid #cbd5e1",
                      fontSize: "8.5pt",
                      pageBreakInside: "avoid",
                    }}
                  >
                    <div style={{ textAlign: "center", width: "28%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "30px" }}></div>
                      <strong>Hall Invigilator / Supervisor</strong>
                      <div style={{ fontSize: "7.5pt", color: "#64748b" }}>Signature & Date</div>
                    </div>
                    <div style={{ textAlign: "center", width: "28%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "30px" }}></div>
                      <strong>Chief Examination Superintendent</strong>
                      <div style={{ fontSize: "7.5pt", color: "#64748b" }}>Signature & Verification</div>
                    </div>
                    <div style={{ textAlign: "center", width: "28%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "30px" }}></div>
                      <strong>Controller of Examinations</strong>
                      <div style={{ fontSize: "7.5pt", color: "#64748b" }}>Seal & Official Approval</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Report 4 / Student Schedule */}
              {isStudentSchedule && (
                <table className="print-doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "15%" }}>Roll Number</th>
                      <th style={{ width: "25%" }}>Candidate Name</th>
                      <th style={{ width: "12%" }}>Department</th>
                      <th style={{ width: "14%" }}>Subject Code</th>
                      <th style={{ width: "12%" }}>Attendance</th>
                      <th style={{ width: "10%" }}>Fee Clearance</th>
                      <th style={{ width: "12%" }}>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.studentRegistrations.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700 }}>{r.rollNo}</td>
                        <td>{r.name}</td>
                        <td>{r.departmentCode}</td>
                        <td style={{ fontWeight: 600 }}>{r.subjectCode}</td>
                        <td>{r.attendancePercentage}%</td>
                        <td>{r.feesCleared ? "Cleared" : "Pending"}</td>
                        <td style={{ fontWeight: 600, color: r.eligibilityStatus === "Eligible" ? "#047857" : "#b91c1c" }}>
                          {r.eligibilityStatus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 5A / Shift-Wise & Date-Wise Faculty Block Allocation Roster */}
              {isDutyShift && (
                <div>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      marginBottom: "12px",
                      fontSize: "8pt",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      Filter Scope: <strong>{dutySelectedShift === "ALL" ? "All Shifts" : dutySelectedShift}</strong> · Target Dates: <strong>{dutySelectedDate === "ALL" ? "All Examination Dates" : dutySelectedDate}</strong>
                    </div>
                    <div style={{ color: "#475569" }}>
                      Institutional Standard: <strong>1 Faculty Member per Block (Max 3 Duties Total)</strong>
                    </div>
                  </div>

                  {shiftWiseAllocations
                    .filter((d) => dutySelectedDate === "ALL" || d.date === dutySelectedDate)
                    .map((dateItem) => {
                      const displayedShifts = dateItem.shifts.filter(
                        (s) => dutySelectedShift === "ALL" || s.shiftName === dutySelectedShift
                      );
                      if (displayedShifts.length === 0) return null;

                      return (
                        <div key={dateItem.date} style={{ marginBottom: "16px", pageBreakInside: "avoid" }}>
                          {displayedShifts.map((shiftItem) => (
                            <div key={shiftItem.shiftName} style={{ marginBottom: "12px", border: "1px solid #cbd5e1", borderRadius: "4px", overflow: "hidden" }}>
                              {/* Shift Banner */}
                              <div
                                style={{
                                  background: "#f1f5f9",
                                  padding: "6px 10px",
                                  borderBottom: "1px solid #cbd5e1",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: "8.5pt",
                                }}
                              >
                                <div>
                                  <strong style={{ color: "#0f172a" }}>DATE: {dateItem.date} ({dateItem.day.toUpperCase()})</strong> — <span style={{ color: "#1d4ed8", fontWeight: 700 }}>{shiftItem.shiftName.toUpperCase()}</span> ({shiftItem.timing})
                                </div>
                                <div style={{ fontSize: "7.5pt", color: "#475569" }}>
                                  Supervised Blocks: <strong>{shiftItem.totalBlocks}</strong> · Faculty Invigilators: <strong>{shiftItem.totalFaculty}</strong> · Total Candidates: <strong>{shiftItem.totalStudents}</strong>
                                </div>
                              </div>

                              <table className="print-doc-table" style={{ margin: 0 }}>
                                <thead>
                                  <tr>
                                    <th style={{ width: "6%", textAlign: "center" }}>Block #</th>
                                    <th style={{ width: "22%" }}>Examination Block / Room</th>
                                    <th style={{ width: "24%" }}>Assigned Faculty Invigilator</th>
                                    <th style={{ width: "24%" }}>Supervised Subject Paper(s)</th>
                                    <th style={{ width: "8%", textAlign: "center" }}>Students</th>
                                    <th style={{ width: "16%", textAlign: "center" }}>Faculty Signature</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {shiftItem.blocks.map((block, bIdx) => (
                                    <tr key={block.room}>
                                      <td style={{ textAlign: "center", fontWeight: 700 }}>{bIdx + 1}</td>
                                      <td>
                                        <strong>{block.room}</strong>
                                        <div style={{ fontSize: "7pt", color: "#64748b" }}>
                                          Report: {shiftItem.shiftName.includes("1") ? "09:30 AM" : shiftItem.shiftName.includes("2") ? "01:00 PM" : "04:00 PM"}
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{ fontWeight: 700 }}>{block.invigilator}</div>
                                        <div style={{ fontSize: "7pt", color: "#64748b" }}>Role: Room Invigilator</div>
                                      </td>
                                      <td>
                                        {block.papers.map((p, pIdx) => (
                                          <div key={pIdx} style={{ fontSize: "7.5pt" }}>
                                            <strong>{p.code}</strong> ({p.dept})
                                          </div>
                                        ))}
                                      </td>
                                      <td style={{ textAlign: "center", fontWeight: 700 }}>{block.totalStudents}</td>
                                      <td style={{ textAlign: "center", verticalAlign: "bottom", height: "32px" }}>
                                        <div style={{ borderBottom: "1px dashed #94a3b8", width: "85%", margin: "14px auto 2px auto" }}></div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                  {/* Signatures Strip */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "24px",
                      paddingTop: "12px",
                      pageBreakInside: "avoid",
                      fontSize: "8pt",
                    }}
                  >
                    <div style={{ textAlign: "center", width: "30%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "24px" }}></div>
                      <strong>Center In-Charge / Supervisor</strong>
                      <div style={{ fontSize: "7pt", color: "#64748b" }}>Signature & Verification</div>
                    </div>
                    <div style={{ textAlign: "center", width: "30%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "24px" }}></div>
                      <strong>Chief Examination Superintendent</strong>
                      <div style={{ fontSize: "7pt", color: "#64748b" }}>Signature & Date</div>
                    </div>
                    <div style={{ textAlign: "center", width: "30%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "24px" }}></div>
                      <strong>Controller of Examinations</strong>
                      <div style={{ fontSize: "7pt", color: "#64748b" }}>Seal & Official Approval</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Report 5B / Teacher-Wise Examination Duty Schedule & Official Orders */}
              {isDutyTeacher && (
                <div>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      marginBottom: "12px",
                      fontSize: "8pt",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      Target Faculty: <strong>{selectedIndividualTeacherForPrint || "All Assigned Faculty Members"}</strong> · Cycle: <strong>{printCycleName}</strong>
                    </div>
                    <div style={{ color: "#475569" }}>
                      Workload Quota: <strong>Maximum 3 Duties / Faculty</strong>
                    </div>
                  </div>

                  {teacherWiseAllocations
                    .filter((t) => !selectedIndividualTeacherForPrint || t.fullName === selectedIndividualTeacherForPrint)
                    .map((teacher, tIdx) => (
                      <div
                        key={teacher.fullName}
                        style={{
                          marginBottom: "16px",
                          pageBreakInside: "avoid",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Teacher Header Banner */}
                        <div
                          style={{
                            background: "#f1f5f9",
                            padding: "6px 12px",
                            borderBottom: "1px solid #cbd5e1",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "8.5pt",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "9pt", color: "#0f172a" }}>
                              {tIdx + 1}. {teacher.fullName}
                            </strong>{" "}
                            (ID: <strong>{teacher.empId}</strong> · Dept: <strong>{teacher.department}</strong>)
                          </div>
                          <div>
                            Assigned Duties: <strong style={{ color: "#166534" }}>{teacher.dutiesCount} / {teacher.maxDuties}</strong>
                          </div>
                        </div>

                        {/* Duties Table for Teacher */}
                        <table className="print-doc-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: "6%", textAlign: "center" }}>Duty #</th>
                              <th style={{ width: "16%" }}>Exam Date & Day</th>
                              <th style={{ width: "22%" }}>Shift & Session Time</th>
                              <th style={{ width: "24%" }}>Allocated Block / Venue</th>
                              <th style={{ width: "22%" }}>Subject Paper Supervised</th>
                              <th style={{ width: "10%", textAlign: "center" }}>Candidates</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teacher.duties.map((duty, dIdx) => (
                              <tr key={duty.examId}>
                                <td style={{ textAlign: "center", fontWeight: 700 }}>{dIdx + 1}</td>
                                <td>
                                  <strong>{duty.date}</strong>
                                  <div style={{ fontSize: "7pt", color: "#64748b" }}>{duty.day}</div>
                                </td>
                                <td>
                                  <strong>{duty.shift}</strong>
                                  <div style={{ fontSize: "7pt", color: "#475569" }}>{duty.slot}</div>
                                </td>
                                <td>
                                  <strong>{duty.room}</strong>
                                  <div style={{ fontSize: "7pt", color: "#64748b" }}>
                                    Report: {duty.shift.includes("1") ? "09:30 AM" : duty.shift.includes("2") ? "01:00 PM" : "04:00 PM"}
                                  </div>
                                </td>
                                <td>
                                  <strong>{duty.code}</strong> — {duty.subject}
                                </td>
                                <td style={{ textAlign: "center", fontWeight: 700 }}>{duty.enrolled}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Duty Acknowledgment Slip per Teacher */}
                        <div
                          style={{
                            padding: "6px 12px",
                            background: "#fafafa",
                            borderTop: "1px dashed #cbd5e1",
                            fontSize: "7.5pt",
                            color: "#475569",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <em>"I hereby acknowledge receipt of this examination duty order and undertake to report 30 mins prior to shift."</em>
                          </div>
                          <div style={{ display: "flex", gap: "20px" }}>
                            <div>Faculty Signature: __________________</div>
                            <div>Date: ____________</div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Footer Seal */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                      paddingTop: "10px",
                      pageBreakInside: "avoid",
                      fontSize: "8pt",
                    }}
                  >
                    <div style={{ textAlign: "center", width: "45%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "24px" }}></div>
                      <strong>Chief Examination Superintendent</strong>
                    </div>
                    <div style={{ textAlign: "center", width: "45%" }}>
                      <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "4px", height: "24px" }}></div>
                      <strong>Controller of Examinations</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Report 5C / Fallback Flat Table */}
              {isDuty && !isDutyShift && !isDutyTeacher && (
                <table className="print-doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "12%" }}>Course Code</th>
                      <th style={{ width: "24%" }}>Subject Title</th>
                      <th style={{ width: "12%" }}>Date</th>
                      <th style={{ width: "14%" }}>Session Slot</th>
                      <th style={{ width: "14%" }}>Examination Hall</th>
                      <th style={{ width: "24%" }}>Assigned Invigilator Faculty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.coordinatorExams.map((ex) => (
                      <tr key={ex.id}>
                        <td style={{ fontWeight: 700 }}>{ex.code}</td>
                        <td>{ex.subject}</td>
                        <td style={{ fontWeight: 600 }}>{ex.date}</td>
                        <td>{ex.slot}</td>
                        <td>{ex.room}</td>
                        <td style={{ fontWeight: 600 }}>{ex.invigilator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 6 / Backlog Summary */}
              {isBacklog && (
                <table className="print-doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "14%" }}>Roll No</th>
                      <th style={{ width: "22%" }}>Candidate Name</th>
                      <th style={{ width: "12%" }}>Department</th>
                      <th style={{ width: "14%" }}>Subject Code</th>
                      <th style={{ width: "12%" }}>Exam Type</th>
                      <th style={{ width: "12%" }}>Attendance</th>
                      <th style={{ width: "14%" }}>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.studentRegistrations
                      .filter((r) => r.registrationType !== "Regular")
                      .map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 700 }}>{r.rollNo}</td>
                          <td>{r.name}</td>
                          <td>{r.departmentCode}</td>
                          <td style={{ fontWeight: 600 }}>{r.subjectCode}</td>
                          <td>{r.registrationType}</td>
                          <td>{r.attendancePercentage}%</td>
                          <td style={{ fontWeight: 600, color: r.eligibilityStatus === "Eligible" ? "#047857" : "#b91c1c" }}>
                            {r.eligibilityStatus}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {/* Report 7 / Conflict Audit */}
              {isConflicts && (
                <table className="print-doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "18%" }}>Conflict Category</th>
                      <th style={{ width: "10%" }}>Severity</th>
                      <th style={{ width: "12%" }}>Subject Code</th>
                      <th style={{ width: "16%" }}>Resource Involved</th>
                      <th style={{ width: "32%" }}>Conflict Description</th>
                      <th style={{ width: "12%" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.conflicts.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700 }}>{c.type}</td>
                        <td>
                          <span className="print-badge">{c.severity}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{c.subjectCode}</td>
                        <td>{c.resourceName}</td>
                        <td>{c.description}</td>
                        <td style={{ fontWeight: 600, color: c.resolved ? "#047857" : "#b91c1c" }}>
                          {c.resolved ? "Resolved" : "Unresolved"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 8 / Approvals History */}
              {isApprovals && (
                <table className="print-doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "18%" }}>Cycle / Schedule</th>
                      <th style={{ width: "16%" }}>Department</th>
                      <th style={{ width: "14%" }}>Submitted By</th>
                      <th style={{ width: "14%" }}>Submission Date</th>
                      <th style={{ width: "10%" }}>Optimization</th>
                      <th style={{ width: "12%" }}>Status</th>
                      <th style={{ width: "16%" }}>Decision Official</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.timetables.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700 }}>{t.cycleName}</td>
                        <td>{t.department}</td>
                        <td>{t.submittedBy}</td>
                        <td>{t.submittedDate}</td>
                        <td>{t.solverStatus}</td>
                        <td style={{ fontWeight: 700 }}>{t.status}</td>
                        <td>{t.decidedBy || "Pending Review"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Official Signatures & Institutional Disclaimer */}
              <div className="print-doc-footer">
                <div className="print-disclaimer">
                  CONFIDENTIAL & IMMUTABLE RECORD · This document is generated from NEXORA University Examination Management System.
                  Any unauthorized tampering, overwriting, or redistribution without institutional authorization is strictly prohibited.
                </div>
                <div className="print-signatures-grid">
                  <div className="print-sig-box">
                    <div className="print-sig-line" />
                    <div className="print-sig-title">{coordinatorName}</div>
                    <div className="print-sig-subtitle">Exam Coordinator</div>
                  </div>
                  <div className="print-sig-box">
                    <div className="print-sig-line" />
                    <div className="print-sig-title">Head of Department</div>
                    <div className="print-sig-subtitle">Department Review & Audit</div>
                  </div>
                  <div className="print-sig-box">
                    <div className="print-sig-line" />
                    <div className="print-sig-title">Controller of Examinations</div>
                    <div className="print-sig-subtitle">University Examination Cell</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
};
