import React, { useState, useEffect, useMemo } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import {
  AcademicDataStore,
  CoordinatorExamEntry,
  SubjectRecord,
} from "../../services/academicDataStore.js";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
  Building2,
  Download,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Users,
  BookOpen,
} from "lucide-react";
import "../../styles/dashboard.css";

interface HODDashboardProps {
  onSwitchRole?: (role: UserRole) => void;
  onLogout?: () => void;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({
  onSwitchRole,
  onLogout,
}) => {
  const { currentUser, switchRole, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string>("overview");
  const [storeState, setStoreState] = useState(AcademicDataStore.getSnapshot());
  const [currentTime, setCurrentTime] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<"REVIEWED" | "APPROVED" | "PENDING">("APPROVED");
  const [approvalRemarks, setApprovalRemarks] = useState("Timetable verified and aligns with department academic calendar. Zero room or faculty overlaps detected.");
  const [condonedStudents, setCondonedStudents] = useState<Record<string, boolean>>({});

  // Sync with AcademicDataStore
  useEffect(() => {
    return AcademicDataStore.subscribe(() => {
      setStoreState(AcademicDataStore.getSnapshot());
    });
  }, []);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " IST"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const hodName = currentUser?.name || "Prof. R. K. Mehta";
  const deptName = currentUser?.department || "Computer Science & Engineering";
  const deptCode = "CSE";

  // Filter department subjects
  const deptSubjects = useMemo(() => {
    const allSubjects = storeState.subjects || [];
    const filtered = allSubjects.filter(
      (s: SubjectRecord) => s.departmentCode === deptCode || s.code.startsWith("CS") || s.code.startsWith("IT")
    );
    if (filtered.length > 0) return filtered;

    // Default institutional offerings if store is clean
    return [
      {
        id: "sub-cs701",
        code: "CS701",
        title: "Distributed Systems & Cloud Computing",
        departmentCode: "CSE",
        programCode: "BTECH-CSE",
        academicYear: "2026-27",
        yearOfStudy: "Fourth",
        semester: 7,
        type: "Theory",
        credits: 4,
        lectureHours: 4,
        tutorialHours: 0,
        practicalHours: 0,
        status: "Active",
        enrolledStudents: 120,
        curriculumStructure: "NEP",
      },
      {
        id: "sub-cs704",
        code: "CS704",
        title: "Cryptography & Network Security",
        departmentCode: "CSE",
        programCode: "BTECH-CSE",
        academicYear: "2026-27",
        yearOfStudy: "Fourth",
        semester: 7,
        type: "Theory",
        credits: 4,
        lectureHours: 4,
        tutorialHours: 0,
        practicalHours: 0,
        status: "Active",
        enrolledStudents: 115,
        curriculumStructure: "NEP",
      },
      {
        id: "sub-cs709",
        code: "CS709",
        title: "High Performance Computing (Elective)",
        departmentCode: "CSE",
        programCode: "BTECH-CSE",
        academicYear: "2026-27",
        yearOfStudy: "Fourth",
        semester: 7,
        type: "Theory",
        credits: 3,
        lectureHours: 3,
        tutorialHours: 0,
        practicalHours: 0,
        status: "Active",
        enrolledStudents: 65,
        curriculumStructure: "CYCLE 2",
      },
      {
        id: "sub-cs712",
        code: "CS712",
        title: "Software Reliability & Fault Tolerance",
        departmentCode: "CSE",
        programCode: "BTECH-CSE",
        academicYear: "2026-27",
        yearOfStudy: "Fourth",
        semester: 7,
        type: "Theory",
        credits: 3,
        lectureHours: 3,
        tutorialHours: 0,
        practicalHours: 0,
        status: "Active",
        enrolledStudents: 118,
        curriculumStructure: "CYCLE 3",
      },
    ] as SubjectRecord[];
  }, [storeState.subjects]);

  // Department Exam Schedule
  const deptExams = useMemo(() => {
    const allExams = storeState.coordinatorExams || [];
    const filtered = allExams.filter(
      (e: CoordinatorExamEntry) => e.department === "CSE" || e.code.startsWith("CS") || e.code.startsWith("IT")
    );
    if (filtered.length > 0) return filtered;

    return [
      {
        id: "ex-cse-1",
        code: "CS701",
        subject: "Distributed Systems & Cloud Computing",
        department: "CSE",
        date: "2026-11-23",
        slot: "09:30 - 12:30 IST",
        room: "Hall A-101",
        invigilator: "Dr. Arvind Sharma (CSE)",
        enrolled: 120,
        status: "Published",
        isIncluded: true,
        durationMinutes: 180,
      },
      {
        id: "ex-cse-2",
        code: "CS704",
        subject: "Cryptography & Network Security",
        department: "CSE",
        date: "2026-11-26",
        slot: "09:30 - 12:30 IST",
        room: "Hall A-101",
        invigilator: "Dr. Arvind Sharma (CSE)",
        enrolled: 115,
        status: "Published",
        isIncluded: true,
        durationMinutes: 180,
      },
      {
        id: "ex-cse-3",
        code: "CS709",
        subject: "High Performance Computing (Elective)",
        department: "CSE",
        date: "2026-11-28",
        slot: "14:00 - 17:00 IST",
        room: "Hall B-204",
        invigilator: "Prof. R. Iyer (ECE)",
        enrolled: 65,
        status: "Published",
        isIncluded: true,
        durationMinutes: 180,
      },
      {
        id: "ex-cse-4",
        code: "CS712",
        subject: "Software Reliability & Fault Tolerance",
        department: "CSE",
        date: "2026-12-02",
        slot: "09:30 - 12:30 IST",
        room: "Hall C-301",
        invigilator: "Dr. P. Kulkarni (Mech)",
        enrolled: 118,
        status: "Published",
        isIncluded: true,
        durationMinutes: 180,
      },
    ] as CoordinatorExamEntry[];
  }, [storeState.coordinatorExams]);

  // Faculty roster distribution for audit
  const facultyRoster = useMemo(() => {
    return [
      { id: "f-1", name: "Dr. Arvind Sharma", designation: "Associate Professor", dutiesAssigned: 3, maxAllowed: 4, status: "Optimal", activeRooms: "Hall A-101, Hall B-204" },
      { id: "f-2", name: "Prof. Snehal Rane", designation: "Assistant Professor", dutiesAssigned: 3, maxAllowed: 4, status: "Optimal", activeRooms: "Hall A-102" },
      { id: "f-3", name: "Dr. Vikram Patil", designation: "Professor", dutiesAssigned: 2, maxAllowed: 3, status: "Optimal", activeRooms: "Drawing Hall D-1" },
      { id: "f-4", name: "Prof. Ananya Deshmukh", designation: "Assistant Professor", dutiesAssigned: 3, maxAllowed: 4, status: "Optimal", activeRooms: "Hall B-201" },
      { id: "f-5", name: "Dr. Nilesh Kulkarni", designation: "Associate Professor", dutiesAssigned: 2, maxAllowed: 4, status: "Optimal", activeRooms: "Hall C-301" },
      { id: "f-6", name: "Prof. R. K. Mehta (HOD)", designation: "Professor & HOD", dutiesAssigned: 0, maxAllowed: 0, status: "Exempt (Ex-Officio)", activeRooms: "Central Control Room" },
    ];
  }, []);

  // Department Students for eligibility audit
  const deptStudents = useMemo(() => {
    return [
      { roll: "CS2023-001", name: "Aarav Sharma", year: "Final Year (Sem 7)", attendance: 88.5, backlogs: 0, status: "Eligible" },
      { roll: "CS2023-014", name: "Bhavya Patel", year: "Final Year (Sem 7)", attendance: 91.0, backlogs: 0, status: "Eligible" },
      { roll: "CS2023-042", name: "Kavya Deshmukh", year: "Final Year (Sem 7)", attendance: 84.5, backlogs: 0, status: "Eligible" },
      { roll: "CS2023-068", name: "Rohan Kulkarni", year: "Final Year (Sem 7)", attendance: 71.5, backlogs: 1, status: "Condonation Required" },
      { roll: "CS2023-095", name: "Siddharth More", year: "Final Year (Sem 7)", attendance: 89.0, backlogs: 0, status: "Eligible" },
      { roll: "CS2023-112", name: "Tanvi Joshi", year: "Final Year (Sem 7)", attendance: 68.0, backlogs: 2, status: "Detained (Low Attendance)" },
    ];
  }, []);

  const totalRegisteredStudents = 235;
  const facultyDeployedCount = 5;
  const totalFacultyInDept = 6;

  const handleApproveSchedule = () => {
    setApprovalStatus("APPROVED");
    showToast("Departmental exam schedule formally approved. COE notified.");
  };

  const handleToggleCondonation = (roll: string) => {
    setCondonedStudents((prev) => ({
      ...prev,
      [roll]: !prev[roll],
    }));
    showToast(`HOD attendance condonation updated for student ${roll}.`);
  };

  return (
    <div className="dash-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="official-toast-banner">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-header">
          <div className="dash-logo-badge">
            <Building2 size={24} className="text-brand-light" />
          </div>
          <div>
            <h1 className="dash-brand-title">Nexora ERP</h1>
            <p className="dash-brand-sub">HOD Departmental Console</p>
          </div>
        </div>

        <nav className="dash-nav-list">
          <button
            className={`dash-nav-item ${activeMenu === "overview" ? "active" : ""}`}
            onClick={() => setActiveMenu("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Department Console</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "courses" ? "active" : ""}`}
            onClick={() => setActiveMenu("courses")}
          >
            <BookOpen size={18} />
            <span>Course Offerings</span>
            <span className="dash-nav-badge">{deptSubjects.length}</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "invigilation" ? "active" : ""}`}
            onClick={() => setActiveMenu("invigilation")}
          >
            <Users size={18} />
            <span>Faculty Duty Audit</span>
            <span className="dash-nav-badge">{facultyDeployedCount}/{totalFacultyInDept}</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "students" ? "active" : ""}`}
            onClick={() => setActiveMenu("students")}
          >
            <UserCheck size={18} />
            <span>Student Eligibility</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "approval" ? "active" : ""}`}
            onClick={() => setActiveMenu("approval")}
          >
            <ShieldCheck size={18} />
            <span>Timetable Review & Sign-Off</span>
          </button>
        </nav>

        {/* Sidebar Footer: Profile & Switcher */}
        <div className="dash-sidebar-footer">
          <div className="dash-user-profile-card">
            <div className="dash-avatar-circle">
              {hodName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="dash-user-info">
              <span className="dash-user-name">{hodName}</span>
              <span className="dash-user-id">HOD • Computer Science</span>
            </div>
          </div>

          <div className="dash-role-switcher-row">
            <span className="dash-role-label">Active Role:</span>
            <select
              className="dash-role-select"
              value={currentUser?.role || UserRole.HOD}
              onChange={(e) => {
                const targetRole = e.target.value as UserRole;
                if (onSwitchRole) onSwitchRole(targetRole);
                else switchRole(targetRole);
              }}
            >
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.EXAM_COORDINATOR}>Exam Coordinator</option>
              <option value={UserRole.DEPARTMENTAL_COORDINATOR}>Dept Coordinator</option>
              <option value={UserRole.HOD}>Head of Department</option>
              <option value={UserRole.FACULTY}>Faculty</option>
              <option value={UserRole.STUDENT}>Student</option>
            </select>
          </div>

          <button
            className="dash-logout-btn"
            onClick={() => {
              if (onLogout) onLogout();
              else logout();
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="dash-main">
        {/* TOPBAR */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <span className="dash-breadcrumb">Autonomous Administration / HOD Portal</span>
            <h2 className="dash-page-title">
              {activeMenu === "overview" && "Department Academic Head Overview"}
              {activeMenu === "courses" && "Department Course Offerings & Exam Syllabi"}
              {activeMenu === "invigilation" && "Faculty Invigilation Workload Audit"}
              {activeMenu === "students" && "Candidate Eligibility & Attendance Clearances"}
              {activeMenu === "approval" && "Departmental Timetable Review & Verification"}
            </h2>
          </div>

          <div className="dash-topbar-right">
            <div className="dash-clock-pill">
              <Clock size={15} className="text-brand-light" />
              <span>{currentTime || "IST Live"}</span>
            </div>

            <div className="dash-badge-status-green">
              <ShieldCheck size={14} />
              <span>Dept Clearance Active</span>
            </div>

            <button
              className="dash-primary-btn"
              onClick={handleApproveSchedule}
            >
              <CheckCircle2 size={16} />
              <span>Formally Approve Schedule</span>
            </button>
          </div>
        </header>

        {/* CONTENT PANELS */}
        <div className="dash-content">
          {/* TAB 1: OVERVIEW */}
          {activeMenu === "overview" && (
            <div className="dash-view-stack">
              {/* Top Banner */}
              <div className="faculty-hero-banner">
                <div className="hero-banner-content">
                  <div className="hero-badge">Autonomous Department Console • Autumn 2026-27</div>
                  <h3 className="hero-title">{deptName}</h3>
                  <p className="hero-subtitle">
                    Head of Department: <strong>{hodName}</strong> • Scope: <strong>B.Tech Computer Science & Engineering</strong> • Status: <strong>Ready for Examinations</strong>
                  </p>
                </div>
                <div className="faculty-workload-gauge">
                  <div className="gauge-label">
                    <span>Department Readiness</span>
                    <strong>100% Verified</strong>
                  </div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: "100%" }} />
                  </div>
                  <span className="gauge-note">Zero schedule conflicts across all 4 cohorts</span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="dash-kpi-grid">
                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Registered CSE Candidates</span>
                    <Users size={18} className="text-brand" />
                  </div>
                  <div className="kpi-value font-mono">{totalRegisteredStudents}</div>
                  <div className="kpi-sub">
                    <span className="text-success">All exam registrations validated</span>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Faculty Deployed</span>
                    <UserCheck size={18} className="text-brand" />
                  </div>
                  <div className="kpi-value font-mono">{facultyDeployedCount} / {totalFacultyInDept}</div>
                  <div className="kpi-sub">
                    <span>Equitable invigilation distribution</span>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Departmental Status</span>
                    <ShieldCheck size={18} className="text-success" />
                  </div>
                  <div className="kpi-value text-success" style={{ fontSize: "20px" }}>
                    {approvalStatus}
                  </div>
                  <div className="kpi-sub">
                    <span>Meets CSE autonomous norms</span>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Venue Allocation</span>
                    <MapPin size={18} className="text-brand" />
                  </div>
                  <div className="kpi-value font-mono" style={{ fontSize: "18px" }}>
                    Halls A-101 & B-204
                  </div>
                  <div className="kpi-sub">
                    <span>86.4% optimal capacity utilization</span>
                  </div>
                </div>
              </div>

              {/* Department Exam Offerings Table */}
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Department Examination Offerings & Invigilation Audit</h3>
                    <p className="panel-card-sub">
                      End Semester Examinations (ESE 2026) scheduled papers and appointed Chief Invigilators
                    </p>
                  </div>
                  <button
                    className="btn-outline-primary"
                    onClick={() => setActiveMenu("approval")}
                  >
                    Review & Sign-Off
                  </button>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Subject Title</th>
                        <th>Date & Slot (IST)</th>
                        <th>Enrolled Candidates</th>
                        <th>Assigned Hall</th>
                        <th>Designated Chief Invigilator</th>
                        <th>Clearance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptExams.map((exam: CoordinatorExamEntry) => (
                        <tr key={exam.id}>
                          <td className="font-mono font-bold text-brand">{exam.code}</td>
                          <td className="font-semibold">{exam.subject}</td>
                          <td>
                            <div>{exam.date}</div>
                            <div className="text-xs text-muted">{exam.slot}</div>
                          </td>
                          <td className="font-mono">{exam.enrolled}</td>
                          <td>
                            <div className="font-semibold">{exam.room}</div>
                          </td>
                          <td>
                            <div className="font-semibold">{exam.invigilator}</div>
                          </td>
                          <td>
                            <span className="status-badge-approved">
                              <CheckCircle2 size={13} />
                              <span>Approved</span>
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

          {/* TAB 2: COURSE OFFERINGS */}
          {activeMenu === "courses" && (
            <div className="dash-view-stack">
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">CSE Department Course Offerings & Exam Syllabi</h3>
                    <p className="panel-card-sub">
                      Autonomous Curriculum 2026-27 (National Education Policy & Cycle 2/3 CBCS)
                    </p>
                  </div>
                  <button
                    className="dash-primary-btn"
                    onClick={() => window.print()}
                  >
                    <Printer size={16} />
                    <span>Print Syllabus Circular</span>
                  </button>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Subject Title</th>
                        <th>Curriculum Structure</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Enrolled Strength</th>
                        <th>Exam Paper Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptSubjects.map((sub: SubjectRecord) => (
                        <tr key={sub.id}>
                          <td className="font-mono font-bold text-brand">{sub.code}</td>
                          <td className="font-semibold">{sub.title}</td>
                          <td>
                            <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 rounded">
                              {sub.curriculumStructure || "NEP 2020"}
                            </span>
                          </td>
                          <td className="font-mono">{sub.credits} Credits</td>
                          <td>{sub.type}</td>
                          <td className="font-mono">{sub.enrolledStudents} Students</td>
                          <td className="font-mono">180 Mins (3.0 Hrs)</td>
                          <td>
                            <span className="status-badge-approved">
                              <CheckCircle2 size={13} />
                              <span>Active</span>
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

          {/* TAB 3: FACULTY DUTY AUDIT */}
          {activeMenu === "invigilation" && (
            <div className="dash-view-stack">
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Faculty Invigilation Workload Equity Audit</h3>
                    <p className="panel-card-sub">
                      Auditing duty distribution to ensure balanced allocation and compliance with university policies.
                    </p>
                  </div>
                  <button
                    className="dash-primary-btn"
                    onClick={() => showToast("Duty audit report exported successfully.")}
                  >
                    <Download size={16} />
                    <span>Export Audit Report</span>
                  </button>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Faculty Member</th>
                        <th>Designation</th>
                        <th>Assigned Duties</th>
                        <th>Workload Limit</th>
                        <th>Assigned Venues</th>
                        <th>Equity Compliance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyRoster.map((f) => (
                        <tr key={f.id}>
                          <td className="font-bold">{f.name}</td>
                          <td className="text-muted">{f.designation}</td>
                          <td className="font-mono font-bold">{f.dutiesAssigned}</td>
                          <td className="font-mono">{f.maxAllowed}</td>
                          <td className="text-xs text-muted">{f.activeRooms}</td>
                          <td>
                            <span className="status-badge-approved">
                              <CheckCircle2 size={13} />
                              <span>{f.status}</span>
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

          {/* TAB 4: STUDENT ELIGIBILITY */}
          {activeMenu === "students" && (
            <div className="dash-view-stack">
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Student Attendance & Examination Eligibility Clearance</h3>
                    <p className="panel-card-sub">
                      Autonomous regulation requires minimum 75% attendance. HOD may grant condonation up to 65% for medical / authorized athletic leaves.
                    </p>
                  </div>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>PRN / Roll Number</th>
                        <th>Candidate Name</th>
                        <th>Year & Cohort</th>
                        <th>Attendance %</th>
                        <th>Backlog Count</th>
                        <th>Eligibility Status</th>
                        <th>HOD Condonation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptStudents.map((s) => {
                        const isCondoned = condonedStudents[s.roll];
                        return (
                          <tr key={s.roll}>
                            <td className="font-mono font-bold text-brand">{s.roll}</td>
                            <td className="font-semibold">{s.name}</td>
                            <td>{s.year}</td>
                            <td className="font-mono font-bold">
                              <span className={s.attendance < 75 ? "text-danger" : "text-success"}>
                                {s.attendance}%
                              </span>
                            </td>
                            <td className="font-mono">{s.backlogs}</td>
                            <td>
                              {isCondoned || s.status === "Eligible" ? (
                                <span className="status-badge-approved">
                                  <CheckCircle2 size={13} />
                                  <span>Cleared {isCondoned ? "(Condoned)" : ""}</span>
                                </span>
                              ) : (
                                <span className="status-badge-rejected">
                                  <AlertTriangle size={13} />
                                  <span>{s.status}</span>
                                </span>
                              )}
                            </td>
                            <td>
                              {s.attendance < 75 && (
                                <button
                                  className={`dash-sm-btn ${isCondoned ? "secondary" : "success"}`}
                                  onClick={() => handleToggleCondonation(s.roll)}
                                >
                                  {isCondoned ? "Revoke Condonation" : "Grant Condonation"}
                                </button>
                              )}
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

          {/* TAB 5: TIMETABLE REVIEW & SIGN OFF */}
          {activeMenu === "approval" && (
            <div className="dash-view-stack">
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Formal Departmental Timetable Review & Approval</h3>
                    <p className="panel-card-sub">
                      End Semester Examinations (ESE 2026). Digital sign-off transmits formal departmental concurrence to the Controller of Examinations.
                    </p>
                  </div>
                </div>

                <div className="approval-card-body">
                  <div className="approval-meta-grid">
                    <div className="meta-box">
                      <span className="meta-label">Department:</span>
                      <strong>Computer Science & Engineering</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Exam Cycle:</span>
                      <strong>End Semester Examinations (ESE) 2026</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Solver Validation:</span>
                      <strong className="text-success">OPTIMAL (0 Clashes)</strong>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Approval State:</span>
                      <strong className="text-success">{approvalStatus}</strong>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "20px" }}>
                    <label className="form-label">Departmental Review Remarks</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={approvalRemarks}
                      onChange={(e) => setApprovalRemarks(e.target.value)}
                    />
                  </div>

                  <div className="approval-actions-footer">
                    <button
                      className="dash-primary-btn"
                      onClick={handleApproveSchedule}
                    >
                      <CheckCircle2 size={18} />
                      <span>Formally Approve & Sign-Off Timetable</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
