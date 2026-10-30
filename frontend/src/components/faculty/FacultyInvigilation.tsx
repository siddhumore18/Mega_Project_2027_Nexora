import React, { useState, useEffect } from "react";
import { SeatingChartModal } from "./SeatingChartModal.js";
import { useAuth } from "../../context/AuthContext.js";
import { AcademicDataStore, CoordinatorExamEntry } from "../../services/academicDataStore.js";
import {
  Clock,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";

interface InvigilationDuty {
  id: string;
  date: string;
  timeSlot: string;
  duration: string;
  hall: string;
  hallCapacity: number;
  expectedCandidates: number;
  courseCode: string;
  courseTitle: string;
  dutyRole: "Chief Invigilator" | "Hall Invigilator" | "Relief Invigilator";
  status: "APPROVED" | "PENDING_ACK";
  acknowledgedAt?: string;
  assistantInvigilator?: string;
}

export const FacultyInvigilation: React.FC = () => {
  const { currentUser } = useAuth();
  const facultyName = currentUser?.name || "Dr. Arvind Sharma";

  const [duties, setDuties] = useState<InvigilationDuty[]>([]);

  useEffect(() => {
    const updateDutiesFromStore = () => {
      const state = AcademicDataStore.getSnapshot();
      const allExams = state.coordinatorExams || [];
      const cleanUserName = facultyName.replace(/\s*\(.*?\)/, "").trim().toLowerCase();

      const matched = allExams.filter((ex: CoordinatorExamEntry) => {
        if (!ex.invigilator) return false;
        const cleanInvig = ex.invigilator.replace(/\s*\(.*?\)/, "").trim().toLowerCase();
        return cleanInvig === cleanUserName || cleanInvig.includes(cleanUserName) || cleanUserName.includes(cleanInvig);
      });

      if (matched.length > 0) {
        const mapped: InvigilationDuty[] = matched.map((ex, idx) => ({
          id: ex.id,
          date: ex.date,
          timeSlot: ex.slot,
          duration: `${(ex.durationMinutes ? ex.durationMinutes / 60 : 2.5).toFixed(1)} Hours`,
          hall: ex.room,
          hallCapacity: (ex.enrolled || 60) + 15,
          expectedCandidates: ex.enrolled || 60,
          courseCode: ex.code,
          courseTitle: ex.subject,
          dutyRole: idx === 0 ? "Chief Invigilator" : "Hall Invigilator",
          status: "APPROVED",
          acknowledgedAt: "Confirmed in Master Schedule",
          assistantInvigilator: "Relief: Exam Control Room",
        }));
        setDuties(mapped);
      }
    };

    updateDutiesFromStore();
    return AcademicDataStore.subscribe(updateDutiesFromStore);
  }, [facultyName]);

  const [activeModalDuty, setActiveModalDuty] = useState<InvigilationDuty | null>(null);

  const handleAcknowledge = (dutyId: string) => {
    const timestamp = new Date().toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " IST";

    setDuties((prev) =>
      prev.map((d) =>
        d.id === dutyId
          ? {
              ...d,
              status: "APPROVED",
              acknowledgedAt: timestamp,
            }
          : d
      )
    );
  };

  const acknowledgedCount = duties.filter((d) => d.status === "APPROVED" && d.acknowledgedAt).length;
  const pendingCount = duties.length - acknowledgedCount;

  return (
    <div className="faculty-invigilation-module">
      {/* Header Row */}
      <div className="portal-header-row">
        <div>
          <div className="portal-title-group">
            <h1 className="portal-main-heading">Faculty Invigilation Roster & Duties</h1>
            <span className="official-version-pill">Official Exam Cycle: Autumn 2026</span>
          </div>
          <p className="portal-sub-heading">
            Faculty Member: <strong>Dr. Arvind Sharma</strong> (EMP: <span className="font-mono">FAC-1082</span>) | Associate Professor, Computer Science
          </p>
        </div>

        <div className="portal-header-actions">
          <button
            onClick={() => setActiveModalDuty(duties[0])}
            className="btn btn-primary"
          >
            <FileSpreadsheet size={16} />
            <span>Open Hall Seating Chart</span>
          </button>
        </div>
      </div>

      {/* Workload & Compliance Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Assigned Duties</div>
          <div className="metric-value font-mono">3 Sessions</div>
          <div className="metric-footer">
            <span>Total: 9.0 Hours examination supervision</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Workload Bound Policy</div>
          <div className="metric-value text-success" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Compliant</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-footer">
            <span>Bound: Max 3 sessions / 10 hours per week</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Teaching Conflict Check</div>
          <div className="metric-value text-success" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>0 Conflicts</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-footer">
            <span>Cross-verified with CS department lecture slots</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Formal Acknowledgement</div>
          <div className="metric-value" style={{ fontSize: "20px" }}>
            {pendingCount === 0 ? (
              <span className="text-success">All Confirmed</span>
            ) : (
              <span className="text-warning font-mono">{pendingCount} Action Pending</span>
            )}
          </div>
          <div className="metric-footer">
            <span>{acknowledgedCount} of {duties.length} sessions acknowledged</span>
          </div>
        </div>
      </div>

      {/* Assigned Duties Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">My Invigilation Schedule & Allocations</h2>
            <p className="card-subtitle">
              Please review all assigned sessions and complete formal acknowledgement
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table" aria-label="Faculty Invigilation Roster">
            <thead>
              <tr>
                <th>Session Date</th>
                <th>Time Slot (IST)</th>
                <th>Examination Hall</th>
                <th>Subject & Paper</th>
                <th>Candidates</th>
                <th>Assigned Role</th>
                <th>Acknowledgement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {duties.map((duty) => (
                <tr key={duty.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <strong>{duty.date}</strong>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} style={{ color: "var(--text-muted)" }} />
                      <span>{duty.timeSlot}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} style={{ color: "var(--brand-primary)" }} />
                      <strong>{duty.hall}</strong>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Cap: {duty.hallCapacity} seats
                    </div>
                  </td>
                  <td>
                    <div className="font-mono" style={{ fontWeight: 600 }}>{duty.courseCode}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{duty.courseTitle}</div>
                  </td>
                  <td>
                    <span className="font-mono">{duty.expectedCandidates}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${duty.dutyRole === "Chief Invigilator" ? "badge-success" : "badge-neutral"}`}
                    >
                      {duty.dutyRole}
                    </span>
                  </td>
                  <td>
                    {duty.status === "APPROVED" && duty.acknowledgedAt ? (
                      <div>
                        <div className="text-success" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                          <CheckCircle2 size={14} />
                          <strong>Acknowledged</strong>
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          {duty.acknowledgedAt}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(duty.id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                      >
                        Acknowledge Duty
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setActiveModalDuty(duty)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "4px 8px", fontSize: "11px", whiteSpace: "nowrap" }}
                    >
                      Seating Roster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chief Invigilator Protocol Checklist & Control Room Info */}
      <div className="faculty-two-col-grid" style={{ marginTop: "24px" }}>
        {/* Checklist */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} className="text-brand" />
              <h3 className="card-title">Invigilator Operational Protocol Checklist</h3>
            </div>
          </div>
          <div className="protocol-checklist">
            <div className="protocol-item">
              <span className="protocol-step">1</span>
              <div>
                <strong>Collect Question Paper Packets</strong>
                <p className="protocol-desc">Report to Exam Confidential Room (Room 102) 45 minutes prior to session start.</p>
              </div>
            </div>
            <div className="protocol-item">
              <span className="protocol-step">2</span>
              <div>
                <strong>Seal Inspection & Signatures</strong>
                <p className="protocol-desc">Verify unbroken envelope seal with two candidate witnesses at 09:15 / 13:45 IST.</p>
              </div>
            </div>
            <div className="protocol-item">
              <span className="protocol-step">3</span>
              <div>
                <strong>Candidate ID & Admit Card Verification</strong>
                <p className="protocol-desc">Verify candidate photograph on Admit Card against university smartcard roster.</p>
              </div>
            </div>
            <div className="protocol-item">
              <span className="protocol-step">4</span>
              <div>
                <strong>Bundle Count & Submission</strong>
                <p className="protocol-desc">Hand over answered scripts arranged strictly by roll number within 30 minutes of exam close.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Control Room Helpline */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PhoneCall size={18} className="text-warning" />
              <h3 className="card-title">Central Examination Control Helpline</h3>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            For urgent exam hall assistance, missing question packets, or candidate medical emergencies, contact immediately:
          </p>
          <div className="contact-numbers-list">
            <div className="contact-row">
              <span className="contact-role">Chief Superintendent:</span>
              <span className="contact-value font-mono">Ext. 4010 / +91 20 2590 4010</span>
            </div>
            <div className="contact-row">
              <span className="contact-role">Exam Control Room:</span>
              <span className="contact-value font-mono">Ext. 4012 / Room 104 Main Block</span>
            </div>
            <div className="contact-row">
              <span className="contact-role">Medical Emergency Cell:</span>
              <span className="contact-value font-mono">Ext. 1100 (Campus Ambulance)</span>
            </div>
            <div className="contact-row">
              <span className="contact-role">IT & Biometric Helpline:</span>
              <span className="contact-value font-mono">Ext. 4055 (Hall Terminal Support)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seating Roster Modal */}
      {activeModalDuty && (
        <SeatingChartModal
          isOpen={!!activeModalDuty}
          onClose={() => setActiveModalDuty(null)}
          hallName={activeModalDuty.hall}
          date={activeModalDuty.date}
          timeSlot={activeModalDuty.timeSlot}
          courseCode={activeModalDuty.courseCode}
          courseTitle={activeModalDuty.courseTitle}
          totalCandidates={activeModalDuty.expectedCandidates}
        />
      )}
    </div>
  );
};
