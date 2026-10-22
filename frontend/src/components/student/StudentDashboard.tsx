import React, { useState, useEffect, useMemo } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import {
  AcademicDataStore,
  CoordinatorExamEntry,
  StudentRegistrationRecord,
  GrievanceRecord,
  ExamCycleRecord,
  SeatingRecord,
} from "../../services/academicDataStore.js";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Printer,
  Building2,
  ShieldCheck,
  UserCheck,
  Send,
  Plus,
  X,
} from "lucide-react";
import "../../styles/dashboard.css";

interface StudentDashboardProps {
  onSwitchRole?: (role: UserRole) => void;
  onLogout?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSwitchRole,
  onLogout,
}) => {
  const { currentUser, switchRole, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string>("overview");
  const [storeState, setStoreState] = useState(AcademicDataStore.getSnapshot());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPRN, setSearchPRN] = useState("CS2023-042");
  const [grievanceModalOpen, setGrievanceModalOpen] = useState(false);
  const [grievanceSubject, setGrievanceSubject] = useState("");
  const [grievanceCategory, setGrievanceCategory] = useState<"Scheduling Clash" | "Venue Facility" | "Special Accommodation" | "Hall Ticket Issue">("Scheduling Clash");
  const [grievanceDesc, setGrievanceDesc] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    return AcademicDataStore.subscribe(() => {
      setStoreState(AcademicDataStore.getSnapshot());
    });
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
        " | " +
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const studentName = currentUser?.name || "Aarav Sharma";
  const studentPRN = currentUser?.identifier || "CS2023-042";
  const studentDept = currentUser?.department || "Computer Science & Engineering";

  // Active exam cycle
  const activeCycle = useMemo(() => {
    return (
      storeState.examCycles.find((c: ExamCycleRecord) => c.status === "In Progress" || c.status === "Configured") ||
      storeState.examCycles[0]
    );
  }, [storeState.examCycles]);

  // Timetable scheduled papers
  const scheduledPapers: CoordinatorExamEntry[] = useMemo(() => {
    return storeState.coordinatorExams.filter((e: CoordinatorExamEntry) => !e.cycleId || e.cycleId === activeCycle.id);
  }, [storeState.coordinatorExams, activeCycle.id]);

  // Student's registered subjects
  const studentRegistrations: StudentRegistrationRecord[] = useMemo(() => {
    return storeState.studentRegistrations.filter(
      (r: StudentRegistrationRecord) => r.studentId === currentUser?.id || r.rollNo === studentPRN || r.name.toLowerCase().includes(studentName.toLowerCase())
    );
  }, [storeState.studentRegistrations, currentUser, studentPRN, studentName]);

  // Student's personalized examination schedule with seating
  const studentExamSchedule = useMemo(() => {
    const defaultCodes = ["UCSPC0701", "UCSPC0702", "UCSPC0703", "UCSPE0711", "UILOE0726", "CS701", "CS704"];
    return scheduledPapers.filter((p) => {
      if (p.department === "CSE" || p.programCode === "BTECH-CSE" || defaultCodes.includes(p.code)) {
        return true;
      }
      return studentRegistrations.some((r: StudentRegistrationRecord) => r.subjectCode === p.code);
    });
  }, [scheduledPapers, studentRegistrations]);

  // Next upcoming exam
  const nextExam = useMemo(() => {
    if (studentExamSchedule.length === 0) return null;
    return studentExamSchedule[0];
  }, [studentExamSchedule]);

  // Student's seating desk
  const studentDeskNumber = useMemo(() => {
    const seat = storeState.seatingRecords.find(
      (s: SeatingRecord) => s.studentRoll === studentPRN || s.studentName.toLowerCase().includes(studentName.toLowerCase())
    );
    return seat ? seat.deskNo : "Desk-14";
  }, [storeState.seatingRecords, studentPRN, studentName]);

  // Handle grievance submit
  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceSubject || !grievanceDesc) {
      showToast("Please fill in all grievance details.");
      return;
    }
    const res = AcademicDataStore.submitGrievance(
      {
        title: `${grievanceCategory}: ${grievanceSubject}`,
        category: grievanceCategory,
        priority: "High",
        status: "Open",
        submittedBy: `${studentName} (${studentPRN})`,
        userRole: "Student",
        assignedTo: "Examination Cell",
        description: grievanceDesc,
      },
      studentName
    );
    if (res.success) {
      showToast("Academic Grievance submitted successfully to Examination Cell.");
      setGrievanceModalOpen(false);
      setGrievanceSubject("");
      setGrievanceDesc("");
    }
  };

  const handlePrintHallTicket = () => {
    window.print();
  };

  return (
    <div className="dash-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13.5px",
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} style={{ color: "#10b981" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          LEFT SIDEBAR: Student Portal Navigation
          ========================================================= */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <div className="dash-brand-icon-box">
            <span>N</span>
          </div>
          <div className="dash-brand-titles">
            <span className="dash-brand-title">Nexora Campus</span>
            <span className="dash-brand-subtitle">Student Examination Portal</span>
          </div>
        </div>

        {/* Student Badge Card */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-default)", background: "#f8fafc" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{studentName}</div>
          <div style={{ fontSize: "11.5px", color: "#2563eb", fontWeight: 600, marginTop: "2px" }}>PRN: {studentPRN}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{studentDept}</div>
          <div style={{ marginTop: "6px", display: "inline-block", padding: "2px 8px", background: "#ecfdf5", color: "#065f46", borderRadius: "12px", fontSize: "10.5px", fontWeight: 600 }}>
            Eligible • Hall Ticket Issued
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="dash-nav">
          <div className="dash-nav-group-title">ACADEMIC EXAMS</div>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "overview" ? "active" : ""}`}
            onClick={() => setActiveMenu("overview")}
          >
            <LayoutDashboard size={17} />
            <span>1. Student Console</span>
          </button>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "timetable" ? "active" : ""}`}
            onClick={() => setActiveMenu("timetable")}
          >
            <Calendar size={17} />
            <span>2. Schedule & Seating</span>
          </button>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "hall-ticket" ? "active" : ""}`}
            onClick={() => setActiveMenu("hall-ticket")}
          >
            <FileText size={17} />
            <span>3. Admit Card / Hall Ticket</span>
          </button>

          <div className="dash-nav-group-title" style={{ marginTop: "12px" }}>REGISTRATIONS & ELIGIBILITY</div>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "registration" ? "active" : ""}`}
            onClick={() => setActiveMenu("registration")}
          >
            <ClipboardList size={17} />
            <span>4. Subject Registrations</span>
          </button>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "eligibility" ? "active" : ""}`}
            onClick={() => setActiveMenu("eligibility")}
          >
            <ShieldCheck size={17} />
            <span>5. Attendance & Clearance</span>
          </button>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "grievances" ? "active" : ""}`}
            onClick={() => setActiveMenu("grievances")}
          >
            <AlertCircle size={17} />
            <span>6. Special Accommodations</span>
          </button>
        </nav>

        {/* Bottom Institutional Info */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-default)", fontSize: "11px", color: "var(--text-muted)" }}>
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>KITCoEK Autonomous</div>
          <div>Controller of Examinations</div>
        </div>
      </aside>

      {/* =========================================================
          MAIN APPLICATION AREA
          ========================================================= */}
      <div className="dash-main">
        {/* Top Header Bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <span className="dash-cycle-indicator">
              <span className="dash-cycle-pulse"></span>
              {activeCycle.name}
            </span>
            <span style={{ fontSize: "12.5px", color: "var(--text-muted)", marginLeft: "8px" }}>
              Academic Year 2026-27 (Odd Semester)
            </span>
          </div>

          <div className="dash-topbar-right">
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
              {currentTime}
            </span>

            {/* Quick Role Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Switch:</span>
              <select
                className="dash-filter-select"
                value="student"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "admin" && onSwitchRole) onSwitchRole(UserRole.ADMIN);
                  else if (val === "coordinator" && onSwitchRole) onSwitchRole(UserRole.EXAM_COORDINATOR);
                  else if (val === "deptCoordinator" && onSwitchRole) onSwitchRole(UserRole.DEPARTMENTAL_COORDINATOR);
                  else if (val === "faculty" && onSwitchRole) onSwitchRole(UserRole.FACULTY);
                  else if (val === "hod" && onSwitchRole) onSwitchRole(UserRole.HOD);
                  else if (switchRole) switchRole(val as any);
                }}
                style={{ padding: "4px 8px", fontSize: "12px" }}
              >
                <option value="student">Student (Aarav)</option>
                <option value="faculty">Faculty (Dr. Arvind)</option>
                <option value="deptCoordinator">Dept Coordinator (Rajesh)</option>
                <option value="coordinator">Exam Coordinator (Sarah)</option>
                <option value="hod">HOD (Prof. Mehta)</option>
                <option value="admin">Admin (Sanika)</option>
              </select>
            </div>

            <button
              type="button"
              className="dash-btn dash-btn-outline"
              onClick={onLogout || logout}
              style={{ padding: "5px 12px", fontSize: "12px" }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* =========================================================
            VIEW 1: OVERVIEW & NEXT EXAM COUNTDOWN
            ========================================================= */}
        {activeMenu === "overview" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Student Examination Dashboard</h1>
                <p className="dash-view-subtitle">
                  Autonomous End-Semester Examination (ESE 2026) candidate workstation & hall allocations
                </p>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={() => setActiveMenu("hall-ticket")}
              >
                <Printer size={15} />
                <span>View & Print Admit Card</span>
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="dash-stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Registered Papers</div>
                <div className="dash-stat-value">{studentExamSchedule.length}</div>
                <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                  All 100% Verified & Approved
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Admit Card Status</div>
                <div className="dash-stat-value" style={{ color: "#10b981", fontSize: "20px" }}>
                  Issued & Live
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Barcode #2026-CS-042 verified
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Average Attendance</div>
                <div className="dash-stat-value" style={{ color: "#2563eb" }}>88.4%</div>
                <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                  Above 75.0% Mandatory Threshold
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Permanent Desk Allocation</div>
                <div className="dash-stat-value font-mono" style={{ color: "#7c3aed", fontSize: "20px" }}>
                  {studentDeskNumber}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Alternating Branch Anti-Cheating Plan
                </div>
              </div>
            </div>

            {/* Next Exam Card */}
            {nextExam && (
              <div
                className="dash-card"
                style={{
                  marginTop: "20px",
                  background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                  color: "#ffffff",
                  border: "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ display: "inline-block", padding: "3px 10px", background: "rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
                      UPCOMING EXAMINATION
                    </span>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "10px 0 6px" }}>
                      {nextExam.code}: {nextExam.subject}
                    </h2>
                    <div style={{ fontSize: "13.5px", opacity: 0.9 }}>
                      Branch: <strong>{nextExam.department}</strong> | Curriculum: <strong>{nextExam.curriculumStructure || "NEP 2020"}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11.5px", opacity: 0.8 }}>EXAMINATION VENUE</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "2px" }}>{nextExam.room}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#93c5fd", marginTop: "2px" }}>
                      Allocated Seat: {studentDeskNumber}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "24px", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={16} />
                    <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{nextExam.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} />
                    <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{nextExam.slot} (Reporting 30m prior)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserCheck size={16} />
                    <span style={{ fontSize: "13.5px" }}>Invigilator: {nextExam.invigilator}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Overview Table */}
            <div className="dash-card" style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Registered Examination Papers</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                    Schedule of papers assigned to candidate {studentName} ({studentPRN})
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  onClick={() => setActiveMenu("timetable")}
                  style={{ fontSize: "12px" }}
                >
                  View Full Seating Plan →
                </button>
              </div>

              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Subject Title</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Exam Hall</th>
                      <th>Desk No</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentExamSchedule.map((paper) => (
                      <tr key={paper.id}>
                        <td style={{ fontWeight: 700, color: "#2563eb" }}>{paper.code}</td>
                        <td style={{ fontWeight: 600 }}>{paper.subject}</td>
                        <td>{paper.date}</td>
                        <td>{paper.slot}</td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                            <Building2 size={13} style={{ color: "#2563eb" }} />
                            {paper.room}
                          </span>
                        </td>
                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#7c3aed" }}>
                          {studentDeskNumber}
                        </td>
                        <td>
                          <span style={{ padding: "2px 8px", background: "#ecfdf5", color: "#065f46", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
                            Scheduled
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

        {/* =========================================================
            VIEW 2: TIMETABLE & SEATING
            ========================================================= */}
        {activeMenu === "timetable" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Examination Timetable & Seating Hall Allocation</h1>
                <p className="dash-view-subtitle">
                  Verified date-wise examination schedule, venue locations, and PRN desk locator
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary"
                  onClick={() => setActiveMenu("hall-ticket")}
                >
                  <Printer size={15} />
                  <span>Download Hall Ticket</span>
                </button>
              </div>
            </div>

            {/* Instant PRN Desk Finder */}
            <div className="dash-card" style={{ marginBottom: "20px", background: "#f8fafc", border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <Search size={18} style={{ color: "#2563eb" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>Instant Candidate Desk Locator</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    Enter candidate Permanent Registration Number (PRN) to verify assigned exam venue & desk label
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="dash-search-input"
                    placeholder="Enter PRN (e.g. CS2023-042)"
                    value={searchPRN}
                    onChange={(e) => setSearchPRN(e.target.value)}
                    style={{ width: "220px", padding: "6px 10px" }}
                  />
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    onClick={() => showToast(`Verified: Candidate ${searchPRN} is allocated ${studentDeskNumber} in ${nextExam?.room || "Hall A-101"}`)}
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                  >
                    Locate Desk
                  </button>
                </div>
              </div>
            </div>

            {/* Timetable Table */}
            <div className="dash-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <input
                  type="text"
                  className="dash-search-input"
                  placeholder="Filter schedule by code or subject title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "320px" }}
                />
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Showing {studentExamSchedule.length} Examination Papers
                </span>
              </div>

              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Date</th>
                      <th>Shift & Slot (IST)</th>
                      <th>Allocated Venue</th>
                      <th>Desk No</th>
                      <th>Reporting Time</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentExamSchedule
                      .filter((p) => p.code.toLowerCase().includes(searchQuery.toLowerCase()) || p.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((p, idx) => (
                        <tr key={p.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 700, color: "#2563eb" }}>{p.code}</td>
                          <td style={{ fontWeight: 600 }}>{p.subject}</td>
                          <td style={{ fontWeight: 600 }}>{p.date}</td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={13} style={{ color: "#64748b" }} />
                              {p.slot}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.room}</span>
                          </td>
                          <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#7c3aed", fontSize: "13px" }}>
                            {studentDeskNumber}
                          </td>
                          <td style={{ color: "#b45309", fontWeight: 600, fontSize: "12px" }}>
                            09:30 AM
                          </td>
                          <td style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                            Calculator permitted
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 3: OFFICIAL ADMIT CARD / HALL TICKET
            ========================================================= */}
        {activeMenu === "hall-ticket" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Official Examination Admit Card & Hall Ticket</h1>
                <p className="dash-view-subtitle">
                  Authorized institutional hall ticket for Autonomous End-Semester Examination 2026-27
                </p>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={handlePrintHallTicket}
              >
                <Printer size={15} />
                <span>Print / Download PDF</span>
              </button>
            </div>

            {/* Printable Hall Ticket Document */}
            <div
              className="dash-card"
              style={{
                maxWidth: "850px",
                margin: "0 auto",
                padding: "30px 40px",
                border: "2px solid #0f172a",
                background: "#ffffff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              {/* University Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "20px" }}>
                <div style={{ fontSize: "19px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Kolhapur Institute of Technology&apos;s College of Engineering (Autonomous)
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#475569", marginTop: "2px" }}>
                  Gokul Shirgaon, Kolhapur, Maharashtra 416234
                </div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e3a8a", marginTop: "6px", textTransform: "uppercase" }}>
                  OFFICIAL ADMIT CARD • END SEMESTER EXAMINATION (ESE 2026)
                </div>
              </div>

              {/* Student Metadata Strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "20px", marginBottom: "20px", padding: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>Candidate Name:</span>
                  <span style={{ fontWeight: 800 }}>{studentName}</span>

                  <span style={{ color: "#64748b", fontWeight: 600 }}>PRN / Roll No:</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#2563eb" }}>{studentPRN}</span>

                  <span style={{ color: "#64748b", fontWeight: 600 }}>Academic Program:</span>
                  <span style={{ fontWeight: 700 }}>B.Tech in Computer Science & Engineering</span>

                  <span style={{ color: "#64748b", fontWeight: 600 }}>Year & Semester:</span>
                  <span style={{ fontWeight: 600 }}>Fourth Year • Semester VII (Batch 2023-27)</span>

                  <span style={{ color: "#64748b", fontWeight: 600 }}>Permanent Desk:</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#7c3aed" }}>{studentDeskNumber}</span>
                </div>

                {/* Candidate Photo & Barcode Box */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #94a3b8", borderRadius: "4px", padding: "8px" }}>
                  <div style={{ width: "90px", height: "100px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#64748b", fontWeight: 600, textAlign: "center" }}>
                    CANDIDATE PHOTO
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", fontFamily: "monospace" }}>
                    *CS2023-042*
                  </div>
                </div>
              </div>

              {/* Papers Schedule Table */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
                  Scheduled Course Papers & Invigilator Sign-Off
                </div>
                <table className="dash-table" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Venue</th>
                      <th>Seat No</th>
                      <th>Invigilator Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentExamSchedule.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: "#2563eb" }}>{p.code}</td>
                        <td style={{ fontWeight: 600 }}>{p.subject}</td>
                        <td>{p.date}</td>
                        <td>{p.slot}</td>
                        <td style={{ fontWeight: 700 }}>{p.room}</td>
                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#7c3aed" }}>{studentDeskNumber}</td>
                        <td style={{ borderBottom: "1px dotted #94a3b8", width: "110px" }}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions to Candidates */}
              <div style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5, borderTop: "1px solid #cbd5e1", paddingTop: "12px", marginBottom: "24px" }}>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>IMPORTANT INSTRUCTIONS TO EXAMINEES:</div>
                <ol style={{ margin: 0, paddingLeft: "16px" }}>
                  <li>Candidates must occupy their assigned seats 20 minutes before the commencement of examination.</li>
                  <li>No candidate will be admitted to the hall after 15 minutes from the scheduled start time.</li>
                  <li>Possession of mobile phones, smartwatches, or unauthorized study material is strictly prohibited.</li>
                  <li>This admit card must be produced on demand by the Chief Superintendent or Invigilator.</li>
                </ol>
              </div>

              {/* Authorization Signatures */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "30px", paddingTop: "20px" }}>
                <div style={{ textAlign: "center", width: "180px" }}>
                  <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "6px", height: "30px" }}></div>
                  <div style={{ fontSize: "11px", fontWeight: 700 }}>Candidate&apos;s Signature</div>
                </div>

                <div style={{ textAlign: "center", width: "180px" }}>
                  <div style={{ borderBottom: "1px solid #0f172a", marginBottom: "6px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", fontWeight: 800, fontSize: "12px" }}>
                    VERIFIED & APPROVED
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700 }}>Controller of Examinations</div>
                  <div style={{ fontSize: "9.5px", color: "#64748b" }}>KIT&apos;s Autonomous Exam Cell</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 4: COURSE REGISTRATIONS & ELECTIVES
            ========================================================= */}
        {activeMenu === "registration" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Subject Registrations & Elective Selections</h1>
                <p className="dash-view-subtitle">
                  Academic registrations for Autumn 2026-27 term across Regular and Backlog categories
                </p>
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Title</th>
                      <th>Department</th>
                      <th>Category</th>
                      <th>Credits</th>
                      <th>Attendance</th>
                      <th>Fee Clearance</th>
                      <th>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRegistrations.length > 0 ? (
                      studentRegistrations.map((reg) => (
                        <tr key={reg.id}>
                          <td style={{ fontWeight: 700, color: "#2563eb" }}>{reg.subjectCode}</td>
                          <td style={{ fontWeight: 600 }}>{reg.subjectTitle}</td>
                          <td>{reg.departmentCode}</td>
                          <td>
                            <span style={{ padding: "2px 8px", background: reg.registrationType === "Regular" ? "#eff6ff" : "#fef3c7", color: reg.registrationType === "Regular" ? "#1e40af" : "#92400e", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
                              {reg.registrationType}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>4 Credits</td>
                          <td style={{ fontWeight: 700, color: reg.attendancePercentage >= 75 ? "#10b981" : "#ef4444" }}>
                            {reg.attendancePercentage.toFixed(1)}%
                          </td>
                          <td>
                            <span style={{ color: "#10b981", fontWeight: 600, fontSize: "12px" }}>Cleared</span>
                          </td>
                          <td>
                            <span style={{ padding: "2px 8px", background: "#ecfdf5", color: "#065f46", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
                              {reg.eligibilityStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          All 7 enrolled course papers are actively registered and eligible for examination.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 5: ATTENDANCE & CLEARANCE
            ========================================================= */}
        {activeMenu === "eligibility" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Attendance & Exam Eligibility Clearance</h1>
                <p className="dash-view-subtitle">
                  Autonomous institute attendance tracking compliance (Minimum 75.0% requirement)
                </p>
              </div>
            </div>

            <div className="dash-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "20px" }}>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Term Attendance</div>
                <div className="dash-stat-value" style={{ color: "#10b981" }}>88.4%</div>
                <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                  Compliant with Institute Norms
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Fee Clearance</div>
                <div className="dash-stat-value" style={{ color: "#10b981", fontSize: "20px" }}>100% Cleared</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Exam fee receipt verified
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Admit Card Release</div>
                <div className="dash-stat-value" style={{ color: "#2563eb", fontSize: "20px" }}>Authorized</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Digital signature appended
                </div>
              </div>
            </div>

            <div className="dash-card">
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>Course-Level Attendance Breakdown</h3>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Title</th>
                      <th>Lectures Conducted</th>
                      <th>Lectures Attended</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700 }}>CS701</td>
                      <td>Distributed Systems & Cloud Computing</td>
                      <td>45</td>
                      <td>41</td>
                      <td style={{ fontWeight: 700, color: "#10b981" }}>91.1%</td>
                      <td><span style={{ color: "#065f46", fontWeight: 600 }}>Eligible</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>CS704</td>
                      <td>Cryptography & Information Security</td>
                      <td>42</td>
                      <td>36</td>
                      <td style={{ fontWeight: 700, color: "#10b981" }}>85.7%</td>
                      <td><span style={{ color: "#065f46", fontWeight: 600 }}>Eligible</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>UCSPE0711</td>
                      <td>Digital Image Processing (PE III)</td>
                      <td>38</td>
                      <td>33</td>
                      <td style={{ fontWeight: 700, color: "#10b981" }}>86.8%</td>
                      <td><span style={{ color: "#065f46", fontWeight: 600 }}>Eligible</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>UILOE0726</td>
                      <td>Urban and Rural Planning (OE III)</td>
                      <td>36</td>
                      <td>32</td>
                      <td style={{ fontWeight: 700, color: "#10b981" }}>88.8%</td>
                      <td><span style={{ color: "#065f46", fontWeight: 600 }}>Eligible</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 6: SPECIAL ACCOMMODATIONS & GRIEVANCES
            ========================================================= */}
        {activeMenu === "grievances" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Academic Accommodations & Grievance Cell</h1>
                <p className="dash-view-subtitle">
                  Submit examination clash reports, venue barrier-free requests, or admit card corrections
                </p>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={() => setGrievanceModalOpen(true)}
              >
                <Plus size={15} />
                <span>Submit Grievance / Request</span>
              </button>
            </div>

            <div className="dash-card">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Ticket ID</th>
                      <th>Category</th>
                      <th>Title / Subject</th>
                      <th>Description</th>
                      <th>Date Filed</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeState.grievances
                      .filter((g: GrievanceRecord) => g.submittedBy.includes(studentPRN) || g.submittedBy.toLowerCase().includes(studentName.toLowerCase()))
                      .map((g: GrievanceRecord) => (
                        <tr key={g.id}>
                          <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{g.ticketNumber || g.id}</td>
                          <td><span style={{ fontWeight: 600 }}>{g.category}</span></td>
                          <td style={{ fontWeight: 700, color: "#2563eb" }}>{g.title}</td>
                          <td>{g.description}</td>
                          <td>{g.date}</td>
                          <td>
                            <span style={{ padding: "2px 8px", background: "#fef3c7", color: "#92400e", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
                              {g.priority}
                            </span>
                          </td>
                          <td>
                            <span style={{ padding: "2px 8px", background: g.status === "Resolved" ? "#ecfdf5" : "#eff6ff", color: g.status === "Resolved" ? "#065f46" : "#1e40af", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {storeState.grievances.filter((g: GrievanceRecord) => g.submittedBy.includes(studentPRN)).length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No pending grievances. All exam arrangements are conflict-free.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Submit Grievance */}
            {grievanceModalOpen && (
              <div className="dash-modal-backdrop">
                <div className="dash-modal-card" style={{ maxWidth: "520px" }}>
                  <div className="dash-modal-header">
                    <div>
                      <h3 className="dash-modal-title">Submit Academic Grievance</h3>
                      <p className="dash-modal-subtitle">Direct escalation to Central Examination Cell</p>
                    </div>
                    <button type="button" className="dash-modal-close" onClick={() => setGrievanceModalOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleGrievanceSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                    <div>
                      <label className="dash-form-label">Category</label>
                      <select
                        className="dash-form-input"
                        value={grievanceCategory}
                        onChange={(e) => setGrievanceCategory(e.target.value as any)}
                      >
                        <option value="Scheduling Clash">Scheduling Clash / Same-Day Overlap</option>
                        <option value="Venue Facility">Venue Barrier-Free / Ramp Access</option>
                        <option value="Special Accommodation">Medical Accommodations / Scribe</option>
                        <option value="Hall Ticket Issue">Admit Card / Subject Discrepancy</option>
                      </select>
                    </div>

                    <div>
                      <label className="dash-form-label">Subject Code / Course</label>
                      <input
                        type="text"
                        className="dash-form-input"
                        placeholder="e.g. CS701 or UILOE0726"
                        value={grievanceSubject}
                        onChange={(e) => setGrievanceSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="dash-form-label">Description of Request</label>
                      <textarea
                        className="dash-form-input"
                        rows={4}
                        placeholder="Provide full details of your request or issue..."
                        value={grievanceDesc}
                        onChange={(e) => setGrievanceDesc(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                      <button
                        type="button"
                        className="dash-btn dash-btn-outline"
                        onClick={() => setGrievanceModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="dash-btn dash-btn-primary">
                        <Send size={15} />
                        <span>Submit to Exam Cell</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentDashboard;
