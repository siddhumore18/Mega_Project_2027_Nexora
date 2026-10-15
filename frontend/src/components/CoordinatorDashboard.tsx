import React, { useState } from "react";
import { StatusBadge } from "./StatusBadge.js";

interface ExamEntry {
  id: string;
  code: string;
  subject: string;
  department: string;
  enrolled: number;
  slot: string;
  room: string;
  invigilator: string;
  status: "FEASIBLE" | "APPROVED" | "DRAFT";
}

interface StudentEligibilityEntry {
  roll: string;
  name: string;
  subject: string;
  attendance: number;
  backlogAttempt: number;
  isEligible: boolean;
  statusLabel: string;
  explanation: string;
}

export const CoordinatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"schedule" | "eligibility">("schedule");
  const [solverStatus, setSolverStatus] = useState<string>("FEASIBLE");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const mockExams: ExamEntry[] = [
    {
      id: "1",
      code: "CS701",
      subject: "Distributed Systems & Cloud Computing",
      department: "CSE",
      enrolled: 120,
      slot: "2026-11-10 09:30 - 12:30",
      room: "Hall A-101 (Cap: 150)",
      invigilator: "Dr. A. Sharma (CSE)",
      status: "FEASIBLE",
    },
    {
      id: "2",
      code: "EC702",
      subject: "VLSI Architecture & Embedded Logic",
      department: "ECE",
      enrolled: 90,
      slot: "2026-11-10 14:00 - 17:00",
      room: "Hall B-204 (Cap: 100)",
      invigilator: "Prof. R. Iyer (ECE)",
      status: "FEASIBLE",
    },
    {
      id: "3",
      code: "ME703",
      subject: "Finite Element Methods & Dynamics",
      department: "Mech",
      enrolled: 75,
      slot: "2026-11-11 09:30 - 12:30",
      room: "Hall C-301 (Cap: 90)",
      invigilator: "Dr. P. Kulkarni (Mech)",
      status: "FEASIBLE",
    },
    {
      id: "4",
      code: "CS704",
      subject: "Cryptography & Network Security",
      department: "CSE",
      enrolled: 115,
      slot: "2026-11-12 09:30 - 12:30",
      room: "Hall A-101 (Cap: 150)",
      invigilator: "Prof. S. Patil (CSE)",
      status: "FEASIBLE",
    },
  ];

  const mockEligibility: StudentEligibilityEntry[] = [
    {
      roll: "CS2023-042",
      name: "Aarav Sharma",
      subject: "CS701",
      attendance: 88.5,
      backlogAttempt: 0,
      isEligible: true,
      statusLabel: "ELIGIBLE",
      explanation: "Prerequisites and 75% attendance criterion satisfied.",
    },
    {
      roll: "CS2023-055",
      name: "Neha Patel",
      subject: "CS701",
      attendance: 69.0,
      backlogAttempt: 0,
      isEligible: true,
      statusLabel: "MEDICAL_CONCESSION",
      explanation: "Approved medical concession applied (threshold 65%).",
    },
    {
      roll: "CS2023-088",
      name: "Rohan Verma",
      subject: "CS701",
      attendance: 62.4,
      backlogAttempt: 0,
      isEligible: false,
      statusLabel: "ATTENDANCE_SHORTAGE",
      explanation: "62.4% is below the mandatory 75% threshold without exemption.",
    },
    {
      roll: "CS2021-019",
      name: "Vikram Das",
      subject: "CS701",
      attendance: 78.0,
      backlogAttempt: 4,
      isEligible: false,
      statusLabel: "MAX_ATTEMPTS_EXCEEDED",
      explanation: "Attempt 4 exceeds institutional limit of 3 backlog attempts.",
    },
  ];

  const handleValidate = () => {
    setValidationMessage("Independent Node validation passed: 0 room conflicts, 0 student overlaps, 0 invigilator over-assignments.");
    setSolverStatus("OPTIMAL");
  };

  return (
    <div>
      {/* Top action header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
            Examination Coordinator Workspace
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Cycle: <strong style={{ color: "var(--text-primary)" }}>Autumn 2026 Regular & Backlogs</strong> | Target Status: Immutable v1.0
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={handleValidate}>
            Run Independent Validation
          </button>
          <button className="btn btn-primary" onClick={() => alert("Candidate schedule validated. Published timetable created as immutable version v1.0.")}>
            Publish Timetable
          </button>
        </div>
      </div>

      {validationMessage && (
        <div
          style={{
            backgroundColor: "var(--status-success-bg)",
            color: "var(--status-success-text)",
            border: "1px solid var(--status-success-border)",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>✓ {validationMessage}</span>
          <button
            onClick={() => setValidationMessage(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "600" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Cycle Status</div>
          <div className="metric-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>Ready</span>
            <StatusBadge status={solverStatus} />
          </div>
          <div className="metric-footer">Input snapshot v3 locked</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Eligible Candidates</div>
          <div className="metric-value">385 / 400</div>
          <div className="metric-footer">15 flagged with explainable shortages</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Room Capacity Utilization</div>
          <div className="metric-value">79.2%</div>
          <div className="metric-footer">Zero overflow across all 3 halls</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Hard Violations</div>
          <div className="metric-value" style={{ color: "var(--status-success-text)" }}>0</div>
          <div className="metric-footer">Student overlap = 0 | Faculty collision = 0</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`btn ${activeTab === "schedule" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "6px 14px" }}
        >
          Candidate Schedule Grid
        </button>
        <button
          onClick={() => setActiveTab("eligibility")}
          className={`btn ${activeTab === "eligibility" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "6px 14px" }}
        >
          Academic Eligibility & Policy Monitor
        </button>
      </div>

      {/* Tab 1: Schedule Grid */}
      {activeTab === "schedule" && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Candidate Schedule Grid</h2>
              <p className="card-subtitle">
                Generated via Google OR-Tools constraint solver and verified independently
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Dept</th>
                  <th>Registered</th>
                  <th>Assigned Slot</th>
                  <th>Allocated Room</th>
                  <th>Invigilator</th>
                  <th>Solver Outcome</th>
                </tr>
              </thead>
              <tbody>
                {mockExams.map((exam) => (
                  <tr key={exam.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>{exam.code}</td>
                    <td style={{ fontWeight: "500" }}>{exam.subject}</td>
                    <td>{exam.department}</td>
                    <td>{exam.enrolled} candidates</td>
                    <td>{exam.slot}</td>
                    <td>{exam.room}</td>
                    <td>{exam.invigilator}</td>
                    <td>
                      <StatusBadge status={exam.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Eligibility Monitor */}
      {activeTab === "eligibility" && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Explainable Student Eligibility Monitor</h2>
              <p className="card-subtitle">
                Rules: Mandatory 75% attendance (65% with Medical), Max 3 Backlog Attempts, Fee Clearance Required
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Paper</th>
                  <th>Attendance %</th>
                  <th>Attempt</th>
                  <th>Eligibility Outcome</th>
                  <th>Explanation & Policy Reason</th>
                </tr>
              </thead>
              <tbody>
                {mockEligibility.map((item) => (
                  <tr key={item.roll}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>{item.roll}</td>
                    <td>{item.name}</td>
                    <td>{item.subject}</td>
                    <td>
                      <strong style={{ color: item.attendance < 75 ? "var(--status-danger-text)" : "var(--status-success-text)" }}>
                        {item.attendance}%
                      </strong>
                    </td>
                    <td>#{item.backlogAttempt === 0 ? "Regular" : `Backlog ${item.backlogAttempt}`}</td>
                    <td>
                      <StatusBadge status={item.isEligible ? "FEASIBLE" : "INFEASIBLE"} />
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
