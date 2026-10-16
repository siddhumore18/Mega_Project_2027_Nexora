import React from "react";
import { Modal } from "../common/Modal.js";
import { Printer, ShieldCheck, AlertTriangle, QrCode } from "lucide-react";

interface ExamEntry {
  code: string;
  subject: string;
  date: string;
  slot: string;
  hall: string;
  desk: string;
}

interface HallTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  rollNo: string;
  department: string;
  exams: ExamEntry[];
}

export const HallTicketModal: React.FC<HallTicketModalProps> = ({
  isOpen,
  onClose,
  studentName,
  rollNo,
  department,
  exams,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Examination Hall Ticket (Admit Card)"
      subtitle="Authorized Document for Entry to Autumn End-Semester Examinations 2026-27"
      maxWidth="780px"
    >
      <div className="hall-ticket-container" id="printable-hall-ticket">
        {/* Ticket Header */}
        <div className="ticket-header-box">
          <div className="ticket-logo-mark">N</div>
          <div className="ticket-header-text">
            <h3 className="ticket-university-name">NEXORA INSTITUTE OF TECHNOLOGY & HIGHER STUDIES</h3>
            <p className="ticket-dept-name">OFFICE OF THE CONTROLLER OF EXAMINATIONS</p>
            <div className="ticket-badge-strip">
              <span>AUTUMN END-SEMESTER EXAMINATIONS 2026-27</span>
              <span>•</span>
              <span>OFFICIAL ADMIT CARD</span>
            </div>
          </div>
          <div className="ticket-qr-box" title="Tamper-proof Digital Verification QR">
            <QrCode size={56} style={{ color: "var(--text-primary)" }} />
            <span className="ticket-qr-caption">VERIFIED PASS</span>
          </div>
        </div>

        {/* Candidate Details Grid */}
        <div className="ticket-candidate-grid">
          <div className="candidate-field">
            <span className="field-label">Candidate Name:</span>
            <span className="field-value"><strong>{studentName}</strong></span>
          </div>
          <div className="candidate-field">
            <span className="field-label">Roll Number:</span>
            <span className="field-value font-mono"><strong>{rollNo}</strong></span>
          </div>
          <div className="candidate-field">
            <span className="field-label">Department / Program:</span>
            <span className="field-value">{department}</span>
          </div>
          <div className="candidate-field">
            <span className="field-label">Current Semester:</span>
            <span className="field-value">Semester VII (Undergraduate)</span>
          </div>
          <div className="candidate-field">
            <span className="field-label">Examination Center:</span>
            <span className="field-value">Main Academic Block, Campus A</span>
          </div>
          <div className="candidate-field">
            <span className="field-label">Eligibility Verification:</span>
            <span className="field-value text-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} /> Fee Cleared & 84% Attendance
            </span>
          </div>
        </div>

        {/* Paper Schedule Table */}
        <div className="ticket-table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Title</th>
                <th>Exam Date</th>
                <th>Time Slot (IST)</th>
                <th>Hall & Desk</th>
                <th>Invigilator Sig.</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.code}>
                  <td className="font-mono" style={{ fontWeight: 600 }}>{exam.code}</td>
                  <td>{exam.subject}</td>
                  <td>{exam.date}</td>
                  <td>{exam.slot}</td>
                  <td>
                    <span className="seat-chip">{exam.hall} • {exam.desk}</span>
                  </td>
                  <td className="sig-placeholder">______________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions Alert */}
        <div className="ticket-rules-box">
          <div className="rules-header">
            <AlertTriangle size={15} className="text-warning" />
            <strong>Mandatory Instructions for the Candidate:</strong>
          </div>
          <ul className="rules-list">
            <li>Candidates must arrive at the examination hall at least <strong>30 minutes before</strong> commencement.</li>
            <li>This Admit Card along with the institutional Photo ID card is mandatory for entry.</li>
            <li>Programmable calculators, mobile phones, smartwatches, and study notes are strictly forbidden.</li>
            <li>No candidate shall be permitted to enter 15 minutes after examination commencement.</li>
          </ul>
        </div>

        {/* Signatures Footer */}
        <div className="ticket-footer-grid">
          <div className="sig-box">
            <div className="sig-line"></div>
            <span>Signature of Candidate</span>
          </div>
          <div className="sig-box center-seal">
            <div className="university-seal-stamp">
              <span>NEXORA EXAM CELL</span>
              <span style={{ fontSize: "9px" }}>OFFICIALLY VERIFIED</span>
            </div>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
            <span>Controller of Examinations</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="modal-actions-bar">
        <button onClick={onClose} className="btn btn-secondary">
          Close
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </Modal>
  );
};
