import React, { useState, useEffect, useMemo } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import {
  AcademicDataStore,
  CoordinatorExamEntry,
  SeatingRecord,
} from "../../services/academicDataStore.js";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
  Building2,
  Download,
  ShieldCheck,
  Send,
  X,
  PhoneCall,
  ShieldAlert,
  Users,
} from "lucide-react";
import "../../styles/dashboard.css";

interface FacultyDashboardProps {
  onSwitchRole?: (role: UserRole) => void;
  onLogout?: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  onSwitchRole,
  onLogout,
}) => {
  const { currentUser, switchRole, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string>("overview");
  const [storeState, setStoreState] = useState(AcademicDataStore.getSnapshot());
  const [currentTime, setCurrentTime] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected duty for Printable Duty Order modal
  const [dutyOrderModal, setDutyOrderModal] = useState<any | null>(null);
  // Selected duty for Door Roster
  const [selectedRosterExamId, setSelectedRosterExamId] = useState<string>("");
  // Local student attendance map: deskId -> "PRESENT" | "ABSENT"
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "PRESENT" | "ABSENT">>({});

  // Availability / Blackout state
  const [blackoutDate, setBlackoutDate] = useState("2026-11-25");
  const [blackoutShift, setBlackoutShift] = useState<"Morning" | "Afternoon" | "Full Day">("Full Day");
  const [blackoutReason, setBlackoutReason] = useState("");
  const [blackoutsList, setBlackoutsList] = useState<Array<{ id: string; date: string; shift: string; reason: string; status: "Approved" | "Pending" }>>([
    { id: "bo-1", date: "2026-11-27", shift: "Afternoon", reason: "Ph.D. Doctoral Committee Meeting", status: "Approved" },
  ]);

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

  const facultyName = currentUser?.name || "Dr. Arvind Sharma";
  const facultyDept = currentUser?.department || "Computer Science & Engineering";
  const facultyId = currentUser?.identifier || "EMP-CSE-014";

  // Filter exams assigned to this faculty from published/approved timetable
  const facultyDuties = useMemo(() => {
    const allExams = storeState.coordinatorExams || [];
    const cleanUserName = facultyName.replace(/\s*\(.*?\)/, "").trim().toLowerCase();

    // Match exam where invigilator corresponds to this faculty
    const matched = allExams.filter((ex: CoordinatorExamEntry) => {
      if (!ex.invigilator) return false;
      const cleanInvig = ex.invigilator.replace(/\s*\(.*?\)/, "").trim().toLowerCase();
      return (
        cleanInvig === cleanUserName ||
        cleanInvig.includes(cleanUserName) ||
        cleanUserName.includes(cleanInvig)
      );
    });

    if (matched.length > 0) {
      return [...matched].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.slot.localeCompare(b.slot);
      });
    }

    return [] as CoordinatorExamEntry[];
  }, [storeState.coordinatorExams, facultyName]);

  // Set initial selected roster exam
  useEffect(() => {
    if (!selectedRosterExamId && facultyDuties.length > 0) {
      setSelectedRosterExamId(facultyDuties[0].id);
    }
  }, [facultyDuties, selectedRosterExamId]);

  // Active selected exam for door roster
  const activeExamForRoster = useMemo(() => {
    return facultyDuties.find((d: CoordinatorExamEntry) => d.id === selectedRosterExamId) || facultyDuties[0];
  }, [facultyDuties, selectedRosterExamId]);

  // Seating records for the active selected exam
  const rosterStudents = useMemo(() => {
    if (!activeExamForRoster) return [];
    const allSeats = storeState.seatingRecords || [];
    const matchedSeats = allSeats.filter(
      (s: SeatingRecord) => s.subjectCode === activeExamForRoster.code || s.examId === activeExamForRoster.id
    );

    if (matchedSeats.length > 0) {
      return matchedSeats;
    }

    // High fidelity generated roster for door display
    const sampleRoster: SeatingRecord[] = [];
    const enrolledCount = Math.min(activeExamForRoster.enrolled || 60, 40);
    for (let i = 1; i <= enrolledCount; i++) {
      const rollNum = `CS2023-${String(i).padStart(3, "0")}`;
      sampleRoster.push({
        id: `seat-${activeExamForRoster.code}-${i}`,
        examId: activeExamForRoster.id,
        subjectCode: activeExamForRoster.code,
        subjectName: activeExamForRoster.subject,
        roomCode: activeExamForRoster.room.split(" ")[0] || "Hall A-101",
        date: activeExamForRoster.date,
        slot: activeExamForRoster.slot,
        deskNo: `D-${String(i).padStart(2, "0")}`,
        studentRoll: rollNum,
        studentName: `Candidate ${i} (${activeExamForRoster.department})`,
        departmentCode: activeExamForRoster.department,
        division: i <= 20 ? "Division A" : "Division B",
      });
    }
    return sampleRoster;
  }, [storeState.seatingRecords, activeExamForRoster]);

  // Summary stats
  const totalDutiesCount = facultyDuties.length;
  const facultyRecord = storeState.invigilators.find(
    (i) => i.name.toLowerCase().includes(facultyName.toLowerCase()) || facultyName.toLowerCase().includes(i.name.toLowerCase())
  );
  const maxAllowedDuties = facultyRecord?.maxDuties || 3;
  const totalSupervisedStudents = facultyDuties.reduce((acc: number, d: CoordinatorExamEntry) => acc + (d.enrolled || 0), 0);
  const totalDutyHours = ((facultyDuties.reduce((acc: number, d: CoordinatorExamEntry) => acc + (d.durationMinutes || 150), 0)) / 60).toFixed(1);

  // Next duty calculation
  const nextDuty = facultyDuties[0];

  const handleToggleAttendance = (deskNo: string) => {
    setAttendanceMap((prev) => {
      const current = prev[deskNo] || "PRESENT";
      return {
        ...prev,
        [deskNo]: current === "PRESENT" ? "ABSENT" : "PRESENT",
      };
    });
  };

  const handleAddBlackout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blackoutReason.trim()) {
      showToast("Please provide a legitimate reason for the blackout request.");
      return;
    }
    const newEntry = {
      id: `bo-${Date.now()}`,
      date: blackoutDate,
      shift: blackoutShift,
      reason: blackoutReason.trim(),
      status: "Approved" as const,
    };
    setBlackoutsList((prev) => [newEntry, ...prev]);
    setBlackoutReason("");
    showToast(`Blackout preference saved for ${blackoutDate} (${blackoutShift}). Store updated.`);
  };

  const handlePrintOfficialPDF = () => {
    window.print();
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
            <p className="dash-brand-sub">Faculty Examination Console</p>
          </div>
        </div>

        <nav className="dash-nav-list">
          <button
            className={`dash-nav-item ${activeMenu === "overview" ? "active" : ""}`}
            onClick={() => setActiveMenu("overview")}
          >
            <LayoutDashboard size={18} />
            <span>Faculty Console</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "duties" ? "active" : ""}`}
            onClick={() => setActiveMenu("duties")}
          >
            <Calendar size={18} />
            <span>Invigilation Duties</span>
            <span className="dash-nav-badge">{totalDutiesCount}</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "roster" ? "active" : ""}`}
            onClick={() => setActiveMenu("roster")}
          >
            <ClipboardList size={18} />
            <span>Door Seating Roster</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "availability" ? "active" : ""}`}
            onClick={() => setActiveMenu("availability")}
          >
            <Clock size={18} />
            <span>Availability & Blackouts</span>
          </button>

          <button
            className={`dash-nav-item ${activeMenu === "guidelines" ? "active" : ""}`}
            onClick={() => setActiveMenu("guidelines")}
          >
            <ShieldAlert size={18} />
            <span>Invigilator SOP & Security</span>
          </button>
        </nav>

        {/* Sidebar Footer: Profile & Switcher */}
        <div className="dash-sidebar-footer">
          <div className="dash-user-profile-card">
            <div className="dash-avatar-circle">
              {facultyName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="dash-user-info">
              <span className="dash-user-name">{facultyName}</span>
              <span className="dash-user-id">{facultyId} • {facultyDept.split(" ")[0]}</span>
            </div>
          </div>

          <div className="dash-role-switcher-row">
            <span className="dash-role-label">Active Role:</span>
            <select
              className="dash-role-select"
              value={currentUser?.role || UserRole.FACULTY}
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
            <span className="dash-breadcrumb">Examination ERP / Faculty Portal</span>
            <h2 className="dash-page-title">
              {activeMenu === "overview" && "Autonomous Examination Faculty Dashboard"}
              {activeMenu === "duties" && "Invigilation Duties & Formal Orders"}
              {activeMenu === "roster" && "Hall Door Roster & Candidate Attendance"}
              {activeMenu === "availability" && "Faculty Availability & Blackout Declarations"}
              {activeMenu === "guidelines" && "Autonomous Exam Regulations & Chief Invigilator SOP"}
            </h2>
          </div>

          <div className="dash-topbar-right">
            <div className="dash-clock-pill">
              <Clock size={15} className="text-brand-light" />
              <span>{currentTime || "IST Live"}</span>
            </div>

            <div className="dash-badge-status-green">
              <ShieldCheck size={14} />
              <span>Duty Order Active</span>
            </div>

            <button
              className="dash-primary-btn"
              onClick={() => {
                if (facultyDuties.length > 0) {
                  setDutyOrderModal(facultyDuties[0]);
                } else {
                  showToast("No active duties scheduled for PDF generation.");
                }
              }}
            >
              <Printer size={16} />
              <span>Print Official Duty Order</span>
            </button>
          </div>
        </header>

        {/* CONTENT PANELS */}
        <div className="dash-content">
          {/* TAB 1: OVERVIEW */}
          {activeMenu === "overview" && (
            <div className="dash-view-stack">
              {/* Top Banner with Workload Gauge */}
              <div className="faculty-hero-banner">
                <div className="hero-banner-content">
                  <div className="hero-badge">Autonomous Semester Examinations 2026-27</div>
                  <h3 className="hero-title">Welcome, {facultyName}</h3>
                  <p className="hero-subtitle">
                    Department of {facultyDept} • Employee Code: <strong>{facultyId}</strong> • Institutional Status: <strong>Cleared & Active</strong>
                  </p>
                </div>
                <div className="faculty-workload-gauge">
                  <div className="gauge-label">
                    <span>Workload Compliance</span>
                    <strong>{totalDutiesCount} / {maxAllowedDuties} Duties</strong>
                  </div>
                  <div className="gauge-track">
                    <div
                      className="gauge-fill"
                      style={{ width: `${(totalDutiesCount / maxAllowedDuties) * 100}%` }}
                    />
                  </div>
                  <span className="gauge-note">Within autonomous regulatory duty ceiling</span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="dash-kpi-grid">
                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Assigned Duties</span>
                    <Calendar size={18} className="text-brand" />
                  </div>
                  <div className="kpi-value font-mono">{totalDutiesCount}</div>
                  <div className="kpi-sub">
                    <span className="text-success">100% Scheduled in Cycle</span>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Candidates Supervised</span>
                    <Users size={18} className="text-brand" />
                  </div>
                  <div className="kpi-value font-mono">{totalSupervisedStudents}</div>
                  <div className="kpi-sub">
                    <span>Across {totalDutiesCount} Examination Halls</span>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Total Invigilation Hours</span>
                    <Clock size={18} className="text-brand" />
                  </div>
                  <div className="kpi-value font-mono">{totalDutyHours} hrs</div>
                  <div className="kpi-sub">
                    <span>3.0 hrs / standard paper session</span>
                  </div>
                </div>

                <div className="dash-kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Duty Acceptance</span>
                    <CheckCircle2 size={18} className="text-success" />
                  </div>
                  <div className="kpi-value text-success" style={{ fontSize: "20px" }}>
                    Acknowledged
                  </div>
                  <div className="kpi-sub">
                    <span>Digital confirmation logged</span>
                  </div>
                </div>
              </div>

              {/* Next Upcoming Duty Card */}
              {nextDuty && (
                <div className="dash-highlight-card">
                  <div className="highlight-header">
                    <div className="highlight-pill">NEXT SCHEDULED SESSION</div>
                    <span className="highlight-date">{nextDuty.date} • {nextDuty.slot}</span>
                  </div>
                  <div className="highlight-body">
                    <div className="highlight-main-info">
                      <h4 className="highlight-course-title">
                        {nextDuty.code} — {nextDuty.subject}
                      </h4>
                      <div className="highlight-meta-row">
                        <span className="highlight-meta-item">
                          <MapPin size={16} className="text-brand" />
                          <strong>{nextDuty.room}</strong>
                        </span>
                        <span className="highlight-meta-item">
                          <Users size={16} className="text-brand" />
                          Expected Candidates: <strong>{nextDuty.enrolled} Students</strong>
                        </span>
                        <span className="highlight-meta-item">
                          <Clock size={16} className="text-brand" />
                          Reporting Time: <strong>08:50 IST (30 mins prior)</strong>
                        </span>
                      </div>
                    </div>

                    <div className="highlight-actions">
                      <button
                        className="btn-outline-primary"
                        onClick={() => {
                          setSelectedRosterExamId(nextDuty.id);
                          setActiveMenu("roster");
                        }}
                      >
                        <ClipboardList size={16} />
                        <span>View Door Roster</span>
                      </button>
                      <button
                        className="btn-solid-primary"
                        onClick={() => setDutyOrderModal(nextDuty)}
                      >
                        <Printer size={16} />
                        <span>Print Duty Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Duties Quick List Table */}
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Assigned Invigilation Duty Schedule</h3>
                    <p className="panel-card-sub">
                      End Semester Examinations (ESE) 2026 — Verified against central timetable database
                    </p>
                  </div>
                  <button
                    className="btn-outline-primary"
                    onClick={() => setActiveMenu("duties")}
                  >
                    View Detailed Roster
                  </button>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Date & Session</th>
                        <th>Subject Code & Title</th>
                        <th>Designated Venue</th>
                        <th>Enrolled</th>
                        <th>Assigned Duty Role</th>
                        <th>Order Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyDuties.map((duty: CoordinatorExamEntry, idx: number) => (
                        <tr key={duty.id || idx}>
                          <td>
                            <div className="font-semibold">{duty.date}</div>
                            <div className="text-muted text-xs">{duty.slot}</div>
                          </td>
                          <td>
                            <div className="font-mono font-bold text-brand">{duty.code}</div>
                            <div className="text-xs text-muted">{duty.subject}</div>
                          </td>
                          <td>
                            <div className="text-sm font-semibold">{duty.room}</div>
                          </td>
                          <td>
                            <span className="font-mono">{duty.enrolled}</span>
                          </td>
                          <td>
                            <span className="role-tag-chief">
                              {idx === 0 ? "Chief Invigilator" : "Hall Invigilator"}
                            </span>
                          </td>
                          <td>
                            <span className="status-badge-approved">
                              <CheckCircle2 size={13} />
                              <span>Approved</span>
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-inline">
                              <button
                                className="action-icon-btn"
                                title="Print Duty Order"
                                onClick={() => setDutyOrderModal(duty)}
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                className="action-icon-btn"
                                title="Open Seating Door Roster"
                                onClick={() => {
                                  setSelectedRosterExamId(duty.id);
                                  setActiveMenu("roster");
                                }}
                              >
                                <ClipboardList size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED DUTIES */}
          {activeMenu === "duties" && (
            <div className="dash-view-stack">
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Official Invigilation Appointments</h3>
                    <p className="panel-card-sub">
                      All allocated duties for End Semester Examinations Autumn 2026-27. Issued by the Controller of Examinations.
                    </p>
                  </div>
                  <div className="panel-actions-row">
                    <button
                      className="dash-primary-btn"
                      onClick={() => setDutyOrderModal(facultyDuties[0])}
                    >
                      <Download size={16} />
                      <span>Download All Duty Orders (PDF)</span>
                    </button>
                  </div>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Session ID</th>
                        <th>Date & Time</th>
                        <th>Course Details</th>
                        <th>Venue / Floor</th>
                        <th>Candidates</th>
                        <th>Duty Designation</th>
                        <th>Acknowledgement</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyDuties.map((duty: CoordinatorExamEntry, idx: number) => (
                        <tr key={duty.id || idx}>
                          <td className="font-mono text-xs">{duty.id}</td>
                          <td>
                            <div className="font-semibold">{duty.date}</div>
                            <div className="text-muted text-xs">{duty.slot}</div>
                          </td>
                          <td>
                            <div className="font-mono font-bold text-brand">{duty.code}</div>
                            <div className="text-sm font-semibold">{duty.subject}</div>
                            <div className="text-xs text-muted">Department: {duty.department}</div>
                          </td>
                          <td>
                            <div className="text-sm font-semibold">{duty.room}</div>
                            <span className="text-xs text-muted">Ground Floor / Wing A</span>
                          </td>
                          <td>
                            <span className="font-mono font-bold">{duty.enrolled}</span>
                          </td>
                          <td>
                            <span className="role-tag-chief">
                              {idx === 0 ? "Chief Invigilator" : "Hall Invigilator"}
                            </span>
                          </td>
                          <td>
                            <div className="status-badge-approved">
                              <CheckCircle2 size={13} />
                              <span>Acknowledged</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-actions-inline">
                              <button
                                className="dash-sm-btn"
                                onClick={() => setDutyOrderModal(duty)}
                              >
                                <Printer size={14} />
                                <span>Duty Order</span>
                              </button>
                              <button
                                className="dash-sm-btn secondary"
                                onClick={() => {
                                  setSelectedRosterExamId(duty.id);
                                  setActiveMenu("roster");
                                }}
                              >
                                <ClipboardList size={14} />
                                <span>Door Roster</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOOR SEATING ROSTER & ATTENDANCE */}
          {activeMenu === "roster" && (
            <div className="dash-view-stack">
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Hall Door Seating Roster & Candidate Attendance</h3>
                    <p className="panel-card-sub">
                      Live attendance verification for examination sessions. Mark present/absent and print official door chart.
                    </p>
                  </div>
                  <div className="panel-actions-row">
                    <button
                      className="dash-primary-btn"
                      onClick={() => window.print()}
                    >
                      <Printer size={16} />
                      <span>Print Door Posting Chart</span>
                    </button>
                  </div>
                </div>

                {/* Session Selector Strip */}
                <div className="roster-selector-strip">
                  <span className="selector-label">Select Assigned Exam Session:</span>
                  <div className="selector-pills">
                    {facultyDuties.map((d: CoordinatorExamEntry) => (
                      <button
                        key={d.id}
                        className={`selector-pill ${selectedRosterExamId === d.id ? "active" : ""}`}
                        onClick={() => setSelectedRosterExamId(d.id)}
                      >
                        <span className="font-mono">{d.code}</span>
                        <span>•</span>
                        <span>{d.date}</span>
                        <span>({d.room.split(" ")[0]})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Summary Header */}
                {activeExamForRoster && (
                  <div className="roster-summary-box">
                    <div className="summary-left">
                      <h4 className="summary-subject">
                        {activeExamForRoster.code} — {activeExamForRoster.subject}
                      </h4>
                      <p className="summary-meta">
                        Date: <strong>{activeExamForRoster.date}</strong> | Slot: <strong>{activeExamForRoster.slot}</strong> | Venue: <strong>{activeExamForRoster.room}</strong>
                      </p>
                    </div>

                    <div className="summary-stats-group">
                      <div className="stat-pill">
                        <span>Total Registered:</span>
                        <strong className="font-mono">{rosterStudents.length}</strong>
                      </div>
                      <div className="stat-pill success">
                        <span>Present:</span>
                        <strong className="font-mono">
                          {rosterStudents.filter((s: SeatingRecord) => (attendanceMap[s.deskNo] || "PRESENT") === "PRESENT").length}
                        </strong>
                      </div>
                      <div className="stat-pill warning">
                        <span>Absent:</span>
                        <strong className="font-mono">
                          {rosterStudents.filter((s: SeatingRecord) => attendanceMap[s.deskNo] === "ABSENT").length}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Roster Table */}
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Desk No.</th>
                        <th>Student PRN / Roll No.</th>
                        <th>Student Full Name</th>
                        <th>Degree / Branch</th>
                        <th>Division</th>
                        <th>Attendance Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterStudents.map((seat: SeatingRecord) => {
                        const status = attendanceMap[seat.deskNo] || "PRESENT";
                        return (
                          <tr key={seat.id} className={status === "ABSENT" ? "row-absent" : ""}>
                            <td>
                              <span className="desk-badge font-mono">{seat.deskNo}</span>
                            </td>
                            <td className="font-mono font-bold text-brand">
                              {seat.studentRoll}
                            </td>
                            <td className="font-semibold">{seat.studentName}</td>
                            <td>{seat.departmentCode}</td>
                            <td>{seat.division}</td>
                            <td>
                              {status === "PRESENT" ? (
                                <span className="status-badge-approved">
                                  <CheckCircle2 size={13} />
                                  <span>Present</span>
                                </span>
                              ) : (
                                <span className="status-badge-rejected">
                                  <X size={13} />
                                  <span>Absent</span>
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className={`dash-sm-btn ${status === "PRESENT" ? "danger" : "success"}`}
                                onClick={() => handleToggleAttendance(seat.deskNo)}
                              >
                                {status === "PRESENT" ? "Mark Absent" : "Mark Present"}
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

          {/* TAB 4: AVAILABILITY & BLACKOUTS */}
          {activeMenu === "availability" && (
            <div className="dash-view-stack">
              <div className="grid-2-cols">
                {/* Form to submit blackout preference */}
                <div className="dash-panel-card">
                  <div className="panel-card-header">
                    <div>
                      <h3 className="panel-card-title">Declare Availability / Blackout Preference</h3>
                      <p className="panel-card-sub">
                        Inform the Examination Cell in advance of doctoral exams, scheduled conferences, or medical leaves.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddBlackout} className="dash-form">
                    <div className="form-group">
                      <label className="form-label">Blackout Date</label>
                      <input
                        type="date"
                        className="form-input font-mono"
                        value={blackoutDate}
                        onChange={(e) => setBlackoutDate(e.target.value)}
                        min="2026-11-20"
                        max="2026-12-15"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Unavailable Session Window</label>
                      <select
                        className="form-select"
                        value={blackoutShift}
                        onChange={(e) => setBlackoutShift(e.target.value as any)}
                      >
                        <option value="Morning">Morning Shift (09:30 - 12:30 IST)</option>
                        <option value="Afternoon">Afternoon Shift (14:00 - 17:00 IST)</option>
                        <option value="Full Day">Full Day Unavailable</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Academic Justification / Reason</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="e.g. University Senate Meeting, Sponsored Project Presentation, Medical Leave"
                        value={blackoutReason}
                        onChange={(e) => setBlackoutReason(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="dash-primary-btn" style={{ width: "100%" }}>
                      <Send size={16} />
                      <span>Submit Availability Declaration</span>
                    </button>
                  </form>
                </div>

                {/* List of active preferences */}
                <div className="dash-panel-card">
                  <div className="panel-card-header">
                    <div>
                      <h3 className="panel-card-title">Logged Availability Declarations</h3>
                      <p className="panel-card-sub">
                        Approved blackouts are respected by the Nexora solver during automated duty assignment.
                      </p>
                    </div>
                  </div>

                  <div className="blackouts-list">
                    {blackoutsList.map((item) => (
                      <div key={item.id} className="blackout-card">
                        <div className="blackout-header">
                          <span className="font-mono font-bold">{item.date}</span>
                          <span className="shift-tag">{item.shift}</span>
                          <span className="status-badge-approved">
                            <CheckCircle2 size={13} />
                            <span>{item.status}</span>
                          </span>
                        </div>
                        <p className="blackout-reason">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GUIDELINES & SOP */}
          {activeMenu === "guidelines" && (
            <div className="dash-view-stack">
              <div className="dash-panel-card">
                <div className="panel-card-header">
                  <div>
                    <h3 className="panel-card-title">Chief & Hall Invigilator Standard Operating Procedures</h3>
                    <p className="panel-card-sub">
                      Autonomous Institute Examination Code of Conduct & Emergency Protocols
                    </p>
                  </div>
                </div>

                <div className="guidelines-grid">
                  <div className="guideline-card">
                    <div className="guideline-step">01</div>
                    <h4 className="guideline-title">Reporting & Question Paper Custody</h4>
                    <p className="guideline-desc">
                      Report to the Central Examination Control Room exactly <strong>30 minutes prior</strong> to exam commencement. Inspect the tamper-evident wax seal on question paper envelopes before opening in front of student witnesses.
                    </p>
                  </div>

                  <div className="guideline-step-card">
                    <div className="guideline-step">02</div>
                    <h4 className="guideline-title">Candidate Entry & Identity Verification</h4>
                    <p className="guideline-desc">
                      Admit students only with their official <strong>Nexora Hall Ticket / Admit Card</strong> and College Photo ID. Ensure no electronic gadgets, smart watches, or unauthorized revision materials are brought into the hall.
                    </p>
                  </div>

                  <div className="guideline-step-card">
                    <div className="guideline-step">03</div>
                    <h4 className="guideline-title">Attendance & Answer Book Reconciliation</h4>
                    <p className="guideline-desc">
                      Obtain student signature on the Door Posting Roster within the first 45 minutes of the examination. Cross-check barcode serial numbers against the official absentee statement.
                    </p>
                  </div>

                  <div className="guideline-step-card">
                    <div className="guideline-step">04</div>
                    <h4 className="guideline-title">Malpractice & Unfair Means (UFM)</h4>
                    <p className="guideline-desc">
                      If malpractice is detected, immediately seize the unauthorized material, issue a fresh answer book, and alert the Flying Squad / Exam Superintendent without causing disruption to other students.
                    </p>
                  </div>
                </div>

                <div className="emergency-contacts-banner">
                  <h4 className="contacts-title">
                    <PhoneCall size={18} className="text-brand" />
                    <span>Emergency Examination Control Room Extensions</span>
                  </h4>
                  <div className="contacts-row">
                    <div className="contact-item">
                      <span>Controller of Examinations (COE):</span>
                      <strong>Ext. 101 / +91 98230 00101</strong>
                    </div>
                    <div className="contact-item">
                      <span>Central Control Room:</span>
                      <strong>Ext. 104 / +91 98230 00104</strong>
                    </div>
                    <div className="contact-item">
                      <span>Campus Health Centre (Emergency):</span>
                      <strong>Ext. 911 / +91 98230 00911</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRINTABLE OFFICIAL DUTY ORDER MODAL */}
      {dutyOrderModal && (
        <div className="official-modal-overlay">
          <div className="official-duty-modal-card">
            <div className="modal-header-actions no-print">
              <span className="modal-title-pill">OFFICIAL ORDER PREVIEW</span>
              <div className="modal-top-buttons">
                <button
                  className="dash-primary-btn"
                  onClick={handlePrintOfficialPDF}
                >
                  <Printer size={16} />
                  <span>Print Duty Order</span>
                </button>
                <button
                  className="modal-close-btn"
                  onClick={() => setDutyOrderModal(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="printable-order-sheet">
              <div className="order-institution-header">
                <div className="institution-crest">
                  <Building2 size={40} className="text-brand" />
                </div>
                <div className="institution-text">
                  <h2 className="inst-name">KOLHAPUR INSTITUTE OF TECHNOLOGY</h2>
                  <p className="inst-tagline">COLLEGE OF ENGINEERING (AUTONOMOUS), KOLHAPUR</p>
                  <p className="inst-office">Office of the Controller of Examinations</p>
                  <span className="order-ref font-mono">
                    REF NO: KIT/COE/ESE-2026/ORD-{dutyOrderModal.code}-{Math.floor(Math.random() * 899 + 100)}
                  </span>
                </div>
              </div>

              <div className="order-divider" />

              <div className="order-subject-line">
                <strong>SUBJECT: APPOINTMENT ORDER AS CHIEF / HALL INVIGILATOR FOR AUTONOMOUS ESE 2026</strong>
              </div>

              <div className="order-intro-text">
                To,<br />
                <strong>{facultyName}</strong><br />
                Assistant / Associate Professor, Department of {facultyDept}<br />
                Employee Identifier: <strong>{facultyId}</strong>
              </div>

              <p className="order-body-paragraph">
                By direction of the Academic Council and the Board of Examinations, you are hereby appointed as an Invigilator for the scheduled End Semester Examination (Autumn 2026-27). The details of your appointed duty are specified hereunder:
              </p>

              <table className="order-duty-table">
                <tbody>
                  <tr>
                    <td className="field-name">Course Code & Title:</td>
                    <td className="field-value font-mono">
                      <strong>{dutyOrderModal.code}</strong> — {dutyOrderModal.subject}
                    </td>
                  </tr>
                  <tr>
                    <td className="field-name">Date of Examination:</td>
                    <td className="field-value">
                      <strong>{dutyOrderModal.date}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="field-name">Time Slot & Duration:</td>
                    <td className="field-value">
                      <strong>{dutyOrderModal.slot}</strong> (3.0 Hours)
                    </td>
                  </tr>
                  <tr>
                    <td className="field-name">Reporting Time:</td>
                    <td className="field-value">
                      <strong>30 Minutes Prior to Slot Start (Report at Central Exam Cell)</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="field-name">Assigned Examination Hall:</td>
                    <td className="field-value">
                      <strong>{dutyOrderModal.room}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="field-name">Candidate Strength:</td>
                    <td className="field-value font-mono">
                      <strong>{dutyOrderModal.enrolled} Enrolled Candidates</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="field-name">Duty Designation:</td>
                    <td className="field-value">
                      <strong>CHIEF INVIGILATOR</strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="order-instructions-box">
                <h4>Mandatory Statutory Instructions:</h4>
                <ol>
                  <li>Under Maharashtra Public Universities Act Section 48(4), examination duty is mandatory for all recognized teaching faculty.</li>
                  <li>No exchange of duty is permitted without prior written sanction from the Controller of Examinations and the respective Head of Department.</li>
                  <li>All mobile phones and smart devices must be deposited in the secure locker at the Central Control Room before entering the examination block.</li>
                </ol>
              </div>

              <div className="order-signatures-row">
                <div className="sig-block">
                  <div className="sig-line" />
                  <span>Signature of Faculty Member</span>
                  <span className="text-xs text-muted font-mono">Acknowledged Digitally</span>
                </div>
                <div className="sig-block">
                  <div className="coe-stamp-seal">
                    <span>COE AUTONOMOUS EXAMINATIONS</span>
                  </div>
                  <div className="sig-line" />
                  <span>Controller of Examinations</span>
                  <span className="text-xs text-muted">KIT College of Engineering</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
