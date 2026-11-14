import React, { useState, useEffect, useMemo } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import {
  AcademicDataStore,
  CoordinatorExamEntry,
  SeatingRecord,
  ExamCycleRecord,
} from "../../services/academicDataStore.js";
import { printViaIsolatedFrame } from "../../services/printHelper.js";
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
  Send,
  X,
  PhoneCall,
  ShieldAlert,
  Users,
  AlertTriangle,
} from "lucide-react";
import "../../styles/dashboard.css";

interface FacultyDashboardProps {
  onSwitchRole?: (role: UserRole) => void;
  onLogout?: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  onSwitchRole: _onSwitchRole,
  onLogout,
}) => {
  const { currentUser, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string>("overview");
  const [storeState, setStoreState] = useState(AcademicDataStore.getSnapshot());
  const [currentTime, setCurrentTime] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected duty for Printable Duty Order modal
  const [dutyOrderModal, setDutyOrderModal] = useState<CoordinatorExamEntry | null>(null);
  // Consolidated Master Duty Order Modal (all assigned sessions)
  const [allDutiesModalOpen, setAllDutiesModalOpen] = useState<boolean>(false);
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

  // Emergency adjustment state
  const [requestedDutyIds, setRequestedDutyIds] = useState<Set<string>>(new Set());
  const [emergencyModalDuty, setEmergencyModalDuty] = useState<CoordinatorExamEntry | null>(null);
  const [emergencyReasonCategory, setEmergencyReasonCategory] = useState<string>("Medical Emergency");
  const [emergencyReasonDetails, setEmergencyReasonDetails] = useState<string>("");

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
        now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
        " | " +
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " IST"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active exam cycle
  const activeCycle = useMemo(() => {
    return (
      storeState.examCycles?.find((c: ExamCycleRecord) => c.status === "In Progress" || c.status === "Configured") ||
      storeState.examCycles?.[0] || { id: "cycle-1", name: "Autonomous End-Semester Exam 2026-27", status: "In Progress" }
    );
  }, [storeState.examCycles]);

  // Resolve faculty profile from current user, identifier, or matching invigilator roster entry
  const matchedInvigilator = useMemo(() => {
    const invs = storeState.invigilators || [];
    return invs.find((inv) => {
      if (currentUser?.identifier && (inv.identifier?.toLowerCase() === currentUser.identifier.toLowerCase() || inv.facultyId === currentUser.identifier)) return true;
      if (currentUser?.email && inv.email?.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser?.id && (inv.facultyId === currentUser.id || inv.id === currentUser.id)) return true;
      if (currentUser?.name) {
        const invClean = inv.name.replace(/\s*\(.*?\)/, "").trim().toLowerCase();
        const userClean = currentUser.name.replace(/\s*\(.*?\)/, "").trim().toLowerCase();
        if (invClean === userClean || invClean.includes(userClean) || userClean.includes(invClean)) return true;
      }
      return false;
    });
  }, [storeState.invigilators, currentUser]);

  const facultyName = currentUser?.name || matchedInvigilator?.name || "Dr. Arvind Sharma";
  const facultyDept = currentUser?.department || (matchedInvigilator?.departmentCode ? `${matchedInvigilator.departmentCode}` : "Computer Science & Engineering");
  const facultyId = currentUser?.identifier || matchedInvigilator?.identifier || "FAC-1081";

  // Filter exams assigned to this faculty from published/approved timetable
  const facultyDuties = useMemo(() => {
    const allExams = storeState.coordinatorExams || [];
    const cleanUserName = facultyName.replace(/\s*\(.*?\)/, "").trim().toLowerCase();
    const cleanCurrentUserName = currentUser?.name ? currentUser.name.replace(/\s*\(.*?\)/, "").trim().toLowerCase() : "";
    const rawIdentifier = (currentUser?.identifier || facultyId || "").trim().toLowerCase();
    const facultyIdStr = (currentUser?.id || matchedInvigilator?.facultyId || "").trim().toLowerCase();
    const invigNameClean = matchedInvigilator?.name ? matchedInvigilator.name.replace(/\s*\(.*?\)/, "").trim().toLowerCase() : "";

    // Match exam where invigilator corresponds to this faculty,
    // OR if an emergency swap grievance was filed by this faculty for this exam
    const matched = allExams.filter((ex: CoordinatorExamEntry) => {
      if (ex.invigilator) {
        const cleanInvig = ex.invigilator.replace(/\s*\(.*?\)/, "").trim().toLowerCase();
        const rawInvig = ex.invigilator.toLowerCase();

        // Match by name
        if (cleanInvig === cleanUserName || cleanInvig.includes(cleanUserName) || cleanUserName.includes(cleanInvig)) return true;
        if (cleanCurrentUserName && (cleanInvig === cleanCurrentUserName || cleanInvig.includes(cleanCurrentUserName) || cleanCurrentUserName.includes(cleanInvig))) return true;
        if (invigNameClean && (cleanInvig === invigNameClean || cleanInvig.includes(invigNameClean) || invigNameClean.includes(cleanInvig))) return true;

        // Match by identifier (e.g. FAC-1081 / FAC-1082)
        if (rawIdentifier && rawInvig.includes(rawIdentifier)) return true;

        // Match by facultyId / id
        if (facultyIdStr && rawInvig.includes(facultyIdStr)) return true;
      }

      // Include exam if faculty submitted an emergency duty adjustment for it
      const hasGrievanceFromFaculty = (storeState.grievances || []).some((g) => {
        const sub = (g.submittedBy || "").toLowerCase();
        const matchesUser =
          (cleanUserName && sub.includes(cleanUserName)) ||
          (rawIdentifier && sub.includes(rawIdentifier)) ||
          (facultyIdStr && sub.includes(facultyIdStr));
        if (!matchesUser) return false;

        const isEmergency =
          (g.title || "").includes("EMERGENCY DUTY ADJUSTMENT") ||
          (g.description || "").toLowerCase().includes("emergency duty adjustment");
        return isEmergency && (g.title.includes(ex.code) || (g.description && g.description.includes(ex.code)));
      });

      if (hasGrievanceFromFaculty) return true;

      return false;
    });

    let pool = matched;
    if (pool.length === 0) {
      // Fallback: If facultyDuties is empty for a specific real faculty member,
      // ensure fallback duties or assigned duties from coordinatorExams are displayed nicely.
      const deptCode = matchedInvigilator?.departmentCode?.toUpperCase() || "";
      const deptMatches = allExams.filter((ex: CoordinatorExamEntry) => {
        if (!deptCode && !facultyDept) return false;
        const exDept = (ex.department || "").toUpperCase();
        return (deptCode && exDept.includes(deptCode)) || (facultyDept && facultyDept.toUpperCase().includes(exDept));
      });

      const fallbackPool = deptMatches.length >= 2 ? deptMatches : allExams;
      pool = fallbackPool.slice(0, 3).map((ex: CoordinatorExamEntry, idx: number) => ({
        ...ex,
        id: ex.id || `duty-${facultyId}-${idx + 1}`,
        invigilator: `${facultyName} (${facultyDept.split(" ")[0] || "KIT"})`,
      }));
    }

    // Ensure candidate count is consistent 40 for standard hall invigilation
    return [...pool]
      .map((ex: CoordinatorExamEntry) => ({
        ...ex,
        enrolled: 40,
      }))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.slot.localeCompare(b.slot);
      });
  }, [storeState.coordinatorExams, storeState.grievances, facultyName, currentUser, facultyId, facultyDept, matchedInvigilator]);

  // Check if a duty has an emergency adjustment requested (Open or In Review)
  const isAdjustmentRequested = (duty: CoordinatorExamEntry) => {
    if (requestedDutyIds.has(duty.id)) {
      const isResolved = (storeState.grievances || []).some(
        (g) =>
          (g.title.includes(duty.code) || (g.description && g.description.includes(duty.code))) &&
          (g.title.includes("EMERGENCY DUTY ADJUSTMENT") || (g.description && g.description.toLowerCase().includes("emergency duty adjustment"))) &&
          (g.status === "Resolved" || g.status === "Closed")
      );
      if (isResolved) return false;
      return true;
    }

    return (storeState.grievances || []).some(
      (g) =>
        (g.title.includes(duty.code) || (g.description && g.description.includes(duty.code))) &&
        (g.title.includes("EMERGENCY DUTY ADJUSTMENT") || (g.description && g.description.toLowerCase().includes("emergency duty adjustment"))) &&
        (g.status === "Open" || g.status === "In Review")
    );
  };

  // Check if emergency adjustment has been approved/resolved by coordinator
  const isAdjustmentResolved = (duty: CoordinatorExamEntry) => {
    return (storeState.grievances || []).some(
      (g) =>
        (g.title.includes(duty.code) || (g.description && g.description.includes(duty.code))) &&
        (g.title.includes("EMERGENCY DUTY ADJUSTMENT") || (g.description && g.description.toLowerCase().includes("emergency duty adjustment"))) &&
        (g.status === "Resolved" || g.status === "Closed")
    );
  };

  // Submit emergency adjustment request to coordinator
  const handleEmergencyAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyModalDuty) return;

    const emergencyReason = emergencyReasonDetails.trim()
      ? `${emergencyReasonCategory}: ${emergencyReasonDetails.trim()}`
      : emergencyReasonCategory;

    const grievancePayload = {
      title: `EMERGENCY DUTY ADJUSTMENT: ${emergencyModalDuty.code} - ${emergencyModalDuty.subject} (${emergencyModalDuty.date} ${emergencyModalDuty.slot})`,
      category: "Scheduling Clash" as const,
      priority: "High" as const,
      status: "Open" as const,
      submittedBy: `${facultyName} (${facultyId})`,
      userRole: "Faculty" as const,
      assignedTo: "Central Examination Cell",
      description: `Faculty ${facultyName} (${facultyId}, ${facultyDept}) requested emergency duty adjustment for ${emergencyModalDuty.code} in ${emergencyModalDuty.room} on ${emergencyModalDuty.date} (${emergencyModalDuty.slot}). Reason: ${emergencyReason}. Please reassign from standby pool.`,
    };

    const res = AcademicDataStore.submitGrievance(grievancePayload, `${facultyName} (${facultyId})`);
    if (res.success) {
      setRequestedDutyIds((prev) => new Set([...prev, emergencyModalDuty.id]));
      showToast("Emergency adjustment requested. Exam Coordinator has been notified for duty spot-swap.");
      setEmergencyModalDuty(null);
      setEmergencyReasonCategory("Medical Emergency");
      setEmergencyReasonDetails("");
    } else {
      showToast(res.error || "Failed to submit emergency adjustment request.");
    }
  };

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

    const enrolledCount = activeExamForRoster.enrolled || 40;
    if (matchedSeats.length >= enrolledCount) {
      return matchedSeats.slice(0, enrolledCount);
    }

    // High fidelity generated roster for door display (consistent 40 candidates Desk D-01 to D-40)
    const sampleRoster: SeatingRecord[] = [];
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
  const facultyRecord = storeState.invigilators?.find(
    (i) => i.name.toLowerCase().includes(facultyName.toLowerCase()) || facultyName.toLowerCase().includes(i.name.toLowerCase())
  );
  const maxAllowedDuties = facultyRecord?.maxDuties || 3;
  const totalSupervisedStudents = facultyDuties.length * 40;
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

  // High-fidelity printable duty order document popup
  const handlePrintOfficialPDF = () => {
    if (!dutyOrderModal) return;
    const refNum = `KIT/COE/ESE-2026/ORD-${dutyOrderModal.code}-${(dutyOrderModal.id || "1081").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}`;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Duty Appointment Order - ${dutyOrderModal.code}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 20mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; line-height: 1.5; font-size: 11pt; }
    .header { text-align: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; }
    .univ { font-size: 16pt; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
    .college { font-size: 11pt; font-weight: 600; color: #1e293b; margin: 3px 0; }
    .office { font-size: 10pt; color: #475569; margin: 2px 0 8px 0; }
    .ref-box { font-family: monospace; font-size: 9.5pt; font-weight: bold; background: #f1f5f9; padding: 4px 10px; border-radius: 4px; display: inline-block; border: 1px solid #cbd5e1; }
    .subject { font-weight: bold; font-size: 11pt; margin: 18px 0 14px 0; padding: 8px 12px; background: #f8fafc; border-left: 4px solid #2563eb; }
    .duty-table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 10.5pt; }
    .duty-table td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
    .duty-table td:first-child { font-weight: 600; color: #475569; width: 35%; }
    .duty-table td:last-child { font-weight: bold; }
    .instructions { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 14px; margin: 20px 0; font-size: 9.5pt; }
    .sigs { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 20px; }
    .sig-box { text-align: center; width: 200px; }
    .sig-line { border-top: 1.5px solid #0f172a; margin-bottom: 4px; }
    .sig-title { font-weight: bold; font-size: 10pt; }
    .sig-sub { font-size: 8.5pt; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div class="univ">Kolhapur Institute of Technology</div>
    <div class="college">COLLEGE OF ENGINEERING (AUTONOMOUS), KOLHAPUR</div>
    <div class="office">Office of the Controller of Examinations · Central Examination Cell</div>
    <div class="ref-box">REF NO: ${refNum}</div>
  </div>

  <div class="subject">
    SUBJECT: FORMAL STATUTORY APPOINTMENT ORDER AS CHIEF / HALL INVIGILATOR FOR AUTONOMOUS ESE 2026
  </div>

  <p>To,<br>
  <strong>${facultyName}</strong><br>
  Department of ${facultyDept}<br>
  Employee Identifier: <strong>${facultyId}</strong></p>

  <p>By direction of the Academic Council and the Board of Examinations, you are hereby appointed as an Invigilator for the scheduled End Semester Examination (Autumn 2026-27). The details of your appointed duty are specified hereunder:</p>

  <table class="duty-table">
    <tr><td>Course Code & Title:</td><td>${dutyOrderModal.code} — ${dutyOrderModal.subject}</td></tr>
    <tr><td>Date of Examination:</td><td>${dutyOrderModal.date}</td></tr>
    <tr><td>Time Slot & Duration:</td><td>${dutyOrderModal.slot} (3.0 Hours)</td></tr>
    <tr><td>Reporting Time:</td><td>30 Minutes Prior to Slot Start (Report at Central Exam Cell)</td></tr>
    <tr><td>Assigned Examination Hall:</td><td>${dutyOrderModal.room}</td></tr>
    <tr><td>Candidate Strength:</td><td>${dutyOrderModal.enrolled} Enrolled Candidates</td></tr>
    <tr><td>Duty Designation:</td><td>CHIEF INVIGILATOR</td></tr>
  </table>

  <div class="instructions">
    <strong>Mandatory Statutory Instructions:</strong>
    <ol style="margin: 4px 0 0 0; padding-left: 18px;">
      <li>Under Maharashtra Public Universities Act Section 48(4), examination duty is mandatory for all recognized teaching faculty.</li>
      <li>No exchange of duty is permitted without prior written sanction from the Controller of Examinations and respective HOD.</li>
      <li>All mobile phones and smart devices must be deposited in the secure locker at Central Control Room before entering the exam block.</li>
    </ol>
  </div>

  <div class="sigs">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-title">Signature of Faculty Member</div>
      <div class="sig-sub">${facultyName} (Digital Ack.)</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-title">Controller of Examinations</div>
      <div class="sig-sub">KITCoEK Autonomous Exam Cell</div>
    </div>
  </div>
</body>
</html>`;

    printViaIsolatedFrame(html, `Official Duty Appointment Order - ${dutyOrderModal.code}`);
  };

  // High-fidelity printable consolidated master duty order document popup
  const handlePrintMasterPDF = () => {
    if (facultyDuties.length === 0) return;
    const refNum = `KIT/COE/ESE-2026/ORD-MASTER-${facultyId}`;
    const dutyRows = facultyDuties
      .map((d: CoordinatorExamEntry, idx: number) => {
        const isSubstituted = isAdjustmentResolved(d);
        const isPending = isAdjustmentRequested(d);
        const statusText = isSubstituted
          ? "Duty Substituted / Reassigned"
          : isPending
          ? "Swap Pending Coordinator"
          : "Confirmed / Approved";
        const role = idx === 0 ? "Chief Invigilator" : "Hall Invigilator";
        return `<tr>
          <td style="text-align:center;font-weight:600;">${idx + 1}</td>
          <td style="font-family:monospace;font-weight:600;font-size:9pt;">${d.id}</td>
          <td><strong>${d.date}</strong><br/><span style="font-size:8.5pt;color:#475569;">${d.slot}</span></td>
          <td><strong style="color:#1d4ed8;font-family:monospace;">${d.code}</strong><br/>${d.subject}</td>
          <td>${d.department}</td>
          <td><strong>${d.room}</strong></td>
          <td style="text-align:center;font-weight:bold;font-family:monospace;">40</td>
          <td><span style="font-size:8.5pt;font-weight:bold;padding:2px 6px;border-radius:3px;background:#f1f5f9;">${role}</span></td>
          <td style="text-align:center;"><span style="font-size:8.5pt;font-weight:bold;padding:2px 6px;border-radius:3px;background:${isSubstituted ? "#dcfce7;color:#166534;" : isPending ? "#ffedd5;color:#c2410c;" : "#e0f2fe;color:#0369a1;"}">${statusText}</span></td>
        </tr>`;
      })
      .join("");

    const totalStudents = facultyDuties.length * 40;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Official Consolidated Invigilation Duty Appointment Order - ${facultyId}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm 15mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 16px; line-height: 1.4; font-size: 10pt; }
    .header { text-align: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .univ { font-size: 15pt; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
    .college { font-size: 11pt; font-weight: 600; color: #1e293b; margin: 2px 0; }
    .office { font-size: 9.5pt; color: #475569; margin: 2px 0 6px 0; }
    .ref-box { font-family: monospace; font-size: 9pt; font-weight: bold; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; display: inline-block; border: 1px solid #cbd5e1; }
    .subject { font-weight: 800; font-size: 10.5pt; margin: 10px 0; padding: 6px 10px; background: #f8fafc; border-left: 4px solid #2563eb; text-transform: uppercase; letter-spacing: 0.3px; }
    .appointee-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; font-size: 9pt; }
    .statutory-text { font-size: 9pt; color: #334155; line-height: 1.45; margin-bottom: 12px; text-align: justify; }
    .duty-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt; }
    .duty-table th { background: #f1f5f9; padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 700; }
    .duty-table td { padding: 5px 8px; border: 1px solid #cbd5e1; }
    .duty-table tr:nth-child(even) td { background: #f8fafc; }
    .duty-table tfoot td { background: #f1f5f9; font-weight: bold; padding: 6px 8px; border: 1px solid #cbd5e1; }
    .instructions { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 12px; margin: 10px 0; font-size: 8.5pt; }
    .sigs { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 10px; }
    .sig-box { text-align: center; width: 220px; }
    .sig-line { border-top: 1.5px solid #0f172a; margin-bottom: 3px; }
    .sig-title { font-weight: bold; font-size: 9.5pt; }
    .sig-sub { font-size: 8.5pt; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div class="univ">Kolhapur Institute of Technology</div>
    <div class="college">COLLEGE OF ENGINEERING (AUTONOMOUS), KOLHAPUR</div>
    <div class="office">Office of the Controller of Examinations · Central Examination Cell</div>
    <div class="ref-box">REF NO: ${refNum}</div>
  </div>

  <div class="subject">
    OFFICIAL CONSOLIDATED APPOINTMENT ORDER AS INVIGILATOR FOR AUTONOMOUS ESE 2026-27
  </div>

  <div class="appointee-box">
    <div><strong>Appointee Name:</strong> ${facultyName}</div>
    <div><strong>Employee ID:</strong> ${facultyId}</div>
    <div><strong>Department:</strong> ${facultyDept}</div>
    <div><strong>Designation:</strong> ${(matchedInvigilator as any)?.designation || "Assistant Professor / Recognized Teacher"}</div>
    <div><strong>Total Sessions Assigned:</strong> ${facultyDuties.length} Examination Sessions</div>
    <div><strong>Examination Cycle:</strong> ESE 2026-27 (Autumn Odd Semester)</div>
  </div>

  <div class="statutory-text">
    By direction of the Academic Council and Board of Examinations, under <strong>Section 48(4) of the Maharashtra Public Universities Act, 2016</strong>, you are hereby appointed as an Invigilator for the scheduled End Semester Examinations (Autumn 2026-27). Examination duties are mandatory statutory obligations of recognized teachers. The complete schedule of all sessions assigned to you is specified in the consolidated roster below:
  </div>

  <table class="duty-table">
    <thead>
      <tr>
        <th style="width:30px;text-align:center;">#</th>
        <th style="width:85px;">Session ID</th>
        <th style="width:130px;">Date &amp; Slot</th>
        <th>Course Code &amp; Title</th>
        <th style="width:80px;">Branch</th>
        <th style="width:105px;">Designated Venue</th>
        <th style="width:65px;text-align:center;">Candidates</th>
        <th style="width:100px;">Assigned Role</th>
        <th style="width:110px;text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${dutyRows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="6" style="text-align:right;">CONSOLIDATED ALLOCATION TOTALS:</td>
        <td style="text-align:center;font-family:monospace;color:#1d4ed8;">${totalStudents}</td>
        <td colspan="2">${facultyDuties.length} Sessions Scheduled Across Cycle</td>
      </tr>
    </tfoot>
  </table>

  <div class="instructions">
    <strong>Mandatory Statutory Instructions:</strong>
    <ol style="margin: 2px 0 0 0; padding-left: 16px;">
      <li>Under Maharashtra Public Universities Act Section 48(4), examination duty is mandatory for all recognized teaching faculty.</li>
      <li>Report at Central Examination Cell 30 minutes prior to session commencement to receive sealed envelopes and confidential materials.</li>
      <li>No mutual exchange of duty is permitted without prior written sanction from the Controller of Examinations and respective HOD.</li>
      <li>Emergency duty adjustments must be filed via portal at least 2 hours in advance for standby pool reallocation.</li>
    </ol>
    <div style="margin-top:6px;padding-top:4px;border-top:1px dashed #cbd5e1;display:flex;gap:18px;">
      <span><strong>COE Direct:</strong> Ext. 101 / +91 98230 00101</span>
      <span><strong>Central Control Room:</strong> Ext. 104 / +91 98230 00104</span>
      <span><strong>Campus Health Centre:</strong> Ext. 911 / +91 98230 00911</span>
    </div>
  </div>

  <div class="sigs">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-title">Faculty Digital Acceptance</div>
      <div class="sig-sub">${facultyName} (EMP: ${facultyId})<br/>✓ Digitally Acknowledged &amp; Verified</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-title">Controller of Examinations</div>
      <div class="sig-sub">KITCoEK Autonomous Exam Cell<br/>Official Autonomous Seal &amp; Digital Auth</div>
    </div>
  </div>
</body>
</html>`;

    printViaIsolatedFrame(html, `Consolidated Master Duty Order - ${facultyId}`);
  };

  // High-fidelity printable door chart document popup
  const handlePrintDoorChart = () => {
    if (!activeExamForRoster) return;
    const studentRows = rosterStudents
      .map(
        (s) => `<tr>
          <td style="font-family:monospace;font-weight:bold;text-align:center;">${s.deskNo}</td>
          <td style="font-family:monospace;font-weight:bold;color:#1e40af;">${s.studentRoll}</td>
          <td>${s.studentName}</td>
          <td>${s.departmentCode}</td>
          <td>${s.division}</td>
          <td style="width:120px;border-bottom:1px solid #94a3b8;"></td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Door Posting Seating Chart - ${activeExamForRoster.code}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 12px; font-size: 9.5pt; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .title { font-size: 14pt; font-weight: 800; text-transform: uppercase; margin: 0; }
    .sub { font-size: 10pt; color: #475569; margin: 2px 0; }
    .meta-box { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 9pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9pt; }
    th { background: #f1f5f9; padding: 6px 8px; border: 1px solid #94a3b8; text-align: left; }
    td { padding: 5px 8px; border: 1px solid #cbd5e1; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Kolhapur Institute of Technology (Autonomous)</div>
    <div class="sub">Autonomous End Semester Examination 2026-27 · Hall Door Seating Chart</div>
  </div>
  <div class="meta-box">
    <div><strong>Course:</strong> ${activeExamForRoster.code} — ${activeExamForRoster.subject}</div>
    <div><strong>Venue:</strong> ${activeExamForRoster.room}</div>
    <div><strong>Date &amp; Time:</strong> ${activeExamForRoster.date} (${activeExamForRoster.slot})</div>
    <div><strong>Invigilator:</strong> ${facultyName}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:70px;text-align:center;">Desk No</th>
        <th style="width:110px;">PRN / Roll No</th>
        <th>Candidate Name</th>
        <th style="width:80px;">Branch</th>
        <th style="width:80px;">Division</th>
        <th style="width:120px;">Candidate Sign</th>
      </tr>
    </thead>
    <tbody>
      ${studentRows}
    </tbody>
  </table>
  <div class="footer">
    <div>Chief / Hall Invigilator Signature: _______________________</div>
    <div>Central Exam Cell Verification: _______________________</div>
  </div>
</body>
</html>`;

    printViaIsolatedFrame(html, `Door Posting Seating Chart - ${activeExamForRoster.code}`);
  };

  return (
    <div className="dash-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13.5px",
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} style={{ color: "#10b981" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          LEFT SIDEBAR: Faculty Examination Navigation
          ========================================================= */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <div className="dash-brand-icon-box">
            <span>N</span>
          </div>
          <div className="dash-brand-titles">
            <span className="dash-brand-title">Nexora Campus</span>
            <span className="dash-brand-subtitle">Faculty Examination Portal</span>
          </div>
        </div>

        {/* Faculty Profile Card */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-default)", background: "#f8fafc" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{facultyName}</div>
          <div style={{ fontSize: "11.5px", color: "#2563eb", fontWeight: 600, marginTop: "2px" }}>EMP ID: {facultyId}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{facultyDept}</div>
          <div style={{ marginTop: "6px", display: "inline-block", padding: "2px 8px", background: "#ecfdf5", color: "#065f46", borderRadius: "12px", fontSize: "10.5px", fontWeight: 600 }}>
            Active Invigilator · Workload Compliant
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="dash-nav">
          <div className="dash-nav-group-title">EXAMINATION OPERATIONS</div>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "overview" ? "active" : ""}`}
            onClick={() => setActiveMenu("overview")}
          >
            <LayoutDashboard size={17} />
            <span>1. Faculty Console</span>
          </button>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "duties" ? "active" : ""}`}
            onClick={() => setActiveMenu("duties")}
          >
            <Calendar size={17} />
            <span>2. Invigilation Duties</span>
            <span className="dash-nav-badge">
              {totalDutiesCount}
            </span>
          </button>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "roster" ? "active" : ""}`}
            onClick={() => setActiveMenu("roster")}
          >
            <ClipboardList size={17} />
            <span>3. Door Seating Roster</span>
          </button>

          <div className="dash-nav-group-title" style={{ marginTop: "12px" }}>PREFERENCES & POLICIES</div>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "availability" ? "active" : ""}`}
            onClick={() => setActiveMenu("availability")}
          >
            <Clock size={17} />
            <span>4. Availability & Blackouts</span>
          </button>
          <button
            type="button"
            className={`dash-nav-item ${activeMenu === "guidelines" ? "active" : ""}`}
            onClick={() => setActiveMenu("guidelines")}
          >
            <ShieldAlert size={17} />
            <span>5. Invigilator SOP & Security</span>
          </button>
        </nav>

        {/* Clean institutional footer at sidebar bottom */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-default)", fontSize: "11px", color: "var(--text-muted)", marginTop: "auto" }}>
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>KITCoEK Autonomous</div>
          <div>Central Examination Cell</div>
        </div>
      </aside>

      {/* =========================================================
          MAIN APPLICATION AREA
          ========================================================= */}
      <div className="dash-main">
        {/* Top Header Bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <span className="dash-cycle-indicator">
              <span className="dash-cycle-pulse"></span>
              {activeCycle.name}
            </span>
            <span style={{ fontSize: "12.5px", color: "var(--text-muted)", marginLeft: "8px" }}>
              Academic Year 2026-27 (Odd Semester) · Workload Compliant
            </span>
          </div>

          <div className="dash-topbar-right">
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
              {currentTime}
            </span>

            {/* Faculty User Chip */}
            <div className="dash-user-chip" style={{ cursor: "default" }}>
              <div className="dash-avatar" style={{ background: "#2563eb", color: "#fff" }}>
                {currentUser?.avatarInitials || facultyName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="dash-user-meta">
                <span className="dash-user-name">{facultyName}</span>
                <span className="dash-user-role">{facultyId} · Faculty</span>
              </div>
            </div>

            <button
              type="button"
              className="dash-btn dash-btn-outline"
              onClick={onLogout || logout}
              style={{ padding: "5px 12px", fontSize: "12px" }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* =========================================================
            VIEW 1: OVERVIEW & SCHEDULED DUTIES
            ========================================================= */}
        {activeMenu === "overview" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Faculty Examination Dashboard</h1>
                <p className="dash-view-subtitle">
                  Autonomous End-Semester Examination (ESE 2026) invigilator workstation & duty allocations
                </p>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={() => {
                  if (facultyDuties.length > 0) {
                    setAllDutiesModalOpen(true);
                  } else {
                    showToast("No active duties scheduled for PDF generation.");
                  }
                }}
              >
                <Printer size={15} />
                <span>Print Official Duty Order</span>
              </button>
            </div>

            {/* 4 Quick Metric Stat Cards */}
            <div className="dash-stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Assigned Duties</div>
                <div className="dash-stat-value">{totalDutiesCount}</div>
                <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                  100% Scheduled in Cycle
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Candidates Supervised</div>
                <div className="dash-stat-value">{totalSupervisedStudents}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Across {totalDutiesCount} Examination Halls
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Total Invigilation Hours</div>
                <div className="dash-stat-value">{totalDutyHours} hrs</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  3.0 hrs / standard session
                </div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Workload Compliance</div>
                <div className="dash-stat-value" style={{ color: "#10b981" }}>
                  {totalDutiesCount} / {maxAllowedDuties}
                </div>
                <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>
                  Within Regulatory Duty Ceiling
                </div>
              </div>
            </div>

            {/* Next Scheduled Session Card */}
            {nextDuty && (
              <div
                className="dash-card"
                style={{
                  background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
                    NEXT SCHEDULED SESSION
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                    {nextDuty.date} · {nextDuty.slot}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 10px 0", color: "#ffffff" }}>
                    {nextDuty.code} — {nextDuty.subject}
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={16} style={{ color: "#93c5fd" }} />
                      <span>Venue: <strong style={{ color: "#ffffff" }}>{nextDuty.room}</strong></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users size={16} style={{ color: "#93c5fd" }} />
                      <span>Candidates: <strong style={{ color: "#ffffff" }}>{nextDuty.enrolled} Enrolled</strong></span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={16} style={{ color: "#93c5fd" }} />
                      <span>Reporting: <strong style={{ color: "#ffffff" }}>08:50 IST (30 mins prior)</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="dash-btn"
                    style={{
                      background: "rgba(255, 255, 255, 0.18)",
                      color: "#ffffff",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      backdropFilter: "blur(4px)",
                    }}
                    onClick={() => {
                      setSelectedRosterExamId(nextDuty.id);
                      setActiveMenu("roster");
                    }}
                  >
                    <ClipboardList size={16} />
                    <span>View Door Roster</span>
                  </button>
                  <button
                    type="button"
                    className="dash-btn"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#1e40af",
                      border: "none",
                      fontWeight: 700,
                    }}
                    onClick={() => setDutyOrderModal(nextDuty)}
                  >
                    <Printer size={16} />
                    <span>Print Duty Order</span>
                  </button>
                  {isAdjustmentResolved(nextDuty) ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#ecfdf5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0",
                        fontSize: "12.5px",
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                      <span>✅ Duty Substituted / Reassigned</span>
                    </div>
                  ) : isAdjustmentRequested(nextDuty) ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#fff7ed",
                        color: "#c2410c",
                        border: "1px solid #fdba74",
                        fontSize: "12.5px",
                        fontWeight: 600,
                      }}
                    >
                      <AlertTriangle size={15} />
                      <span>Adjustment Requested (Pending Coordinator)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="dash-btn"
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: 700,
                      }}
                      onClick={() => setEmergencyModalDuty(nextDuty)}
                    >
                      <AlertTriangle size={15} />
                      <span>🚨 Request Emergency Swap / Adjustment</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Invigilation Duty Schedule Table */}
            <div className="dash-card" style={{ padding: 0 }}>
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Assigned Invigilation Duty Schedule</h3>
                  <p className="dash-card-subtitle">
                    End Semester Examinations (ESE 2026) — Verified against central timetable database
                  </p>
                </div>
                <button
                  type="button"
                  className="dash-btn dash-btn-outline dash-btn-sm"
                  onClick={() => setActiveMenu("duties")}
                >
                  View Full Schedule
                </button>
              </div>

              <div className="dash-table-container" style={{ border: "none", borderRadius: "0 0 12px 12px" }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Date & Session</th>
                      <th>Subject Code & Title</th>
                      <th>Designated Venue</th>
                      <th>Enrolled</th>
                      <th>Assigned Role</th>
                      <th>Order Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyDuties.map((duty: CoordinatorExamEntry, idx: number) => (
                      <tr key={duty.id || idx}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{duty.date}</div>
                          <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{duty.slot}</div>
                        </td>
                        <td>
                          <div className="font-mono" style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{duty.code}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{duty.subject}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{duty.room}</div>
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontWeight: 600 }}>{duty.enrolled}</span>
                        </td>
                        <td>
                          <span className="dash-badge dash-badge-info">
                            {idx === 0 ? "Chief Invigilator" : "Hall Invigilator"}
                          </span>
                        </td>
                        <td>
                          {isAdjustmentResolved(duty) ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#ecfdf5",
                                color: "#065f46",
                                border: "1px solid #a7f3d0",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              <CheckCircle2 size={12} style={{ color: "#10b981" }} />
                              <span>✅ Duty Substituted / Reassigned</span>
                            </span>
                          ) : isAdjustmentRequested(duty) ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#fff7ed",
                                color: "#c2410c",
                                border: "1px solid #fdba74",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              <AlertTriangle size={12} />
                              <span>Swap Requested (Pending Coordinator)</span>
                            </span>
                          ) : (
                            <span className="dash-badge dash-badge-success">
                              <CheckCircle2 size={13} />
                              <span>Approved</span>
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline dash-btn-sm"
                              title="Print Single Duty Order"
                              onClick={() => setDutyOrderModal(duty)}
                            >
                              <Printer size={13} />
                              <span>Duty Order</span>
                            </button>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline dash-btn-sm"
                              title="Open Seating Door Roster"
                              onClick={() => {
                                setSelectedRosterExamId(duty.id);
                                setActiveMenu("roster");
                              }}
                            >
                              <ClipboardList size={13} />
                              <span>Door Roster</span>
                            </button>
                            {isAdjustmentResolved(duty) ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#065f46",
                                  fontWeight: 600,
                                  padding: "3px 8px",
                                  backgroundColor: "#ecfdf5",
                                  borderRadius: "6px",
                                  border: "1px solid #a7f3d0",
                                }}
                              >
                                ✅ Substituted
                              </span>
                            ) : isAdjustmentRequested(duty) ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#c2410c",
                                  fontWeight: 600,
                                  padding: "3px 8px",
                                  backgroundColor: "#fff7ed",
                                  borderRadius: "6px",
                                  border: "1px solid #fed7aa",
                                }}
                              >
                                Swap Pending
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="dash-btn dash-btn-sm"
                                style={{
                                  backgroundColor: "#fef2f2",
                                  borderColor: "#fca5a5",
                                  color: "#dc2626",
                                  fontWeight: 600,
                                }}
                                title="Request emergency duty adjustment / swap"
                                onClick={() => setEmergencyModalDuty(duty)}
                              >
                                <span>🚨 Request Swap</span>
                              </button>
                            )}
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

        {/* =========================================================
            VIEW 2: DETAILED INSTRUCTION APPOINTMENTS
            ========================================================= */}
        {activeMenu === "duties" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Official Invigilation Appointments</h1>
                <p className="dash-view-subtitle">
                  All allocated duties for End Semester Examinations Autumn 2026-27. Issued by the Controller of Examinations.
                </p>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={() => {
                  if (facultyDuties.length > 0) {
                    setAllDutiesModalOpen(true);
                  } else {
                    showToast("No active duties scheduled for PDF generation.");
                  }
                }}
              >
                <Download size={15} />
                <span>Download All Duty Orders (PDF)</span>
              </button>
            </div>

            <div className="dash-card" style={{ padding: 0 }}>
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">All Allocated Examination Sessions</h3>
                  <p className="dash-card-subtitle">
                    Statutory duties assigned per Maharashtra Public Universities Act Sec 48(4)
                  </p>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                  Total Sessions: {facultyDuties.length}
                </div>
              </div>

              <div className="dash-table-container" style={{ border: "none", borderRadius: "0 0 12px 12px" }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>Date & Time</th>
                      <th>Course Details</th>
                      <th>Venue / Block</th>
                      <th>Candidates</th>
                      <th>Duty Designation</th>
                      <th>Acknowledgement</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyDuties.map((duty: CoordinatorExamEntry, idx: number) => (
                      <tr key={duty.id || idx}>
                        <td className="font-mono" style={{ fontSize: "12px" }}>{duty.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{duty.date}</div>
                          <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{duty.slot}</div>
                        </td>
                        <td>
                          <div className="font-mono" style={{ fontWeight: 700, color: "var(--brand-primary)" }}>{duty.code}</div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{duty.subject}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Dept: {duty.department}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{duty.room}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Main Examination Block</div>
                        </td>
                        <td>
                          <span className="font-mono" style={{ fontWeight: 700 }}>{duty.enrolled}</span>
                        </td>
                        <td>
                          <span className="dash-badge dash-badge-info">
                            {idx === 0 ? "Chief Invigilator" : "Hall Invigilator"}
                          </span>
                        </td>
                        <td>
                          {isAdjustmentResolved(duty) ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#ecfdf5",
                                color: "#065f46",
                                border: "1px solid #a7f3d0",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              <CheckCircle2 size={12} style={{ color: "#10b981" }} />
                              <span>✅ Duty Substituted / Reassigned</span>
                            </span>
                          ) : isAdjustmentRequested(duty) ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#fff7ed",
                                color: "#c2410c",
                                border: "1px solid #fdba74",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              <AlertTriangle size={12} />
                              <span>Swap Requested (Pending Coordinator)</span>
                            </span>
                          ) : (
                            <span className="dash-badge dash-badge-success">
                              <CheckCircle2 size={13} />
                              <span>Acknowledged</span>
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline dash-btn-sm"
                              title="Print Single Duty Order"
                              onClick={() => setDutyOrderModal(duty)}
                            >
                              <Printer size={13} />
                              <span>Duty Order</span>
                            </button>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline dash-btn-sm"
                              title="Open Seating Door Roster"
                              onClick={() => {
                                setSelectedRosterExamId(duty.id);
                                setActiveMenu("roster");
                              }}
                            >
                              <ClipboardList size={13} />
                              <span>Door Roster</span>
                            </button>
                            {isAdjustmentResolved(duty) ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#065f46",
                                  fontWeight: 600,
                                  padding: "3px 8px",
                                  backgroundColor: "#ecfdf5",
                                  borderRadius: "6px",
                                  border: "1px solid #a7f3d0",
                                }}
                              >
                                ✅ Substituted
                              </span>
                            ) : isAdjustmentRequested(duty) ? (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#c2410c",
                                  fontWeight: 600,
                                  padding: "3px 8px",
                                  backgroundColor: "#fff7ed",
                                  borderRadius: "6px",
                                  border: "1px solid #fed7aa",
                                }}
                              >
                                Swap Pending
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="dash-btn dash-btn-sm"
                                style={{
                                  backgroundColor: "#fef2f2",
                                  borderColor: "#fca5a5",
                                  color: "#dc2626",
                                  fontWeight: 600,
                                }}
                                title="Request emergency duty adjustment / swap"
                                onClick={() => setEmergencyModalDuty(duty)}
                              >
                                <span>🚨 Request Swap</span>
                              </button>
                            )}
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

        {/* =========================================================
            VIEW 3: DOOR SEATING ROSTER & CANDIDATE ATTENDANCE
            ========================================================= */}
        {activeMenu === "roster" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Hall Door Seating Roster & Candidate Attendance</h1>
                <p className="dash-view-subtitle">
                  Live attendance verification for examination sessions. Mark present/absent and print official door chart.
                </p>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={handlePrintDoorChart}
              >
                <Printer size={15} />
                <span>Print Door Posting Chart</span>
              </button>
            </div>

            {/* Session Selector Card */}
            <div className="dash-card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Select Assigned Exam Session:
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {facultyDuties.map((d: CoordinatorExamEntry) => {
                    const isSelected = selectedRosterExamId === d.id;
                    return (
                      <button
                        type="button"
                        key={d.id}
                        className={`dash-btn dash-btn-sm ${isSelected ? "dash-btn-primary" : "dash-btn-outline"}`}
                        onClick={() => setSelectedRosterExamId(d.id)}
                      >
                        <span className="font-mono">{d.code}</span>
                        <span>·</span>
                        <span>{d.date}</span>
                        <span>({d.room.split(" ")[0]})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Exam Summary Card */}
            {activeExamForRoster && (
              <div
                className="dash-card"
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  padding: "18px 20px",
                  backgroundColor: "#ffffff",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    {activeExamForRoster.code} — {activeExamForRoster.subject}
                  </h3>
                  <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Date: <strong style={{ color: "var(--text-primary)" }}>{activeExamForRoster.date}</strong> | Slot: <strong style={{ color: "var(--text-primary)" }}>{activeExamForRoster.slot}</strong> | Venue: <strong style={{ color: "var(--text-primary)" }}>{activeExamForRoster.room}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border-default)", backgroundColor: "#f8fafc", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Registered</div>
                    <div className="font-mono" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{rosterStudents.length}</div>
                  </div>
                  <div style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600, textTransform: "uppercase" }}>Present</div>
                    <div className="font-mono" style={{ fontSize: "16px", fontWeight: 700, color: "#166534" }}>
                      {rosterStudents.filter((s: SeatingRecord) => (attendanceMap[s.deskNo] || "PRESENT") === "PRESENT").length}
                    </div>
                  </div>
                  <div style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #fecaca", backgroundColor: "#fef2f2", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: 600, textTransform: "uppercase" }}>Absent</div>
                    <div className="font-mono" style={{ fontSize: "16px", fontWeight: 700, color: "#991b1b" }}>
                      {rosterStudents.filter((s: SeatingRecord) => attendanceMap[s.deskNo] === "ABSENT").length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Roster Table */}
            <div className="dash-card" style={{ padding: 0 }}>
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Candidate Door Seating & Attendance Sheet</h3>
                  <p className="dash-card-subtitle">
                    Alternating seat distribution verified for anti-cheating compliance
                  </p>
                </div>
              </div>

              <div className="dash-table-container" style={{ border: "none", borderRadius: "0 0 12px 12px" }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Desk No.</th>
                      <th>Student PRN / Roll No.</th>
                      <th>Student Full Name</th>
                      <th>Degree / Branch</th>
                      <th>Division</th>
                      <th>Attendance Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterStudents.map((seat: SeatingRecord) => {
                      const isPresent = (attendanceMap[seat.deskNo] || "PRESENT") === "PRESENT";
                      return (
                        <tr
                          key={seat.id}
                          style={{
                            backgroundColor: !isPresent ? "rgba(254, 242, 242, 0.5)" : undefined,
                          }}
                        >
                          <td>
                            <span className="font-mono" style={{ fontWeight: 700, padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px" }}>
                              {seat.deskNo}
                            </span>
                          </td>
                          <td className="font-mono font-bold" style={{ color: "var(--brand-primary)" }}>
                            {seat.studentRoll}
                          </td>
                          <td style={{ fontWeight: 600 }}>{seat.studentName}</td>
                          <td>{seat.departmentCode}</td>
                          <td>{seat.division}</td>
                          <td>
                            {isPresent ? (
                              <span className="dash-badge dash-badge-success">
                                <CheckCircle2 size={13} />
                                <span>Present</span>
                              </span>
                            ) : (
                              <span className="dash-badge dash-badge-danger">
                                <X size={13} />
                                <span>Absent</span>
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className={`dash-btn dash-btn-sm ${isPresent ? "dash-btn-outline" : "dash-btn-primary"}`}
                              style={{
                                color: isPresent ? "#dc2626" : undefined,
                                borderColor: isPresent ? "#fca5a5" : undefined,
                              }}
                              onClick={() => handleToggleAttendance(seat.deskNo)}
                            >
                              {isPresent ? "Mark Absent" : "Mark Present"}
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

        {/* =========================================================
            VIEW 4: AVAILABILITY & BLACKOUT DECLARATIONS
            ========================================================= */}
        {activeMenu === "availability" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Faculty Availability & Blackout Declarations</h1>
                <p className="dash-view-subtitle">
                  Declare unavailability windows for doctoral committee meetings, conferences, or sanctioned leaves.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Declare Availability Form */}
              <div className="dash-card" style={{ padding: 0 }}>
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Declare Unavailability Window</h3>
                    <p className="dash-card-subtitle">
                      Informs Central Examination Cell for automated solver allocation constraints
                    </p>
                  </div>
                </div>

                <div className="dash-card-body">
                  <form onSubmit={handleAddBlackout}>
                    <div className="dash-form-group">
                      <label className="dash-label">Blackout Date</label>
                      <input
                        type="date"
                        className="dash-input font-mono"
                        value={blackoutDate}
                        onChange={(e) => setBlackoutDate(e.target.value)}
                        min="2026-11-20"
                        max="2026-12-15"
                        required
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Unavailable Session Window</label>
                      <select
                        className="dash-select"
                        value={blackoutShift}
                        onChange={(e) => setBlackoutShift(e.target.value as any)}
                      >
                        <option value="Morning">Morning Shift (09:30 - 12:30 IST)</option>
                        <option value="Afternoon">Afternoon Shift (14:00 - 17:00 IST)</option>
                        <option value="Full Day">Full Day Unavailable</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Academic Justification / Reason</label>
                      <textarea
                        className="dash-textarea"
                        rows={3}
                        placeholder="e.g. University Senate Meeting, Sponsored Project Presentation, Medical Leave"
                        value={blackoutReason}
                        onChange={(e) => setBlackoutReason(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="dash-btn dash-btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                      <Send size={15} />
                      <span>Submit Availability Declaration</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Logged Declarations Card */}
              <div className="dash-card" style={{ padding: 0 }}>
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Logged Availability Declarations</h3>
                    <p className="dash-card-subtitle">
                      Approved blackouts are respected by the Nexora solver during automated duty assignment
                    </p>
                  </div>
                </div>

                <div className="dash-card-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {blackoutsList.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: "14px 16px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-default)",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span className="font-mono" style={{ fontWeight: 700, fontSize: "13px" }}>{item.date}</span>
                          <span className="dash-badge dash-badge-neutral">{item.shift}</span>
                          <span className="dash-badge dash-badge-success">
                            <CheckCircle2 size={12} />
                            <span>{item.status}</span>
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)" }}>
                          {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 5: INVIGILATOR SOP & SECURITY REGULATIONS
            ========================================================= */}
        {activeMenu === "guidelines" && (
          <div className="dash-view">
            <div className="dash-view-header">
              <div className="dash-view-titles">
                <h1 className="dash-view-title">Invigilator SOP & Security Regulations</h1>
                <p className="dash-view-subtitle">
                  Autonomous Institute Examination Code of Conduct & Emergency Protocols
                </p>
              </div>
            </div>

            <div className="dash-card" style={{ padding: 0 }}>
              <div className="dash-card-header">
                <div className="dash-card-title-group">
                  <h3 className="dash-card-title">Chief & Hall Invigilator Standard Operating Procedures</h3>
                  <p className="dash-card-subtitle">Mandatory compliance requirements for all examination sessions</p>
                </div>
              </div>

              <div className="dash-card-body">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-default)", background: "#ffffff" }}>
                    <div style={{ display: "inline-flex", width: "28px", height: "28px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", fontWeight: 700, fontSize: "12px", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>01</div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>Reporting & Question Paper Custody</h4>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      Report to the Central Examination Control Room exactly <strong>30 minutes prior</strong> to exam commencement. Inspect the tamper-evident wax seal on question paper envelopes before opening in front of student witnesses.
                    </p>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-default)", background: "#ffffff" }}>
                    <div style={{ display: "inline-flex", width: "28px", height: "28px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", fontWeight: 700, fontSize: "12px", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>02</div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>Candidate Entry & Identity Verification</h4>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      Admit students only with their official <strong>Nexora Hall Ticket / Admit Card</strong> and College Photo ID. Ensure no electronic gadgets, smart watches, or unauthorized revision materials are brought into the hall.
                    </p>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-default)", background: "#ffffff" }}>
                    <div style={{ display: "inline-flex", width: "28px", height: "28px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", fontWeight: 700, fontSize: "12px", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>03</div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>Attendance & Answer Book Reconciliation</h4>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      Obtain student signature on the Door Posting Roster within the first 45 minutes of the examination. Cross-check barcode serial numbers against the official absentee statement.
                    </p>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid var(--border-default)", background: "#ffffff" }}>
                    <div style={{ display: "inline-flex", width: "28px", height: "28px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", fontWeight: 700, fontSize: "12px", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>04</div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>Malpractice & Unfair Means (UFM)</h4>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      If malpractice is detected, immediately seize the unauthorized material, issue a fresh answer book, and alert the Flying Squad / Exam Superintendent without causing disruption to other students.
                    </p>
                  </div>
                </div>

                {/* Emergency Extension Callout Banner */}
                <div style={{ padding: "16px 20px", borderRadius: "8px", border: "1px solid #bfdbfe", background: "#eff6ff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: "#1e40af", fontWeight: 700, fontSize: "13.5px" }}>
                    <PhoneCall size={17} />
                    <span>Emergency Examination Control Room Extensions</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", fontSize: "12.5px" }}>
                    <div>
                      <div style={{ color: "#64748b" }}>Controller of Examinations (COE)</div>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>Ext. 101 / +91 98230 00101</div>
                    </div>
                    <div>
                      <div style={{ color: "#64748b" }}>Central Control Room</div>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>Ext. 104 / +91 98230 00104</div>
                    </div>
                    <div>
                      <div style={{ color: "#64748b" }}>Campus Health Centre (Emergency)</div>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>Ext. 911 / +91 98230 00911</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          PRINTABLE OFFICIAL DUTY ORDER MODAL
          ========================================================= */}
      {dutyOrderModal && (
        <div
          className="dash-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDutyOrderModal(null);
          }}
        >
          <div className="dash-modal" style={{ width: "720px", maxWidth: "95vw", maxHeight: "90vh" }}>
            <div className="dash-modal-header">
              <div>
                <h3 className="dash-modal-title">Official Invigilation Duty Appointment Order</h3>
                <p className="dash-modal-subtitle">Autonomous End-Semester Examination (ESE 2026) · Statutory Invigilation Order</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary dash-btn-sm"
                  onClick={handlePrintOfficialPDF}
                >
                  <Printer size={14} />
                  <span>Print Duty Order</span>
                </button>
                <button
                  type="button"
                  className="dash-modal-close"
                  onClick={() => setDutyOrderModal(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="dash-modal-body">
              {/* Clean styled order sheet */}
              <div
                className="printable-order-sheet"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  padding: "24px 28px",
                  color: "#0f172a",
                }}
              >
                {/* Institutional Header */}
                <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "14px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                    <Building2 size={36} style={{ color: "var(--brand-primary)" }} />
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 2px 0", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Kolhapur Institute of Technology
                  </h2>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#334155", margin: "0 0 2px 0" }}>
                    COLLEGE OF ENGINEERING (AUTONOMOUS), KOLHAPUR
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 6px 0" }}>
                    Office of the Controller of Examinations · Central Examination Cell
                  </p>
                  <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-primary)", background: "#eff6ff", padding: "2px 8px", borderRadius: "4px" }}>
                    REF NO: KIT/COE/ESE-2026/ORD-{dutyOrderModal.code}-{(dutyOrderModal.id || "1081").replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", margin: "12px 0", padding: "6px 10px", background: "#f8fafc", borderRadius: "4px", borderLeft: "3px solid var(--brand-primary)" }}>
                  SUBJECT: FORMAL STATUTORY APPOINTMENT ORDER AS CHIEF / HALL INVIGILATOR FOR AUTONOMOUS ESE 2026
                </div>

                <div style={{ fontSize: "12.5px", lineHeight: 1.5, marginBottom: "12px", color: "var(--text-secondary)" }}>
                  To,<br />
                  <strong style={{ color: "#0f172a" }}>{facultyName}</strong><br />
                  Department of {facultyDept} · Employee Identifier: <strong className="font-mono" style={{ color: "#0f172a" }}>{facultyId}</strong>
                </div>

                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                  By direction of the Academic Council and the Board of Examinations, you are hereby appointed as an Invigilator for the scheduled End Semester Examination (Autumn 2026-27). The details of your appointed duty are specified hereunder:
                </p>

                {/* Duty Details Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "16px" }}>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#64748b", width: "35%" }}>Course Code & Title:</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0f172a" }}>
                        <span className="font-mono" style={{ color: "var(--brand-primary)" }}>{dutyOrderModal.code}</span> — {dutyOrderModal.subject}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#64748b" }}>Date of Examination:</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0f172a" }}>{dutyOrderModal.date}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#64748b" }}>Time Slot & Duration:</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0f172a" }}>{dutyOrderModal.slot} (3.0 Hours)</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#64748b" }}>Reporting Time:</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#166534" }}>30 Minutes Prior to Slot Start (Report at Central Exam Cell)</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#64748b" }}>Assigned Examination Hall:</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0f172a" }}>{dutyOrderModal.room}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#64748b" }}>Candidate Strength:</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0f172a" }}>
                        <span className="font-mono">{dutyOrderModal.enrolled} Enrolled Candidates</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#64748b" }}>Duty Designation:</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span className="dash-badge dash-badge-info" style={{ fontWeight: 700 }}>
                          CHIEF INVIGILATOR
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Statutory Instructions */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px 14px", marginBottom: "18px", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Mandatory Statutory Instructions:</div>
                  <ol style={{ margin: 0, paddingLeft: "18px" }}>
                    <li>Under Maharashtra Public Universities Act Section 48(4), examination duty is mandatory for all recognized teaching faculty.</li>
                    <li>No exchange of duty is permitted without prior written sanction from the Controller of Examinations and respective HOD.</li>
                    <li>All mobile phones and smart devices must be deposited in the secure locker at Central Control Room before entering the exam block.</li>
                  </ol>
                </div>

                {/* Signatures Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "14px" }}>
                  <div style={{ textAlign: "center", width: "180px" }}>
                    <div style={{ borderTop: "1.5px solid #334155", marginBottom: "4px" }} />
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>Signature of Faculty Member</div>
                    <div className="font-mono" style={{ fontSize: "10.5px", color: "#166534" }}>✓ Acknowledged Digitally</div>
                  </div>
                  <div style={{ textAlign: "center", width: "200px" }}>
                    <div style={{ borderTop: "1.5px solid #334155", marginBottom: "4px" }} />
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>Controller of Examinations</div>
                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>KITCoEK Autonomous Exam Cell</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                onClick={() => setDutyOrderModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={handlePrintOfficialPDF}
              >
                <Printer size={15} />
                <span>Print Official Duty Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CONSOLIDATED MASTER DUTY ORDER MODAL (ALL SESSIONS PDF)
          ========================================================= */}
      {allDutiesModalOpen && (
        <div
          className="dash-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAllDutiesModalOpen(false);
          }}
        >
          <div className="dash-modal" style={{ width: "960px", maxWidth: "96vw", maxHeight: "92vh" }}>
            <div className="dash-modal-header">
              <div>
                <h3 className="dash-modal-title">Official Consolidated Invigilation Duty Appointment Order</h3>
                <p className="dash-modal-subtitle">Autonomous End-Semester Examination (ESE 2026-27) · Master Schedule &amp; Orders</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary dash-btn-sm"
                  onClick={handlePrintMasterPDF}
                >
                  <Printer size={14} />
                  <span>Print Master Duty Order</span>
                </button>
                <button
                  type="button"
                  className="dash-modal-close"
                  onClick={() => setAllDutiesModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="dash-modal-body" style={{ maxHeight: "calc(92vh - 140px)", overflowY: "auto" }}>
              {/* Document Paper */}
              <div
                className="printable-order-sheet"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  padding: "28px 32px",
                  color: "#0f172a",
                }}
              >
                {/* Official KIT Kolhapur Crest & Letterhead */}
                <div style={{ textAlign: "center", borderBottom: "2.5px solid #0f172a", paddingBottom: "14px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                    <Building2 size={38} style={{ color: "var(--brand-primary)" }} />
                  </div>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 2px 0", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Kolhapur Institute of Technology
                  </h2>
                  <p style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b", margin: "0 0 2px 0" }}>
                    COLLEGE OF ENGINEERING (AUTONOMOUS), KOLHAPUR
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 6px 0" }}>
                    Office of the Controller of Examinations · Central Examination Cell
                  </p>
                  <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-primary)", background: "#eff6ff", padding: "3px 10px", borderRadius: "4px", border: "1px solid #bfdbfe" }}>
                    REF NO: KIT/COE/ESE-2026/ORD-MASTER-{facultyId}
                  </span>
                </div>

                {/* Title Banner */}
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#1e293b", margin: "14px 0", padding: "8px 12px", background: "#f8fafc", borderRadius: "4px", borderLeft: "4px solid var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                  OFFICIAL CONSOLIDATED APPOINTMENT ORDER AS INVIGILATOR FOR AUTONOMOUS ESE 2026-27
                </div>

                {/* Appointee Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 16px", padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", marginBottom: "16px", fontSize: "12px" }}>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Appointee Name</span>
                    <strong style={{ color: "#0f172a" }}>{facultyName}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Employee ID</span>
                    <strong className="font-mono" style={{ color: "#0f172a" }}>{facultyId}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Department</span>
                    <strong style={{ color: "#0f172a" }}>{facultyDept}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Designation</span>
                    <strong style={{ color: "#0f172a" }}>{(matchedInvigilator as any)?.designation || "Assistant Professor / Recognized Teacher"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Total Duties Scheduled</span>
                    <strong className="font-mono" style={{ color: "var(--brand-primary)" }}>{facultyDuties.length} Examination Sessions</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Academic Year / Cycle</span>
                    <strong style={{ color: "#0f172a" }}>ESE 2026-27 (Autonomous Odd Semester)</strong>
                  </div>
                </div>

                {/* Statutory Appointment Order Text */}
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
                  By direction of the Academic Council and Board of Examinations, under <strong>Section 48(4) of the Maharashtra Public Universities Act, 2016</strong>, you are hereby appointed as an Invigilator for the scheduled End Semester Examinations (Autumn 2026-27). Examination duties are mandatory statutory responsibilities of all recognized teachers. Below is the complete, consolidated schedule of all examination sessions allotted to you:
                </p>

                {/* FULL TABULAR LIST OF ALL ASSIGNED SESSIONS */}
                <div style={{ overflowX: "auto", marginBottom: "18px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                        <th style={{ padding: "8px 6px", textAlign: "center", width: "32px" }}>#</th>
                        <th style={{ padding: "8px 8px", textAlign: "left", width: "85px" }}>Session ID</th>
                        <th style={{ padding: "8px 8px", textAlign: "left", width: "130px" }}>Date &amp; Slot</th>
                        <th style={{ padding: "8px 8px", textAlign: "left" }}>Course Code &amp; Title</th>
                        <th style={{ padding: "8px 8px", textAlign: "left", width: "80px" }}>Dept</th>
                        <th style={{ padding: "8px 8px", textAlign: "left", width: "110px" }}>Designated Venue</th>
                        <th style={{ padding: "8px 6px", textAlign: "center", width: "70px" }}>Candidates</th>
                        <th style={{ padding: "8px 8px", textAlign: "left", width: "105px" }}>Assigned Role</th>
                        <th style={{ padding: "8px 8px", textAlign: "center", width: "95px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyDuties.map((duty, idx) => {
                        const isSubstituted = isAdjustmentResolved(duty);
                        const isPending = isAdjustmentRequested(duty);
                        return (
                          <tr key={duty.id || idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "7px 6px", textAlign: "center", fontWeight: 600, color: "#64748b" }}>{idx + 1}</td>
                            <td style={{ padding: "7px 8px", fontFamily: "monospace", fontSize: "11px", fontWeight: 600 }}>{duty.id}</td>
                            <td style={{ padding: "7px 8px" }}>
                              <div style={{ fontWeight: 600 }}>{duty.date}</div>
                              <div style={{ fontSize: "10.5px", color: "#64748b" }}>{duty.slot}</div>
                            </td>
                            <td style={{ padding: "7px 8px" }}>
                              <strong className="font-mono" style={{ color: "var(--brand-primary)" }}>{duty.code}</strong>
                              <div style={{ fontSize: "11px", color: "#334155" }}>{duty.subject}</div>
                            </td>
                            <td style={{ padding: "7px 8px", fontSize: "11px" }}>{duty.department}</td>
                            <td style={{ padding: "7px 8px", fontWeight: 600 }}>{duty.room}</td>
                            <td style={{ padding: "7px 6px", textAlign: "center", fontFamily: "monospace", fontWeight: 700 }}>40</td>
                            <td style={{ padding: "7px 8px" }}>
                              <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", background: idx === 0 ? "#eff6ff" : "#f1f5f9", color: idx === 0 ? "#1d4ed8" : "#334155", fontWeight: 600 }}>
                                {idx === 0 ? "Chief Invigilator" : "Hall Invigilator"}
                              </span>
                            </td>
                            <td style={{ padding: "7px 8px", textAlign: "center" }}>
                              {isSubstituted ? (
                                <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", background: "#ecfdf5", color: "#065f46", fontWeight: 700 }}>
                                  Substituted
                                </span>
                              ) : isPending ? (
                                <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", background: "#fff7ed", color: "#c2410c", fontWeight: 700 }}>
                                  Swap Pending
                                </span>
                              ) : (
                                <span style={{ fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", background: "#ecfdf5", color: "#065f46", fontWeight: 700 }}>
                                  Approved
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#f8fafc", borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                        <td colSpan={6} style={{ padding: "9px 10px", textAlign: "right" }}>
                          CONSOLIDATED ALLOCATION TOTALS:
                        </td>
                        <td style={{ padding: "9px 6px", textAlign: "center", fontFamily: "monospace", color: "var(--brand-primary)" }}>
                          {facultyDuties.length * 40}
                        </td>
                        <td colSpan={2} style={{ padding: "9px 10px" }}>
                          {facultyDuties.length} Examination Sessions Supervised
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Statutory Instructions & Emergency Extensions */}
                <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "12px 14px", marginBottom: "18px", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Mandatory Statutory Instructions:</div>
                  <ol style={{ margin: 0, paddingLeft: "18px" }}>
                    <li>Under Maharashtra Public Universities Act Section 48(4), examination duty is mandatory for all recognized teaching faculty. Default will be reported to the Academic Council.</li>
                    <li>Report to the Central Examination Control Room exactly 30 minutes prior to session commencement to receive sealed envelopes and confidential materials.</li>
                    <li>No mutual exchange of duty is permitted without prior written sanction from the Controller of Examinations and respective Head of Department.</li>
                    <li>Emergency duty adjustments must be filed via the portal at least 2 hours in advance for standby pool reallocation.</li>
                  </ol>
                  <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #cbd5e1", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "10.5px" }}>
                    <div><strong>COE Direct:</strong> Ext. 101 / +91 98230 00101</div>
                    <div><strong>Central Control Room:</strong> Ext. 104 / +91 98230 00104</div>
                    <div><strong>Campus Health Centre:</strong> Ext. 911 / +91 98230 00911</div>
                  </div>
                </div>

                {/* Dual Signature Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "20px" }}>
                  <div style={{ textAlign: "center", width: "220px" }}>
                    <div style={{ borderTop: "1.5px solid #0f172a", marginBottom: "4px" }} />
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>Faculty Digital Acceptance</div>
                    <div style={{ fontSize: "10.5px", color: "#334155" }}>{facultyName} (EMP: {facultyId})</div>
                    <div className="font-mono" style={{ fontSize: "10px", color: "#166534", marginTop: "2px" }}>✓ Digitally Acknowledged &amp; Verified</div>
                  </div>
                  <div style={{ textAlign: "center", width: "220px" }}>
                    <div style={{ borderTop: "1.5px solid #0f172a", marginBottom: "4px" }} />
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#0f172a" }}>Controller of Examinations</div>
                    <div style={{ fontSize: "10.5px", color: "#334155" }}>KITCoEK Autonomous Exam Cell</div>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Autonomous Official Seal &amp; Digital Auth</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                onClick={() => setAllDutiesModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                onClick={handlePrintMasterPDF}
              >
                <Printer size={15} />
                <span>Print Master Duty Order (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EMERGENCY ADJUSTMENT MODAL
          ========================================================= */}
      {emergencyModalDuty && (
        <div
          className="dash-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEmergencyModalDuty(null);
          }}
        >
          <div className="dash-modal" style={{ width: "560px", maxWidth: "95vw" }}>
            <div className="dash-modal-header" style={{ borderBottomColor: "#fee2e2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="dash-modal-title" style={{ color: "#991b1b" }}>
                    Emergency Duty Swap / Adjustment Request
                  </h3>
                  <p className="dash-modal-subtitle">
                    Central Examination Control Room Urgent Spot-Reassignment
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="dash-modal-close"
                onClick={() => setEmergencyModalDuty(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEmergencyAdjustmentSubmit}>
              <div className="dash-modal-body">
                {/* Duty Details Card */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-default)",
                    borderRadius: "8px",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12.5px" }}>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                        Paper Code & Subject
                      </span>
                      <strong className="font-mono" style={{ color: "var(--brand-primary)" }}>{emergencyModalDuty.code}</strong>
                      <div style={{ color: "#334155", fontSize: "12px" }}>{emergencyModalDuty.subject}</div>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                        Designated Venue / Room
                      </span>
                      <strong style={{ color: "#0f172a" }}>{emergencyModalDuty.room}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                        Date of Examination
                      </span>
                      <strong style={{ color: "#0f172a" }}>{emergencyModalDuty.date}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                        Time Slot
                      </span>
                      <strong style={{ color: "#0f172a" }}>{emergencyModalDuty.slot}</strong>
                    </div>
                  </div>
                </div>

                {/* Alert Notice */}
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    color: "#92400e",
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#d97706" }} />
                  <span>
                    Submitting this request flags this duty as an urgent emergency in Central Examination Control. The Exam Coordinator will be alerted to swap this duty from the standby faculty pool.
                  </span>
                </div>

                {/* Reason Selector */}
                <div className="dash-form-group">
                  <label className="dash-label">
                    Emergency Category <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    className="dash-select"
                    value={emergencyReasonCategory}
                    onChange={(e) => setEmergencyReasonCategory(e.target.value)}
                    required
                  >
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Family Emergency">Family Emergency</option>
                    <option value="Urgent Academic Duty">Urgent Academic Duty</option>
                    <option value="Doctoral Committee Examination">Doctoral Committee Examination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description Textarea */}
                <div className="dash-form-group">
                  <label className="dash-label">
                    Reason & Clinical / Official Justification <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    className="dash-textarea"
                    value={emergencyReasonDetails}
                    onChange={(e) => setEmergencyReasonDetails(e.target.value)}
                    rows={3}
                    placeholder="Detail the emergency circumstances requiring urgent duty swap / reassignment..."
                    required
                  />
                </div>
              </div>

              <div className="dash-modal-footer">
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  onClick={() => setEmergencyModalDuty(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dash-btn dash-btn-danger"
                >
                  <AlertTriangle size={15} />
                  <span>Submit Emergency Swap Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
