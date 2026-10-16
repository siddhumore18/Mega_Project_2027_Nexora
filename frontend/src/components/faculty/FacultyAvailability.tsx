import React, { useState } from "react";
import { AlertBanner } from "../common/AlertBanner.js";
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface SlotPreference {
  day: string;
  morning: boolean; // 09:30 - 12:30
  afternoon: boolean; // 14:00 - 17:00
}

interface BlackoutRequest {
  id: string;
  date: string;
  slot: string;
  reason: string;
  status: "APPROVED" | "PENDING_HOD_REVIEW";
  submittedAt: string;
}

export const FacultyAvailability: React.FC = () => {
  // Weekly default slots (True = Available, False = Blocked)
  const [weeklySlots, setWeeklySlots] = useState<SlotPreference[]>([
    { day: "Monday", morning: true, afternoon: true },
    { day: "Tuesday", morning: true, afternoon: false }, // Teaching lecture in afternoon
    { day: "Wednesday", morning: true, afternoon: true },
    { day: "Thursday", morning: true, afternoon: true },
    { day: "Friday", morning: true, afternoon: true },
    { day: "Saturday", morning: true, afternoon: false },
  ]);

  // Blackout date form state
  const [blackoutDate, setBlackoutDate] = useState("");
  const [blackoutSlot, setBlackoutSlot] = useState("Morning (09:30 - 12:30)");
  const [blackoutReason, setBlackoutReason] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Existing recorded blackouts
  const [blackoutList, setBlackoutList] = useState<BlackoutRequest[]>([
    {
      id: "req-1",
      date: "2026-11-13",
      slot: "Afternoon (14:00 - 17:00)",
      reason: "Institute Academic Senate Curriculum Committee Meeting",
      status: "APPROVED",
      submittedAt: "Oct 12, 2026",
    },
  ]);

  const toggleSlot = (dayIndex: number, period: "morning" | "afternoon") => {
    setWeeklySlots((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex ? { ...item, [period]: !item[period] } : item
      )
    );
  };

  // Frontend validation for blackout submission
  const handleBlackoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!blackoutDate) {
      errors.push("Please select an effective exemption date.");
    }

    if (!blackoutReason.trim()) {
      errors.push("Please provide a legitimate justification/reason for the requested exemption.");
    } else if (blackoutReason.trim().length < 10) {
      errors.push("Exemption reason must be descriptive (at least 10 characters).");
    }

    // Policy check: Max 2 blackout slots allowed per exam cycle
    if (blackoutList.length >= 2) {
      errors.push(
        "Policy Constraint: You have reached the maximum limit of 2 blackout exemptions per examination cycle. Additional requests require Dean of Academic Affairs dispensation."
      );
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      setSubmitSuccess(null);
      return;
    }

    const newRequest: BlackoutRequest = {
      id: `req-${Date.now()}`,
      date: blackoutDate,
      slot: blackoutSlot,
      reason: blackoutReason.trim(),
      status: "PENDING_HOD_REVIEW",
      submittedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setBlackoutList([newRequest, ...blackoutList]);
    setBlackoutDate("");
    setBlackoutReason("");
    setFormErrors([]);
    setSubmitSuccess("Exemption request submitted successfully and queued for HOD review.");
  };

  const removeBlackout = (id: string) => {
    setBlackoutList((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate total available slots
  const totalAvailableSlots = weeklySlots.reduce(
    (acc, cur) => acc + (cur.morning ? 1 : 0) + (cur.afternoon ? 1 : 0),
    0
  );

  return (
    <div className="faculty-availability-module">
      <div className="portal-header-row">
        <div>
          <h1 className="portal-main-heading">Faculty Availability & Blackout Preferences</h1>
          <p className="portal-sub-heading">
            Configure your regular slot preferences and lodge official duty exemption requests
          </p>
        </div>
      </div>

      {/* Policy Rules Banner */}
      <AlertBanner
        type="info"
        title="Institutional Invigilation Availability Policy (2026-27)"
        message={
          <span>
            Every full-time faculty member is required to maintain availability for a minimum of{" "}
            <strong>8 slots per week</strong>. A maximum of <strong>2 blackout exemptions</strong> may be logged during an examination cycle.
          </span>
        }
      />

      {/* Weekly Slot Availability Matrix */}
      <div className="card" style={{ marginTop: "20px" }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Weekly Recurring Invigilation Availability Matrix</h2>
            <p className="card-subtitle">
              Click individual session tiles to toggle between Available (Green) and Unavailable (Slate)
            </p>
          </div>
          <div className="slot-count-badge">
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Available:</span>
            <strong className={`font-mono ${totalAvailableSlots >= 8 ? "text-success" : "text-danger"}`}>
              {totalAvailableSlots} / 12 Slots
            </strong>
          </div>
        </div>

        <div className="weekly-matrix-table-wrap">
          <table className="weekly-matrix-table">
            <thead>
              <tr>
                <th style={{ width: "160px" }}>Day of Week</th>
                <th>Morning Session (09:30 - 12:30 IST)</th>
                <th>Afternoon Session (14:00 - 17:00 IST)</th>
              </tr>
            </thead>
            <tbody>
              {weeklySlots.map((slot, index) => (
                <tr key={slot.day}>
                  <td><strong>{slot.day}</strong></td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleSlot(index, "morning")}
                      className={`slot-matrix-btn ${slot.morning ? "slot-available" : "slot-blocked"}`}
                      aria-label={`${slot.day} Morning: ${slot.morning ? "Available" : "Unavailable"}`}
                    >
                      {slot.morning ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>AVAILABLE FOR DUTY</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={15} />
                          <span>UNAVAILABLE (LECTURE / LAB)</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleSlot(index, "afternoon")}
                      className={`slot-matrix-btn ${slot.afternoon ? "slot-available" : "slot-blocked"}`}
                      aria-label={`${slot.day} Afternoon: ${slot.afternoon ? "Available" : "Unavailable"}`}
                    >
                      {slot.afternoon ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>AVAILABLE FOR DUTY</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={15} />
                          <span>UNAVAILABLE (LECTURE / LAB)</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exemption Request Form & Active Blackouts Grid */}
      <div className="faculty-two-col-grid" style={{ marginTop: "24px" }}>
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Lodge Date-Specific Blackout Request</h3>
              <p className="card-subtitle">
                Subject to HOD and Exam Cell verification
              </p>
            </div>
          </div>

          {formErrors.length > 0 && (
            <div className="alert-banner alert-danger" style={{ marginBottom: "16px" }}>
              <div className="alert-icon-container">
                <AlertCircle size={18} className="text-danger" />
              </div>
              <div className="alert-content">
                <div className="alert-title">Validation Warning</div>
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="alert-banner alert-success" style={{ marginBottom: "16px" }}>
              <div className="alert-icon-container">
                <CheckCircle2 size={18} className="text-success" />
              </div>
              <div className="alert-content">
                <div>{submitSuccess}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleBlackoutSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="blackout-date">
                Exemption Date <span className="text-danger">*</span>
              </label>
              <input
                id="blackout-date"
                type="date"
                value={blackoutDate}
                onChange={(e) => setBlackoutDate(e.target.value)}
                className="form-input"
                min="2026-11-01"
                max="2026-11-30"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="blackout-slot">
                Affected Session Slot <span className="text-danger">*</span>
              </label>
              <select
                id="blackout-slot"
                value={blackoutSlot}
                onChange={(e) => setBlackoutSlot(e.target.value)}
                className="form-select"
              >
                <option value="Morning (09:30 - 12:30)">Morning Slot (09:30 - 12:30 IST)</option>
                <option value="Afternoon (14:00 - 17:00)">Afternoon Slot (14:00 - 17:00 IST)</option>
                <option value="Full Day (Both Slots)">Full Day (Both Morning & Afternoon)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="blackout-reason">
                Institutional / Academic Justification <span className="text-danger">*</span>
              </label>
              <textarea
                id="blackout-reason"
                rows={3}
                placeholder="State reason (e.g. PhD Defense external committee, National Conference paper presentation, Medical leave)..."
                value={blackoutReason}
                onChange={(e) => setBlackoutReason(e.target.value)}
                className="form-input"
                style={{ resize: "vertical" }}
              />
              <div className="form-hint">
                Minimum 10 characters required. Documentary proof must be retained for audit.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              <Send size={15} />
              <span>Submit Exemption Petition</span>
            </button>
          </form>
        </div>

        {/* Existing Blackout Entries */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recorded Blackout Entries ({blackoutList.length}/2)</h3>
              <p className="card-subtitle">
                Approved exemptions prevent the OR-Tools solver from allocating you
              </p>
            </div>
          </div>

          <div className="blackout-requests-list">
            {blackoutList.map((item) => (
              <div key={item.id} className="blackout-item-card">
                <div className="blackout-item-header">
                  <div>
                    <span className="font-mono font-bold">{item.date}</span>
                    <span className="bullet-dot">•</span>
                    <span>{item.slot}</span>
                  </div>
                  <span
                    className={`badge ${item.status === "APPROVED" ? "badge-success" : "badge-warning"}`}
                  >
                    {item.status === "APPROVED" ? "APPROVED" : "PENDING HOD"}
                  </span>
                </div>
                <p className="blackout-reason-text">{item.reason}</p>
                <div className="blackout-footer">
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Lodge Date: {item.submittedAt}
                  </span>
                  <button
                    onClick={() => removeBlackout(item.id)}
                    className="btn-icon-subtle text-danger"
                    title="Cancel Request"
                    aria-label="Cancel exemption request"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {blackoutList.length === 0 && (
              <div className="empty-state-box">
                <ShieldCheck size={28} style={{ color: "var(--text-muted)" }} />
                <p style={{ marginTop: "8px", fontWeight: 600 }}>No blackout dates registered</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  You are available for automated invigilation scheduling as per your weekly matrix.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
