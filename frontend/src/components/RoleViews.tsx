import React, { useState } from "react";
import { UserRole } from "@nexora/contracts";
import { StatusBadge } from "./StatusBadge.js";

interface RoleViewsProps {
  role: UserRole;
}

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
  }

  if (role === UserRole.FACULTY) {
    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700" }}>Faculty Invigilation Roster</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Faculty: <strong>Dr. A. Sharma</strong> (EMP: FAC-1082) | Department: Computer Science
          </p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Assigned Duties</div>
            <div className="metric-value">2 Sessions</div>
            <div className="metric-footer">Workload bound: Max 3/week</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Duty Conflict Check</div>
            <div className="metric-value" style={{ color: "var(--status-success-text)" }}>Passed</div>
            <div className="metric-footer">0 overlap with lecture availability</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assigned Invigilation Duties</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Time Slot</th>
                  <th>Examination Hall</th>
                  <th>Expected Candidates</th>
                  <th>Duty Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nov 10, 2026</td>
                  <td>09:30 - 12:30 IST</td>
                  <td>Hall A-101</td>
                  <td>120 Candidates</td>
                  <td>Chief Invigilator</td>
                  <td><StatusBadge status="APPROVED" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // HOD View
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700" }}>HOD Department Dashboard</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Department Scope: <strong>Computer Science & Engineering</strong>
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Dept Students Registered</div>
          <div className="metric-value">235</div>
          <div className="metric-footer">0 pending eligibility clearances</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Dept Faculty Deployed</div>
          <div className="metric-value">6 / 8</div>
          <div className="metric-footer">Balanced invigilation distribution</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Dept Approval</div>
          <div className="metric-value" style={{ color: "var(--status-success-text)" }}>Reviewed</div>
          <div className="metric-footer">Schedule meets departmental guidelines</div>
        </div>
      </div>
    </div>
  );
};
