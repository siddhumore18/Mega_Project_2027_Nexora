import React, { useState, useEffect, useMemo } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import {
  AcademicDataStore,
  UserRecord,
  DepartmentRecord,
  ProgramRecord,
  SubjectRecord,
  YearOfStudy,
  SubjectType,
  getYearFromSemester,
  ExamCycleRecord,
  TimetableApprovalRecord,
  GrievanceRecord,
  PolicySettingsRecord,
} from "../../services/academicDataStore.js";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  Calendar,
  CalendarCheck2,
  AlertCircle,
  BarChart3,
  FileText,
  Sliders,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  X,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

interface AdminDashboardProps {
  onSwitchToCoordinator?: () => void;
  onLogout?: () => void;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSwitchToCoordinator,
  onLogout,
  activeTab,
  onNavigateTab,
}) => {
  const auth = useAuth();

  // Navigation State (10 items per requirement)
  const [activeMenu, setActiveMenu] = useState<string>("overview");

  // Subscribe to live AcademicDataStore
  const [storeState, setStoreState] = useState(() => AcademicDataStore.getState());

  useEffect(() => {
    const unsubscribe = AcademicDataStore.subscribe(() => {
      setStoreState({ ...AcademicDataStore.getState() });
    });
    return () => unsubscribe();
  }, []);

  // Sync external tab if provided
  useEffect(() => {
    if (activeTab) {
      const map: Record<string, string> = {
        overview: "overview",
        users: "users",
        academic: "departments",
        departments: "departments",
        programs: "programs",
        cycles: "cycles",
        timetables: "approvals",
        approvals: "approvals",
        complaints: "grievances",
        grievances: "grievances",
        reports: "reports",
        audit: "audit",
        settings: "settings",
      };
      if (map[activeTab]) {
        setActiveMenu(map[activeTab]);
      }
    }
  }, [activeTab]);

  const handleMenuSelect = (menuId: string) => {
    setActiveMenu(menuId);
    if (onNavigateTab) onNavigateTab(menuId);
  };

  // Toast feedback state
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // --- User & Roles: Role-wise Tabs & Filters ---
  const [activeUserRoleTab, setActiveUserRoleTab] = useState<UserRole>(UserRole.ADMIN);
  const [userSearch, setUserSearch] = useState("");
  const [userDeptFilter, setUserDeptFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");

  const [deptSearch, setDeptSearch] = useState("");

  // --- Programs & Subjects: Department-wise Academic Filters ---
  const [programTab, setProgramTab] = useState<"subjects" | "programs">("subjects");
  const [selectedSubjectDept, setSelectedSubjectDept] = useState<string>("CSE");
  const [subjectAcadYearFilter, setSubjectAcadYearFilter] = useState("ALL");
  const [subjectProgramFilter, setSubjectProgramFilter] = useState("ALL");
  const [subjectYearFilter, setSubjectYearFilter] = useState("ALL");
  const [subjectSemFilter, setSubjectSemFilter] = useState("ALL");
  const [subjectTypeFilter, setSubjectTypeFilter] = useState("ALL");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [progSearch, setProgSearch] = useState("");

  const [cycleSearch, setCycleSearch] = useState("");
  const [cycleStatusFilter, setCycleStatusFilter] = useState("ALL");

  const [grievanceSearch, setGrievanceSearch] = useState("");
  const [grievanceCategoryFilter, setGrievanceCategoryFilter] = useState("ALL");
  const [grievanceStatusFilter, setGrievanceStatusFilter] = useState("ALL");

  // --- Modals State ---
  // Users
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

  // Departments
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [viewingDept, setViewingDept] = useState<DepartmentRecord | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentRecord | null>(null);

  // Programs & Subjects
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramRecord | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<ProgramRecord | null>(null);

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectRecord | null>(null);

  // Exam Cycles
  const [showAddCycleModal, setShowAddCycleModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<ExamCycleRecord | null>(null);
  const [deletingCycle, setDeletingCycle] = useState<ExamCycleRecord | null>(null);

  // Timetable Approvals
  const [selectedTimetableForReview, setSelectedTimetableForReview] = useState<TimetableApprovalRecord | null>(null);
  const [revisionNoteInput, setRevisionNoteInput] = useState("");
  const [rejectionNoteInput, setRejectionNoteInput] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  // Grievances
  const [showAddGrievanceModal, setShowAddGrievanceModal] = useState(false);
  const [viewingGrievance, setViewingGrievance] = useState<GrievanceRecord | null>(null);
  const [grievanceNoteInput, setGrievanceNoteInput] = useState("");

  // Policies
  const [policyForm, setPolicyForm] = useState<PolicySettingsRecord>(storeState.policies);

  useEffect(() => {
    setPolicyForm(storeState.policies);
  }, [storeState.policies]);

  // --- Filtered Datasets ---
  // Role counts for tabs
  const roleCounts = useMemo(() => {
    return {
      [UserRole.ADMIN]: storeState.users.filter((u) => u.role === UserRole.ADMIN).length,
      [UserRole.EXAM_COORDINATOR]: storeState.users.filter((u) => u.role === UserRole.EXAM_COORDINATOR).length,
      [UserRole.HOD]: storeState.users.filter((u) => u.role === UserRole.HOD).length,
      [UserRole.FACULTY]: storeState.users.filter((u) => u.role === UserRole.FACULTY).length,
      [UserRole.STUDENT]: storeState.users.filter((u) => u.role === UserRole.STUDENT).length,
    };
  }, [storeState.users]);

  const roleLabelMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Admin",
    [UserRole.EXAM_COORDINATOR]: "Exam Coordinator",
    [UserRole.HOD]: "Department HOD",
    [UserRole.FACULTY]: "Faculty",
    [UserRole.STUDENT]: "Student",
  };

  // Filtered Users: strictly isolated by active role tab, search, department, and status
  const filteredUsers = useMemo(() => {
    return storeState.users.filter((u) => {
      const matchRole = u.role === activeUserRoleTab;
      const q = userSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.identifier.toLowerCase().includes(q);
      const matchDept = userDeptFilter === "ALL" || u.department.toLowerCase() === userDeptFilter.toLowerCase();
      const matchStatus = userStatusFilter === "ALL" || u.status === userStatusFilter;
      return matchRole && matchSearch && matchDept && matchStatus;
    });
  }, [storeState.users, activeUserRoleTab, userSearch, userDeptFilter, userStatusFilter]);

  const filteredDepartments = useMemo(() => {
    return storeState.departments.filter((d) => {
      return (
        d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
        d.code.toLowerCase().includes(deptSearch.toLowerCase()) ||
        d.hodName.toLowerCase().includes(deptSearch.toLowerCase())
      );
    });
  }, [storeState.departments, deptSearch]);

  // Dependent programs under currently selected department
  const deptPrograms = useMemo(() => {
    return storeState.programs.filter((p) => p.departmentCode === selectedSubjectDept);
  }, [storeState.programs, selectedSubjectDept]);

  // Valid semesters based on selected year of study
  const availableSemesters = useMemo(() => {
    if (subjectYearFilter === "First") return [1, 2];
    if (subjectYearFilter === "Second") return [3, 4];
    if (subjectYearFilter === "Third") return [5, 6];
    if (subjectYearFilter === "Fourth") return [7, 8];
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }, [subjectYearFilter]);

  // Reset semester filter if incompatible with selected year
  useEffect(() => {
    if (subjectYearFilter !== "ALL") {
      const semNum = Number(subjectSemFilter);
      if (!isNaN(semNum) && !availableSemesters.includes(semNum)) {
        setSubjectSemFilter("ALL");
      }
    }
  }, [subjectYearFilter, availableSemesters, subjectSemFilter]);

  // Filtered Subjects: Step 1 (Department) + Step 2 (Academic Filters)
  const filteredSubjects = useMemo(() => {
    return storeState.subjects.filter((s) => {
      // Step 1: Department match (Strict - do not display subjects belonging to unrelated departments)
      const matchDept = s.departmentCode === selectedSubjectDept;

      // Step 2: Academic filters
      const matchProg = subjectProgramFilter === "ALL" || s.programCode === subjectProgramFilter;
      const matchYear = subjectYearFilter === "ALL" || s.yearOfStudy === subjectYearFilter;
      
      let matchSem = true;
      if (subjectSemFilter === "ODD") {
        matchSem = s.semester % 2 === 1;
      } else if (subjectSemFilter === "EVEN") {
        matchSem = s.semester % 2 === 0;
      } else if (subjectSemFilter !== "ALL") {
        matchSem = String(s.semester) === subjectSemFilter;
      }

      const matchType = subjectTypeFilter === "ALL" || s.type === subjectTypeFilter;
      const matchAcadYear = subjectAcadYearFilter === "ALL" || s.academicYear === subjectAcadYearFilter;

      const q = subjectSearch.toLowerCase().trim();
      const matchSearch = !q || s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);

      return matchDept && matchProg && matchYear && matchSem && matchType && matchAcadYear && matchSearch;
    });
  }, [storeState.subjects, selectedSubjectDept, subjectProgramFilter, subjectYearFilter, subjectSemFilter, subjectTypeFilter, subjectAcadYearFilter, subjectSearch]);

  const filteredPrograms = useMemo(() => {
    return storeState.programs.filter((p) => {
      const matchDept = selectedSubjectDept === "ALL" || p.departmentCode === selectedSubjectDept;
      const q = progSearch.toLowerCase().trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [storeState.programs, selectedSubjectDept, progSearch]);

  const filteredCycles = useMemo(() => {
    return storeState.examCycles.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(cycleSearch.toLowerCase()) ||
        c.academicYear.toLowerCase().includes(cycleSearch.toLowerCase()) ||
        c.department.toLowerCase().includes(cycleSearch.toLowerCase());
      const matchStatus = cycleStatusFilter === "ALL" || c.status === cycleStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [storeState.examCycles, cycleSearch, cycleStatusFilter]);

  const filteredGrievances = useMemo(() => {
    return storeState.grievances.filter((g) => {
      const matchSearch =
        g.title.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
        g.ticketNumber.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
        g.submittedBy.toLowerCase().includes(grievanceSearch.toLowerCase());
      const matchCat = grievanceCategoryFilter === "ALL" || g.category === grievanceCategoryFilter;
      const matchStat = grievanceStatusFilter === "ALL" || g.status === grievanceStatusFilter;
      return matchSearch && matchCat && matchStat;
    });
  }, [storeState.grievances, grievanceSearch, grievanceCategoryFilter, grievanceStatusFilter]);

  // Derived counts for Overview
  const totalStudents = storeState.users.filter((u) => u.role === UserRole.STUDENT).length * 310; // realistic strength
  const pendingApprovalsCount = storeState.timetables.filter((t) => t.status === "Submitted").length;

  // CSV Exporter
  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
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

  return (
    <div className="dash-shell">
      {/* =========================================================================
          1. VERTICAL LEFT SIDEBAR - Original Light Minimalist Theme
         ========================================================================= */}
      <aside className="dash-sidebar">
        {/* Brand Header */}
        <div className="dash-brand">
          <div className="dash-brand-icon-box">N</div>
          <div className="dash-brand-titles">
            <span className="dash-brand-title">Nexora</span>
            <span className="dash-brand-subtitle">Admin Console · Academic 2026-27</span>
          </div>
        </div>

        {/* 10 Sidebar Navigation Items */}
        <nav className="dash-nav" aria-label="Administrative Navigation">
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "overview" ? "active" : ""}`}
            onClick={() => handleMenuSelect("overview")}
          >
            <LayoutDashboard size={17} className="dash-nav-item-icon" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "users" ? "active" : ""}`}
            onClick={() => handleMenuSelect("users")}
          >
            <Users size={17} className="dash-nav-item-icon" />
            <span>User & Roles</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "departments" ? "active" : ""}`}
            onClick={() => handleMenuSelect("departments")}
          >
            <Building2 size={17} className="dash-nav-item-icon" />
            <span>Departments</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "programs" ? "active" : ""}`}
            onClick={() => handleMenuSelect("programs")}
          >
            <BookOpen size={17} className="dash-nav-item-icon" />
            <span>Programs & Subjects</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "cycles" ? "active" : ""}`}
            onClick={() => handleMenuSelect("cycles")}
          >
            <Calendar size={17} className="dash-nav-item-icon" />
            <span>Exam Cycles</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "approvals" ? "active" : ""}`}
            onClick={() => handleMenuSelect("approvals")}
          >
            <CalendarCheck2 size={17} className="dash-nav-item-icon" />
            <span>Timetable Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  backgroundColor: "var(--brand-primary)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "1px 7px",
                  borderRadius: "9999px",
                }}
              >
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "grievances" ? "active" : ""}`}
            onClick={() => handleMenuSelect("grievances")}
          >
            <AlertCircle size={17} className="dash-nav-item-icon" />
            <span>Grievances</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "reports" ? "active" : ""}`}
            onClick={() => handleMenuSelect("reports")}
          >
            <BarChart3 size={17} className="dash-nav-item-icon" />
            <span>Reports & Analytics</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "audit" ? "active" : ""}`}
            onClick={() => handleMenuSelect("audit")}
          >
            <FileText size={17} className="dash-nav-item-icon" />
            <span>Audit Logs</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "settings" ? "active" : ""}`}
            onClick={() => handleMenuSelect("settings")}
          >
            <Sliders size={17} className="dash-nav-item-icon" />
            <span>Policies & Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="dash-sidebar-footer">
          <div className="dash-status-indicator">
            <span className="dash-pulse-dot" />
            <span>Live System Online</span>
          </div>
          <span className="dash-version-caption">v1.2-enterprise</span>
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CANVAS AREA
         ========================================================================= */}
      <div className="dash-main">
        {/* Horizontal Top Navbar - Clean White Surface */}
        <header className="dash-topbar">
          {/* Search box */}
          <div className="dash-search-box">
            <Search size={15} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              className="dash-search-input"
              placeholder="Search academic data, users, exam cycles..."
              value={userSearch || deptSearch || progSearch || cycleSearch}
              onChange={(e) => {
                const val = e.target.value;
                setUserSearch(val);
                setDeptSearch(val);
                setProgSearch(val);
                setCycleSearch(val);
              }}
            />
          </div>

          {/* Right Controls */}
          <div className="dash-topbar-actions">
            {/* Quick Switch to Coordinator Dashboard */}
            <div className="dash-role-switcher" title="Switch active evaluation view">
              <button type="button" className="dash-role-btn active">
                Admin Console
              </button>
              <button
                type="button"
                className="dash-role-btn"
                onClick={() => {
                  if (onSwitchToCoordinator) onSwitchToCoordinator();
                  else auth.switchRole(UserRole.EXAM_COORDINATOR);
                }}
                title="Open Exam Coordinator Dashboard"
              >
                Coordinator
              </button>
            </div>

            {/* User Profile Pill */}
            <div
              className="dash-user-chip"
              onClick={() => {
                if (onLogout) onLogout();
                else auth.logout();
              }}
              title="Click to sign out"
            >
              <div className="dash-avatar-circle">SP</div>
              <div className="dash-user-details">
                <span className="dash-user-name">Sanika Patil</span>
                <span className="dash-user-role-label">System Administrator</span>
              </div>
              <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="dash-content">
          {/* Header & Title */}
          <div className="dash-page-header">
            <div className="dash-page-title-row">
              <div className="dash-page-icon-badge">
                {activeMenu === "overview" && <LayoutDashboard size={20} />}
                {activeMenu === "users" && <Users size={20} />}
                {activeMenu === "departments" && <Building2 size={20} />}
                {activeMenu === "programs" && <BookOpen size={20} />}
                {activeMenu === "cycles" && <Calendar size={20} />}
                {activeMenu === "approvals" && <CalendarCheck2 size={20} />}
                {activeMenu === "grievances" && <AlertCircle size={20} />}
                {activeMenu === "reports" && <BarChart3 size={20} />}
                {activeMenu === "audit" && <FileText size={20} />}
                {activeMenu === "settings" && <Sliders size={20} />}
              </div>
              <div>
                <h1 className="dash-page-title">
                  {activeMenu === "overview" && "Administrator Command Center"}
                  {activeMenu === "users" && "User Accounts & Role Permissions"}
                  {activeMenu === "departments" && "Academic Departments Roster"}
                  {activeMenu === "programs" && "Programs & Subject Curriculum Catalog"}
                  {activeMenu === "cycles" && "Examination Cycles Configuration"}
                  {activeMenu === "approvals" && "Timetable Verification & Approval Queue"}
                  {activeMenu === "grievances" && "Examination Grievance & Redressal Desk"}
                  {activeMenu === "reports" && "Institutional Analytics & Data Export"}
                  {activeMenu === "audit" && "System Audit Log & Immutable Trails (FR-20)"}
                  {activeMenu === "settings" && "Examination Governance Policies & Parameters"}
                </h1>
                <p className="dash-page-subtitle">
                  Institutional Scope: <strong>NEXORA University Examination Cell</strong> · Academic Year 2026-27
                </p>
              </div>
            </div>

            <div className="dash-breadcrumbs">
              <span>NEXORA</span>
              <span>/</span>
              <span>Admin</span>
              <span>/</span>
              <span style={{ color: "var(--brand-primary)", fontWeight: "600", textTransform: "capitalize" }}>
                {activeMenu}
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div
              style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                backgroundColor:
                  toast.type === "error"
                    ? "var(--status-danger-text, #991b1b)"
                    : toast.type === "info"
                    ? "var(--brand-primary, #2563eb)"
                    : "var(--status-success-text, #166534)",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "var(--radius-md, 8px)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                zIndex: 9999,
                fontWeight: "500",
                fontSize: "13.5px",
              }}
            >
              {toast.type === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{toast.message}</span>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: OVERVIEW (Interactive Stat Cards, Approvals, Cycles, Activities)
             ========================================================================= */}
          {activeMenu === "overview" && (
            <div>
              {/* 4 Summary Stat Cards linking to sections */}
              <div className="dash-stats-grid">
                <div
                  className="dash-stat-card"
                  onClick={() => handleMenuSelect("departments")}
                  title="Click to manage Departments"
                >
                  <div className="dash-stat-icon-wrapper" style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
                    <Building2 size={22} />
                  </div>
                  <div className="dash-stat-content">
                    <span className="dash-stat-title">Departments</span>
                    <span className="dash-stat-value">{storeState.departments.length}</span>
                    <span className="dash-stat-desc">Total academic branches & faculty</span>
                  </div>
                </div>

                <div
                  className="dash-stat-card"
                  onClick={() => handleMenuSelect("programs")}
                  title="Click to manage Programs & Subjects"
                >
                  <div className="dash-stat-icon-wrapper" style={{ backgroundColor: "#f0fdf4", color: "#166534" }}>
                    <BookOpen size={22} />
                  </div>
                  <div className="dash-stat-content">
                    <span className="dash-stat-title">Programs</span>
                    <span className="dash-stat-value">{storeState.programs.length}</span>
                    <span className="dash-stat-desc">{storeState.subjects.length} active subject offerings</span>
                  </div>
                </div>

                <div
                  className="dash-stat-card"
                  onClick={() => handleMenuSelect("users")}
                  title="Click to manage Users"
                >
                  <div className="dash-stat-icon-wrapper" style={{ backgroundColor: "#f8fafc", color: "#0f172a", border: "1px solid var(--border-default)" }}>
                    <Users size={22} />
                  </div>
                  <div className="dash-stat-content">
                    <span className="dash-stat-title">Students</span>
                    <span className="dash-stat-value">{totalStudents.toLocaleString()}</span>
                    <span className="dash-stat-desc">{storeState.users.length} registered system users</span>
                  </div>
                </div>

                <div
                  className="dash-stat-card"
                  onClick={() => handleMenuSelect("approvals")}
                  title="Click to review Pending Timetable Approvals"
                  style={{
                    borderColor: pendingApprovalsCount > 0 ? "var(--brand-primary)" : "var(--border-default)",
                    backgroundColor: pendingApprovalsCount > 0 ? "#f8faff" : "#ffffff",
                  }}
                >
                  <div
                    className="dash-stat-icon-wrapper"
                    style={{
                      backgroundColor: pendingApprovalsCount > 0 ? "#eff6ff" : "#f1f5f9",
                      color: pendingApprovalsCount > 0 ? "#2563eb" : "#64748b",
                    }}
                  >
                    <CalendarCheck2 size={22} />
                  </div>
                  <div className="dash-stat-content">
                    <span className="dash-stat-title">Pending Approvals</span>
                    <span className="dash-stat-value" style={{ color: pendingApprovalsCount > 0 ? "#2563eb" : "#0f172a" }}>
                      {pendingApprovalsCount}
                    </span>
                    <span className="dash-stat-desc">Coordinator timetable submissions</span>
                  </div>
                </div>
              </div>

              {/* Exam Cycle Overview & Pending Approvals Strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.7fr", gap: "20px", marginBottom: "24px" }}>
                {/* Exam Cycles Overview */}
                <div className="dash-card" style={{ margin: 0 }}>
                  <div className="dash-card-header">
                    <div className="dash-card-title-group">
                      <h3 className="dash-card-title">Exam Cycle Overview</h3>
                      <p className="dash-card-subtitle">Active and forthcoming assessment terms</p>
                    </div>
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-secondary"
                      onClick={() => handleMenuSelect("cycles")}
                    >
                      View All
                    </button>
                  </div>

                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {storeState.examCycles.slice(0, 3).map((cycle) => (
                        <div
                          key={cycle.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 14px",
                            backgroundColor: "var(--bg-subtle, #f8fafc)",
                            borderRadius: "var(--radius-md, 8px)",
                            border: "1px solid var(--border-default, #e2e8f0)",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>{cycle.name}</strong>
                              <span
                                className={`dash-pill-badge ${
                                  cycle.status === "In Progress"
                                    ? "badge-green"
                                    : cycle.status === "Configured"
                                    ? "badge-blue"
                                    : "badge-gray"
                                }`}
                              >
                                {cycle.status}
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                              {cycle.semesterType} · {cycle.examType} | {cycle.startDate} to {cycle.endDate}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="dash-btn-sm dash-btn-secondary"
                            onClick={() => {
                              setEditingCycle(cycle);
                              setShowAddCycleModal(false);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pending Timetable Approvals Queue */}
                <div className="dash-card" style={{ margin: 0 }}>
                  <div className="dash-card-header">
                    <div className="dash-card-title-group">
                      <h3 className="dash-card-title">Pending Timetable Approvals</h3>
                      <p className="dash-card-subtitle">Schedules awaiting administrative verification</p>
                    </div>
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-secondary"
                      onClick={() => handleMenuSelect("approvals")}
                    >
                      Open Queue
                    </button>
                  </div>

                  <div className="dash-table-container">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Cycle / Dept</th>
                          <th>Submitted By</th>
                          <th>Solver</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeState.timetables.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <strong>{t.cycleName}</strong>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.department}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: "12.5px" }}>{t.submittedBy}</span>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.submittedDate}</div>
                            </td>
                            <td>
                              <span className="dash-pill-badge badge-blue">{t.solverStatus}</span>
                            </td>
                            <td>
                              <span
                                className={`dash-pill-badge ${
                                  t.status === "Approved" || t.status === "Published"
                                    ? "badge-green"
                                    : t.status === "Revision Requested"
                                    ? "badge-orange"
                                    : "badge-blue"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="dash-btn-sm dash-btn-primary"
                                style={{ padding: "5px 10px", fontSize: "12px" }}
                                onClick={() => {
                                  setSelectedTimetableForReview(t);
                                  setShowRevisionForm(false);
                                  setShowRejectionForm(false);
                                }}
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Recent Administrative Activity & System Overview Trend */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Recent Activity */}
                <div className="dash-card" style={{ margin: 0 }}>
                  <div className="dash-card-header">
                    <div className="dash-card-title-group">
                      <h3 className="dash-card-title">Recent Administrative Activity</h3>
                      <p className="dash-card-subtitle">Real-time system actions and audit trail entries</p>
                    </div>
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-secondary"
                      onClick={() => handleMenuSelect("audit")}
                    >
                      View All Logs
                    </button>
                  </div>

                  <div style={{ padding: "16px 20px" }}>
                    {storeState.auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="dash-timeline-item">
                        <div
                          className="dash-timeline-dot"
                          style={{
                            backgroundColor:
                              log.status === "SUCCESS"
                                ? "var(--status-success-text, #166534)"
                                : log.status === "WARNING"
                                ? "var(--status-warning-text, #92400e)"
                                : "var(--brand-primary, #2563eb)",
                          }}
                        />
                        <div>
                          <div className="dash-timeline-title">{log.action.replace(/_/g, " ")}</div>
                          <div className="dash-timeline-desc">
                            <strong>{log.actor}</strong> ({log.role}): {log.details}
                          </div>
                        </div>
                        <span className="dash-timeline-time">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Overview Chart */}
                <div className="dash-card" style={{ margin: 0 }}>
                  <div className="dash-card-header">
                    <div className="dash-card-title-group">
                      <h3 className="dash-card-title">System Overview & Progress Trend</h3>
                      <p className="dash-card-subtitle">Scheduled examinations vs published schedules</p>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Last 6 Months</span>
                  </div>

                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <svg viewBox="0 0 500 180" style={{ width: "100%", height: "160px", overflow: "visible" }}>
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1" />

                      {/* Line 1: Exams Scheduled (Blue) */}
                      <path
                        d="M 50 130 C 130 115, 200 95, 270 70 C 340 55, 410 40, 470 30"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Line 2: Timetables Published (Green) */}
                      <path
                        d="M 50 145 C 130 135, 200 120, 270 95 C 340 85, 410 65, 470 45"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                        strokeLinecap="round"
                      />

                      {/* Data Dots */}
                      <circle cx="50" cy="130" r="4" fill="#2563eb" />
                      <circle cx="270" cy="70" r="4" fill="#2563eb" />
                      <circle cx="470" cy="30" r="4" fill="#2563eb" />

                      <circle cx="50" cy="145" r="4" fill="#16a34a" />
                      <circle cx="270" cy="95" r="4" fill="#16a34a" />
                      <circle cx="470" cy="45" r="4" fill="#16a34a" />

                      {/* X Labels */}
                      <text x="50" y="165" fontSize="11" fill="#64748b" textAnchor="middle">May 2026</text>
                      <text x="155" y="165" fontSize="11" fill="#64748b" textAnchor="middle">Jul 2026</text>
                      <text x="260" y="165" fontSize="11" fill="#64748b" textAnchor="middle">Sep 2026</text>
                      <text x="365" y="165" fontSize="11" fill="#64748b" textAnchor="middle">Nov 2026</text>
                      <text x="470" y="165" fontSize="11" fill="#64748b" textAnchor="middle">Jan 2027</text>
                    </svg>

                    <div style={{ display: "flex", gap: "20px", marginTop: "12px", fontSize: "12px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "12px", height: "3px", backgroundColor: "#2563eb" }} />
                        <strong>Exams Scheduled</strong>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "12px", height: "2px", backgroundColor: "#16a34a", borderTop: "2px dashed #16a34a" }} />
                        <strong>Timetables Published</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: USER & ROLES (Role-wise Tab Separation, Filters, Actions)
             ========================================================================= */}
          {activeMenu === "users" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Institutional Users & Role Management</h3>
                  <p className="dash-card-subtitle">
                    Role-segregated directory for Admin, Exam Coordinator, HOD, Faculty, and Student accounts
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-secondary"
                    onClick={() =>
                      handleExportCSV(
                        `Nexora_${roleLabelMap[activeUserRoleTab]}_Users`,
                        ["Identifier", "Name", "Email", "Role", "Department", "Status", "Created At"],
                        filteredUsers.map((u) => [u.identifier, u.name, u.email, u.role, u.department, u.status, u.createdAt])
                      )
                    }
                  >
                    <Download size={14} />
                    Export {roleLabelMap[activeUserRoleTab]} CSV
                  </button>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-primary"
                    onClick={() => setShowAddUserModal(true)}
                  >
                    <Plus size={14} />
                    Add {roleLabelMap[activeUserRoleTab]} User
                  </button>
                </div>
              </div>

              {/* Segmented Role Navigation Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "12px 20px 0 20px",
                  borderBottom: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  overflowX: "auto",
                }}
                role="tablist"
                aria-label="User Roles Navigation"
              >
                {[
                  { role: UserRole.ADMIN, label: "Admin" },
                  { role: UserRole.EXAM_COORDINATOR, label: "Exam Coordinator" },
                  { role: UserRole.HOD, label: "HOD" },
                  { role: UserRole.FACULTY, label: "Faculty" },
                  { role: UserRole.STUDENT, label: "Student" },
                ].map((tab) => {
                  const isActive = activeUserRoleTab === tab.role;
                  const count = roleCounts[tab.role] || 0;
                  return (
                    <button
                      key={tab.role}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveUserRoleTab(tab.role)}
                      style={{
                        padding: "9px 16px",
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "var(--brand-primary)" : "var(--text-secondary)",
                        borderBottom: isActive ? "2.5px solid var(--brand-primary)" : "2.5px solid transparent",
                        background: "none",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.15s ease",
                        marginBottom: "-1px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>{tab.label}</span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "1px 7px",
                          borderRadius: "9999px",
                          backgroundColor: isActive ? "var(--brand-surface, #eff6ff)" : "var(--bg-subtle, #f1f5f9)",
                          color: isActive ? "var(--brand-primary, #2563eb)" : "var(--text-muted, #64748b)",
                          border: isActive ? "1px solid var(--brand-border, #bfdbfe)" : "1px solid var(--border-default, #e2e8f0)",
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filters Strip */}
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border-default)",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  backgroundColor: "var(--bg-subtle)",
                }}
              >
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <input
                    type="text"
                    placeholder={`Search ${roleLabelMap[activeUserRoleTab]} by name, email, identifier...`}
                    className="dash-input"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-secondary)" }}>Department:</label>
                  <select
                    className="dash-select"
                    style={{ width: "200px" }}
                    value={userDeptFilter}
                    onChange={(e) => setUserDeptFilter(e.target.value)}
                  >
                    <option value="ALL">All Departments</option>
                    {storeState.departments.map((d) => (
                      <option key={d.code} value={d.name}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                    <option value="Central Administration">Central Administration</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-secondary)" }}>Status:</label>
                  <select
                    className="dash-select"
                    style={{ width: "130px" }}
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {(userSearch || userDeptFilter !== "ALL" || userStatusFilter !== "ALL") && (
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-secondary"
                    style={{ padding: "6px 10px", fontSize: "12px" }}
                    onClick={() => {
                      setUserSearch("");
                      setUserDeptFilter("ALL");
                      setUserStatusFilter("ALL");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Users Table */}
              <div className="dash-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Identifier</th>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "40px 20px" }}>
                          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <Users size={32} style={{ color: "var(--text-muted)", strokeWidth: 1.5 }} />
                            <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                              No {roleLabelMap[activeUserRoleTab]} users found
                            </strong>
                            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
                              {userSearch || userDeptFilter !== "ALL" || userStatusFilter !== "ALL"
                                ? `No ${roleLabelMap[activeUserRoleTab]} accounts match your search or filter criteria.`
                                : `There are currently no registered users assigned to the ${roleLabelMap[activeUserRoleTab]} role.`}
                            </p>
                            {(userSearch || userDeptFilter !== "ALL" || userStatusFilter !== "ALL") && (
                              <button
                                type="button"
                                className="dash-btn-sm dash-btn-secondary"
                                style={{ marginTop: "8px" }}
                                onClick={() => {
                                  setUserSearch("");
                                  setUserDeptFilter("ALL");
                                  setUserStatusFilter("ALL");
                                }}
                              >
                                Reset Search Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong style={{ fontFamily: "var(--font-mono)", fontSize: "12.5px", color: "var(--brand-primary)" }}>
                              {user.identifier}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</span>
                          </td>
                          <td>
                            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{user.email}</span>
                          </td>
                          <td>
                            <span
                              className={`dash-pill-badge ${
                                user.role === UserRole.ADMIN
                                  ? "badge-red"
                                  : user.role === UserRole.EXAM_COORDINATOR
                                  ? "badge-blue"
                                  : user.role === UserRole.HOD
                                  ? "badge-orange"
                                  : user.role === UserRole.FACULTY
                                  ? "badge-green"
                                  : "badge-gray"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: "13px" }}>{user.department}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                const res = AcademicDataStore.toggleUserStatus(user.id);
                                showToast(`User ${user.name} is now ${res.newStatus}.`);
                              }}
                              className={`dash-pill-badge ${user.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}
                              style={{ cursor: "pointer", border: "none" }}
                              title="Click to Activate/Deactivate"
                            >
                              {user.status === "ACTIVE" ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                              {user.status}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="dash-action-btn"
                                onClick={() => setEditingUser(user)}
                                title="Edit user details"
                              >
                                <Edit2 size={13} />
                                Edit
                              </button>
                              <button
                                type="button"
                                className="dash-action-btn"
                                style={{ color: "var(--status-danger-text)" }}
                                onClick={() => setDeletingUser(user)}
                                title="Delete user account"
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

          {/* =========================================================================
              VIEW 3: DEPARTMENTS (Add with duplicate code reject, Edit, View, Delete)
             ========================================================================= */}
          {activeMenu === "departments" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Academic Departments & Branches</h3>
                  <p className="dash-card-subtitle">
                    Department codes, designated HOD leadership, and registered student cohorts
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-secondary"
                    onClick={() =>
                      handleExportCSV(
                        "Nexora_Departments",
                        ["Code", "Department Name", "Head of Department", "Student Strength", "Programs", "Faculty"],
                        storeState.departments.map((d) => [d.code, d.name, d.hodName, d.studentStrength, d.programsCount, d.facultyCount])
                      )
                    }
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-primary"
                    onClick={() => setShowAddDeptModal(true)}
                  >
                    <Plus size={14} />
                    Register Department
                  </button>
                </div>
              </div>

              {/* Filter */}
              <div style={{ padding: "12px 22px", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-subtle)" }}>
                <input
                  type="text"
                  placeholder="Filter departments by code, title, or HOD name..."
                  className="dash-input"
                  style={{ maxWidth: "380px" }}
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                />
              </div>

              {/* Departments Table */}
              <div className="dash-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Dept Code</th>
                      <th>Department Name</th>
                      <th>Head of Department (HOD)</th>
                      <th>Student Strength</th>
                      <th>Academic Programs</th>
                      <th>Faculty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.map((dept) => (
                      <tr key={dept.id}>
                        <td>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: "700",
                              color: "var(--brand-primary)",
                              backgroundColor: "var(--brand-surface)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {dept.code}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: "var(--text-primary)" }}>{dept.name}</strong>
                        </td>
                        <td>
                          <span style={{ color: "var(--text-secondary)" }}>{dept.hodName}</span>
                        </td>
                        <td>
                          <strong>{dept.studentStrength.toLocaleString()}</strong> candidates
                        </td>
                        <td>
                          <span className="dash-pill-badge badge-blue">{dept.programsCount} Programs</span>
                        </td>
                        <td>
                          <span className="dash-pill-badge badge-green">{dept.facultyCount} Members</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="dash-action-btn"
                              onClick={() => setViewingDept(dept)}
                              title="View Department details"
                            >
                              <Eye size={13} />
                              View
                            </button>
                            <button
                              type="button"
                              className="dash-action-btn"
                              onClick={() => setEditingDept(dept)}
                              title="Edit department"
                            >
                              <Edit2 size={13} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="dash-action-btn"
                              style={{ color: "var(--status-danger-text)" }}
                              onClick={() => setDeletingDept(dept)}
                              title="Delete department"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: PROGRAMS & SUBJECTS (Department-wise Academic Management)
             ========================================================================= */}
          {activeMenu === "programs" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Academic Programs & Subjects Management</h3>
                  <p className="dash-card-subtitle">
                    Department-driven curriculum architecture, credit configurations, and semester syllabi
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-secondary"
                    onClick={() =>
                      handleExportCSV(
                        `Nexora_${selectedSubjectDept}_Curriculum`,
                        ["Subject Code", "Subject Name", "Department", "Program", "Year", "Semester", "Type", "Credits", "L-T-P", "Status"],
                        filteredSubjects.map((s) => [
                          s.code,
                          s.title,
                          s.departmentCode,
                          s.programCode,
                          s.yearOfStudy,
                          s.semester,
                          s.type,
                          s.credits,
                          `${s.lectureHours}-${s.tutorialHours}-${s.practicalHours}`,
                          s.status,
                        ])
                      )
                    }
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                  {programTab === "programs" ? (
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-primary"
                      onClick={() => setShowAddProgramModal(true)}
                    >
                      <Plus size={14} />
                      Add Program
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-primary"
                      onClick={() => setShowAddSubjectModal(true)}
                    >
                      <Plus size={14} />
                      Add Subject
                    </button>
                  )}
                </div>
              </div>

              {/* Step 1: Department Selection Bar */}
              <div
                style={{
                  padding: "16px 22px",
                  borderBottom: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Building2 size={18} style={{ color: "var(--brand-primary)" }} />
                    <label style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                      Academic Department:
                    </label>
                  </div>
                  <select
                    className="dash-select"
                    style={{
                      width: "320px",
                      fontWeight: 600,
                      backgroundColor: "var(--bg-subtle)",
                      border: "1.5px solid var(--border-default)",
                    }}
                    value={selectedSubjectDept}
                    onChange={(e) => {
                      setSelectedSubjectDept(e.target.value);
                      setSubjectProgramFilter("ALL");
                    }}
                  >
                    {storeState.departments.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-tab Navigation: Subjects vs Programs */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setProgramTab("subjects")}
                    className={`dash-btn-sm ${programTab === "subjects" ? "dash-btn-primary" : "dash-btn-secondary"}`}
                  >
                    <BookOpen size={14} />
                    Subjects Catalog ({filteredSubjects.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramTab("programs")}
                    className={`dash-btn-sm ${programTab === "programs" ? "dash-btn-primary" : "dash-btn-secondary"}`}
                  >
                    <Sliders size={14} />
                    Degree Programs ({deptPrograms.length})
                  </button>
                </div>
              </div>

              {/* Step 2: Academic Filters (shown when Subjects sub-tab is active) */}
              {programTab === "subjects" && (
                <div
                  style={{
                    padding: "14px 22px",
                    borderBottom: "1px solid var(--border-default)",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    backgroundColor: "var(--bg-subtle)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <input
                      type="text"
                      placeholder="Search subject by code or name..."
                      className="dash-input"
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                    />
                  </div>

                  {/* Academic Year */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Acad Year:</label>
                    <select
                      className="dash-select"
                      style={{ width: "115px", padding: "6px 10px", fontSize: "12.5px" }}
                      value={subjectAcadYearFilter}
                      onChange={(e) => setSubjectAcadYearFilter(e.target.value)}
                    >
                      <option value="ALL">All Years</option>
                      <option value="2026-27">2026-27</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2024-25">2024-25</option>
                    </select>
                  </div>

                  {/* Dependent Program / Course (only programs under selected department!) */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Program:</label>
                    <select
                      className="dash-select"
                      style={{ width: "150px", padding: "6px 10px", fontSize: "12.5px" }}
                      value={subjectProgramFilter}
                      onChange={(e) => setSubjectProgramFilter(e.target.value)}
                    >
                      <option value="ALL">All Programs</option>
                      {deptPrograms.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year of Study */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Year:</label>
                    <select
                      className="dash-select"
                      style={{ width: "110px", padding: "6px 10px", fontSize: "12.5px" }}
                      value={subjectYearFilter}
                      onChange={(e) => setSubjectYearFilter(e.target.value)}
                    >
                      <option value="ALL">All Years</option>
                      <option value="First">First Year</option>
                      <option value="Second">Second Year</option>
                      <option value="Third">Third Year</option>
                      <option value="Fourth">Fourth Year</option>
                    </select>
                  </div>

                  {/* Semester: Grouped Odd/Even and valid semester numbers */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Semester:</label>
                    <select
                      className="dash-select"
                      style={{ width: "120px", padding: "6px 10px", fontSize: "12.5px" }}
                      value={subjectSemFilter}
                      onChange={(e) => setSubjectSemFilter(e.target.value)}
                    >
                      <option value="ALL">All Semesters</option>
                      <optgroup label="Semester Groups">
                        <option value="ODD">Odd Semesters (1, 3, 5, 7)</option>
                        <option value="EVEN">Even Semesters (2, 4, 6, 8)</option>
                      </optgroup>
                      <optgroup label="Specific Semesters">
                        {availableSemesters.map((sem) => (
                          <option key={sem} value={String(sem)}>
                            Semester {sem}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Subject Type */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Type:</label>
                    <select
                      className="dash-select"
                      style={{ width: "120px", padding: "6px 10px", fontSize: "12.5px" }}
                      value={subjectTypeFilter}
                      onChange={(e) => setSubjectTypeFilter(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Lab">Lab</option>
                      <option value="Project">Project</option>
                      <option value="Elective">Elective</option>
                      <option value="Seminar">Seminar</option>
                    </select>
                  </div>

                  {(subjectSearch ||
                    subjectAcadYearFilter !== "ALL" ||
                    subjectProgramFilter !== "ALL" ||
                    subjectYearFilter !== "ALL" ||
                    subjectSemFilter !== "ALL" ||
                    subjectTypeFilter !== "ALL") && (
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-secondary"
                      style={{ padding: "5px 9px", fontSize: "11.5px" }}
                      onClick={() => {
                        setSubjectSearch("");
                        setSubjectAcadYearFilter("ALL");
                        setSubjectProgramFilter("ALL");
                        setSubjectYearFilter("ALL");
                        setSubjectSemFilter("ALL");
                        setSubjectTypeFilter("ALL");
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Subjects Table (Subject Code, Subject Name, Year, Semester, Type, Credits, L-T-P, Status, Actions) */}
              {programTab === "subjects" && (
                <div className="dash-table-container">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Year</th>
                        <th>Semester</th>
                        <th>Subject Type</th>
                        <th>Credits</th>
                        <th>L-T-P Hours</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                              <BookOpen size={32} style={{ color: "var(--text-muted)", strokeWidth: 1.5 }} />
                              <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                                No subjects found for {selectedSubjectDept}
                              </strong>
                              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
                                No curriculum subjects match the selected academic year, program, year of study, semester, or type filters.
                              </p>
                              <button
                                type="button"
                                className="dash-btn-sm dash-btn-primary"
                                style={{ marginTop: "8px" }}
                                onClick={() => setShowAddSubjectModal(true)}
                              >
                                <Plus size={13} />
                                Add Subject to {selectedSubjectDept}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredSubjects.map((sub) => (
                          <tr key={sub.id}>
                            <td>
                              <strong style={{ fontFamily: "var(--font-mono)", color: "var(--brand-primary)", fontSize: "13px" }}>
                                {sub.code}
                              </strong>
                            </td>
                            <td>
                              <div>
                                <strong style={{ color: "var(--text-primary)", fontSize: "13.5px" }}>{sub.title}</strong>
                                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                                  Program: {sub.programCode} · Cohort: {sub.academicYear}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: "13px", fontWeight: 500 }}>{sub.yearOfStudy} Year</span>
                            </td>
                            <td>
                              <span className="dash-pill-badge badge-blue">Semester {sub.semester}</span>
                            </td>
                            <td>
                              <span
                                className={`dash-pill-badge ${
                                  sub.type === "Theory"
                                    ? "badge-blue"
                                    : sub.type === "Practical" || sub.type === "Lab"
                                    ? "badge-orange"
                                    : sub.type === "Project"
                                    ? "badge-green"
                                    : "badge-gray"
                                }`}
                              >
                                {sub.type}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>
                                {sub.credits} Credits
                              </strong>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "12px",
                                  backgroundColor: "var(--bg-subtle)",
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  border: "1px solid var(--border-default)",
                                }}
                                title="Lecture - Tutorial - Practical hours"
                              >
                                {sub.lectureHours}-{sub.tutorialHours}-{sub.practicalHours}
                              </span>
                            </td>
                            <td>
                              <span className={`dash-pill-badge ${sub.status === "Active" ? "badge-green" : "badge-gray"}`}>
                                {sub.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  type="button"
                                  className="dash-action-btn"
                                  onClick={() => setEditingSubject(sub)}
                                  title="Edit subject course details"
                                >
                                  <Edit2 size={13} />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="dash-action-btn"
                                  style={{ color: "var(--status-danger-text)" }}
                                  onClick={() => setDeletingSubject(sub)}
                                  title="Delete subject course"
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

              {/* Step 6: Program Management (Degree Programs belonging to selected department) */}
              {programTab === "programs" && (
                <div>
                  <div
                    style={{
                      padding: "12px 22px",
                      borderBottom: "1px solid var(--border-default)",
                      backgroundColor: "var(--bg-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      Registered Degree Programs under <strong>{selectedSubjectDept}</strong> ({filteredPrograms.length} programs)
                    </span>
                    <input
                      type="text"
                      placeholder="Search programs by code or name..."
                      className="dash-input"
                      style={{ width: "260px", padding: "6px 12px" }}
                      value={progSearch}
                      onChange={(e) => setProgSearch(e.target.value)}
                    />
                  </div>

                  <div className="dash-table-container">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Program Code</th>
                          <th>Program Title</th>
                          <th>Department</th>
                          <th>Degree Level</th>
                          <th>Duration</th>
                          <th>Current Cohort</th>
                          <th>Associated Subjects</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPrograms.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: "center", padding: "36px 20px" }}>
                              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                                No degree programs registered under {selectedSubjectDept}.
                              </p>
                              <button
                                type="button"
                                className="dash-btn-sm dash-btn-primary"
                                style={{ marginTop: "10px" }}
                                onClick={() => setShowAddProgramModal(true)}
                              >
                                <Plus size={13} />
                                Register Program
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredPrograms.map((prog) => {
                            const programSubjectsCount = storeState.subjects.filter((s) => s.programCode === prog.code).length;
                            return (
                              <tr key={prog.id}>
                                <td>
                                  <strong style={{ fontFamily: "var(--font-mono)", color: "var(--brand-primary)", fontSize: "13px" }}>
                                    {prog.code}
                                  </strong>
                                </td>
                                <td>
                                  <strong>{prog.name}</strong>
                                </td>
                                <td>
                                  <span className="dash-pill-badge badge-blue">{prog.departmentCode}</span>
                                </td>
                                <td>
                                  <span className="dash-pill-badge badge-gray">{prog.degreeLevel}</span>
                                </td>
                                <td>{prog.durationYears} Years</td>
                                <td>{prog.currentStrength} Enrolled</td>
                                <td>
                                  <button
                                    type="button"
                                    className="dash-action-btn"
                                    style={{ color: "var(--brand-primary)", fontWeight: 600 }}
                                    onClick={() => {
                                      setProgramTab("subjects");
                                      setSubjectProgramFilter(prog.code);
                                    }}
                                    title="View all subjects registered under this program"
                                  >
                                    <BookOpen size={13} />
                                    {programSubjectsCount} Subjects
                                  </button>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      type="button"
                                      className="dash-action-btn"
                                      onClick={() => setEditingProgram(prog)}
                                      title="Edit degree program"
                                    >
                                      <Edit2 size={13} />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="dash-action-btn"
                                      style={{ color: "var(--status-danger-text)" }}
                                      onClick={() => setDeletingProgram(prog)}
                                      title="Delete degree program"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 5: EXAM CYCLES (Actionable Creation, Validation, Independent Odd/Even & MSE/ESE)
             ========================================================================= */}
          {activeMenu === "cycles" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Examination Cycles Management</h3>
                  <p className="dash-card-subtitle">
                    Configure independent Semesters (Odd/Even) and Exam Types (MSE/ESE/Makeup/Lab)
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-secondary"
                    onClick={() =>
                      handleExportCSV(
                        "Nexora_Exam_Cycles",
                        ["Name", "Academic Year", "Semester", "Exam Type", "Start Date", "End Date", "Status", "Subjects"],
                        storeState.examCycles.map((c) => [
                          c.name,
                          c.academicYear,
                          c.semesterType,
                          c.examType,
                          c.startDate,
                          c.endDate,
                          c.status,
                          c.applicableSubjectsCount,
                        ])
                      )
                    }
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-primary"
                    onClick={() => setShowAddCycleModal(true)}
                  >
                    <Plus size={14} />
                    Create Exam Cycle
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div
                style={{
                  padding: "14px 22px",
                  borderBottom: "1px solid var(--border-default)",
                  display: "flex",
                  gap: "12px",
                  backgroundColor: "var(--bg-subtle)",
                }}
              >
                <input
                  type="text"
                  placeholder="Filter cycles by title, academic year, department..."
                  className="dash-input"
                  style={{ maxWidth: "340px" }}
                  value={cycleSearch}
                  onChange={(e) => setCycleSearch(e.target.value)}
                />
                <select
                  className="dash-select"
                  style={{ width: "160px" }}
                  value={cycleStatusFilter}
                  onChange={(e) => setCycleStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Configured">Configured</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Table */}
              <div className="dash-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Exam Cycle Name</th>
                      <th>Academic Year</th>
                      <th>Semester (Independent)</th>
                      <th>Exam Type (Independent)</th>
                      <th>Assessment Window</th>
                      <th>Daily Sessions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCycles.map((cycle) => (
                      <tr key={cycle.id}>
                        <td>
                          <strong style={{ color: "var(--text-primary)" }}>{cycle.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Cohort: {cycle.yearLevel} ({cycle.division})
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono)" }}>{cycle.academicYear}</span>
                        </td>
                        <td>
                          <span
                            className={`dash-pill-badge ${
                              cycle.semesterType === "Odd Semester" ? "badge-blue" : "badge-orange"
                            }`}
                          >
                            {cycle.semesterType}
                          </span>
                        </td>
                        <td>
                          <span className="dash-pill-badge badge-green">{cycle.examType}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: "12.5px", fontWeight: "600" }}>{cycle.startDate}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>to {cycle.endDate}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px" }}>{cycle.sessionWindow}</span>
                        </td>
                        <td>
                          <span
                            className={`dash-pill-badge ${
                              cycle.status === "In Progress"
                                ? "badge-green"
                                : cycle.status === "Configured"
                                ? "badge-blue"
                                : cycle.status === "Completed"
                                ? "badge-gray"
                                : "badge-orange"
                            }`}
                          >
                            {cycle.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="dash-action-btn"
                              onClick={() => setEditingCycle(cycle)}
                            >
                              <Edit2 size={13} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="dash-action-btn"
                              style={{ color: "var(--status-danger-text)" }}
                              onClick={() => setDeletingCycle(cycle)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 6: TIMETABLE APPROVALS (Actionable Review, Approve, Revision, Reject)
             ========================================================================= */}
          {activeMenu === "approvals" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Timetable Approvals Queue</h3>
                  <p className="dash-card-subtitle">
                    Actionable verification of Exam Coordinator submissions with clash validation
                  </p>
                </div>
              </div>

              <div className="dash-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Cycle / Department</th>
                      <th>Submitted By</th>
                      <th>Solver Result</th>
                      <th>Clashes Detected</th>
                      <th>Room Utilization</th>
                      <th>Approval Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.timetables.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <strong>{t.cycleName}</strong>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.program}</div>
                        </td>
                        <td>
                          <div>{t.submittedBy}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.submittedDate}</div>
                        </td>
                        <td>
                          <span className="dash-pill-badge badge-blue">{t.solverStatus}</span>
                        </td>
                        <td>
                          <span
                            className={`dash-pill-badge ${t.clashesCount === 0 ? "badge-green" : "badge-red"}`}
                          >
                            {t.clashesCount} Clashes
                          </span>
                        </td>
                        <td>
                          <strong>{t.roomUtilization}</strong>
                        </td>
                        <td>
                          <span
                            className={`dash-pill-badge ${
                              t.status === "Approved" || t.status === "Published"
                                ? "badge-green"
                                : t.status === "Revision Requested"
                                ? "badge-orange"
                                : t.status === "Submitted"
                                ? "badge-blue"
                                : "badge-gray"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="dash-btn-sm dash-btn-primary"
                            onClick={() => {
                              setSelectedTimetableForReview(t);
                              setShowRevisionForm(false);
                              setShowRejectionForm(false);
                            }}
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 7: GRIEVANCES & COMPLAINTS DESK
             ========================================================================= */}
          {activeMenu === "grievances" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Examination Grievance & Redressal Desk</h3>
                  <p className="dash-card-subtitle">
                    Manage scheduling clashes, facility inquiries, and student accommodations
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-btn-sm dash-btn-primary"
                  onClick={() => setShowAddGrievanceModal(true)}
                >
                  <Plus size={14} />
                  Log Grievance Ticket
                </button>
              </div>

              {/* Filters */}
              <div
                style={{
                  padding: "12px 22px",
                  borderBottom: "1px solid var(--border-default)",
                  display: "flex",
                  gap: "12px",
                  backgroundColor: "var(--bg-subtle)",
                }}
              >
                <input
                  type="text"
                  placeholder="Search grievance tickets..."
                  className="dash-input"
                  style={{ maxWidth: "300px" }}
                  value={grievanceSearch}
                  onChange={(e) => setGrievanceSearch(e.target.value)}
                />

                <select
                  className="dash-select"
                  style={{ width: "180px" }}
                  value={grievanceCategoryFilter}
                  onChange={(e) => setGrievanceCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Scheduling Clash">Scheduling Clash</option>
                  <option value="Venue Facility">Venue Facility</option>
                  <option value="Special Accommodation">Special Accommodation</option>
                  <option value="Hall Ticket Issue">Hall Ticket Issue</option>
                </select>

                <select
                  className="dash-select"
                  style={{ width: "150px" }}
                  value={grievanceStatusFilter}
                  onChange={(e) => setGrievanceStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Table */}
              <div className="dash-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject / Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Applicant</th>
                      <th>Assigned Desk</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrievances.map((grv) => (
                      <tr key={grv.id}>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: "700" }}>
                            {grv.ticketNumber}
                          </span>
                        </td>
                        <td>
                          <strong>{grv.title}</strong>
                        </td>
                        <td>
                          <span className="dash-pill-badge badge-blue">{grv.category}</span>
                        </td>
                        <td>
                          <span
                            className={`dash-pill-badge ${
                              grv.priority === "High" ? "badge-red" : grv.priority === "Medium" ? "badge-orange" : "badge-gray"
                            }`}
                          >
                            {grv.priority}
                          </span>
                        </td>
                        <td>
                          <div>{grv.submittedBy}</div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{grv.userRole}</span>
                        </td>
                        <td>{grv.assignedTo}</td>
                        <td>
                          <span
                            className={`dash-pill-badge ${
                              grv.status === "Resolved"
                                ? "badge-green"
                                : grv.status === "In Review"
                                ? "badge-blue"
                                : grv.status === "Open"
                                ? "badge-orange"
                                : "badge-gray"
                            }`}
                          >
                            {grv.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="dash-action-btn"
                            onClick={() => {
                              setViewingGrievance(grv);
                              setGrievanceNoteInput("");
                            }}
                          >
                            <Eye size={13} />
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 8: REPORTS & ANALYTICS
             ========================================================================= */}
          {activeMenu === "reports" && (
            <div>
              {/* Disclosure banner */}
              <div
                style={{
                  padding: "12px 18px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={18} style={{ color: "var(--brand-primary)" }} />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Institutional reports are synthesized from certified academic data records.
                  </span>
                </div>
                <button
                  type="button"
                  className="dash-btn-sm dash-btn-primary"
                  onClick={() =>
                    handleExportCSV(
                      "Nexora_Full_Department_Summary",
                      ["Dept Code", "Department Name", "Student Count", "Programs Count", "Faculty Count"],
                      storeState.departments.map((d) => [d.code, d.name, d.studentStrength, d.programsCount, d.facultyCount])
                    )
                  }
                >
                  <Download size={14} />
                  Download Full Analytical CSV
                </button>
              </div>

              {/* Department Summary Table */}
              <div className="dash-card" style={{ marginBottom: "24px" }}>
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Department-wise Examination Summary</h3>
                    <p className="dash-card-subtitle">Aggregated student strength, offerings, and leadership</p>
                  </div>
                </div>

                <div className="dash-table-container">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>HOD Name</th>
                        <th>Registered Students</th>
                        <th>Courses Offered</th>
                        <th>Active Faculty</th>
                        <th>Utilization Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeState.departments.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <strong>{d.name}</strong> ({d.code})
                          </td>
                          <td>{d.hodName}</td>
                          <td>{d.studentStrength} candidates</td>
                          <td>{d.programsCount * 4} papers</td>
                          <td>{d.facultyCount} members</td>
                          <td>
                            <span className="dash-pill-badge badge-green">Balanced Capacity</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Faculty Workload Table */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Faculty Invigilation Workload Distribution</h3>
                    <p className="dash-card-subtitle">Workload equity adherence (≤ 3 duties/week cap)</p>
                  </div>
                </div>

                <div className="dash-table-container">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Faculty Identifier</th>
                        <th>Faculty Member</th>
                        <th>Department</th>
                        <th>Assigned Duties</th>
                        <th>Cap Limit</th>
                        <th>Workload Equity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeState.users
                        .filter((u) => u.role === UserRole.FACULTY)
                        .map((f, i) => (
                          <tr key={f.id}>
                            <td>
                              <strong style={{ fontFamily: "var(--font-mono)" }}>{f.identifier}</strong>
                            </td>
                            <td>{f.name}</td>
                            <td>{f.department}</td>
                            <td>{i % 2 === 0 ? "2 Duties" : "1 Duty"}</td>
                            <td>3 Duties/wk</td>
                            <td>
                              <span className="dash-pill-badge badge-green">Within Limits</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 9: AUDIT LOGS (Immutable History FR-20)
             ========================================================================= */}
          {activeMenu === "audit" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">System Audit Log Trail</h3>
                  <p className="dash-card-subtitle">
                    Immutable chronological record of administrative actions (Requirement FR-20)
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-btn-sm dash-btn-secondary"
                  onClick={() =>
                    handleExportCSV(
                      "Nexora_Audit_Trail",
                      ["Timestamp", "Actor", "Role", "Action", "Entity", "Details", "Status"],
                      storeState.auditLogs.map((l) => [l.timestamp, l.actor, l.role, l.action, l.entityType, l.details, l.status])
                    )
                  }
                >
                  <Download size={14} />
                  Export Audit Trail
                </button>
              </div>

              <div className="dash-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Actor</th>
                      <th>Role</th>
                      <th>Action Code</th>
                      <th>Entity</th>
                      <th>Action Summary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                            {log.timestamp}
                          </span>
                        </td>
                        <td>
                          <strong>{log.actor}</strong>
                        </td>
                        <td>
                          <span className="dash-pill-badge badge-blue">{log.role}</span>
                        </td>
                        <td>
                          <code style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-primary)" }}>
                            {log.action}
                          </code>
                        </td>
                        <td>
                          <span className="dash-pill-badge badge-gray">{log.entityType}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "13px" }}>{log.details}</span>
                        </td>
                        <td>
                          <span
                            className={`dash-pill-badge ${
                              log.status === "SUCCESS" ? "badge-green" : log.status === "WARNING" ? "badge-orange" : "badge-blue"
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
          )}

          {/* =========================================================================
              VIEW 10: POLICIES & SETTINGS (Actionable Configuration)
             ========================================================================= */}
          {activeMenu === "settings" && (
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Institutional Examination Policies & Parameters</h3>
                  <p className="dash-card-subtitle">
                    Configure faculty workload limits, daily session windows, and conflict rules
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-btn-sm dash-btn-secondary"
                  onClick={() => {
                    AcademicDataStore.resetToDefaults();
                    showToast("Restored default policies and initial system parameters.");
                  }}
                >
                  <RotateCcw size={14} />
                  Restore System Defaults
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  AcademicDataStore.updatePolicies(policyForm);
                  showToast("Examination policies updated and active across system.");
                }}
                style={{ padding: "24px" }}
              >
                {/* Faculty Workload */}
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                    1. Faculty Invigilation Workload Policy
                  </h4>
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Hard constraint limit enforced during invigilator allocation.
                  </p>

                  <div style={{ maxWidth: "300px" }}>
                    <label className="dash-label">Maximum Duties per Faculty per Week *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      className="dash-input"
                      value={policyForm.maxDutiesPerFaculty}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, maxDutiesPerFaculty: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--border-default)", margin: "24px 0" }} />

                {/* Session Windows */}
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                    2. Daily Examination Session Windows (IST)
                  </h4>
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Standard morning and afternoon assessment time slots.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "600px" }}>
                    <div>
                      <label className="dash-label">Morning Slot (Start & End) *</label>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="time"
                          required
                          className="dash-input"
                          value={policyForm.morningSlotStart}
                          onChange={(e) => setPolicyForm({ ...policyForm, morningSlotStart: e.target.value })}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          required
                          className="dash-input"
                          value={policyForm.morningSlotEnd}
                          onChange={(e) => setPolicyForm({ ...policyForm, morningSlotEnd: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="dash-label">Afternoon Slot (Start & End) *</label>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="time"
                          required
                          className="dash-input"
                          value={policyForm.afternoonSlotStart}
                          onChange={(e) => setPolicyForm({ ...policyForm, afternoonSlotStart: e.target.value })}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          required
                          className="dash-input"
                          value={policyForm.afternoonSlotEnd}
                          onChange={(e) => setPolicyForm({ ...policyForm, afternoonSlotEnd: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--border-default)", margin: "24px 0" }} />

                {/* Conflict & Seating Governance */}
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                    3. Integrity & Accessibility Rules
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={policyForm.mandatoryAlternatingBranches}
                        onChange={(e) =>
                          setPolicyForm({ ...policyForm, mandatoryAlternatingBranches: e.target.checked })
                        }
                      />
                      <span>
                        <strong>Mandatory Alternating Branch Seating:</strong> Disallow students of the same department/branch from sitting on adjacent desks.
                      </span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={policyForm.wheelchairDeskMandatory}
                        onChange={(e) =>
                          setPolicyForm({ ...policyForm, wheelchairDeskMandatory: e.target.checked })
                        }
                      />
                      <span>
                        <strong>Ground-Floor Wheelchair Guarantee:</strong> Enforce barrier-free ground floor hall allocations for accommodation requests.
                      </span>
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button type="submit" className="dash-btn-sm dash-btn-primary" style={{ padding: "8px 20px" }}>
                    Save Policy Configuration
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* MODAL 1: ADD USER */}
      {showAddUserModal && (
        <div className="dash-modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Add New Institutional User</h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("userName") as HTMLInputElement).value;
                const email = (form.elements.namedItem("userEmail") as HTMLInputElement).value;
                const role = (form.elements.namedItem("userRole") as HTMLSelectElement).value as UserRole;
                const dept = (form.elements.namedItem("userDept") as HTMLSelectElement).value;
                const id = (form.elements.namedItem("userId") as HTMLInputElement).value;

                const res = AcademicDataStore.addUser({
                  name,
                  email,
                  role,
                  department: dept,
                  identifier: id,
                  status: "ACTIVE",
                });

                if (!res.success) {
                  showToast(res.error || "Failed to add user.", "error");
                  return;
                }

                showToast(`User ${name} created successfully.`);
                setShowAddUserModal(false);
              }}
            >
              <div className="dash-modal-body">
                <div className="dash-form-group">
                  <label className="dash-label">Full Name *</label>
                  <input name="userName" type="text" required placeholder="e.g. Dr. Rajesh Sharma" className="dash-input" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Institutional Email *</label>
                    <input name="userEmail" type="email" required placeholder="name@nexora.edu" className="dash-input" />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Identifier (Roll/Employee Code) *</label>
                    <input name="userId" type="text" required placeholder="e.g. FAC-2041 or CS2023-080" className="dash-input" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Role *</label>
                    <select name="userRole" className="dash-select" defaultValue={activeUserRoleTab} key={activeUserRoleTab}>
                      <option value={UserRole.ADMIN}>System Administrator</option>
                      <option value={UserRole.EXAM_COORDINATOR}>Exam Coordinator</option>
                      <option value={UserRole.HOD}>Department HOD</option>
                      <option value={UserRole.FACULTY}>Faculty / Invigilator</option>
                      <option value={UserRole.STUDENT}>Student</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Department *</label>
                    <select name="userDept" className="dash-select">
                      {storeState.departments.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                      <option value="Central Administration">Central Administration</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="dash-modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Edit User Details: {editingUser.name}</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("editName") as HTMLInputElement).value;
                const email = (form.elements.namedItem("editEmail") as HTMLInputElement).value;
                const role = (form.elements.namedItem("editRole") as HTMLSelectElement).value as UserRole;
                const dept = (form.elements.namedItem("editDept") as HTMLSelectElement).value;

                const res = AcademicDataStore.updateUser(editingUser.id, {
                  name,
                  email,
                  role,
                  department: dept,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to update.", "error");
                  return;
                }

                showToast(`User ${name} updated.`);
                setEditingUser(null);
              }}
            >
              <div className="dash-modal-body">
                <div className="dash-form-group">
                  <label className="dash-label">Full Name *</label>
                  <input name="editName" type="text" defaultValue={editingUser.name} required className="dash-input" />
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Email Address *</label>
                  <input name="editEmail" type="email" defaultValue={editingUser.email} required className="dash-input" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Role *</label>
                    <select name="editRole" defaultValue={editingUser.role} className="dash-select">
                      <option value={UserRole.ADMIN}>System Administrator</option>
                      <option value={UserRole.EXAM_COORDINATOR}>Exam Coordinator</option>
                      <option value={UserRole.HOD}>Department HOD</option>
                      <option value={UserRole.FACULTY}>Faculty / Invigilator</option>
                      <option value={UserRole.STUDENT}>Student</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Department *</label>
                    <select name="editDept" defaultValue={editingUser.department} className="dash-select">
                      {storeState.departments.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                      <option value="Central Administration">Central Administration</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE USER CONFIRMATION */}
      {deletingUser && (
        <div className="dash-modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Confirm Account Deletion</h3>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: "1.6" }}>
                Are you sure you want to delete user account <strong>{deletingUser.name}</strong> ({deletingUser.identifier})?
              </p>
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px 14px",
                  backgroundColor: "var(--status-warning-bg)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--status-warning-border)",
                  fontSize: "12.5px",
                  color: "var(--status-warning-text)",
                }}
              >
                This action is subject to dependency verification. Accounts actively assigned to scheduled invigilation duties cannot be removed.
              </div>
            </div>

            <div className="dash-modal-footer">
              <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setDeletingUser(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="dash-btn-sm dash-btn-danger"
                onClick={() => {
                  const res = AcademicDataStore.deleteUser(deletingUser.id);
                  if (!res.success) {
                    showToast(res.error || "Cannot delete user.", "error");
                  } else {
                    showToast(`User ${deletingUser.name} deleted.`);
                  }
                  setDeletingUser(null);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD DEPARTMENT (with duplicate code check) */}
      {showAddDeptModal && (
        <div className="dash-modal-backdrop" onClick={() => setShowAddDeptModal(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Register Academic Department</h3>
              <button
                type="button"
                onClick={() => setShowAddDeptModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const code = (form.elements.namedItem("deptCode") as HTMLInputElement).value;
                const name = (form.elements.namedItem("deptName") as HTMLInputElement).value;
                const hod = (form.elements.namedItem("deptHOD") as HTMLInputElement).value;
                const strength = Number((form.elements.namedItem("deptStrength") as HTMLInputElement).value);

                const res = AcademicDataStore.addDepartment({
                  code,
                  name,
                  hodName: hod,
                  studentStrength: strength,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to add department.", "error");
                  return;
                }

                showToast(`Department "${name}" registered successfully.`);
                setShowAddDeptModal(false);
              }}
            >
              <div className="dash-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Dept Code *</label>
                    <input name="deptCode" type="text" required placeholder="e.g. MATH" className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Department Name *</label>
                    <input name="deptName" type="text" required placeholder="e.g. Department of Mathematics" className="dash-input" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Head of Department (HOD) *</label>
                    <input name="deptHOD" type="text" required placeholder="e.g. Dr. S. K. Gupta" className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Student Strength *</label>
                    <input name="deptStrength" type="number" required min={0} defaultValue={120} className="dash-input" />
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setShowAddDeptModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT DEPARTMENT */}
      {editingDept && (
        <div className="dash-modal-backdrop" onClick={() => setEditingDept(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Edit Department: {editingDept.code}</h3>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("editDeptName") as HTMLInputElement).value;
                const hod = (form.elements.namedItem("editDeptHOD") as HTMLInputElement).value;
                const strength = Number((form.elements.namedItem("editDeptStrength") as HTMLInputElement).value);

                const res = AcademicDataStore.updateDepartment(editingDept.id, {
                  name,
                  hodName: hod,
                  studentStrength: strength,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to update.", "error");
                  return;
                }

                showToast(`Department ${editingDept.code} updated.`);
                setEditingDept(null);
              }}
            >
              <div className="dash-modal-body">
                <div className="dash-form-group">
                  <label className="dash-label">Department Name *</label>
                  <input name="editDeptName" type="text" defaultValue={editingDept.name} required className="dash-input" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Head of Department (HOD) *</label>
                    <input name="editDeptHOD" type="text" defaultValue={editingDept.hodName} required className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Student Strength *</label>
                    <input name="editDeptStrength" type="number" defaultValue={editingDept.studentStrength} required className="dash-input" />
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setEditingDept(null)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: VIEW DEPARTMENT DETAILS */}
      {viewingDept && (
        <div className="dash-modal-backdrop" onClick={() => setViewingDept(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Department Dossier: {viewingDept.name}</h3>
              <button
                type="button"
                onClick={() => setViewingDept(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div style={{ padding: "10px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Dept Code</div>
                  <strong style={{ fontSize: "15px", color: "var(--brand-primary)" }}>{viewingDept.code}</strong>
                </div>
                <div style={{ padding: "10px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Students</div>
                  <strong style={{ fontSize: "15px" }}>{viewingDept.studentStrength}</strong>
                </div>
                <div style={{ padding: "10px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Established</div>
                  <strong style={{ fontSize: "15px" }}>{viewingDept.createdAt}</strong>
                </div>
              </div>

              <p style={{ fontSize: "13.5px", color: "var(--text-primary)", marginBottom: "14px" }}>
                Current Department Chair / HOD: <strong>{viewingDept.hodName}</strong>
              </p>

              <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                Associated Academic Offerings:
              </h4>
              <ul style={{ paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {storeState.programs
                  .filter((p) => p.departmentCode === viewingDept.code)
                  .map((p) => (
                    <li key={p.id}>
                      <strong>{p.name}</strong> ({p.code}) - {p.degreeLevel}
                    </li>
                  ))}
                {storeState.programs.filter((p) => p.departmentCode === viewingDept.code).length === 0 && (
                  <li>No programs registered under this department yet.</li>
                )}
              </ul>
            </div>

            <div className="dash-modal-footer">
              <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setViewingDept(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: DELETE DEPARTMENT CONFIRMATION */}
      {deletingDept && (
        <div className="dash-modal-backdrop" onClick={() => setDeletingDept(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Delete Department: {deletingDept.code}</h3>
              <button
                type="button"
                onClick={() => setDeletingDept(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                Are you sure you want to delete <strong>{deletingDept.name} ({deletingDept.code})</strong>?
              </p>
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "var(--status-danger-bg)",
                  color: "var(--status-danger-text)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--status-danger-border)",
                  fontSize: "12.5px",
                }}
              >
                Dependency Protection: Departments with registered programs or curriculum subjects cannot be deleted.
              </div>
            </div>

            <div className="dash-modal-footer">
              <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setDeletingDept(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="dash-btn-sm dash-btn-danger"
                onClick={() => {
                  const res = AcademicDataStore.deleteDepartment(deletingDept.id);
                  if (!res.success) {
                    showToast(res.error || "Cannot delete department.", "error");
                  } else {
                    showToast(`Department ${deletingDept.code} deleted.`);
                  }
                  setDeletingDept(null);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: CREATE OR EDIT EXAM CYCLE (Independent Odd/Even & MSE/ESE) */}
      {(showAddCycleModal || editingCycle) && (
        <div
          className="dash-modal-backdrop"
          onClick={() => {
            setShowAddCycleModal(false);
            setEditingCycle(null);
          }}
        >
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">
                {editingCycle ? `Edit Exam Cycle: ${editingCycle.name}` : "Create New Examination Cycle"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddCycleModal(false);
                  setEditingCycle(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("cycleName") as HTMLInputElement).value;
                const acadYear = (form.elements.namedItem("acadYear") as HTMLInputElement).value;
                const sem = (form.elements.namedItem("semType") as HTMLSelectElement).value as "Odd Semester" | "Even Semester";
                const exType = (form.elements.namedItem("exType") as HTMLSelectElement).value as ExamCycleRecord["examType"];
                const dept = (form.elements.namedItem("dept") as HTMLSelectElement).value;
                const yr = (form.elements.namedItem("yrLevel") as HTMLSelectElement).value as ExamCycleRecord["yearLevel"];
                const div = (form.elements.namedItem("div") as HTMLSelectElement).value as ExamCycleRecord["division"];
                const start = (form.elements.namedItem("startDate") as HTMLInputElement).value;
                const end = (form.elements.namedItem("endDate") as HTMLInputElement).value;
                const regDeadline = (form.elements.namedItem("regDeadline") as HTMLInputElement).value;
                const sess = (form.elements.namedItem("sessWindow") as HTMLSelectElement).value as ExamCycleRecord["sessionWindow"];
                const dur = Number((form.elements.namedItem("duration") as HTMLInputElement).value);
                const status = (form.elements.namedItem("status") as HTMLSelectElement).value as ExamCycleRecord["status"];

                if (editingCycle) {
                  const res = AcademicDataStore.updateExamCycle(editingCycle.id, {
                    name,
                    academicYear: acadYear,
                    semesterType: sem,
                    examType: exType,
                    department: dept,
                    yearLevel: yr,
                    division: div,
                    startDate: start,
                    endDate: end,
                    registrationDeadline: regDeadline,
                    sessionWindow: sess,
                    durationMinutes: dur,
                    status,
                  });
                  if (!res.success) {
                    showToast(res.error || "Failed to update cycle.", "error");
                    return;
                  }
                  showToast(`Cycle ${name} updated.`);
                  setEditingCycle(null);
                } else {
                  const res = AcademicDataStore.addExamCycle({
                    name,
                    academicYear: acadYear,
                    semesterType: sem,
                    examType: exType,
                    department: dept,
                    yearLevel: yr,
                    division: div,
                    startDate: start,
                    endDate: end,
                    registrationDeadline: regDeadline,
                    sessionWindow: sess,
                    durationMinutes: dur,
                    status,
                    applicableSubjectsCount: 8,
                  });
                  if (!res.success) {
                    showToast(res.error || "Failed to create cycle.", "error");
                    return;
                  }
                  showToast(`Exam Cycle "${name}" created successfully.`);
                  setShowAddCycleModal(false);
                }
              }}
            >
              <div className="dash-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Exam Cycle Name *</label>
                    <input
                      name="cycleName"
                      type="text"
                      required
                      placeholder="e.g. Winter 2026 Examination"
                      defaultValue={editingCycle?.name || ""}
                      className="dash-input"
                    />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Academic Year *</label>
                    <input
                      name="acadYear"
                      type="text"
                      required
                      placeholder="e.g. 2025-26"
                      defaultValue={editingCycle?.academicYear || "2025-26"}
                      className="dash-input"
                    />
                  </div>
                </div>

                {/* Independent Selection: Semester & Exam Type */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Semester Type (Independent) *</label>
                    <select name="semType" className="dash-select" defaultValue={editingCycle?.semesterType || "Odd Semester"}>
                      <option value="Odd Semester">Odd Semester (Semesters 1, 3, 5, 7)</option>
                      <option value="Even Semester">Even Semester (Semesters 2, 4, 6, 8)</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Exam Type (Independent) *</label>
                    <select name="exType" className="dash-select" defaultValue={editingCycle?.examType || "MSE"}>
                      <option value="MSE">MSE (Mid-Semester Exam)</option>
                      <option value="ESE">ESE (End-Semester Exam)</option>
                      <option value="Makeup Examination">Makeup Examination</option>
                      <option value="Lab-Practical Examination">Lab-Practical Examination</option>
                    </select>
                  </div>
                </div>

                {/* Target Scope */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Department *</label>
                    <select name="dept" className="dash-select" defaultValue={editingCycle?.department || "All Departments"}>
                      <option value="All Departments">All Departments</option>
                      {storeState.departments.map((d) => (
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Year Cohort *</label>
                    <select name="yrLevel" className="dash-select" defaultValue={editingCycle?.yearLevel || "All Years"}>
                      <option value="All Years">All Years</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Division *</label>
                    <select name="div" className="dash-select" defaultValue={editingCycle?.division || "All Divisions"}>
                      <option value="All Divisions">All Divisions</option>
                      <option value="Division A">Division A</option>
                      <option value="Division B">Division B</option>
                    </select>
                  </div>
                </div>

                {/* Dates & Times */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Start Date *</label>
                    <input
                      name="startDate"
                      type="date"
                      required
                      defaultValue={editingCycle?.startDate || "2026-11-10"}
                      className="dash-input"
                    />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">End Date *</label>
                    <input
                      name="endDate"
                      type="date"
                      required
                      defaultValue={editingCycle?.endDate || "2026-11-25"}
                      className="dash-input"
                    />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Registration Deadline *</label>
                    <input
                      name="regDeadline"
                      type="date"
                      required
                      defaultValue={editingCycle?.registrationDeadline || "2026-10-31"}
                      className="dash-input"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Session Window *</label>
                    <select name="sessWindow" className="dash-select" defaultValue={editingCycle?.sessionWindow || "Both Sessions"}>
                      <option value="Both Sessions">Both Sessions (Morning & Afternoon)</option>
                      <option value="Morning (09:30 - 12:30 IST)">Morning Only (09:30 - 12:30)</option>
                      <option value="Afternoon (14:00 - 17:00 IST)">Afternoon Only (14:00 - 17:00)</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Duration (Mins) *</label>
                    <input
                      name="duration"
                      type="number"
                      required
                      min={60}
                      max={240}
                      defaultValue={editingCycle?.durationMinutes || 180}
                      className="dash-input"
                    />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Status *</label>
                    <select name="status" className="dash-select" defaultValue={editingCycle?.status || "Draft"}>
                      <option value="Draft">Draft</option>
                      <option value="Configured">Configured</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button
                  type="button"
                  className="dash-btn-sm dash-btn-secondary"
                  onClick={() => {
                    setShowAddCycleModal(false);
                    setEditingCycle(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  {editingCycle ? "Save Updates" : "Create Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: TIMETABLE REVIEW & DECISION WORKFLOW */}
      {selectedTimetableForReview && (
        <div className="dash-modal-backdrop" onClick={() => setSelectedTimetableForReview(null)}>
          <div className="dash-modal" style={{ width: "720px" }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <div>
                <h3 className="dash-modal-title">Review Timetable: {selectedTimetableForReview.cycleName}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Submitted by {selectedTimetableForReview.submittedBy} on {selectedTimetableForReview.submittedDate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTimetableForReview(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              {/* Validation Summary */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  padding: "12px",
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Clash Status</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--status-success-text)" }}>
                    0 Hard Conflicts
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Room Capacity</span>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>{selectedTimetableForReview.roomUtilization}</div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Solver Status</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--brand-primary)" }}>
                    {selectedTimetableForReview.solverStatus}
                  </div>
                </div>
              </div>

              {/* Scheduled Papers Table */}
              <h4 style={{ fontSize: "13.5px", fontWeight: "700", marginBottom: "8px" }}>
                Scheduled Examination Papers ({selectedTimetableForReview.exams.length} Papers)
              </h4>
              <div className="dash-table-container" style={{ maxHeight: "220px", overflowY: "auto", marginBottom: "16px" }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Course Title</th>
                      <th>Date & Slot</th>
                      <th>Hall</th>
                      <th>Invigilator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTimetableForReview.exams.map((ex) => (
                      <tr key={ex.id}>
                        <td><strong>{ex.code}</strong></td>
                        <td>{ex.subject}</td>
                        <td>
                          <div>{ex.date}</div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ex.slot}</span>
                        </td>
                        <td>{ex.room}</td>
                        <td>{ex.invigilator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Show Previous Notes if any */}
              {selectedTimetableForReview.reviewNotes && (
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "var(--status-warning-bg)",
                    border: "1px solid var(--status-warning-border)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "14px",
                    fontSize: "12.5px",
                    color: "var(--status-warning-text)",
                  }}
                >
                  <strong>Active Revision Request:</strong> {selectedTimetableForReview.reviewNotes}
                </div>
              )}

              {/* Action Form Toggle */}
              {showRevisionForm && (
                <div style={{ padding: "12px", border: "1px solid var(--status-warning-border)", borderRadius: "var(--radius-md)", backgroundColor: "#fffdfa", marginBottom: "14px" }}>
                  <label className="dash-label">Mandatory Reason for Requesting Revisions *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Specify the room or date clash that coordinator must resolve..."
                    className="dash-textarea"
                    value={revisionNoteInput}
                    onChange={(e) => setRevisionNoteInput(e.target.value)}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-secondary"
                      onClick={() => setShowRevisionForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="dash-btn-sm"
                      style={{ backgroundColor: "var(--status-warning-text)", color: "#fff" }}
                      onClick={() => {
                        const res = AcademicDataStore.requestTimetableRevision(selectedTimetableForReview.id, revisionNoteInput);
                        if (!res.success) {
                          showToast(res.error || "Reason required.", "error");
                          return;
                        }
                        showToast("Revision request transmitted to Examination Coordinator.", "info");
                        setSelectedTimetableForReview(null);
                      }}
                    >
                      Send Revision Request
                    </button>
                  </div>
                </div>
              )}

              {showRejectionForm && (
                <div style={{ padding: "12px", border: "1px solid var(--status-danger-border)", borderRadius: "var(--radius-md)", backgroundColor: "#fffafa", marginBottom: "14px" }}>
                  <label className="dash-label">Mandatory Reason for Rejection *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Specify institutional non-compliance reason for schedule rejection..."
                    className="dash-textarea"
                    value={rejectionNoteInput}
                    onChange={(e) => setRejectionNoteInput(e.target.value)}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-secondary"
                      onClick={() => setShowRejectionForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="dash-btn-sm dash-btn-danger"
                      onClick={() => {
                        const res = AcademicDataStore.rejectTimetable(selectedTimetableForReview.id, rejectionNoteInput);
                        if (!res.success) {
                          showToast(res.error || "Reason required.", "error");
                          return;
                        }
                        showToast("Timetable submission rejected.", "error");
                        setSelectedTimetableForReview(null);
                      }}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn-sm dash-btn-secondary"
                onClick={() => setSelectedTimetableForReview(null)}
              >
                Close
              </button>

              {!showRevisionForm && !showRejectionForm && (
                <>
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-danger"
                    onClick={() => setShowRejectionForm(true)}
                  >
                    Reject Schedule
                  </button>

                  <button
                    type="button"
                    className="dash-btn-sm"
                    style={{ backgroundColor: "var(--status-warning-bg)", color: "var(--status-warning-text)", borderColor: "var(--status-warning-border)" }}
                    onClick={() => setShowRevisionForm(true)}
                  >
                    Request Revisions
                  </button>

                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-primary"
                    onClick={() => {
                      const res = AcademicDataStore.approveTimetable(selectedTimetableForReview.id, true);
                      if (!res.success) {
                        showToast(res.error || "Cannot approve.", "error");
                        return;
                      }
                      showToast(`Schedule ${selectedTimetableForReview.cycleName} approved & published.`);
                      setSelectedTimetableForReview(null);
                    }}
                  >
                    Approve & Publish Timetable
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: MANAGE GRIEVANCE TICKET */}
      {viewingGrievance && (
        <div className="dash-modal-backdrop" onClick={() => setViewingGrievance(null)}>
          <div className="dash-modal" style={{ width: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <div>
                <h3 className="dash-modal-title">Grievance Ticket: {viewingGrievance.ticketNumber}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Filed on {viewingGrievance.date} by {viewingGrievance.submittedBy} ({viewingGrievance.userRole})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingGrievance(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              <div style={{ marginBottom: "14px" }}>
                <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>{viewingGrievance.title}</strong>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: "1.6" }}>
                  {viewingGrievance.description}
                </p>
              </div>

              {/* Status & Assignment Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "12px",
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label className="dash-label">Current Status</label>
                  <select
                    className="dash-select"
                    value={viewingGrievance.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as GrievanceRecord["status"];
                      AcademicDataStore.updateGrievanceStatus(viewingGrievance.id, newStatus);
                      setViewingGrievance({ ...viewingGrievance, status: newStatus });
                      showToast(`Ticket status updated to ${newStatus}.`);
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="dash-label">Assigned Desk Officer</label>
                  <input
                    type="text"
                    className="dash-input"
                    defaultValue={viewingGrievance.assignedTo}
                    onBlur={(e) => {
                      AcademicDataStore.assignGrievance(viewingGrievance.id, e.target.value);
                      showToast(`Assigned to ${e.target.value}.`);
                    }}
                  />
                </div>
              </div>

              {/* Internal Notes Log */}
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>Internal Administrative Notes</h4>
                {viewingGrievance.internalNotes.length === 0 ? (
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>No internal notes recorded yet.</p>
                ) : (
                  <ul style={{ paddingLeft: "18px", fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {viewingGrievance.internalNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <input
                    type="text"
                    placeholder="Add an internal note or resolution remark..."
                    className="dash-input"
                    value={grievanceNoteInput}
                    onChange={(e) => setGrievanceNoteInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="dash-btn-sm dash-btn-primary"
                    onClick={() => {
                      if (!grievanceNoteInput.trim()) return;
                      AcademicDataStore.updateGrievanceStatus(viewingGrievance.id, viewingGrievance.status, grievanceNoteInput);
                      viewingGrievance.internalNotes.push(`[${new Date().toLocaleDateString("en-IN")}] ${grievanceNoteInput}`);
                      setGrievanceNoteInput("");
                      showToast("Note recorded.");
                    }}
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>

            <div className="dash-modal-footer">
              <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setViewingGrievance(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 11: ADD PROGRAM */}
      {showAddProgramModal && (
        <div className="dash-modal-backdrop" onClick={() => setShowAddProgramModal(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Register Degree Program</h3>
              <button
                type="button"
                onClick={() => setShowAddProgramModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const code = (form.elements.namedItem("progCode") as HTMLInputElement).value;
                const name = (form.elements.namedItem("progName") as HTMLInputElement).value;
                const level = (form.elements.namedItem("progLevel") as HTMLSelectElement).value as ProgramRecord["degreeLevel"];
                const dept = (form.elements.namedItem("progDept") as HTMLSelectElement).value;
                const duration = Number((form.elements.namedItem("progDuration") as HTMLInputElement).value);
                const strength = Number((form.elements.namedItem("progStrength") as HTMLInputElement).value);

                const res = AcademicDataStore.addProgram({
                  code,
                  name,
                  degreeLevel: level,
                  departmentCode: dept,
                  durationYears: duration,
                  currentStrength: strength,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to add program.", "error");
                  return;
                }

                showToast(`Program ${name} registered.`);
                setShowAddProgramModal(false);
              }}
            >
              <div className="dash-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Program Code *</label>
                    <input name="progCode" type="text" required placeholder="e.g. BTECH-AI" className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Program Title *</label>
                    <input name="progName" type="text" required placeholder="e.g. B.Tech in Artificial Intelligence" className="dash-input" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Degree Level *</label>
                    <select name="progLevel" className="dash-select">
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Doctoral">Doctoral</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Parent Department *</label>
                    <select name="progDept" className="dash-select" defaultValue={selectedSubjectDept} key={selectedSubjectDept}>
                      {storeState.departments.map((d) => (
                        <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Duration (Years) *</label>
                    <input name="progDuration" type="number" required min={1} max={6} defaultValue={4} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Current Strength *</label>
                    <input name="progStrength" type="number" required min={0} defaultValue={120} className="dash-input" />
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setShowAddProgramModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 12: ADD SUBJECT */}
      {showAddSubjectModal && (
        <div className="dash-modal-backdrop" onClick={() => setShowAddSubjectModal(false)}>
          <div className="dash-modal" style={{ maxWidth: "660px" }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <div>
                <h3 className="dash-modal-title">Register Curriculum Subject</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Department: {selectedSubjectDept} · Academic Year: {subjectAcadYearFilter !== "ALL" ? subjectAcadYearFilter : "2026-27"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const code = (form.elements.namedItem("subCode") as HTMLInputElement).value;
                const title = (form.elements.namedItem("subTitle") as HTMLInputElement).value;
                const dept = (form.elements.namedItem("subDept") as HTMLSelectElement).value;
                const prog = (form.elements.namedItem("subProg") as HTMLSelectElement).value;
                const year = (form.elements.namedItem("subYear") as HTMLSelectElement).value as YearOfStudy;
                const sem = Number((form.elements.namedItem("subSem") as HTMLSelectElement).value);
                const type = (form.elements.namedItem("subType") as HTMLSelectElement).value as SubjectType;
                const credits = Number((form.elements.namedItem("subCredits") as HTMLInputElement).value);
                const acadYear = (form.elements.namedItem("subAcadYear") as HTMLInputElement).value;
                const lHours = Number((form.elements.namedItem("subL") as HTMLInputElement).value);
                const tHours = Number((form.elements.namedItem("subT") as HTMLInputElement).value);
                const pHours = Number((form.elements.namedItem("subP") as HTMLInputElement).value);
                const status = (form.elements.namedItem("subStatus") as HTMLSelectElement).value as "Active" | "Inactive";

                // Year-Semester compatibility validation
                const expectedYear = getYearFromSemester(sem);
                if (year !== expectedYear) {
                  showToast(`Incompatible: Semester ${sem} belongs to ${expectedYear} Year, but ${year} Year was selected.`, "error");
                  return;
                }

                if (credits < 0) {
                  showToast("Credits must be a valid non-negative number.", "error");
                  return;
                }

                const res = AcademicDataStore.addSubject({
                  code,
                  title,
                  departmentCode: dept,
                  programCode: prog,
                  academicYear: acadYear || "2026-27",
                  yearOfStudy: year,
                  semester: sem,
                  type,
                  credits,
                  lectureHours: lHours,
                  tutorialHours: tHours,
                  practicalHours: pHours,
                  status,
                  enrolledStudents: 120,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to add subject.", "error");
                  return;
                }

                showToast(`Subject ${title} (${code}) added successfully.`);
                setShowAddSubjectModal(false);
              }}
            >
              <div className="dash-modal-body">
                {/* Department & Program */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Department *</label>
                    <select
                      name="subDept"
                      className="dash-select"
                      defaultValue={selectedSubjectDept}
                      key={`dept-${selectedSubjectDept}`}
                    >
                      {storeState.departments.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} — {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Degree Program *</label>
                    <select
                      name="subProg"
                      className="dash-select"
                      defaultValue={subjectProgramFilter !== "ALL" ? subjectProgramFilter : (deptPrograms[0]?.code || "BTECH-CSE")}
                    >
                      {storeState.programs.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject Code & Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Course Code *</label>
                    <input name="subCode" type="text" required placeholder="e.g. CS504" className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Subject Title *</label>
                    <input name="subTitle" type="text" required placeholder="e.g. Database Engineering" className="dash-input" />
                  </div>
                </div>

                {/* Year of Study & Semester */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Year of Study *</label>
                    <select
                      name="subYear"
                      className="dash-select"
                      defaultValue={subjectYearFilter !== "ALL" ? subjectYearFilter : "Third"}
                    >
                      <option value="First">First Year</option>
                      <option value="Second">Second Year</option>
                      <option value="Third">Third Year</option>
                      <option value="Fourth">Fourth Year</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Semester (1 to 8) *</label>
                    <select
                      name="subSem"
                      className="dash-select"
                      defaultValue={
                        subjectSemFilter !== "ALL" && !["ODD", "EVEN"].includes(subjectSemFilter)
                          ? Number(subjectSemFilter)
                          : 5
                      }
                    >
                      <option value={1}>Semester 1 (First Year · Odd)</option>
                      <option value={2}>Semester 2 (First Year · Even)</option>
                      <option value={3}>Semester 3 (Second Year · Odd)</option>
                      <option value={4}>Semester 4 (Second Year · Even)</option>
                      <option value={5}>Semester 5 (Third Year · Odd)</option>
                      <option value={6}>Semester 6 (Third Year · Even)</option>
                      <option value={7}>Semester 7 (Fourth Year · Odd)</option>
                      <option value={8}>Semester 8 (Fourth Year · Even)</option>
                    </select>
                  </div>
                </div>

                {/* Subject Type, Credits, Academic Year */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Subject Type *</label>
                    <select
                      name="subType"
                      className="dash-select"
                      defaultValue={subjectTypeFilter !== "ALL" ? subjectTypeFilter : "Theory"}
                    >
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Lab">Lab</option>
                      <option value="Project">Project</option>
                      <option value="Elective">Elective</option>
                      <option value="Seminar">Seminar</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Credits *</label>
                    <input name="subCredits" type="number" required min={0} max={12} defaultValue={4} className="dash-input" />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Academic Year *</label>
                    <input
                      name="subAcadYear"
                      type="text"
                      required
                      defaultValue={subjectAcadYearFilter !== "ALL" ? subjectAcadYearFilter : "2026-27"}
                      className="dash-input"
                    />
                  </div>
                </div>

                {/* L-T-P Hours and Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Lecture (L) *</label>
                    <input name="subL" type="number" required min={0} max={10} defaultValue={3} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Tutorial (T) *</label>
                    <input name="subT" type="number" required min={0} max={10} defaultValue={1} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Practical (P) *</label>
                    <input name="subP" type="number" required min={0} max={10} defaultValue={0} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Status *</label>
                    <select name="subStatus" className="dash-select" defaultValue="Active">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setShowAddSubjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 13: EDIT PROGRAM */}
      {editingProgram && (
        <div className="dash-modal-backdrop" onClick={() => setEditingProgram(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Edit Program: {editingProgram.code}</h3>
              <button
                type="button"
                onClick={() => setEditingProgram(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("progName") as HTMLInputElement).value;
                const level = (form.elements.namedItem("progLevel") as HTMLSelectElement).value as ProgramRecord["degreeLevel"];
                const dept = (form.elements.namedItem("progDept") as HTMLSelectElement).value;
                const duration = Number((form.elements.namedItem("progDuration") as HTMLInputElement).value);
                const strength = Number((form.elements.namedItem("progStrength") as HTMLInputElement).value);

                const res = AcademicDataStore.updateProgram(editingProgram.id, {
                  name,
                  degreeLevel: level,
                  departmentCode: dept,
                  durationYears: duration,
                  currentStrength: strength,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to update program.", "error");
                  return;
                }

                showToast(`Program ${name} updated.`);
                setEditingProgram(null);
              }}
            >
              <div className="dash-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Program Code</label>
                    <input type="text" disabled value={editingProgram.code} className="dash-input" style={{ backgroundColor: "var(--bg-subtle)" }} />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Program Title *</label>
                    <input name="progName" type="text" required defaultValue={editingProgram.name} className="dash-input" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Degree Level *</label>
                    <select name="progLevel" className="dash-select" defaultValue={editingProgram.degreeLevel}>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Doctoral">Doctoral</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Parent Department *</label>
                    <select name="progDept" className="dash-select" defaultValue={editingProgram.departmentCode}>
                      {storeState.departments.map((d) => (
                        <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Duration (Years) *</label>
                    <input name="progDuration" type="number" required min={1} max={6} defaultValue={editingProgram.durationYears} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Current Strength *</label>
                    <input name="progStrength" type="number" required min={0} defaultValue={editingProgram.currentStrength} className="dash-input" />
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setEditingProgram(null)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 14: DELETE PROGRAM CONFIRMATION */}
      {deletingProgram && (
        <div className="dash-modal-backdrop" onClick={() => setDeletingProgram(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Delete Program: {deletingProgram.code}</h3>
              <button
                type="button"
                onClick={() => setDeletingProgram(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                Are you sure you want to remove degree program <strong>{deletingProgram.name} ({deletingProgram.code})</strong>?
              </p>
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "var(--status-danger-bg)",
                  color: "var(--status-danger-text)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--status-danger-border)",
                  fontSize: "12.5px",
                }}
              >
                Enrolled students and historical records associated with this program will be preserved in archival audit logs.
              </div>
            </div>

            <div className="dash-modal-footer">
              <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setDeletingProgram(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="dash-btn-sm dash-btn-danger"
                onClick={() => {
                  const res = AcademicDataStore.deleteProgram(deletingProgram.id);
                  if (!res.success) {
                    showToast(res.error || "Cannot delete program.", "error");
                  } else {
                    showToast(`Program ${deletingProgram.code} deleted.`);
                  }
                  setDeletingProgram(null);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 15: EDIT SUBJECT */}
      {editingSubject && (
        <div className="dash-modal-backdrop" onClick={() => setEditingSubject(null)}>
          <div className="dash-modal" style={{ maxWidth: "660px" }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <div>
                <h3 className="dash-modal-title">Edit Subject: {editingSubject.code}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Department: {editingSubject.departmentCode} · Program: {editingSubject.programCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem("subTitle") as HTMLInputElement).value;
                const dept = (form.elements.namedItem("subDept") as HTMLSelectElement).value;
                const prog = (form.elements.namedItem("subProg") as HTMLSelectElement).value;
                const year = (form.elements.namedItem("subYear") as HTMLSelectElement).value as YearOfStudy;
                const sem = Number((form.elements.namedItem("subSem") as HTMLSelectElement).value);
                const type = (form.elements.namedItem("subType") as HTMLSelectElement).value as SubjectType;
                const credits = Number((form.elements.namedItem("subCredits") as HTMLInputElement).value);
                const acadYear = (form.elements.namedItem("subAcadYear") as HTMLInputElement).value;
                const lHours = Number((form.elements.namedItem("subL") as HTMLInputElement).value);
                const tHours = Number((form.elements.namedItem("subT") as HTMLInputElement).value);
                const pHours = Number((form.elements.namedItem("subP") as HTMLInputElement).value);
                const status = (form.elements.namedItem("subStatus") as HTMLSelectElement).value as "Active" | "Inactive";

                // Year-Semester compatibility validation
                const expectedYear = getYearFromSemester(sem);
                if (year !== expectedYear) {
                  showToast(`Incompatible: Semester ${sem} belongs to ${expectedYear} Year, but ${year} Year was selected.`, "error");
                  return;
                }

                if (credits < 0) {
                  showToast("Credits must be a valid non-negative number.", "error");
                  return;
                }

                const res = AcademicDataStore.updateSubject(editingSubject.id, {
                  title,
                  departmentCode: dept,
                  programCode: prog,
                  academicYear: acadYear,
                  yearOfStudy: year,
                  credits,
                  semester: sem,
                  type,
                  lectureHours: lHours,
                  tutorialHours: tHours,
                  practicalHours: pHours,
                  status,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to update subject.", "error");
                  return;
                }

                showToast(`Subject ${title} (${editingSubject.code}) updated successfully.`);
                setEditingSubject(null);
              }}
            >
              <div className="dash-modal-body">
                {/* Subject Code & Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Course Code</label>
                    <input
                      type="text"
                      disabled
                      value={editingSubject.code}
                      className="dash-input"
                      style={{ backgroundColor: "var(--bg-subtle)", fontWeight: 600 }}
                    />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Subject Name / Title *</label>
                    <input name="subTitle" type="text" required defaultValue={editingSubject.title} className="dash-input" />
                  </div>
                </div>

                {/* Department & Program */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Department *</label>
                    <select name="subDept" className="dash-select" defaultValue={editingSubject.departmentCode}>
                      {storeState.departments.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} — {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Degree Program *</label>
                    <select name="subProg" className="dash-select" defaultValue={editingSubject.programCode}>
                      {storeState.programs.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Year of Study & Semester */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Year of Study *</label>
                    <select name="subYear" className="dash-select" defaultValue={editingSubject.yearOfStudy}>
                      <option value="First">First Year</option>
                      <option value="Second">Second Year</option>
                      <option value="Third">Third Year</option>
                      <option value="Fourth">Fourth Year</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Target Semester (1 to 8) *</label>
                    <select name="subSem" className="dash-select" defaultValue={editingSubject.semester}>
                      <option value={1}>Semester 1 (First Year · Odd)</option>
                      <option value={2}>Semester 2 (First Year · Even)</option>
                      <option value={3}>Semester 3 (Second Year · Odd)</option>
                      <option value={4}>Semester 4 (Second Year · Even)</option>
                      <option value={5}>Semester 5 (Third Year · Odd)</option>
                      <option value={6}>Semester 6 (Third Year · Even)</option>
                      <option value={7}>Semester 7 (Fourth Year · Odd)</option>
                      <option value={8}>Semester 8 (Fourth Year · Even)</option>
                    </select>
                  </div>
                </div>

                {/* Subject Type, Credits, Academic Year */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Subject Type *</label>
                    <select name="subType" className="dash-select" defaultValue={editingSubject.type}>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                      <option value="Lab">Lab</option>
                      <option value="Project">Project</option>
                      <option value="Elective">Elective</option>
                      <option value="Seminar">Seminar</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Credits *</label>
                    <input name="subCredits" type="number" required min={0} max={12} defaultValue={editingSubject.credits} className="dash-input" />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Academic Year *</label>
                    <input name="subAcadYear" type="text" required defaultValue={editingSubject.academicYear || "2026-27"} className="dash-input" />
                  </div>
                </div>

                {/* L-T-P Hours and Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Lecture (L) *</label>
                    <input name="subL" type="number" required min={0} max={10} defaultValue={editingSubject.lectureHours} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Tutorial (T) *</label>
                    <input name="subT" type="number" required min={0} max={10} defaultValue={editingSubject.tutorialHours} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Practical (P) *</label>
                    <input name="subP" type="number" required min={0} max={10} defaultValue={editingSubject.practicalHours} className="dash-input" />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-label">Status *</label>
                    <select name="subStatus" className="dash-select" defaultValue={editingSubject.status}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setEditingSubject(null)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 16: DELETE SUBJECT CONFIRMATION */}
      {deletingSubject && (
        <div className="dash-modal-backdrop" onClick={() => setDeletingSubject(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Delete Subject: {deletingSubject.code}</h3>
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                Are you sure you want to delete course <strong>{deletingSubject.title} ({deletingSubject.code})</strong>?
              </p>
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "var(--status-danger-bg)",
                  color: "var(--status-danger-text)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--status-danger-border)",
                  fontSize: "12.5px",
                }}
              >
                Dependency Protection: Courses actively scheduled in an examination timetable cannot be deleted.
              </div>
            </div>

            <div className="dash-modal-footer">
              <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setDeletingSubject(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="dash-btn-sm dash-btn-danger"
                onClick={() => {
                  const res = AcademicDataStore.deleteSubject(deletingSubject.id);
                  if (!res.success) {
                    showToast(res.error || "Cannot delete subject.", "error");
                  } else {
                    showToast(`Course ${deletingSubject.code} deleted.`);
                  }
                  setDeletingSubject(null);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 17: DELETE EXAM CYCLE CONFIRMATION */}
      {deletingCycle && (
        <div className="dash-modal-backdrop" onClick={() => setDeletingCycle(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Delete Exam Cycle</h3>
              <button
                type="button"
                onClick={() => setDeletingCycle(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dash-modal-body">
              <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                Are you sure you want to delete examination cycle <strong>{deletingCycle.name}</strong> ({deletingCycle.academicYear})?
              </p>
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "var(--status-danger-bg)",
                  color: "var(--status-danger-text)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--status-danger-border)",
                  fontSize: "12.5px",
                }}
              >
                Cycles currently in progress cannot be deleted.
              </div>
            </div>

            <div className="dash-modal-footer">
              <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setDeletingCycle(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="dash-btn-sm dash-btn-danger"
                onClick={() => {
                  const res = AcademicDataStore.deleteExamCycle(deletingCycle.id);
                  if (!res.success) {
                    showToast(res.error || "Cannot delete cycle.", "error");
                  } else {
                    showToast(`Cycle ${deletingCycle.name} deleted.`);
                  }
                  setDeletingCycle(null);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 18: LOG NEW GRIEVANCE TICKET */}
      {showAddGrievanceModal && (
        <div className="dash-modal-backdrop" onClick={() => setShowAddGrievanceModal(false)}>
          <div className="dash-modal" style={{ width: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Log New Examination Grievance</h3>
              <button
                type="button"
                onClick={() => setShowAddGrievanceModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem("grvTitle") as HTMLInputElement).value;
                const cat = (form.elements.namedItem("grvCat") as HTMLSelectElement).value as GrievanceRecord["category"];
                const prio = (form.elements.namedItem("grvPrio") as HTMLSelectElement).value as GrievanceRecord["priority"];
                const subBy = (form.elements.namedItem("grvSubmittedBy") as HTMLInputElement).value;
                const role = (form.elements.namedItem("grvRole") as HTMLSelectElement).value as GrievanceRecord["userRole"];
                const desc = (form.elements.namedItem("grvDesc") as HTMLTextAreaElement).value;

                const res = AcademicDataStore.addGrievance({
                  title,
                  category: cat,
                  priority: prio,
                  status: "Open",
                  submittedBy: subBy,
                  userRole: role,
                  assignedTo: "Examination Control Desk",
                  description: desc,
                });

                if (!res.success) {
                  showToast(res.error || "Failed to log grievance.", "error");
                  return;
                }

                showToast("Grievance ticket created successfully.");
                setShowAddGrievanceModal(false);
              }}
            >
              <div className="dash-modal-body">
                <div className="dash-form-group">
                  <label className="dash-label">Grievance Subject / Title *</label>
                  <input name="grvTitle" type="text" required placeholder="e.g. Schedule clash between CS701 and CS703" className="dash-input" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Category *</label>
                    <select name="grvCat" className="dash-select">
                      <option value="Scheduling Clash">Scheduling Clash</option>
                      <option value="Venue Facility">Venue Facility</option>
                      <option value="Special Accommodation">Special Accommodation</option>
                      <option value="Hall Ticket Issue">Hall Ticket Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Priority Level *</label>
                    <select name="grvPrio" className="dash-select">
                      <option value="High">High (Immediate)</option>
                      <option value="Medium">Medium (Standard)</option>
                      <option value="Low">Low (Informational)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div className="dash-form-group">
                    <label className="dash-label">Complainant Name / ID *</label>
                    <input name="grvSubmittedBy" type="text" required placeholder="e.g. Rahul Sharma (2023BCSE014)" className="dash-input" />
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-label">Complainant Role *</label>
                    <select name="grvRole" className="dash-select">
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="HOD">Department HOD</option>
                    </select>
                  </div>
                </div>

                <div className="dash-form-group">
                  <label className="dash-label">Detailed Grievance Description *</label>
                  <textarea name="grvDesc" rows={3} required placeholder="Describe the examination concern, clash specifics, or accommodation need..." className="dash-textarea" />
                </div>
              </div>

              <div className="dash-modal-footer">
                <button type="button" className="dash-btn-sm dash-btn-secondary" onClick={() => setShowAddGrievanceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dash-btn-sm dash-btn-primary">
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
