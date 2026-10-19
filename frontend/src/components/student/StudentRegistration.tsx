import React, { useState } from "react";
import { AlertBanner } from "../common/AlertBanner.js";
import { Modal } from "../common/Modal.js";
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Printer,
  ChevronRight,
  XCircle,
  Info,
} from "lucide-react";

interface SubjectEligibility {
  code: string;
  name: string;
  credits: number;
  attendancePercent: number;
  attendanceRequired: number;
  feesCleared: boolean;
  prerequisiteCleared: boolean;
  prerequisiteName?: string;
  isEligible: boolean;
  verdictReason: string;
  calculatedAt: string;
}

export const StudentRegistration: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"eligibility" | "register">("eligibility");

  // Registration Form State
  const [selectedElective, setSelectedElective] = useState<string>("CS709");
  const [backlogSelected, setBacklogSelected] = useState<boolean>(false);
  const [declaredUndertaking, setDeclaredUndertaking] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [registrationToken] = useState<string>("REG-2026-CS-04289");

  // Mock Eligibility Data with explainable reasons
  const eligibilityList: SubjectEligibility[] = [
    {
      code: "CS701",
      name: "Distributed Systems & Cloud Computing",
      credits: 4,
      attendancePercent: 86.5,
      attendanceRequired: 75.0,
      feesCleared: true,
      prerequisiteCleared: true,
      prerequisiteName: "CS502 Operating Systems (Grade: A)",
      isEligible: true,
      verdictReason: "Eligible: Attendance (86.5%) exceeds the mandatory 75% threshold. All academic tuition and lab fees cleared. Prerequisite CS502 verified.",
      calculatedAt: "Oct 15, 2026 18:30 IST",
    },
    {
      code: "CS704",
      name: "Cryptography & Network Security",
      credits: 4,
      attendancePercent: 82.0,
      attendanceRequired: 75.0,
      feesCleared: true,
      prerequisiteCleared: true,
      prerequisiteName: "CS403 Discrete Mathematics & CS504 Computer Networks",
      isEligible: true,
      verdictReason: "Eligible: Attendance (82.0%) exceeds the mandatory 75% threshold. No pending dues. Dual prerequisites verified.",
      calculatedAt: "Oct 15, 2026 18:30 IST",
    },
    {
      code: "CS709",
      name: "High Performance Computing & GPU Architecture (Elective)",
      credits: 3,
      attendancePercent: 78.4,
      attendanceRequired: 75.0,
      feesCleared: true,
      prerequisiteCleared: true,
      prerequisiteName: "CS501 Computer Architecture",
      isEligible: true,
      verdictReason: "Eligible: Attendance (78.4%) clears minimum cut-off. Prerequisite architecture track verified.",
      calculatedAt: "Oct 15, 2026 18:30 IST",
    },
    {
      code: "CS712",
      name: "Software Reliability & Fault Tolerance",
      credits: 3,
      attendancePercent: 91.2,
      attendanceRequired: 75.0,
      feesCleared: true,
      prerequisiteCleared: true,
      prerequisiteName: "CS602 Software Engineering",
      isEligible: true,
      verdictReason: "Eligible: Attendance (91.2%) well above cut-off. All laboratory journals approved by course coordinator.",
      calculatedAt: "Oct 15, 2026 18:30 IST",
    },
    {
      code: "MA701",
      name: "Stochastic Processes & Random Optimization (Audit/Add-on)",
      credits: 3,
      attendancePercent: 68.0,
      attendanceRequired: 75.0,
      feesCleared: true,
      prerequisiteCleared: false,
      prerequisiteName: "MA501 Advanced Calculus (Grade: Pending)",
      isEligible: false,
      verdictReason: "Ineligible / Conditional: Attendance (68.0%) is below the mandatory 75% university norm. Prerequisite MA501 evaluation pending. Condonation petition must be submitted to HOD by Oct 20, 2026.",
      calculatedAt: "Oct 15, 2026 18:30 IST",
    },
  ];

  // Frontend validation for registration form
  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!selectedElective) {
      errors.push("You must select exactly one Departmental Elective course.");
    }

    if (!declaredUndertaking) {
      errors.push("You must acknowledge and accept the academic integrity declaration checkbox before submitting.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormErrors([]);
    setIsSubmitted(true);
    setShowReceiptModal(true);
  };

  return (
    <div className="student-registration-module">
      {/* Module Title */}
      <div className="portal-header-row">
        <div>
          <h1 className="portal-main-heading">Academic Registration & Eligibility Center</h1>
          <p className="portal-sub-heading">
            Current Examination Cycle: <strong>Autumn End-Semester 2026-27</strong> | Candidate: <strong>Aarav Sharma</strong> (<span className="font-mono">CS2023-042</span>)
          </p>
        </div>

        {/* Tab switch between Eligibility and Registration Form */}
        <div className="portal-sub-tabs">
          <button
            className={`sub-tab-btn ${activeSubTab === "eligibility" ? "active" : ""}`}
            onClick={() => setActiveSubTab("eligibility")}
          >
            <ShieldCheck size={16} />
            <span>Eligibility Clearance</span>
          </button>
          <button
            className={`sub-tab-btn ${activeSubTab === "register" ? "active" : ""}`}
            onClick={() => setActiveSubTab("register")}
          >
            <BookOpen size={16} />
            <span>Course Registration</span>
            {isSubmitted && <span className="tab-chip-pill">Submitted</span>}
          </button>
        </div>
      </div>

      {/* Deadline Notice Banner */}
      <AlertBanner
        type="warning"
        title="Official Registration Window Notice"
        message={
          <span>
            Candidate course registration for Autumn 2026 closes on{" "}
            <strong>October 25, 2026 at 23:59 IST</strong> (Asia/Kolkata). Untagged papers will not appear on official hall tickets.
          </span>
        }
      />

      {/* SUB-TAB 1: ELIGIBILITY VERIFICATION SCREEN */}
      {activeSubTab === "eligibility" && (
        <div style={{ marginTop: "20px" }}>
          {/* Summary Status Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Overall Clearance</div>
              <div className="metric-value text-success" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Eligible</span>
                <CheckCircle2 size={22} />
              </div>
              <div className="metric-footer">
                <span>4 of 5 courses unconditionally approved</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Average Attendance</div>
              <div className="metric-value font-mono">82.0%</div>
              <div className="metric-footer">
                <span className="text-success">+7.0% above 75.0% threshold</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Institutional Fee Dues</div>
              <div className="metric-value text-success" style={{ fontSize: "20px" }}>
                ₹0.00 (Cleared)
              </div>
              <div className="metric-footer">
                <span>Accounts clearance slip #AC-2026-9042</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Last Rule Engine Audit</div>
              <div className="metric-value font-mono" style={{ fontSize: "15px", marginTop: "12px" }}>
                Oct 15, 2026 18:30 IST
              </div>
              <div className="metric-footer">
                <span>Calculated via Nexora Policy Engine v2.1</span>
              </div>
            </div>
          </div>

          {/* Detailed Course-by-Course Eligibility Explanations */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Subject-Wise Explainable Eligibility Assessment</h2>
                <p className="card-subtitle">
                  Detailed statutory criteria breakdown with recorded audit reasons per academic regulations
                </p>
              </div>
            </div>

            <div className="eligibility-cards-list">
              {eligibilityList.map((item) => (
                <div
                  key={item.code}
                  className={`eligibility-item-card ${item.isEligible ? "border-eligible" : "border-ineligible"}`}
                >
                  <div className="eligibility-header-strip">
                    <div className="eligibility-title-block">
                      <span className="font-mono subject-badge">{item.code}</span>
                      <h3 className="subject-name-heading">{item.name}</h3>
                      <span className="credit-tag">{item.credits} Credits</span>
                    </div>

                    <div className="eligibility-verdict-tag">
                      {item.isEligible ? (
                        <span className="badge badge-success" style={{ padding: "6px 12px", fontSize: "13px" }}>
                          <CheckCircle2 size={14} /> ELIGIBLE
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ padding: "6px 12px", fontSize: "13px" }}>
                          <XCircle size={14} /> CONDITIONAL / INELIGIBLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Criteria Grid */}
                  <div className="eligibility-criteria-grid">
                    <div className="criteria-box">
                      <span className="criteria-label">Attendance Record</span>
                      <div className="criteria-value-group">
                        <span className={`attendance-number ${item.attendancePercent >= item.attendanceRequired ? "text-success" : "text-danger"}`}>
                          {item.attendancePercent}%
                        </span>
                        <span className="threshold-label">/ {item.attendanceRequired}% req.</span>
                      </div>
                      <div className="attendance-bar-bg">
                        <div
                          className={`attendance-bar-fill ${item.attendancePercent >= item.attendanceRequired ? "fill-success" : "fill-danger"}`}
                          style={{ width: `${Math.min(item.attendancePercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="criteria-box">
                      <span className="criteria-label">Tuition & Exam Fees</span>
                      <div className="criteria-status-badge text-success">
                        <CheckCircle2 size={15} />
                        <span>Cleared in Full</span>
                      </div>
                      <span className="criteria-subtext">No accounts hold registered</span>
                    </div>

                    <div className="criteria-box">
                      <span className="criteria-label">Prerequisites Verified</span>
                      <div className="criteria-status-badge">
                        {item.prerequisiteCleared ? (
                          <span className="text-success" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={15} /> Cleared
                          </span>
                        ) : (
                          <span className="text-danger" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <AlertCircle size={15} /> Grade Pending
                          </span>
                        )}
                      </div>
                      <span className="criteria-subtext">{item.prerequisiteName}</span>
                    </div>
                  </div>

                  {/* Explainable Verdict Box */}
                  <div className={`verdict-explanation-box ${item.isEligible ? "explanation-ok" : "explanation-warn"}`}>
                    <div className="explanation-title">
                      <Info size={14} />
                      <span><strong>Official System Determination:</strong></span>
                    </div>
                    <p className="explanation-text">{item.verdictReason}</p>
                    <div className="explanation-timestamp">
                      Timestamp: {item.calculatedAt} (Engine: RuleSet-UG2026-R4)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setActiveSubTab("register")}
                className="btn btn-primary"
              >
                <span>Proceed to Course Registration</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REGISTRATION FORM SCREEN */}
      {activeSubTab === "register" && (
        <div style={{ marginTop: "20px" }}>
          {/* Validation Errors Alert */}
          {formErrors.length > 0 && (
            <div className="alert-banner alert-danger" style={{ marginBottom: "16px" }}>
              <div className="alert-icon-container">
                <AlertCircle size={20} className="text-danger" />
              </div>
              <div className="alert-content">
                <div className="alert-title">Submission Blocked — Validation Errors</div>
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {isSubmitted && (
            <div className="alert-banner alert-success" style={{ marginBottom: "16px" }}>
              <div className="alert-icon-container">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <div className="alert-content">
                <div className="alert-title">Course Registration Confirmed!</div>
                <div>
                  Your examination registration has been confirmed under confirmation token{" "}
                  <strong className="font-mono">{registrationToken}</strong>. All core and chosen elective papers are locked for hall allocation.
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(true)}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={14} />
                <span>View Receipt</span>
              </button>
            </div>
          )}

          <form onSubmit={handleRegistrationSubmit}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Autumn End-Semester Course Enrollment</h2>
                  <p className="card-subtitle">
                    Select your elective papers and confirm compulsory core offerings
                  </p>
                </div>
              </div>

              {/* Section 1: Compulsory Core Papers */}
              <div className="form-section-block">
                <h3 className="section-block-title">
                  <span>1. Compulsory Core Subjects</span>
                  <span className="badge badge-neutral">Pre-selected (Mandatory)</span>
                </h3>
                <p className="section-block-desc">
                  These papers are universally mandatory for all VII Semester B.Tech Computer Science candidates.
                </p>

                <div className="course-selection-list">
                  <div className="course-selection-card locked">
                    <input type="checkbox" checked disabled className="form-checkbox" />
                    <div className="course-card-body">
                      <div className="course-card-header">
                        <span className="font-mono course-code">CS701</span>
                        <span className="course-title">Distributed Systems & Cloud Computing</span>
                        <span className="course-credits">4 Credits</span>
                      </div>
                      <div className="course-desc-muted">
                        Exam Slot: Nov 10, 2026 (09:30 - 12:30 IST) • Eligibility: Cleared (86.5% attendance)
                      </div>
                    </div>
                  </div>

                  <div className="course-selection-card locked">
                    <input type="checkbox" checked disabled className="form-checkbox" />
                    <div className="course-card-body">
                      <div className="course-card-header">
                        <span className="font-mono course-code">CS704</span>
                        <span className="course-title">Cryptography & Network Security</span>
                        <span className="course-credits">4 Credits</span>
                      </div>
                      <div className="course-desc-muted">
                        Exam Slot: Nov 12, 2026 (09:30 - 12:30 IST) • Eligibility: Cleared (82.0% attendance)
                      </div>
                    </div>
                  </div>

                  <div className="course-selection-card locked">
                    <input type="checkbox" checked disabled className="form-checkbox" />
                    <div className="course-card-body">
                      <div className="course-card-header">
                        <span className="font-mono course-code">CS712</span>
                        <span className="course-title">Software Reliability & Fault Tolerance</span>
                        <span className="course-credits">3 Credits</span>
                      </div>
                      <div className="course-desc-muted">
                        Exam Slot: Nov 19, 2026 (09:30 - 12:30 IST) • Eligibility: Cleared (91.2% attendance)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Departmental Elective Selection */}
              <div className="form-section-block" style={{ marginTop: "24px" }}>
                <h3 className="section-block-title">
                  <span>2. Departmental Elective II <span className="text-danger">*</span></span>
                  <span className="badge badge-warning">Select Exactly 1 Option</span>
                </h3>
                <p className="section-block-desc">
                  Choose one specialization elective subject. Both papers are scheduled in parallel slots; conflict-free allocation is guaranteed.
                </p>

                <div className="elective-radios-grid">
                  <label
                    className={`elective-card-option ${selectedElective === "CS709" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="elective"
                      value="CS709"
                      checked={selectedElective === "CS709"}
                      onChange={() => setSelectedElective("CS709")}
                      className="sr-only"
                    />
                    <div className="elective-radio-indicator" />
                    <div className="elective-info">
                      <div className="elective-code-title">
                        <span className="font-mono font-bold">CS709</span>
                        <strong>High Performance Computing & GPU Architecture</strong>
                      </div>
                      <div className="elective-meta">
                        <span>3 Credits • Hardware & Systems Track</span>
                        <span>Nov 16, 2026 (14:00 - 17:00 IST)</span>
                      </div>
                      <div className="text-success" style={{ fontSize: "12px", marginTop: "4px" }}>
                        ✓ Full attendance & prerequisite satisfied
                      </div>
                    </div>
                  </label>

                  <label
                    className={`elective-card-option ${selectedElective === "CS715" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="elective"
                      value="CS715"
                      checked={selectedElective === "CS715"}
                      onChange={() => setSelectedElective("CS715")}
                      className="sr-only"
                    />
                    <div className="elective-radio-indicator" />
                    <div className="elective-info">
                      <div className="elective-code-title">
                        <span className="font-mono font-bold">CS715</span>
                        <strong>Quantum Information & Quantum Algorithms</strong>
                      </div>
                      <div className="elective-meta">
                        <span>3 Credits • Theoretical Computing Track</span>
                        <span>Nov 16, 2026 (14:00 - 17:00 IST)</span>
                      </div>
                      <div className="text-success" style={{ fontSize: "12px", marginTop: "4px" }}>
                        ✓ Full attendance & prerequisite satisfied
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 3: Backlog / Arrear Examination Option */}
              <div className="form-section-block" style={{ marginTop: "24px" }}>
                <h3 className="section-block-title">
                  <span>3. Backlog / Grade Improvement (Optional)</span>
                </h3>
                <div className="backlog-box">
                  <label className="checkbox-label-row">
                    <input
                      type="checkbox"
                      checked={backlogSelected}
                      onChange={(e) => setBacklogSelected(e.target.checked)}
                      className="form-checkbox"
                    />
                    <div>
                      <strong>Register for Previous Semester Arrear / Improvement Examination</strong>
                      <p className="form-hint" style={{ marginTop: "2px" }}>
                        Check this box only if you have an un-cleared arrears course from Semesters I-VI.
                      </p>
                    </div>
                  </label>
                  {backlogSelected && (
                    <div className="backlog-dropdown-area">
                      <label className="form-label">Select Backlog Subject</label>
                      <select className="form-select" defaultValue="CS503">
                        <option value="CS503">CS503 — Database Management Systems (Semester V Arrear)</option>
                        <option value="MA401">MA401 — Probability & Statistics (Semester IV Arrear)</option>
                      </select>
                      <div className="form-hint" style={{ marginTop: "4px" }}>
                        Note: An additional examination fee of ₹500 per arrear paper will apply.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Declaration & Undertaking */}
              <div className="form-section-block" style={{ marginTop: "24px" }}>
                <h3 className="section-block-title">
                  <span>4. Candidate Undertaking & Declaration <span className="text-danger">*</span></span>
                </h3>
                <div className={`declaration-card ${!declaredUndertaking && formErrors.length > 0 ? "border-danger" : ""}`}>
                  <label className="checkbox-label-row">
                    <input
                      type="checkbox"
                      id="checkbox-undertaking"
                      checked={declaredUndertaking}
                      onChange={(e) => setDeclaredUndertaking(e.target.checked)}
                      className="form-checkbox"
                    />
                    <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                      I hereby solemnly affirm that the information submitted above is complete and truthful. I understand that registration is subject to continuous attendance compliance (minimum 75%) and institutional code of conduct. I agree to abide by all university examination rules.
                    </div>
                  </label>
                </div>
              </div>

              {/* Submission Controls */}
              <div className="registration-submit-bar">
                <div className="summary-text">
                  Total Registered Papers: <strong>{3 + (selectedElective ? 1 : 0) + (backlogSelected ? 1 : 0)} Subjects</strong>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("eligibility")}
                    className="btn btn-secondary"
                  >
                    Back to Eligibility
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    id="btn-submit-registration"
                  >
                    <span>Submit & Confirm Registration</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Official Registration Slip Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Official Course Registration Confirmation Slip"
        subtitle="Receipt for Autumn End-Semester Examination 2026-27"
        maxWidth="680px"
      >
        <div className="registration-slip-box">
          <div className="slip-header">
            <div>
              <div className="slip-inst-title">NEXORA INSTITUTE OF TECHNOLOGY</div>
              <div className="slip-cell-title">OFFICE OF ACADEMIC REGISTRATION</div>
            </div>
            <div className="slip-token-badge">
              <span className="token-label">CONFIRMATION TOKEN:</span>
              <span className="token-val font-mono">{registrationToken}</span>
            </div>
          </div>

          <div className="slip-details-grid">
            <div>
              <span className="slip-field-label">Student Name:</span>
              <span><strong>Aarav Sharma</strong></span>
            </div>
            <div>
              <span className="slip-field-label">Roll Number:</span>
              <span className="font-mono"><strong>CS2023-042</strong></span>
            </div>
            <div>
              <span className="slip-field-label">Program:</span>
              <span>B.Tech Computer Science & Engg</span>
            </div>
            <div>
              <span className="slip-field-label">Semester:</span>
              <span>Semester VII (Autumn 2026)</span>
            </div>
          </div>

          <table className="slip-papers-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Credits</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">CS701</td>
                <td>Distributed Systems & Cloud Computing</td>
                <td>4</td>
                <td>Core (Mandatory)</td>
                <td><span className="badge badge-success">REGISTERED</span></td>
              </tr>
              <tr>
                <td className="font-mono">CS704</td>
                <td>Cryptography & Network Security</td>
                <td>4</td>
                <td>Core (Mandatory)</td>
                <td><span className="badge badge-success">REGISTERED</span></td>
              </tr>
              <tr>
                <td className="font-mono">CS712</td>
                <td>Software Reliability & Fault Tolerance</td>
                <td>3</td>
                <td>Core (Mandatory)</td>
                <td><span className="badge badge-success">REGISTERED</span></td>
              </tr>
              <tr>
                <td className="font-mono">{selectedElective}</td>
                <td>
                  {selectedElective === "CS709"
                    ? "High Performance Computing & GPU Architecture"
                    : "Quantum Information & Quantum Algorithms"}
                </td>
                <td>3</td>
                <td>Elective II</td>
                <td><span className="badge badge-success">REGISTERED</span></td>
              </tr>
              {backlogSelected && (
                <tr>
                  <td className="font-mono">CS503</td>
                  <td>Database Management Systems</td>
                  <td>4</td>
                  <td>Arrear / Improvement</td>
                  <td><span className="badge badge-warning">FEE PENDING</span></td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="slip-footer">
            <div className="slip-seal">
              <CheckCircle2 size={16} className="text-success" />
              <span>Electronically signed & verified at Oct 16, 2026 14:35 IST</span>
            </div>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
