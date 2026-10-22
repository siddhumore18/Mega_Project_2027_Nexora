import React, { useState, useMemo } from "react";
import { Printer, Download, Search, ShieldCheck, ArrowLeft } from "lucide-react";
import { CoordinatorExamEntry, AcademicDataStore } from "../../services/academicDataStore.js";
import "../../styles/circular.css";

export interface AutonomousCircularViewProps {
  exams?: CoordinatorExamEntry[];
  circularNo?: string;
  circularDate?: string;
  academicYear?: string;
  examTitle?: string;
  onBack?: () => void;
}

export const AutonomousCircularView: React.FC<AutonomousCircularViewProps> = ({
  exams: customExams,
  circularNo = "Circular No. 01 MSE Exam of September2026",
  circularDate = "03/09/2026",
  academicYear = "2026-27",
  examTitle = "TIME TABLE OF MID SEMESTER EXAMINATION (OFFLINE MODE) SEPTEMBER 2026",
  onBack,
}) => {
  const storeState = AcademicDataStore.getState();
  const [selectedCycleId, setSelectedCycleId] = useState<string>("cycle-ese-2026");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedProgramme, setSelectedProgramme] = useState<string>("ALL");
  const [selectedStructure, setSelectedStructure] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeCycle = useMemo(() => {
    return storeState.examCycles.find((c) => c.id === selectedCycleId) || storeState.examCycles[0];
  }, [storeState.examCycles, selectedCycleId]);

  const exams = useMemo(() => {
    if (customExams && customExams.length > 0) {
      if (selectedCycleId === "ALL") return customExams;
      const filtered = customExams.filter((e) => !e.cycleId || e.cycleId === selectedCycleId);
      return filtered.length > 0 ? filtered : customExams;
    }
    if (selectedCycleId === "ALL") return storeState.coordinatorExams;
    return storeState.coordinatorExams.filter((e) => !e.cycleId || e.cycleId === selectedCycleId);
  }, [customExams, storeState.coordinatorExams, selectedCycleId]);

  const isESE = activeCycle?.examType === "ESE" || activeCycle?.id === "cycle-ese-2026" || selectedCycleId === "cycle-ese-2026";

  const effectiveTitle = isESE
    ? "TIME TABLE OF END SEMESTER EXAMINATION (OFFLINE MODE) NOVEMBER / DECEMBER 2026"
    : examTitle;

  const effectiveCircularNo = isESE
    ? "Circular No. 04 ESE Exam of November/December 2026"
    : circularNo;

  const effectiveCircularDate = isESE
    ? "01/11/2026"
    : circularDate;

  const effectiveAcademicYear = activeCycle?.academicYear || academicYear;

  // Map year of study to autonomous circular notation
  const formatYear = (y: string, sem?: number): string => {
    if (y === "First" || sem === 1 || sem === 2) return "F.Y.B.TECH";
    if (y === "Second" || sem === 3 || sem === 4) return "S.Y.B.TECH";
    if (y === "Third" || sem === 5 || sem === 6) return "T.Y.B.TECH";
    if (y === "Fourth" || sem === 7 || sem === 8) return "FINAL YR B.TECH";
    return y.toUpperCase();
  };

  // Convert Roman semester
  const formatRomanSem = (sem: number): string => {
    const romanMap: Record<number, string> = {
      1: "I", 2: "II", 3: "III", 4: "IV",
      5: "V", 6: "VI", 7: "VII", 8: "VIII",
    };
    return romanMap[sem] || String(sem);
  };

  // Map session time and M/A/E indicator
  const formatSessionTimeAndIndicator = (slot: string, sem: number): { time: string; mae: string } => {
    if (slot && (slot.includes("TO") || slot.includes("-"))) {
      const isMorning = slot.includes("10.00") || slot.includes("09:30") || slot.toLowerCase().includes("morn");
      const isAfternoon = slot.includes("01.30") || slot.includes("12.30") || slot.includes("14:00") || slot.toLowerCase().includes("after");
      const mae = isMorning ? "M" : isAfternoon ? "A" : "E";
      return { time: slot, mae };
    }
    if (isESE) {
      if (sem <= 4) return { time: "10.00 AM TO 12.30 PM", mae: "M" };
      if (sem <= 6) return { time: "01.30 PM TO 04.00 PM", mae: "A" };
      return { time: "04.30 PM TO 07.00 PM", mae: "E" };
    }
    if (sem <= 4) return { time: "10.00 AM TO 11.30 AM", mae: "M" };
    if (sem <= 6) return { time: "12.30 PM TO 02.00 PM", mae: "A" };
    return { time: "03.00 PM TO 04.30 PM", mae: "E" };
  };

  // Format date to Indian DD.MM.YYYY
  const formatIndianDate = (dateStr: string): string => {
    if (!dateStr) return "TBD";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  };

  // Get Day of Week
  const getDayName = (dateStr: string): string => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { weekday: "long" });
    } catch {
      return "TBD";
    }
  };

  // Filtered & Sorted exam rows matching the PDF ordering (Date -> Session -> Year -> Branch)
  const rows = useMemo(() => {
    return exams
      .filter((e) => {
        const yearFormatted = formatYear(e.yearOfStudy, e.semester);
        const matchYear = selectedYear === "ALL" || yearFormatted === selectedYear;
        const matchProg = selectedProgramme === "ALL" || e.department === selectedProgramme || e.programCode.includes(selectedProgramme);
        const structure = e.curriculumStructure || (e.code.startsWith("UC") ? "NEP" : "CYCLE 2");
        const matchStruct = selectedStructure === "ALL" || structure === selectedStructure;
        const matchSearch = !searchQuery ||
          e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.department.toLowerCase().includes(searchQuery.toLowerCase());
        return matchYear && matchProg && matchStruct && matchSearch;
      })
      .map((e) => {
        const { time, mae } = formatSessionTimeAndIndicator(e.slot, e.semester);
        const structure = e.curriculumStructure || (e.code.includes("C0") && !e.code.startsWith("UCP") && !e.code.startsWith("UCS") ? "CYCLE 2" : "NEP");
        return {
          id: e.id,
          dateRaw: e.date,
          date: formatIndianDate(e.date),
          day: getDayName(e.date),
          year: formatYear(e.yearOfStudy, e.semester),
          programme: e.department || "CSE",
          structure: structure,
          time,
          mae,
          sem: formatRomanSem(e.semester),
          courseCode: e.code,
          courseName: e.subject,
        };
      })
      .sort((a, b) => {
        // Sort by Date
        if (a.dateRaw !== b.dateRaw) return a.dateRaw.localeCompare(b.dateRaw);
        // Sort by Session order (M -> A -> E)
        const maeOrder: Record<string, number> = { M: 1, A: 2, E: 3 };
        const orderA = maeOrder[a.mae] || 4;
        const orderB = maeOrder[b.mae] || 4;
        if (orderA !== orderB) return orderA - orderB;
        // Sort by Year
        return a.year.localeCompare(b.year);
      });
  }, [exams, selectedYear, selectedProgramme, selectedStructure, searchQuery]);

  // Unique lists for filtering
  const programmes = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((e) => set.add(e.department || "CSE"));
    return Array.from(set).sort();
  }, [exams]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Day", "Year", "Programme", "Structure", "Time", "M/A/E", "Sem", "Course Code", "Course Name"];
    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        [
          `"${r.date}"`,
          `"${r.day}"`,
          `"${r.year}"`,
          `"${r.programme}"`,
          `"${r.structure}"`,
          `"${r.time}"`,
          `"${r.mae}"`,
          `"${r.sem}"`,
          `"${r.courseCode}"`,
          `"${r.courseName.replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Autonomous_Exam_Timetable_${academicYear.replace("/", "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="autonomous-circular-container">
      {/* Action Toolbar — Hidden in print mode */}
      <div className="circular-toolbar no-print">
        <div className="toolbar-left">
          {onBack && (
            <button type="button" className="dash-btn dash-btn-outline" onClick={onBack}>
              <ArrowLeft size={15} />
              <span>Back to Dashboard</span>
            </button>
          )}
          <div className="toolbar-meta">
            <span className="badge-official">
              <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
              Autonomous Examination Circular
            </span>
            <span className="text-muted" style={{ fontSize: "12px", marginLeft: "10px" }}>
              Total Papers: <strong>{rows.length}</strong>
            </span>
          </div>
        </div>

        <div className="toolbar-filters">
          <div className="filter-item">
            <label>Exam Cycle:</label>
            <select value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)}>
              <option value="ALL">All Exam Cycles</option>
              {storeState.examCycles.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="ALL">All Years (F.Y. - Final)</option>
              <option value="F.Y.B.TECH">F.Y.B.TECH</option>
              <option value="S.Y.B.TECH">S.Y.B.TECH</option>
              <option value="T.Y.B.TECH">T.Y.B.TECH</option>
              <option value="FINAL YR B.TECH">FINAL YR B.TECH</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Programme:</label>
            <select value={selectedProgramme} onChange={(e) => setSelectedProgramme(e.target.value)}>
              <option value="ALL">All Programmes</option>
              {programmes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Structure:</label>
            <select value={selectedStructure} onChange={(e) => setSelectedStructure(e.target.value)}>
              <option value="ALL">All Structures</option>
              <option value="NEP">NEP (Regular)</option>
              <option value="CYCLE 1">CYCLE 1 (Backlog)</option>
              <option value="CYCLE 2">CYCLE 2 (Backlog)</option>
              <option value="CYCLE 3">CYCLE 3 (Backlog)</option>
            </select>
          </div>

          <div className="filter-item search-input-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search code or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button type="button" className="dash-btn dash-btn-primary" onClick={handlePrint} title="Print official circular or save as PDF">
            <Printer size={15} />
            <span>Print to PDF</span>
          </button>

          <button type="button" className="dash-btn dash-btn-outline" onClick={handleExportCSV} title="Export timetable data as CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          PRINTABLE CIRCULAR DOCUMENT
          Exact Replica of KIT's College of Engineering Circular
          ========================================================= */}
      <div className="circular-document">
        {/* Document Header */}
        <div className="circular-header">
          <div className="college-crest-container">
            <div className="college-crest-logo">
              <span className="crest-initials">KIT</span>
            </div>
          </div>
          <div className="college-header-text">
            <div className="college-affiliation">KOLHAPUR INSTITUTE OF TECHNOLOGY'S</div>
            <h1 className="college-name">COLLEGE OF ENGINEERING (AUTONOMOUS), KOLHAPUR</h1>
            <div className="college-accreditation">(EMPOWERED AUTONOMOUS)</div>
            <h2 className="circular-title">{effectiveTitle}</h2>
            <div className="circular-meta-strip">
              <span className="circular-number">{effectiveCircularNo}</span>
              <span className="circular-date">Date: {effectiveCircularDate}</span>
            </div>
            <div className="circular-subtext">
              Second Year To Final Year B.Tech – (Odd Semester) Examination Schedule for Academic Year {effectiveAcademicYear}
            </div>
            <div className="circular-branches-note">
              Programme of the Second Year to Final Year B.Tech. SEM.III, V, VII {isESE ? "End Semester Examination (ESE)" : "Mid Semester Examination (MSE)"} in the Branches of Biotechnology / Civil / Mechanical / Electronics and TeleComm. / Electrical / Civil and Environmental / Computer Science & Engineering / Computer Science & Engineering (AIML) / Computer Science & Engineering (DS) / Computer Science & Business Systems
            </div>
          </div>
        </div>

        {/* Tabular Timetable Grid matching KIT College of Engineering PDF format */}
        <div className="circular-table-wrapper">
          <table className="circular-timetable-table">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "8.5%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "22%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Year</th>
                <th>Programme</th>
                <th>Structure</th>
                <th>Time</th>
                <th>M/A/E</th>
                <th>Sem</th>
                <th>Course Code</th>
                <th>Course Name</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No examinations match the current filter selection.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const isCycle = row.structure.includes("CYCLE");
                  return (
                    <tr
                      key={row.id || idx}
                      className={isCycle ? "cycle-row" : ""}
                    >
                      <td className="cell-date font-mono">{row.date}</td>
                      <td className="cell-day">{row.day}</td>
                      <td className="cell-year font-semibold">{row.year}</td>
                      <td className="cell-programme font-medium">{row.programme}</td>
                      <td className="cell-structure">
                        <span className={`structure-tag ${isCycle ? "tag-cycle" : "tag-nep"}`}>
                          {row.structure}
                        </span>
                      </td>
                      <td className="cell-time font-mono">{row.time}</td>
                      <td className="cell-mae font-semibold text-center">{row.mae}</td>
                      <td className="cell-sem text-center">{row.sem}</td>
                      <td className="cell-code font-mono font-bold">{row.courseCode}</td>
                      <td className="cell-name">{row.courseName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Important Instructions for Students (1 to 9 from PDF) */}
        <div className="circular-instructions-section">
          <h3 className="instructions-heading">Important Instructions for Students</h3>
          <ol className="instructions-list">
            <li>
              <strong>MSE shall be based on 50% weightage</strong> and for 30 marks with duration 90 minutes (1hrs .30min.) for S.Y., T.Y. B.Tech and Final Year.
            </li>
            <li>
              <strong>The Identity Card and Hall Ticket is Compulsory</strong> at the time of Examination. Identity Card must be duly signed by student & concerned head of the department.
            </li>
            <li>
              The candidates are requested to be present at their respective place of examination <strong>FIFTEEN MINUTES before</strong> the time appointed for seating of the First paper and <strong>TEN MINUTES before</strong> the time of seating of each subsequent paper. They are forbidden to take any book or paper into the Examination Hall.
            </li>
            <li>
              The exchange or loan of drawing instruments or other material used in the examination is not permitted while the examination is in progress. Candidates must bring their own instruments.
            </li>
            <li>
              <strong>Use of only Blue Ink</strong> (except diagram) is permitted. No supplement will be provided at the time of examination.
            </li>
            <li>
              The candidates are allowed to use scientific calculators for numerical calculations at their own cost. College will not supply such calculators.
            </li>
            <li>
              The Examination Programme is subject to change. If there is any change in the programme of the examination, it will be communicated in time through the Institute Website, Exam Cell Notice Board, or official academic channels; however the College is not responsible for any loss or inconvenience caused to the candidate.
            </li>
            <li>
              <strong>The seating arrangement is made datewise & coursewise</strong>; therefore candidates are requested to see their seating arrangement before the date of Examination. The same will be displayed at Examination Cell Notice Board / display board at college entrance.
            </li>
            <li>
              <strong>Cellular Phones, Digital Watches, Smart Gadgets, Programmable Calculators</strong>, Digital Diaries or any unauthorized electronic media are strictly forbidden in the examination hall.
            </li>
          </ol>
          <div className="instructions-footer-note">
            <em>Note: The Examination Programme may subject to change as per the guidelines of higher authorities.</em>
          </div>
        </div>

        {/* 5-Signatory Administrative Authority Strip from PDF */}
        <div className="circular-signatures-section">
          <div className="signatures-grid">
            <div className="sig-block">
              <div className="sig-line">
                <span className="sig-handwritten">Shivraj Kadam</span>
              </div>
              <div className="sig-name">Mr. Shivraj S. Kadam</div>
              <div className="sig-title">Dy. Registrar (Pre-Exam)</div>
            </div>

            <div className="sig-block">
              <div className="sig-line">
                <span className="sig-handwritten">B. S. Kamble</span>
              </div>
              <div className="sig-name">Mr. Bhushan S. Kamble</div>
              <div className="sig-title">Dy. Registrar (On-Exam)</div>
            </div>

            <div className="sig-block">
              <div className="sig-line">
                <span className="sig-handwritten">Dr. S. S. Palkar</span>
              </div>
              <div className="sig-name">Dr. Samadhan S. Palkar</div>
              <div className="sig-title">Dy. Registrar (Post-Exam)</div>
            </div>

            <div className="sig-block seal-block">
              <div className="exam-cell-seal">
                <div className="seal-inner">Exam. Cell</div>
              </div>
            </div>

            <div className="sig-block">
              <div className="sig-line">
                <span className="sig-handwritten">Dr. M. M. Yadav</span>
              </div>
              <div className="sig-name">Dr. Manoj M. Yadav</div>
              <div className="sig-title">Dean Examinations & Evaluation</div>
            </div>

            <div className="sig-block">
              <div className="sig-line">
                <span className="sig-handwritten">Dr. M. B. Vanarotti</span>
              </div>
              <div className="sig-name">Dr. Mohan B. Vanarotti</div>
              <div className="sig-title">Director</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
