import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.js";
import {
  AcademicDataStore,
  YearOfStudy,
} from "../../services/academicDataStore.js";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  UserPlus,
  BookPlus,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

interface DepartmentCoordinatorDashboardProps {
  onSwitchToExamCoordinator?: () => void;
  onLogout?: () => void;
}

export const DepartmentCoordinatorDashboard: React.FC<DepartmentCoordinatorDashboardProps> = ({
  onSwitchToExamCoordinator,
  onLogout,
}) => {
  const auth = useAuth();
  const user = auth.currentUser;
  const coordinatorName = user?.name || "Prof. Rajesh Kulkarni";
  const userDepartment = user?.department || "Computer Science & Engineering";

  // Derive department code (e.g., CSE)
  const deptCode = useMemo(() => {
    if (userDepartment.includes("Computer") || userDepartment.includes("CSE")) return "CSE";
    if (userDepartment.includes("Electronics") || userDepartment.includes("ECE")) return "ECE";
    if (userDepartment.includes("Mechanical") || userDepartment.includes("MECH")) return "MECH";
    if (userDepartment.includes("Civil") || userDepartment.includes("CE")) return "CIVIL";
    if (userDepartment.includes("Data") || userDepartment.includes("AIDS")) return "AIDS";
    if (userDepartment.includes("Electrical") || userDepartment.includes("EE")) return "EE";
    return "CSE";
  }, [userDepartment]);

  const [activeTab, setActiveTab] = useState<"overview" | "students" | "faculty" | "subjects" | "backlogs" | "schedule">("overview");

  // Subscribe to live state
  const [storeState, setStoreState] = useState(() => AcademicDataStore.getState());
  React.useEffect(() => {
    const unsub = AcademicDataStore.subscribe(() => {
      setStoreState({ ...AcademicDataStore.getState() });
    });
    return () => unsub();
  }, []);

  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter department scoped data
  const deptStudents = useMemo(() => {
    const direct = storeState.studentRegistrations.filter(
      (s) => s.departmentCode?.toUpperCase() === deptCode.toUpperCase()
    );
    if (direct.length > 0) return direct;
    return storeState.studentRegistrations.filter(
      (s) => s.departmentCode === "CSE" || !s.departmentCode
    );
  }, [storeState.studentRegistrations, deptCode]);

  const deptFaculty = useMemo(() => {
    const direct = storeState.invigilators.filter(
      (f) => f.departmentCode?.toUpperCase() === deptCode.toUpperCase()
    );
    if (direct.length > 0) return direct;
    return storeState.invigilators.filter(
      (f) => f.departmentCode === "CSE" || !f.departmentCode
    );
  }, [storeState.invigilators, deptCode]);

  const deptSubjects = useMemo(() => {
    const direct = storeState.subjects.filter(
      (s) => s.departmentCode?.toUpperCase() === deptCode.toUpperCase()
    );
    if (direct.length > 0) return direct;
    return storeState.subjects.filter(
      (s) => s.departmentCode === "CSE" || !s.departmentCode
    );
  }, [storeState.subjects, deptCode]);

  const deptExams = useMemo(() => {
    return storeState.coordinatorExams.filter(
      (e) =>
        e.department?.toUpperCase() === deptCode.toUpperCase() ||
        e.department === userDepartment ||
        e.department === "CSE"
    );
  }, [storeState.coordinatorExams, deptCode, userDepartment]);

  // Backlog counts & registrations
  const backlogStudents = useMemo(() => {
    return deptStudents.filter((s) => s.registrationType === "Backlog" || (s.backlogSubjects && s.backlogSubjects.length > 0));
  }, [deptStudents]);

  // --- Filtering States for Students Directory ---
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedEligibilityFilter, setSelectedEligibilityFilter] = useState<string>("ALL");

  const filteredStudents = useMemo(() => {
    return deptStudents.filter((st) => {
      const q = studentSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        st.rollNo.toLowerCase().includes(q) ||
        st.name.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        st.subjectCode.toLowerCase().includes(q);

      const matchYear = selectedYearFilter === "ALL" || st.yearOfStudy === selectedYearFilter;
      const matchType = selectedTypeFilter === "ALL" || st.registrationType === selectedTypeFilter;
      const matchElig = selectedEligibilityFilter === "ALL" || st.eligibilityStatus === selectedEligibilityFilter;

      return matchSearch && matchYear && matchType && matchElig;
    });
  }, [deptStudents, studentSearch, selectedYearFilter, selectedTypeFilter, selectedEligibilityFilter]);

  // --- Faculty Filter ---
  const [facultySearch, setFacultySearch] = useState("");
  const filteredFaculty = useMemo(() => {
    return deptFaculty.filter((f) => {
      const q = facultySearch.trim().toLowerCase();
      return (
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.identifier.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
      );
    });
  }, [deptFaculty, facultySearch]);

  // --- Modal States ---
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    email: "",
    semester: 3,
    yearOfStudy: "Second" as YearOfStudy,
    attendancePercentage: 85,
    registrationType: "Regular" as "Regular" | "Backlog",
    curriculumStructure: "NEP" as "NEP" | "CYCLE 1" | "CYCLE 2" | "CYCLE 3",
  });

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    code: "",
    title: "",
    credits: 4,
    semester: 3,
    yearOfStudy: "Second" as YearOfStudy,
    type: "Theory" as const,
    curriculumStructure: "NEP" as "NEP" | "CYCLE 1" | "CYCLE 2" | "CYCLE 3",
  });

  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    identifier: "",
    email: "",
    maxDuties: 3,
  });

  const [showBacklogModal, setShowBacklogModal] = useState(false);
  const [selectedStudentForBacklog, setSelectedStudentForBacklog] = useState<string>("");
  const [backlogCourseCode, setBacklogCourseCode] = useState<string>("");
  const [backlogCycle, setBacklogCycle] = useState<"CYCLE 1" | "CYCLE 2" | "CYCLE 3">("CYCLE 2");

  // --- Bulk Import Modal State ---
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkImportOverwrite, setBulkImportOverwrite] = useState(false);

  // --- Standard Excel Template Download ---
  const handleDownloadStudentTemplate = () => {
    const headers = [
      "Roll No (PRN)",
      "Full Name",
      "Email",
      "Department",
      "Program",
      "Year of Study",
      "Semester",
      "Division",
      "Registration Type",
      "Curriculum Structure",
      "Attendance Percentage",
      "Eligibility Status",
      "Fees Cleared",
    ];

    const sampleRows = [
      [`2024BTE${deptCode}00101`, "Aarav Deshmukh", `aarav.deshmukh@nexora.edu`, deptCode, `BTECH-${deptCode}`, "Third", "5", "Division A", "Regular", "NEP", "88", "Eligible", "Yes"],
      [`2024BTE${deptCode}00102`, "Pooja Patil", `pooja.patil@nexora.edu`, deptCode, `BTECH-${deptCode}`, "Third", "5", "Division A", "Regular", "NEP", "82", "Eligible", "Yes"],
      [`2024BTE${deptCode}00103`, "Rohan Kulkarni", `rohan.kulkarni@nexora.edu`, deptCode, `BTECH-${deptCode}`, "Third", "5", "Division B", "Backlog", "CYCLE 2", "72", "Eligible", "Yes"],
      [`2025BTE${deptCode}00201`, "Aditi Shinde", `aditi.shinde@nexora.edu`, deptCode, `BTECH-${deptCode}`, "Second", "3", "Division A", "Regular", "NEP", "91", "Eligible", "Yes"],
      [`2025BTE${deptCode}00202`, "Sameer Joshi", `sameer.joshi@nexora.edu`, deptCode, `BTECH-${deptCode}`, "Second", "3", "Division B", "Regular", "NEP", "68", "Ineligible", "Yes"],
      [`2026BTE${deptCode}00301`, "Tanvi More", `tanvi.more@nexora.edu`, deptCode, `BTECH-${deptCode}`, "First", "1", "Division A", "Regular", "NEP", "94", "Eligible", "Yes"],
    ];

    const csvContent = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Standard_${deptCode}_Student_Template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Standard student Excel template downloaded for ${deptCode}.`, "success");
  };

  // --- Export Filtered Students to CSV ---
  const handleExportStudentsCSV = () => {
    const headers = [
      "Roll No (PRN)",
      "Full Name",
      "Email",
      "Department",
      "Program",
      "Year of Study",
      "Semester",
      "Division",
      "Registration Type",
      "Curriculum Structure",
      "Attendance Percentage",
      "Eligibility Status",
      "Fees Cleared",
    ];

    const rows = filteredStudents.map((s) => [
      s.rollNo,
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.departmentCode,
      s.programCode,
      s.yearOfStudy,
      s.semester,
      s.division,
      s.registrationType,
      s.curriculumStructure || "NEP",
      `${s.attendancePercentage}%`,
      s.eligibilityStatus,
      s.feesCleared ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${deptCode}_Students_Directory_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredStudents.length} student records to CSV.`, "success");
  };

  // --- Live Parse Bulk Import Data ---
  const parsedStudentRows = useMemo(() => {
    if (!bulkImportText.trim()) return [];

    const lines = bulkImportText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return [];

    const firstLineLower = lines[0].toLowerCase();
    const hasHeader =
      firstLineLower.includes("roll") ||
      firstLineLower.includes("prn") ||
      firstLineLower.includes("name") ||
      firstLineLower.includes("student");

    const dataLines = hasHeader ? lines.slice(1) : lines;

    return dataLines.map((line) => {
      const isTab = line.includes("\t");
      const parts = isTab ? line.split("\t") : line.split(",");
      const cleanParts = parts.map((p) => p.trim().replace(/^["']|["']$/g, ""));

      const rollNo = (cleanParts[0] || "").toUpperCase();
      const name = cleanParts[1] || "";
      const email = cleanParts[2] || (rollNo ? `${rollNo.toLowerCase()}@nexora.edu` : "");
      const departmentCode = cleanParts[3] || deptCode;
      const programCode = cleanParts[4] || `BTECH-${departmentCode}`;
      const yearRaw = cleanParts[5] || "";
      const semRaw = parseInt(cleanParts[6] || "1", 10) || 1;

      let yearOfStudy: YearOfStudy = "First";
      if (yearRaw.toLowerCase().includes("four") || yearRaw === "4") yearOfStudy = "Fourth";
      else if (yearRaw.toLowerCase().includes("three") || yearRaw.toLowerCase().includes("third") || yearRaw === "3") yearOfStudy = "Third";
      else if (yearRaw.toLowerCase().includes("two") || yearRaw.toLowerCase().includes("second") || yearRaw === "2") yearOfStudy = "Second";
      else if (yearRaw.toLowerCase().includes("one") || yearRaw.toLowerCase().includes("first") || yearRaw === "1") yearOfStudy = "First";
      else {
        if (semRaw >= 7) yearOfStudy = "Fourth";
        else if (semRaw >= 5) yearOfStudy = "Third";
        else if (semRaw >= 3) yearOfStudy = "Second";
        else yearOfStudy = "First";
      }

      const division: "Division A" | "Division B" = (cleanParts[7] || "").toUpperCase().includes("B") ? "Division B" : "Division A";
      const typeRaw = cleanParts[8] || "Regular";
      const registrationType: "Regular" | "Backlog" = typeRaw.toLowerCase().includes("backlog") ? "Backlog" : "Regular";
      const structRaw = cleanParts[9] || "NEP";
      let curriculumStructure: "NEP" | "CYCLE 1" | "CYCLE 2" | "CYCLE 3" = "NEP";
      if (structRaw.toUpperCase().includes("CYCLE 1")) curriculumStructure = "CYCLE 1";
      else if (structRaw.toUpperCase().includes("CYCLE 2")) curriculumStructure = "CYCLE 2";
      else if (structRaw.toUpperCase().includes("CYCLE 3")) curriculumStructure = "CYCLE 3";

      const attRaw = parseFloat(cleanParts[10] || "85") || 85;
      const attendancePercentage = Math.min(100, Math.max(0, attRaw));
      const eligibilityStatus: "Eligible" | "Ineligible" =
        (cleanParts[11] || "").toLowerCase().includes("ineligible") || attendancePercentage < 75 ? "Ineligible" : "Eligible";
      const feesCleared = !(cleanParts[12] || "").toLowerCase().includes("no");

      const isDuplicate = storeState.studentRegistrations.some((s) => s.rollNo.toUpperCase() === rollNo);
      const isValid = Boolean(rollNo && name);

      return {
        rollNo,
        name,
        email,
        departmentCode,
        programCode,
        yearOfStudy,
        semester: semRaw,
        division,
        registrationType,
        curriculumStructure,
        attendancePercentage,
        eligibilityStatus,
        feesCleared,
        isDuplicate,
        isValid,
        error: !rollNo ? "Missing PRN" : !name ? "Missing Name" : undefined,
      };
    });
  }, [bulkImportText, deptCode, storeState.studentRegistrations]);

  const handleConfirmBulkImport = () => {
    const validRows = parsedStudentRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast("No valid student rows found to import.", "error");
      return;
    }

    const payload = validRows.map((r) => ({
      name: r.name,
      rollNo: r.rollNo,
      email: r.email,
      departmentCode: r.departmentCode,
      programCode: r.programCode,
      yearOfStudy: r.yearOfStudy,
      semester: r.semester,
      division: r.division as "Division A" | "Division B",
      registrationType: r.registrationType,
      curriculumStructure: r.curriculumStructure,
      attendancePercentage: r.attendancePercentage,
      eligibilityStatus: r.eligibilityStatus,
      feesCleared: r.feesCleared,
      subjectCode: deptSubjects[0]?.code || `${r.departmentCode}${r.semester}01`,
      subjectTitle: deptSubjects[0]?.title || "Department Curriculum Paper",
      registrationStatus: "Registered" as const,
    }));

    const result = AcademicDataStore.bulkAddStudents(payload, coordinatorName, bulkImportOverwrite);
    showToast(
      `Bulk Import Complete: ${result.addedCount} added, ${result.updatedCount} updated, ${result.skippedCount} skipped.`,
      "success"
    );
    setShowBulkImportModal(false);
    setBulkImportText("");
  };

  const handleDeleteStudent = (id: string, name: string, roll: string) => {
    if (window.confirm(`Are you sure you want to remove student "${name}" (${roll}) from department registry?`)) {
      const res = AcademicDataStore.deleteStudent(id, coordinatorName);
      if (res.success) {
        showToast(`Student ${name} (${roll}) removed from registry.`, "info");
      } else {
        showToast(res.error || "Failed to remove student.", "error");
      }
    }
  };

  const handleToggleFacultyAvailability = (id: string, currentStatus: string, name: string) => {
    const nextStatus = currentStatus === "Available" ? "On Leave" : "Available";
    AcademicDataStore.toggleFacultyAvailability(id, nextStatus as any, coordinatorName);
    showToast(`Updated ${name} status to ${nextStatus}.`, "info");
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from department invigilation roster?`)) {
      const res = AcademicDataStore.deleteFaculty(id, coordinatorName);
      if (res.success) {
        showToast(`Faculty member ${name} removed from roster.`, "info");
      } else {
        showToast(res.error || "Failed to remove faculty.", "error");
      }
    }
  };

  // --- Handlers ---
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.rollNo.trim()) {
      showToast("Student name and roll number (PRN) are required.", "error");
      return;
    }
    const cleanRoll = newStudent.rollNo.trim().toUpperCase();

    const res = AcademicDataStore.addStudent(
      {
        name: newStudent.name.trim(),
        rollNo: cleanRoll,
        email: newStudent.email.trim() || `${cleanRoll.toLowerCase()}@nexora.edu`,
        departmentCode: deptCode,
        programCode: `BTECH-${deptCode}`,
        yearOfStudy: newStudent.yearOfStudy,
        division: "Division A",
        semester: Number(newStudent.semester),
        academicYear: "2026-27",
        subjectCode: deptSubjects[0]?.code || `${deptCode}${newStudent.semester}01`,
        subjectTitle: deptSubjects[0]?.title || "Department Curriculum Paper",
        registrationType: newStudent.registrationType,
        registrationStatus: "Registered",
        eligibilityStatus: newStudent.attendancePercentage >= 75 ? "Eligible" : "Ineligible",
        attendancePercentage: Number(newStudent.attendancePercentage),
        feesCleared: true,
        curriculumStructure: newStudent.curriculumStructure,
      },
      coordinatorName
    );

    if (res.success) {
      showToast(`Student ${newStudent.name} (${cleanRoll}) successfully registered.`);
      setShowAddStudentModal(false);
      setNewStudent({
        name: "",
        rollNo: "",
        email: "",
        semester: 3,
        yearOfStudy: "Second",
        attendancePercentage: 85,
        registrationType: "Regular",
        curriculumStructure: "NEP",
      });
    } else {
      showToast(res.error || "Failed to register student.", "error");
    }
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.code.trim() || !newSubject.title.trim()) {
      showToast("Course code and title are required.", "error");
      return;
    }
    const cleanCode = newSubject.code.trim().toUpperCase();
    const res = AcademicDataStore.addSubject(
      {
        code: cleanCode,
        title: newSubject.title.trim(),
        credits: Number(newSubject.credits) || 3,
        departmentCode: deptCode,
        programCode: `BTECH-${deptCode}`,
        academicYear: "2026-27",
        yearOfStudy: newSubject.yearOfStudy,
        semester: Number(newSubject.semester),
        type: newSubject.type,
        curriculumStructure: newSubject.curriculumStructure,
        lectureHours: 3,
        tutorialHours: 1,
        practicalHours: 0,
        status: "Active",
        enrolledStudents: 60,
      },
      coordinatorName
    );

    if (res.success) {
      showToast(`Subject ${cleanCode} (${newSubject.title}) added to department syllabus.`);
      setShowAddSubjectModal(false);
      setNewSubject({
        code: "",
        title: "",
        credits: 4,
        semester: 3,
        yearOfStudy: "Second",
        type: "Theory",
        curriculumStructure: "NEP",
      });
    } else {
      showToast(res.error || "Failed to create course.", "error");
    }
  };

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name.trim() || !newFaculty.identifier.trim()) {
      showToast("Faculty name and employee code are required.", "error");
      return;
    }
    const cleanId = newFaculty.identifier.trim().toUpperCase();
    const res = AcademicDataStore.addFaculty(
      {
        name: newFaculty.name.trim(),
        identifier: cleanId,
        departmentCode: deptCode,
        email: newFaculty.email.trim() || `${cleanId.toLowerCase()}@nexora.edu`,
        maxDuties: Number(newFaculty.maxDuties) || 3,
      },
      coordinatorName
    );

    if (res.success) {
      showToast(`Faculty member ${newFaculty.name} successfully registered.`);
      setShowAddFacultyModal(false);
      setNewFaculty({ name: "", identifier: "", email: "", maxDuties: 3 });
    } else {
      showToast(res.error || "Failed to register faculty.", "error");
    }
  };

  const handleRegisterBacklog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForBacklog || !backlogCourseCode.trim()) {
      showToast("Select a student and enter the backlog course code.", "error");
      return;
    }

    const cleanCode = backlogCourseCode.trim().toUpperCase();
    const res = AcademicDataStore.registerStudentBacklog(
      selectedStudentForBacklog,
      cleanCode,
      backlogCycle,
      coordinatorName
    );

    if (res.success) {
      showToast(`Backlog course ${cleanCode} (${backlogCycle}) enrolled. Central solver guarantees daily separation from regular papers.`);
      setShowBacklogModal(false);
      setSelectedStudentForBacklog("");
      setBacklogCourseCode("");
    } else {
      showToast(res.error || "Failed to enroll backlog.", "error");
    }
  };

  return (
    <div className="dash-shell">
      {/* =========================================================
          1. VERTICAL LEFT SIDEBAR — Clean Platform Enterprise Theme
          ========================================================= */}
      <aside className="dash-sidebar" aria-label="Department Coordinator Navigation">
        {/* Brand Header */}
        <div className="dash-brand">
          <div className="dash-brand-icon-box" style={{ background: "var(--brand-primary, #2563eb)" }}>
            N
          </div>
          <div className="dash-brand-titles">
            <span className="dash-brand-title">NEXORA</span>
            <span className="dash-brand-subtitle">{deptCode} Dept. Coordinator</span>
          </div>
        </div>

        {/* 6 Workspace Navigation Items */}
        <nav className="dash-nav" aria-label="Department Workspaces">
          <button
            type="button"
            className={`dash-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Building2 size={16} className="dash-nav-item-icon" />
            <span>1. Department Overview</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <GraduationCap size={16} className="dash-nav-item-icon" />
            <span>2. Students Directory</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: activeTab === "students" ? "rgba(37, 99, 235, 0.12)" : "var(--bg-subtle, #f1f5f9)",
                color: activeTab === "students" ? "var(--brand-primary, #2563eb)" : "var(--text-secondary, #64748b)",
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              {deptStudents.length}
            </span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "faculty" ? "active" : ""}`}
            onClick={() => setActiveTab("faculty")}
          >
            <Users size={16} className="dash-nav-item-icon" />
            <span>3. Faculty Roster</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: activeTab === "faculty" ? "rgba(37, 99, 235, 0.12)" : "var(--bg-subtle, #f1f5f9)",
                color: activeTab === "faculty" ? "var(--brand-primary, #2563eb)" : "var(--text-secondary, #64748b)",
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              {deptFaculty.length}
            </span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "subjects" ? "active" : ""}`}
            onClick={() => setActiveTab("subjects")}
          >
            <BookOpen size={16} className="dash-nav-item-icon" />
            <span>4. Subject Courses & NEP</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: activeTab === "subjects" ? "rgba(37, 99, 235, 0.12)" : "var(--bg-subtle, #f1f5f9)",
                color: activeTab === "subjects" ? "var(--brand-primary, #2563eb)" : "var(--text-secondary, #64748b)",
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              {deptSubjects.length}
            </span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "backlogs" ? "active" : ""}`}
            onClick={() => setActiveTab("backlogs")}
          >
            <Layers size={16} className="dash-nav-item-icon" />
            <span>5. Backlogs & Cycles</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: activeTab === "backlogs" ? "rgba(217, 119, 6, 0.15)" : "#fef3c7",
                color: "#b45309",
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              {backlogStudents.length}
            </span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar size={16} className="dash-nav-item-icon" />
            <span>6. Department Timetable</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="dash-sidebar-footer" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="dash-status-indicator">
              <span className="dash-pulse-dot" />
              <span>{deptCode} Dept Active</span>
            </div>
            <span className="dash-version-caption">2026-27</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "8px", borderTop: "1px solid var(--border-default, #e2e8f0)" }}>
            <div className="dash-avatar-circle" style={{ width: "28px", height: "28px", fontSize: "11px", background: "var(--brand-primary, #2563eb)" }}>
              {coordinatorName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "RK"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-primary, #0f172a)" }}>
                {coordinatorName}
              </div>
              <div style={{ fontSize: "10.5px", color: "var(--text-muted, #64748b)" }}>{deptCode} Coordinator</div>
            </div>
          </div>

          {onSwitchToExamCoordinator && (
            <button
              type="button"
              className="dash-btn dash-btn-outline"
              style={{ width: "100%", justifyContent: "center", fontSize: "12px", height: "30px", marginTop: "2px" }}
              onClick={onSwitchToExamCoordinator}
            >
              <span>Switch to Exam Cell</span>
              <ArrowRight size={13} />
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              className="dash-btn dash-btn-outline"
              style={{ width: "100%", justifyContent: "center", fontSize: "12px", height: "30px" }}
              onClick={onLogout}
            >
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================
          2. MAIN CONTENT AREA — Matching Platform Topbar & Design System
          ========================================================= */}
      <div className="dash-main">
        {/* Horizontal Top Navbar */}
        <header className="dash-topbar">
          <div className="dash-search-box">
            <Search size={15} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              className="dash-search-input"
              placeholder={`Search ${deptCode} students, faculty, courses...`}
              value={studentSearch || facultySearch}
              onChange={(e) => {
                const val = e.target.value;
                setStudentSearch(val);
                setFacultySearch(val);
              }}
            />
          </div>

          <div className="dash-topbar-actions">
            {onSwitchToExamCoordinator && (
              <div className="dash-role-switcher" title="Switch active portal view">
                <button type="button" className="dash-role-btn active">
                  {deptCode} Dept Portal
                </button>
                <button
                  type="button"
                  className="dash-role-btn"
                  onClick={onSwitchToExamCoordinator}
                  title="Open Exam Coordinator Dashboard"
                >
                  Exam Coordinator
                </button>
              </div>
            )}

            {/* User Profile Pill */}
            <div
              className="dash-user-chip"
              onClick={() => {
                if (onLogout) onLogout();
                else auth.logout();
              }}
              title="Click to sign out"
            >
              <div className="dash-avatar-circle" style={{ background: "var(--brand-primary, #2563eb)" }}>
                {coordinatorName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "RK"}
              </div>
              <div className="dash-user-details">
                <span className="dash-user-name">{coordinatorName}</span>
                <span className="dash-user-role-label">{deptCode} Dept. Coordinator</span>
              </div>
              <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="dash-content" style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>
          {/* Toast */}
          {toastMessage && (
            <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, backgroundColor: toastMessage.type === "error" ? "#ef4444" : "#10b981", color: "#fff", padding: "12px 18px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontWeight: "500", fontSize: "13.5px" }}>
              {toastMessage.message}
            </div>
          )}

          {/* Top Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
            <div style={{ flex: "1 1 450px", minWidth: "300px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "var(--brand-surface, #eff6ff)", color: "var(--brand-primary, #2563eb)", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "700" }}>
                  DEPARTMENTAL PORTAL · {deptCode}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted, #64748b)" }}>Academic Year 2026–27</span>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary, #0f172a)", margin: "6px 0 0 0" }}>
                {userDepartment} Examination Coordination
              </h1>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-muted, #64748b)", fontSize: "13.5px" }}>
                Manage students across all 4 tiers, department course syllabi, faculty invigilators, and student backlogs for autonomous timetable scheduling.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                title="Download standard format Excel / CSV template for bulk student addition"
                onClick={handleDownloadStudentTemplate}
              >
                <FileSpreadsheet size={15} color="#16a34a" />
                <span>Standard Excel Template</span>
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderColor: "var(--brand-primary, #2563eb)", color: "var(--brand-primary, #2563eb)", fontWeight: "600" }}
                title="Upload and bulk add department students via Excel/CSV spreadsheet"
                onClick={() => setShowBulkImportModal(true)}
              >
                <Upload size={15} />
                <span>Bulk Import Students</span>
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setShowAddStudentModal(true)}
              >
                <UserPlus size={15} />
                <span>Add Student</span>
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setShowAddSubjectModal(true)}
              >
                <BookPlus size={15} />
                <span>Add Subject</span>
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setShowBacklogModal(true)}
              >
                <Plus size={15} />
                <span>Register Backlog</span>
              </button>
            </div>
          </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
              <div className="card" style={{ padding: "18px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Registered Students</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{deptStudents.length}</div>
                <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>Across F.Y. to Final Year</div>
              </div>

              <div className="card" style={{ padding: "18px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Department Faculty</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{deptFaculty.length}</div>
                <div style={{ fontSize: "12px", color: "#3b82f6", marginTop: "4px" }}>Active Invigilators</div>
              </div>

              <div className="card" style={{ padding: "18px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Curriculum Subjects</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{deptSubjects.length}</div>
                <div style={{ fontSize: "12px", color: "var(--brand-primary, #2563eb)", marginTop: "4px" }}>NEP & Electives Active</div>
              </div>

              <div className="card" style={{ padding: "18px" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Backlog Entries</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#b45309", marginTop: "4px" }}>{backlogStudents.length}</div>
                <div style={{ fontSize: "12px", color: "#d97706", marginTop: "4px" }}>Cycles 1, 2, 3 Protected</div>
              </div>
            </div>

            {/* Quick Actions & Policy Card */}
            <div className="card" style={{ padding: "20px", marginBottom: "24px", borderLeft: "4px solid var(--brand-primary, #2563eb)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <ShieldCheck size={24} style={{ color: "var(--brand-primary, #2563eb)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                    Autonomous Examination Coordination Rule (Strict H6 Enforced)
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                    As Departmental Coordinator, any backlog papers enrolled under your department for students repeating earlier courses (Cycle 1, Cycle 2, or Cycle 3) are guaranteed to be scheduled on <strong>strictly separate calendar days</strong> from their regular semester examinations. The central solver validates this hard constraint prior to publication.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Department Subjects Table */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Active Department Curriculum Courses</h3>
                <button type="button" className="dash-btn dash-btn-outline" style={{ fontSize: "12px", height: "30px" }} onClick={() => setActiveTab("subjects")}>
                  View All Subjects
                </button>
              </div>

              <table className="dash-table" style={{ width: "100%", fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course Title</th>
                    <th>Year Tier</th>
                    <th>Sem</th>
                    <th>Structure</th>
                    <th>Credits</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {deptSubjects.slice(0, 8).map((sub) => (
                    <tr key={sub.id}>
                      <td className="font-mono font-bold">{sub.code}</td>
                      <td>{sub.title}</td>
                      <td>{sub.yearOfStudy} Year</td>
                      <td>Sem {sub.semester}</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: sub.curriculumStructure?.includes("CYCLE") ? "#fef3c7" : "#dbeafe", color: sub.curriculumStructure?.includes("CYCLE") ? "#92400e" : "#1e40af" }}>
                          {sub.curriculumStructure || "NEP"}
                        </span>
                      </td>
                      <td>{sub.credits}</td>
                      <td>{sub.enrolledStudents} students</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="card" style={{ padding: "20px" }}>
            {/* Header with Title and Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                  Department Students Directory · {deptCode}
                </h3>
                <p style={{ margin: "3px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  Enrolled students across First, Second, Third, and Final Year tiers
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
                  onClick={handleDownloadStudentTemplate}
                  title="Download standard format Excel / CSV template for bulk student addition"
                >
                  <FileSpreadsheet size={14} color="#16a34a" />
                  <span>Download Excel Template</span>
                </button>
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", borderColor: "var(--brand-primary, #2563eb)", color: "var(--brand-primary, #2563eb)", fontWeight: "600" }}
                  onClick={() => setShowBulkImportModal(true)}
                  title="Upload student list from Excel/CSV spreadsheet"
                >
                  <Upload size={14} />
                  <span>Bulk Import Excel</span>
                </button>
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
                  onClick={handleExportStudentsCSV}
                  title="Export currently filtered students to CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
                  onClick={() => setShowAddStudentModal(true)}
                >
                  <UserPlus size={14} />
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            {/* Stats Ribbon */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "16px" }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Total Candidates</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>{deptStudents.length}</div>
              </div>
              <div style={{ backgroundColor: "#f0fdf4", padding: "10px 14px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: "11px", color: "#166534", textTransform: "uppercase", fontWeight: "600" }}>Regular Enrolled</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#15803d" }}>
                  {deptStudents.filter((s) => s.registrationType === "Regular").length}
                </div>
              </div>
              <div style={{ backgroundColor: "#fefce8", padding: "10px 14px", borderRadius: "8px", border: "1px solid #fef08a" }}>
                <div style={{ fontSize: "11px", color: "#854d0e", textTransform: "uppercase", fontWeight: "600" }}>Backlog Students</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#a16207" }}>
                  {deptStudents.filter((s) => s.registrationType === "Backlog" || (s.backlogSubjects && s.backlogSubjects.length > 0)).length}
                </div>
              </div>
              <div style={{ backgroundColor: "#fef2f2", padding: "10px 14px", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <div style={{ fontSize: "11px", color: "#991b1b", textTransform: "uppercase", fontWeight: "600" }}>Attendance Ineligible</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#dc2626" }}>
                  {deptStudents.filter((s) => s.eligibilityStatus !== "Eligible").length}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ flex: "1 1 240px", position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search by Roll No (PRN), Name, Course..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="dash-input"
                  style={{ paddingLeft: "32px", fontSize: "13px", height: "36px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="dash-select"
                  style={{ height: "36px", fontSize: "12.5px" }}
                >
                  <option value="ALL">All Year Tiers</option>
                  <option value="First">First Year (F.Y.)</option>
                  <option value="Second">Second Year (S.Y.)</option>
                  <option value="Third">Third Year (T.Y.)</option>
                  <option value="Fourth">Final Year (B.Tech)</option>
                </select>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="dash-select"
                  style={{ height: "36px", fontSize: "12.5px" }}
                >
                  <option value="ALL">All Types</option>
                  <option value="Regular">Regular</option>
                  <option value="Backlog">Backlog</option>
                </select>

                <select
                  value={selectedEligibilityFilter}
                  onChange={(e) => setSelectedEligibilityFilter(e.target.value)}
                  className="dash-select"
                  style={{ height: "36px", fontSize: "12.5px" }}
                >
                  <option value="ALL">All Status</option>
                  <option value="Eligible">Eligible (≥ 75%)</option>
                  <option value="Ineligible">Ineligible (&lt; 75%)</option>
                </select>

                {(studentSearch || selectedYearFilter !== "ALL" || selectedTypeFilter !== "ALL" || selectedEligibilityFilter !== "ALL") && (
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline"
                    style={{ height: "36px", fontSize: "12px", padding: "0 10px" }}
                    onClick={() => {
                      setStudentSearch("");
                      setSelectedYearFilter("ALL");
                      setSelectedTypeFilter("ALL");
                      setSelectedEligibilityFilter("ALL");
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Students Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table" style={{ width: "100%", fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>Roll No (PRN)</th>
                    <th>Student Name & Email</th>
                    <th>Year Tier</th>
                    <th>Sem</th>
                    <th>Division</th>
                    <th>Type</th>
                    <th>Curriculum</th>
                    <th>Attendance</th>
                    <th>Eligibility</th>
                    <th>Fees</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <Users size={32} color="#cbd5e1" />
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>No students match your filter criteria.</div>
                          <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
                            Try adjusting your search query, or use "Bulk Import Excel" to add students.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id}>
                        <td className="font-mono font-bold" style={{ color: "#1e293b" }}>{st.rollNo}</td>
                        <td>
                          <div className="font-semibold" style={{ color: "#0f172a" }}>{st.name}</div>
                          <div style={{ fontSize: "11.5px", color: "#64748b" }}>{st.email}</div>
                        </td>
                        <td>{st.yearOfStudy} Year</td>
                        <td>Sem {st.semester}</td>
                        <td>{st.division || "Div A"}</td>
                        <td>
                          <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 6px", borderRadius: "4px", backgroundColor: st.registrationType === "Backlog" ? "#fef3c7" : "#f1f5f9", color: st.registrationType === "Backlog" ? "#92400e" : "#334155" }}>
                            {st.registrationType}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: st.curriculumStructure?.includes("CYCLE") ? "#fef3c7" : "#dbeafe", color: st.curriculumStructure?.includes("CYCLE") ? "#92400e" : "#1e40af" }}>
                            {st.curriculumStructure || "NEP"}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: st.attendancePercentage >= 75 ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
                            {st.attendancePercentage}%
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: st.eligibilityStatus === "Eligible" ? "#16a34a" : "#dc2626" }}>
                            {st.eligibilityStatus}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: st.feesCleared ? "#16a34a" : "#dc2626" }}>
                            {st.feesCleared ? "Cleared" : "Pending"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline"
                              style={{ padding: "3px 8px", fontSize: "11.5px", height: "26px" }}
                              title="Register backlog paper for this candidate"
                              onClick={() => {
                                setSelectedStudentForBacklog(st.id);
                                setShowBacklogModal(true);
                              }}
                            >
                              + Backlog
                            </button>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline"
                              style={{ padding: "3px 6px", fontSize: "11.5px", height: "26px", color: "#dc2626", borderColor: "#fecaca" }}
                              title="Remove student record"
                              onClick={() => handleDeleteStudent(st.id, st.name, st.rollNo)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Faculty Tab */}
        {activeTab === "faculty" && (
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                  Department Faculty & Invigilators · {deptCode}
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  Active teaching faculty members eligible for examination duties and seating invigilation
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ position: "relative", minWidth: "200px" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    className="dash-input"
                    style={{ paddingLeft: "32px", fontSize: "13px", height: "34px" }}
                  />
                </div>
                <button type="button" className="dash-btn dash-btn-primary" onClick={() => setShowAddFacultyModal(true)}>
                  <UserPlus size={15} />
                  <span>Add Faculty Member</span>
                </button>
              </div>
            </div>

            <table className="dash-table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Institutional Email</th>
                  <th>Assigned Duties</th>
                  <th>Max Workload</th>
                  <th>Availability</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                      No faculty records match your search.
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((f) => (
                    <tr key={f.id}>
                      <td className="font-mono font-bold" style={{ color: "#1e293b" }}>{f.identifier}</td>
                      <td className="font-semibold" style={{ color: "#0f172a" }}>{f.name}</td>
                      <td>{f.departmentCode}</td>
                      <td className="text-muted">{f.email}</td>
                      <td>{f.assignedDuties} sessions</td>
                      <td>Max {f.maxDuties} / cycle</td>
                      <td>
                        <span style={{ fontSize: "11.5px", fontWeight: "700", color: f.status === "Available" ? "#16a34a" : "#ea580c" }}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                          <button
                            type="button"
                            className="dash-btn dash-btn-outline"
                            style={{ padding: "3px 8px", fontSize: "11.5px", height: "26px" }}
                            onClick={() => handleToggleFacultyAvailability(f.id, f.status, f.name)}
                          >
                            {f.status === "Available" ? "Mark On Leave" : "Mark Available"}
                          </button>
                          <button
                            type="button"
                            className="dash-btn dash-btn-outline"
                            style={{ padding: "3px 6px", fontSize: "11.5px", height: "26px", color: "#dc2626", borderColor: "#fecaca" }}
                            onClick={() => handleDeleteFaculty(f.id, f.name)}
                            title="Remove faculty from roster"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Department Curriculum & Course Offerings</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  Full course catalog including NEP curriculum and older Cycle 1/2/3 backlog courses
                </p>
              </div>
              <button type="button" className="dash-btn dash-btn-primary" onClick={() => setShowAddSubjectModal(true)}>
                <BookPlus size={15} />
                <span>Add Subject Course</span>
              </button>
            </div>

            <table className="dash-table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Title</th>
                  <th>Year Level</th>
                  <th>Sem</th>
                  <th>Structure</th>
                  <th>Credits</th>
                  <th>Enrolled</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deptSubjects.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-mono font-bold">{sub.code}</td>
                    <td className="font-semibold">{sub.title}</td>
                    <td>{sub.yearOfStudy} Year</td>
                    <td>Sem {sub.semester}</td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: sub.curriculumStructure?.includes("CYCLE") ? "#fef3c7" : "#dbeafe", color: sub.curriculumStructure?.includes("CYCLE") ? "#92400e" : "#1e40af" }}>
                        {sub.curriculumStructure || "NEP"}
                      </span>
                    </td>
                    <td>{sub.credits}</td>
                    <td>{sub.enrolledStudents}</td>
                    <td>
                      <span style={{ color: "#16a34a", fontWeight: "600" }}>{sub.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Backlogs Tab */}
        {activeTab === "backlogs" && (
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Backlog Students & Curriculum Cycles</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  Students registered for repeat examinations under Cycle 1, Cycle 2, or Cycle 3 regulations
                </p>
              </div>
              <button type="button" className="dash-btn dash-btn-primary" onClick={() => setShowBacklogModal(true)}>
                <Plus size={15} />
                <span>Enroll Student in Backlog Paper</span>
              </button>
            </div>

            <div style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#fef3c7", borderRadius: "6px", color: "#92400e", fontSize: "13px" }}>
              <strong>Backlog Collision Protection:</strong> If a student is taking both their regular year exam (e.g. 2nd Year) and an earlier backlog exam (e.g. 1st Year Cycle 2), the system enforces that the backlog paper is scheduled on a <strong>different calendar date</strong>.
            </div>

            <table className="dash-table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Current Year</th>
                  <th>Backlog Course</th>
                  <th>Regulation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {backlogStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                      No active backlog entries recorded for this department.
                    </td>
                  </tr>
                ) : (
                  backlogStudents.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono font-bold">{b.rollNo}</td>
                      <td className="font-semibold">{b.name}</td>
                      <td>{b.yearOfStudy} Year</td>
                      <td className="font-mono font-bold text-amber-700">{b.subjectCode} — {b.subjectTitle}</td>
                      <td>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#92400e" }}>
                          CYCLE 2 (Backlog)
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#16a34a", fontWeight: "600" }}>Conflict-Free Protected</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700" }}>Department Examination Schedule</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "12.5px", color: "#64748b" }}>
              Scheduled dates and slots generated by the Central Exam Cell solver for {userDepartment}
            </p>

            <table className="dash-table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject</th>
                  <th>Year Level</th>
                  <th>Exam Date</th>
                  <th>Time Slot</th>
                  <th>Assigned Hall</th>
                  <th>Invigilator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deptExams.map((ex) => (
                  <tr key={ex.id}>
                    <td className="font-mono font-bold">{ex.code}</td>
                    <td className="font-semibold">{ex.subject}</td>
                    <td>{ex.yearOfStudy} Year</td>
                    <td className="font-mono">{ex.date}</td>
                    <td>{ex.slot}</td>
                    <td>{ex.room}</td>
                    <td>{ex.invigilator}</td>
                    <td>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#dcfce7", color: "#15803d" }}>
                        {ex.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </main>
      </div>

      {/* =========================================================
          MODALS
          ========================================================= */}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: "500px", width: "100%", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Register Department Student</h3>
            <form onSubmit={handleCreateStudent} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="dash-label">Full Name *</label>
                <input
                  type="text"
                  className="dash-input"
                  required
                  placeholder="e.g., Rohan V. Patil"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dash-label">Roll Number *</label>
                  <input
                    type="text"
                    className="dash-input"
                    required
                    placeholder="e.g., CS2024-055"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="dash-label">Year of Study *</label>
                  <select
                    className="dash-select"
                    value={newStudent.yearOfStudy}
                    onChange={(e) => setNewStudent({ ...newStudent, yearOfStudy: e.target.value as YearOfStudy })}
                  >
                    <option value="First">First Year (F.Y.)</option>
                    <option value="Second">Second Year (S.Y.)</option>
                    <option value="Third">Third Year (T.Y.)</option>
                    <option value="Fourth">Final Year (B.Tech)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dash-label">Semester *</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    className="dash-input"
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="dash-label">Attendance (%) *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="dash-input"
                    value={newStudent.attendancePercentage}
                    onChange={(e) => setNewStudent({ ...newStudent, attendancePercentage: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" className="dash-btn dash-btn-outline" onClick={() => setShowAddStudentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn dash-btn-primary">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: "500px", width: "100%", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Add Curriculum Course</h3>
            <form onSubmit={handleCreateSubject} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="dash-label">Course Code *</label>
                  <input
                    type="text"
                    className="dash-input font-mono"
                    required
                    placeholder="e.g., UCSPC0301"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="dash-label">Course Title *</label>
                  <input
                    type="text"
                    className="dash-input"
                    required
                    placeholder="e.g., Discrete Mathematical Structures"
                    value={newSubject.title}
                    onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dash-label">Year of Study *</label>
                  <select
                    className="dash-select"
                    value={newSubject.yearOfStudy}
                    onChange={(e) => setNewSubject({ ...newSubject, yearOfStudy: e.target.value as YearOfStudy })}
                  >
                    <option value="First">First Year (F.Y.)</option>
                    <option value="Second">Second Year (S.Y.)</option>
                    <option value="Third">Third Year (T.Y.)</option>
                    <option value="Fourth">Final Year (B.Tech)</option>
                  </select>
                </div>
                <div>
                  <label className="dash-label">Curriculum Structure *</label>
                  <select
                    className="dash-select"
                    value={newSubject.curriculumStructure}
                    onChange={(e) => setNewSubject({ ...newSubject, curriculumStructure: e.target.value as any })}
                  >
                    <option value="NEP">NEP (Regular Syllabus)</option>
                    <option value="CYCLE 1">CYCLE 1 (Backlog)</option>
                    <option value="CYCLE 2">CYCLE 2 (Backlog)</option>
                    <option value="CYCLE 3">CYCLE 3 (Backlog)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dash-label">Semester *</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    className="dash-input"
                    value={newSubject.semester}
                    onChange={(e) => setNewSubject({ ...newSubject, semester: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="dash-label">Credits *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="dash-input"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" className="dash-btn dash-btn-outline" onClick={() => setShowAddSubjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn dash-btn-primary">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddFacultyModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: "500px", width: "100%", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Register Department Faculty</h3>
            <form onSubmit={handleCreateFaculty} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="dash-label">Faculty Full Name *</label>
                <input
                  type="text"
                  className="dash-input"
                  required
                  placeholder="e.g., Dr. Meenakshi Sundaram"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dash-label">Employee Code *</label>
                  <input
                    type="text"
                    className="dash-input"
                    required
                    placeholder="e.g., FAC-1205"
                    value={newFaculty.identifier}
                    onChange={(e) => setNewFaculty({ ...newFaculty, identifier: e.target.value })}
                  />
                </div>
                <div>
                  <label className="dash-label">Max Duties / Cycle *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="dash-input"
                    value={newFaculty.maxDuties}
                    onChange={(e) => setNewFaculty({ ...newFaculty, maxDuties: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" className="dash-btn dash-btn-outline" onClick={() => setShowAddFacultyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn dash-btn-primary">
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Backlog Modal */}
      {showBacklogModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: "520px", width: "100%", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Enroll Student in Backlog Paper</h3>
            <form onSubmit={handleRegisterBacklog} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="dash-label">Select Student *</label>
                <select
                  className="dash-select"
                  required
                  value={selectedStudentForBacklog}
                  onChange={(e) => setSelectedStudentForBacklog(e.target.value)}
                >
                  <option value="">-- Choose Department Student --</option>
                  {deptStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.rollNo}) — {st.yearOfStudy} Year
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dash-label">Backlog Course Code *</label>
                  <input
                    type="text"
                    className="dash-input font-mono"
                    required
                    placeholder="e.g., CS101 or UCSC0701"
                    value={backlogCourseCode}
                    onChange={(e) => setBacklogCourseCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="dash-label">Curriculum Cycle *</label>
                  <select
                    className="dash-select"
                    value={backlogCycle}
                    onChange={(e) => setBacklogCycle(e.target.value as any)}
                  >
                    <option value="CYCLE 1">CYCLE 1 (CBCS 2018)</option>
                    <option value="CYCLE 2">CYCLE 2 (CBCS 2020)</option>
                    <option value="CYCLE 3">CYCLE 3 (Legacy)</option>
                  </select>
                </div>
              </div>

              <div style={{ backgroundColor: "#eff6ff", padding: "10px 14px", borderRadius: "6px", fontSize: "12.5px", color: "#1e40af" }}>
                <strong>No-Clash Guarantee:</strong> Enrolling this backlog paper ensures the CP-SAT solver places it on a date when this student has no regular semester examinations.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" className="dash-btn dash-btn-outline" onClick={() => setShowBacklogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn dash-btn-primary">
                  Enroll Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Students Modal */}
      {showBulkImportModal && (
        <div className="modal-backdrop" onClick={() => setShowBulkImportModal(false)}>
          <div
            className="card modal-content"
            style={{ maxWidth: "860px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ backgroundColor: "var(--brand-surface, #eff6ff)", color: "var(--brand-primary, #2563eb)", padding: "8px", borderRadius: "8px" }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                    Bulk Add Department Students ({deptCode})
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                    Upload standard Excel (.xlsx, .csv) spreadsheet or paste candidate rows directly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Download Format Box */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>
                  Step 1: Download Standard Institutional Excel Format
                </div>
                <div style={{ fontSize: "12px", color: "#15803d", marginTop: "2px" }}>
                  Includes required column headers: PRN/Roll No, Name, Year, Sem, Division, Type, Attendance, Eligibility.
                </div>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                style={{ backgroundColor: "#ffffff", borderColor: "#86efac", color: "#166534", fontWeight: "600", fontSize: "12.5px" }}
                onClick={handleDownloadStudentTemplate}
              >
                <FileSpreadsheet size={15} color="#16a34a" />
                <span>Download Sample Sheet (.csv / Excel)</span>
              </button>
            </div>

            {/* Step 2: Upload or Paste */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="dash-label" style={{ margin: 0, fontWeight: "700" }}>
                  Step 2: Upload File or Paste CSV / TSV Rows
                </label>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "var(--brand-primary, #2563eb)",
                    fontWeight: "600",
                  }}
                >
                  <Upload size={13} />
                  <span>Choose File (.csv, .tsv, .txt)</span>
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const text = ev.target?.result as string;
                          if (text) setBulkImportText(text);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>

              <textarea
                className="dash-input font-mono"
                rows={5}
                placeholder="Paste rows here from Excel or CSV..."
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                style={{ width: "100%", fontSize: "12px", padding: "10px", lineHeight: "1.5" }}
              />
            </div>

            {/* Step 3: Live Preview Table */}
            {parsedStudentRows.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#0f172a" }}>
                      Live Preview & Validation
                    </span>
                    <span style={{ fontSize: "11px", backgroundColor: "#e2e8f0", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                      {parsedStudentRows.length} Rows Detected
                    </span>
                    <span style={{ fontSize: "11px", backgroundColor: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                      {parsedStudentRows.filter((r) => r.isValid && !r.isDuplicate).length} New
                    </span>
                    {parsedStudentRows.some((r) => r.isDuplicate) && (
                      <span style={{ fontSize: "11px", backgroundColor: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                        {parsedStudentRows.filter((r) => r.isDuplicate).length} Existing PRN(s)
                      </span>
                    )}
                  </div>

                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "#475569" }}>
                    <input
                      type="checkbox"
                      checked={bulkImportOverwrite}
                      onChange={(e) => setBulkImportOverwrite(e.target.checked)}
                    />
                    <span>Overwrite existing students if PRN matches</span>
                  </label>
                </div>

                <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                  <table className="dash-table" style={{ width: "100%", fontSize: "12px", margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>PRN / Roll No</th>
                        <th>Student Name</th>
                        <th>Year & Sem</th>
                        <th>Division</th>
                        <th>Type</th>
                        <th>Structure</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedStudentRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} style={{ backgroundColor: !row.isValid ? "#fef2f2" : row.isDuplicate ? "#fffbeb" : "inherit" }}>
                          <td>
                            {!row.isValid ? (
                              <span style={{ fontSize: "10.5px", color: "#dc2626", fontWeight: "700" }}>Invalid: {row.error}</span>
                            ) : row.isDuplicate ? (
                              <span style={{ fontSize: "10.5px", color: "#d97706", fontWeight: "700" }}>
                                {bulkImportOverwrite ? "Will Overwrite" : "Duplicate (Skip)"}
                              </span>
                            ) : (
                              <span style={{ fontSize: "10.5px", color: "#16a34a", fontWeight: "700" }}>Ready</span>
                            )}
                          </td>
                          <td className="font-mono font-bold">{row.rollNo || "—"}</td>
                          <td className="font-semibold">{row.name || "—"}</td>
                          <td>{row.yearOfStudy} (Sem {row.semester})</td>
                          <td>{row.division}</td>
                          <td>{row.registrationType}</td>
                          <td>{row.curriculumStructure}</td>
                          <td style={{ color: row.attendancePercentage >= 75 ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
                            {row.attendancePercentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedStudentRows.length > 15 && (
                  <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "4px", textAlign: "right" }}>
                    Showing first 15 of {parsedStudentRows.length} rows...
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                onClick={() => {
                  setShowBulkImportModal(false);
                  setBulkImportText("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                disabled={parsedStudentRows.filter((r) => r.isValid).length === 0}
                onClick={handleConfirmBulkImport}
              >
                Confirm & Bulk Import {parsedStudentRows.filter((r) => r.isValid).length} Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
