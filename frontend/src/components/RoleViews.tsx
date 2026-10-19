import React, { useState } from "react";
import { UserRole } from "@nexora/contracts";
import { StudentPortal } from "./student/StudentPortal.js";
import { FacultyPortal } from "./faculty/FacultyPortal.js";
import { StatusBadge } from "./StatusBadge.js";
import { ShieldCheck } from "lucide-react";

interface RoleViewsProps {
  role: UserRole;
  activeTab?: string;
}

<<<<<<< HEAD
export const RoleViews: React.FC<RoleViewsProps> = ({ role }) => {
  const [registeredPapers, setRegisteredPapers] = useState<string[]>(["CS701"]);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);

  const availableOfferings = [
    { code: "CS701", title: "Distributed Systems & Cloud Computing", credits: 4, attendance: 88.5, eligible: true },
    { code: "CS704", title: "Cryptography & Network Security", credits: 3, attendance: 82.0, eligible: true },
    { code: "CS709", title: "Advanced Compiler Design (Elective)", credits: 3, attendance: 61.0, eligible: false, ineligibilityReason: "Attendance 61% is below mandatory 75% threshold" },
  ];

  const handleRegister = (code: string) => {
    if (registeredPapers.includes(code)) return;
    setRegisteredPapers((prev) => [...prev, code]);
    setRegisterSuccessMsg(`Successfully registered for examination paper ${code}.`);
    setTimeout(() => setRegisterSuccessMsg(null), 4000);
  };

  if (role === UserRole.STUDENT) {
    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700" }}>Student Portal — My Examination Schedule & Registrations</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Student: <strong>Aarav Sharma</strong> (Roll: CS2023-042) | Branch: Computer Science & Engineering
          </p>
        </div>

        {registerSuccessMsg && (
          <div
            style={{
              backgroundColor: "var(--status-success-bg)",
              color: "var(--status-success-text)",
              border: "1px solid var(--status-success-border)",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            ✓ {registerSuccessMsg}
          </div>
        )}

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Registration Window</div>
            <div className="metric-value" style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Open</span>
              <StatusBadge status="PUBLISHED" />
            </div>
            <div className="metric-footer">Cycle: Autumn 2026 Regular & Backlogs</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Registered Papers</div>
            <div className="metric-value">{registeredPapers.length}</div>
            <div className="metric-footer">Attendance cleared on registered offerings</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Published Timetable Version</div>
            <div className="metric-value">v1.0</div>
            <div className="metric-footer">Official release (Asia/Kolkata)</div>
          </div>
        </div>

        {/* Available Offerings & Registration */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Available Examination Offerings (Registration Open)</h2>
              <p className="card-subtitle">Select eligible subjects to register for the upcoming examination cycle</p>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paper Code</th>
                  <th>Subject Title</th>
                  <th>Credits</th>
                  <th>My Attendance</th>
                  <th>Eligibility</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableOfferings.map((paper) => {
                  const isRegistered = registeredPapers.includes(paper.code);
                  return (
                    <tr key={paper.code}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>{paper.code}</td>
                      <td>{paper.title}</td>
                      <td>{paper.credits}</td>
                      <td>
                        <strong style={{ color: paper.attendance < 75 ? "var(--status-danger-text)" : "var(--status-success-text)" }}>
                          {paper.attendance}%
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={paper.eligible ? "FEASIBLE" : "INFEASIBLE"} />
                        {!paper.eligible && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {paper.ineligibilityReason}
                          </div>
                        )}
                      </td>
                      <td>
                        {isRegistered ? (
                          <span style={{ fontSize: "12px", color: "var(--status-success-text)", fontWeight: "600" }}>
                            ✓ Registered
                          </span>
                        ) : paper.eligible ? (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: "12px", padding: "4px 10px" }}
                            onClick={() => handleRegister(paper.code)}
                          >
                            Register Paper
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: "12px", padding: "4px 10px", opacity: 0.5, cursor: "not-allowed" }}
                            disabled
                          >
                            Ineligible
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

        {/* Timetable Grid */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Personalized Exam Timetable & Seating</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paper Code</th>
                  <th>Subject</th>
                  <th>Date & Time</th>
                  <th>Assigned Hall</th>
                  <th>Designated Seat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>CS701</td>
                  <td>Distributed Systems & Cloud Computing</td>
                  <td>Nov 10, 2026 (09:30 - 12:30 IST)</td>
                  <td>Hall A-101</td>
                  <td><strong style={{ color: "var(--brand-primary)" }}>Row 3, Desk 14</strong></td>
                  <td><StatusBadge status="PUBLISHED" /></td>
                </tr>
                {registeredPapers.includes("CS704") && (
                  <tr>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>CS704</td>
                    <td>Cryptography & Network Security</td>
                    <td>Nov 12, 2026 (09:30 - 12:30 IST)</td>
                    <td>Hall A-101</td>
                    <td><strong style={{ color: "var(--brand-primary)" }}>Row 4, Desk 08</strong></td>
                    <td><StatusBadge status="PUBLISHED" /></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
=======
export const RoleViews: React.FC<RoleViewsProps> = ({ role, activeTab }) => {
  if (role === UserRole.STUDENT) {
    return <StudentPortal initialTab={activeTab === "registration" ? "registration" : "timetable"} />;
>>>>>>> 3a9aaab4dc5978465605bc6591b73fc14d95c5e8
  }

  if (role === UserRole.FACULTY) {
    return <FacultyPortal initialTab={activeTab === "availability" ? "availability" : "invigilation"} />;
  }

  // HOD View (Preserved and styled cleanly)
  return (
    <div className="hod-dashboard">
      <div className="portal-header-row">
        <div>
          <div className="portal-title-group">
            <h1 className="portal-main-heading">HOD Department Administrative Console</h1>
            <span className="official-version-pill">Academic Cycle 2026-27</span>
          </div>
          <p className="portal-sub-heading">
            Department Scope: <strong>Computer Science & Engineering</strong> | HOD: <strong>Prof. R. K. Mehta</strong>
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Dept Students Registered</div>
          <div className="metric-value font-mono">235</div>
          <div className="metric-footer">
            <span className="text-success">0 pending eligibility clearances</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Dept Faculty Deployed</div>
          <div className="metric-value font-mono">6 / 8</div>
          <div className="metric-footer">
            <span>Balanced invigilation distribution</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Departmental Approval</div>
          <div className="metric-value text-success" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Reviewed</span>
            <ShieldCheck size={20} />
          </div>
          <div className="metric-footer">
            <span>Schedule meets CSE departmental norms</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Lab & Hall Allocations</div>
          <div className="metric-value text-brand" style={{ fontSize: "20px" }}>
            Halls A-101 & B-204
          </div>
          <div className="metric-footer">
            <span>Optimal capacity utilization (86.4%)</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Department Examination Offerings & Invigilation Audit</h2>
            <p className="card-subtitle">
              Overview of scheduled departmental papers and faculty duties
            </p>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Subject Title</th>
                <th>Date & Slot (IST)</th>
                <th>Enrolled Candidates</th>
                <th>Assigned Hall</th>
                <th>Designated Chief Invigilator</th>
                <th>Department Clearance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono" style={{ fontWeight: 600 }}>CS701</td>
                <td>Distributed Systems & Cloud Computing</td>
                <td>Nov 10, 2026 (09:30 - 12:30)</td>
                <td className="font-mono">120</td>
                <td>Hall A-101</td>
                <td>Dr. Arvind Sharma (CSE)</td>
                <td><StatusBadge status="APPROVED" /></td>
              </tr>
              <tr>
                <td className="font-mono" style={{ fontWeight: 600 }}>CS704</td>
                <td>Cryptography & Network Security</td>
                <td>Nov 12, 2026 (09:30 - 12:30)</td>
                <td className="font-mono">115</td>
                <td>Hall A-101</td>
                <td>Dr. Arvind Sharma (CSE)</td>
                <td><StatusBadge status="APPROVED" /></td>
              </tr>
              <tr>
                <td className="font-mono" style={{ fontWeight: 600 }}>CS709</td>
                <td>High Performance Computing (Elective)</td>
                <td>Nov 16, 2026 (14:00 - 17:00)</td>
                <td className="font-mono">65</td>
                <td>Hall B-204</td>
                <td>Prof. R. Iyer (ECE)</td>
                <td><StatusBadge status="APPROVED" /></td>
              </tr>
              <tr>
                <td className="font-mono" style={{ fontWeight: 600 }}>CS712</td>
                <td>Software Reliability & Fault Tolerance</td>
                <td>Nov 19, 2026 (09:30 - 12:30)</td>
                <td className="font-mono">118</td>
                <td>Hall C-301</td>
                <td>Dr. P. Kulkarni (Mech)</td>
                <td><StatusBadge status="APPROVED" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
