import React, { useState } from "react";
import { Modal } from "../common/Modal.js";
import { Printer, CheckSquare, Square } from "lucide-react";

interface CandidateRecord {
  rollNo: string;
  name: string;
  desk: string;
  courseCode: string;
  present: boolean;
}

interface SeatingChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  hallName: string;
  date: string;
  timeSlot: string;
  courseCode: string;
  courseTitle: string;
  totalCandidates: number;
}

export const SeatingChartModal: React.FC<SeatingChartModalProps> = ({
  isOpen,
  onClose,
  hallName,
  date,
  timeSlot,
  courseCode,
  courseTitle,
  totalCandidates,
}) => {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([
    { rollNo: "CS2023-001", name: "Aaditya Patil", desk: "Row 1, Desk 01", courseCode: "CS701", present: true },
    { rollNo: "CS2023-002", name: "Aakriti Sen", desk: "Row 1, Desk 02", courseCode: "CS701", present: true },
    { rollNo: "CS2023-003", name: "Abhay Singh", desk: "Row 1, Desk 03", courseCode: "CS701", present: true },
    { rollNo: "CS2023-014", name: "Ananya Roy", desk: "Row 2, Desk 04", courseCode: "CS701", present: true },
    { rollNo: "CS2023-025", name: "Bhavya Joshi", desk: "Row 2, Desk 12", courseCode: "CS701", present: true },
    { rollNo: "CS2023-042", name: "Aarav Sharma", desk: "Row 3, Desk 14", courseCode: "CS701", present: true },
    { rollNo: "CS2023-043", name: "Divya Deshmukh", desk: "Row 3, Desk 15", courseCode: "CS701", present: true },
    { rollNo: "CS2023-051", name: "Farhan Khan", desk: "Row 4, Desk 06", courseCode: "CS701", present: false },
    { rollNo: "CS2023-068", name: "Gaurav Verma", desk: "Row 4, Desk 18", courseCode: "CS701", present: true },
    { rollNo: "CS2023-079", name: "Ishaan Nair", desk: "Row 5, Desk 09", courseCode: "CS701", present: true },
  ]);

  const toggleAttendance = (rollNo: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.rollNo === rollNo ? { ...c, present: !c.present } : c))
    );
  };

  const presentCount = candidates.filter((c) => c.present).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hall Seating & Attendance Roster — ${hallName}`}
      subtitle={`${courseCode}: ${courseTitle} | ${date} (${timeSlot})`}
      maxWidth="820px"
    >
      <div className="seating-modal-content">
        {/* Hall Metadata Summary */}
        <div className="hall-meta-banner">
          <div className="hall-stat-block">
            <span className="stat-label">Assigned Hall:</span>
            <span className="stat-value"><strong>{hallName}</strong> (Main Block, Floor 1)</span>
          </div>
          <div className="hall-stat-block">
            <span className="stat-label">Allocated Candidates:</span>
            <span className="stat-value font-mono"><strong>{totalCandidates} Candidates</strong></span>
          </div>
          <div className="hall-stat-block">
            <span className="stat-label">Marked Attendance:</span>
            <span className="stat-value text-success font-mono">
              <strong>{presentCount} Present</strong> / {candidates.length} Sampled
            </span>
          </div>
        </div>

        {/* Visual Seating Layout Preview */}
        <div className="seating-grid-section">
          <div className="seating-grid-header">
            <h4 style={{ fontSize: "14px", fontWeight: "600" }}>Physical Hall Layout & Invigilator Podium</h4>
            <div className="seating-legend">
              <span className="legend-item"><span className="legend-chip occupied" /> Assigned Desk</span>
              <span className="legend-item"><span className="legend-chip vacant" /> Buffer Desk</span>
            </div>
          </div>

          <div className="podium-banner">PODIUM / CHIEF INVIGILATOR DESK (FRONT)</div>

          <div className="mini-desk-grid">
            {Array.from({ length: 24 }).map((_, idx) => {
              const isAssigned = idx < 18;
              const isTargetStudent = idx === 13; // Aarav Sharma's desk
              return (
                <div
                  key={idx}
                  className={`desk-cell ${isAssigned ? "occupied" : "buffer"} ${isTargetStudent ? "highlighted" : ""}`}
                  title={isAssigned ? `Desk ${idx + 1}: Assigned` : `Desk ${idx + 1}: Buffer Seat`}
                >
                  <span className="desk-num">D-{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  {isTargetStudent && <span className="student-dot" title="Aarav Sharma (CS2023-042)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Attendance Roster Table */}
        <div className="attendance-roster-section" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600" }}>Candidate Attendance Verification Sheet</h4>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Click checkbox to toggle candidate presence
            </span>
          </div>

          <div className="table-container" style={{ maxHeight: "240px", overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>Present</th>
                  <th>Roll Number</th>
                  <th>Candidate Name</th>
                  <th>Designated Desk</th>
                  <th>Course Code</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.rollNo}>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleAttendance(c.rollNo)}
                        style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                        aria-label={`Mark ${c.name} as ${c.present ? "absent" : "present"}`}
                      >
                        {c.present ? (
                          <CheckSquare size={18} className="text-success" />
                        ) : (
                          <Square size={18} style={{ color: "var(--border-strong)" }} />
                        )}
                      </button>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600 }}>{c.rollNo}</td>
                    <td>{c.name}</td>
                    <td><strong>{c.desk}</strong></td>
                    <td className="font-mono">{c.courseCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions-bar" style={{ marginTop: "20px" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer size={16} />
            <span>Print Attendance Sheet</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
