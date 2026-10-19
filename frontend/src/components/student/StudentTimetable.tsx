import React, { useState } from "react";
import { StatusBadge } from "../StatusBadge.js";
import { HallTicketModal } from "./HallTicketModal.js";
import {
  Clock,
  MapPin,
  Search,
  Printer,
  Info,
  CheckCircle2,
  List,
  Columns3,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface ExamItem {
  id: string;
  code: string;
  subject: string;
  date: string;
  timeSlot: string;
  rawDate: string;
  duration: string;
  hall: string;
  roomCapacity: number;
  desk: string;
  chiefInvigilator: string;
  status: "PUBLISHED" | "CONFIRMED";
  isUpcoming: boolean;
  notes: string;
}

interface StudentTimetableProps {
  onNavigateToRegistration?: () => void;
}

export const StudentTimetable: React.FC<StudentTimetableProps> = ({
  onNavigateToRegistration,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UPCOMING" | "COMPLETED">("ALL");
  const [showHallTicket, setShowHallTicket] = useState(false);

  const mockExams: ExamItem[] = [
    {
      id: "ex-1",
      code: "CS701",
      subject: "Distributed Systems & Cloud Computing",
      date: "Nov 10, 2026",
      rawDate: "2026-11-10",
      timeSlot: "09:30 - 12:30 IST",
      duration: "3 Hours",
      hall: "Hall A-101",
      roomCapacity: 150,
      desk: "Row 3, Desk 14",
      chiefInvigilator: "Dr. Arvind Sharma (CSE)",
      status: "PUBLISHED",
      isUpcoming: true,
      notes: "Open Book for Part B only; standard scientific calculator permitted",
    },
    {
      id: "ex-2",
      code: "CS704",
      subject: "Cryptography & Network Security",
      date: "Nov 12, 2026",
      rawDate: "2026-11-12",
      timeSlot: "09:30 - 12:30 IST",
      duration: "3 Hours",
      hall: "Hall A-101",
      roomCapacity: 150,
      desk: "Row 4, Desk 08",
      chiefInvigilator: "Dr. Arvind Sharma (CSE)",
      status: "PUBLISHED",
      isUpcoming: true,
      notes: "No programmable devices allowed",
    },
    {
      id: "ex-3",
      code: "CS709",
      subject: "High Performance Computing & GPU Architecture",
      date: "Nov 16, 2026",
      rawDate: "2026-11-16",
      timeSlot: "14:00 - 17:00 IST",
      duration: "3 Hours",
      hall: "Hall B-204",
      roomCapacity: 100,
      desk: "Row 2, Desk 06",
      chiefInvigilator: "Prof. R. Iyer (ECE)",
      status: "PUBLISHED",
      isUpcoming: true,
      notes: "Departmental Elective II",
    },
    {
      id: "ex-4",
      code: "CS712",
      subject: "Software Reliability & Fault Tolerance",
      date: "Nov 19, 2026",
      rawDate: "2026-11-19",
      timeSlot: "09:30 - 12:30 IST",
      duration: "3 Hours",
      hall: "Hall C-301",
      roomCapacity: 90,
      desk: "Row 5, Desk 22",
      chiefInvigilator: "Dr. P. Kulkarni (Mech)",
      status: "PUBLISHED",
      isUpcoming: true,
      notes: "Final Semester Capstone Evaluation Paper",
    },
  ];

  // Filtering
  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch =
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.hall.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "UPCOMING"
        ? exam.isUpcoming
        : !exam.isUpcoming;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="student-dashboard">
      {/* Page Title & Profile Banner */}
      <div className="portal-header-row">
        <div>
          <div className="portal-title-group">
            <h1 className="portal-main-heading">Student Examination Dashboard</h1>
            <span className="official-version-pill" title="Immutable released timetable">
              Official Timetable v1.2 • Published Oct 14, 2026 (11:30 IST)
            </span>
          </div>
          <p className="portal-sub-heading">
            Student: <strong>Aarav Sharma</strong> (Roll: <span className="font-mono">CS2023-042</span>) | B.Tech Computer Science & Engg | Sem VII
          </p>
        </div>

        <div className="portal-header-actions">
          <button
            onClick={() => setShowHallTicket(true)}
            className="btn btn-primary"
            id="btn-view-hall-ticket"
          >
            <Printer size={16} />
            <span>View & Print Admit Card</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Registration Status</div>
          <div className="metric-value text-success" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Confirmed</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-footer" style={{ justifyContent: "space-between" }}>
            <span>Verified by Exam Cell • Fee clearance OK</span>
            {onNavigateToRegistration && (
              <button
                onClick={onNavigateToRegistration}
                className="link-subtle"
                style={{ fontSize: "11px", color: "var(--brand-primary)", border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "2px" }}
              >
                <span>Eligibility</span>
                <ArrowRight size={11} />
              </button>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Enrolled Papers</div>
          <div className="metric-value">4</div>
          <div className="metric-footer">
            <span className="text-success">0 time-slot collisions detected</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">First Examination</div>
          <div className="metric-value font-mono" style={{ fontSize: "22px" }}>
            Nov 10, 2026
          </div>
          <div className="metric-footer">
            <span>09:30 IST • Hall A-101 (CS701)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Seating Allocation</div>
          <div className="metric-value text-brand" style={{ fontSize: "20px" }}>
            100% Allocated
          </div>
          <div className="metric-footer">
            <span>All 4 papers assigned dedicated desks</span>
          </div>
        </div>
      </div>

      {/* Main Schedule Container */}
      <div className="card">
        {/* Card Header with Filter Controls */}
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">My Personalized Examination Timetable</h2>
            <p className="card-subtitle">
              All dates and time slots are displayed in Indian Standard Time (Asia/Kolkata, UTC+05:30)
            </p>
          </div>

          <div className="timetable-toolbar">
            {/* Search Input */}
            <div className="input-with-icon" style={{ minWidth: "220px" }}>
              <Search size={15} className="input-icon" />
              <input
                type="text"
                placeholder="Search subject or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input form-input-sm"
              />
            </div>

            {/* Filter Toggle */}
            <div className="filter-button-group">
              <button
                className={`filter-btn ${statusFilter === "ALL" ? "active" : ""}`}
                onClick={() => setStatusFilter("ALL")}
              >
                All (4)
              </button>
              <button
                className={`filter-btn ${statusFilter === "UPCOMING" ? "active" : ""}`}
                onClick={() => setStatusFilter("UPCOMING")}
              >
                Upcoming
              </button>
            </div>

            {/* View Mode Toggle (Accessibility: table vs cards) */}
            <div className="view-mode-toggle" aria-label="Timetable display mode">
              <button
                className={`mode-btn ${viewMode === "cards" ? "active" : ""}`}
                onClick={() => setViewMode("cards")}
                title="Card Timeline View"
                aria-pressed={viewMode === "cards"}
              >
                <Columns3 size={15} />
                <span className="mode-btn-text">Cards</span>
              </button>
              <button
                className={`mode-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Accessible Table View"
                aria-pressed={viewMode === "table"}
              >
                <List size={15} />
                <span className="mode-btn-text">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content View: Cards vs Table */}
        {viewMode === "cards" ? (
          <div className="exam-cards-grid">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="exam-schedule-card">
                <div className="exam-card-top">
                  <div className="exam-date-badge">
                    <span className="exam-date-month">NOV</span>
                    <span className="exam-date-day">
                      {exam.date.split(" ")[1].replace(",", "")}
                    </span>
                  </div>
                  <div className="exam-meta-main">
                    <div className="exam-code-tag">{exam.code}</div>
                    <h3 className="exam-title-text">{exam.subject}</h3>
                    <div className="exam-time-strip">
                      <Clock size={13} />
                      <span>{exam.timeSlot} ({exam.duration})</span>
                    </div>
                  </div>
                </div>

                <div className="exam-seating-details">
                  <div className="seating-info-cell">
                    <span className="cell-label">Assigned Hall</span>
                    <span className="cell-value">
                      <MapPin size={13} style={{ color: "var(--brand-primary)" }} />
                      <strong>{exam.hall}</strong>
                    </span>
                  </div>
                  <div className="seating-info-cell">
                    <span className="cell-label">Designated Seat</span>
                    <span className="cell-value seat-highlight">
                      {exam.desk}
                    </span>
                  </div>
                  <div className="seating-info-cell">
                    <span className="cell-label">Chief Invigilator</span>
                    <span className="cell-value" style={{ fontSize: "12px" }}>
                      {exam.chiefInvigilator}
                    </span>
                  </div>
                </div>

                <div className="exam-card-footer">
                  <span className="exam-note-text">
                    <Info size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                    {exam.notes}
                  </span>
                  <StatusBadge status="PUBLISHED" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Accessible Table View */
          <div className="table-container">
            <table className="data-table" aria-label="Student Examination Schedule">
              <thead>
                <tr>
                  <th>Paper Code</th>
                  <th>Subject Title</th>
                  <th>Date</th>
                  <th>Time Slot (IST)</th>
                  <th>Assigned Hall</th>
                  <th>Designated Seat</th>
                  <th>Chief Invigilator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="font-mono" style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                      {exam.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600" }}>{exam.subject}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{exam.notes}</div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{exam.date}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{exam.timeSlot}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{exam.hall}</span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--brand-primary)" }}>{exam.desk}</strong>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {exam.chiefInvigilator}
                    </td>
                    <td>
                      <StatusBadge status="PUBLISHED" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredExams.length === 0 && (
          <div className="empty-state-box">
            <Search size={32} style={{ color: "var(--text-muted)" }} />
            <p style={{ marginTop: "12px", fontWeight: 600 }}>No examination papers found matching filter</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Try searching for a different course code or clearing the filters.</p>
          </div>
        )}
      </div>

      {/* Guidelines & Exam Conduct Rules Section */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldAlert size={18} className="text-warning" />
            <h2 className="card-title">University Examination Regulations & Conduct</h2>
          </div>
        </div>
        <div className="rules-grid-layout">
          <div className="rule-box">
            <div className="rule-title">Entry & Reporting Time</div>
            <p className="rule-desc">
              Entry to the hall commences <strong>30 minutes</strong> prior to scheduled start. No entry is permitted after 15 minutes from the commencement bell.
            </p>
          </div>
          <div className="rule-box">
            <div className="rule-title">Mandatory Identification</div>
            <p className="rule-desc">
              Candidates must present both their official <strong>Nexora Admit Card</strong> and their physical <strong>University Identity Smart Card</strong>.
            </p>
          </div>
          <div className="rule-box">
            <div className="rule-title">Permitted Stationery</div>
            <p className="rule-desc">
              Only blue/black ballpoint pens, non-programmable scientific calculators (Fx-991ES or equivalent), and geometry tools are permitted in the hall.
            </p>
          </div>
          <div className="rule-box">
            <div className="rule-title">Malpractice & Penalty</div>
            <p className="rule-desc">
              Possession of unauthorized electronic devices, smartbands, or written notes will result in immediate disqualification and academic disciplinary action.
            </p>
          </div>
        </div>
      </div>

      {/* Admit Card Modal */}
      <HallTicketModal
        isOpen={showHallTicket}
        onClose={() => setShowHallTicket(false)}
        studentName="Aarav Sharma"
        rollNo="CS2023-042"
        department="Computer Science & Engineering"
        exams={mockExams.map((e) => ({
          code: e.code,
          subject: e.subject,
          date: e.date,
          slot: e.timeSlot,
          hall: e.hall,
          desk: e.desk,
        }))}
      />
    </div>
  );
};
