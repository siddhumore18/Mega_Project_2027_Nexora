import React from "react";
import { UserRole } from "@nexora/contracts";
import { StudentPortal } from "./student/StudentPortal.js";
import { FacultyPortal } from "./faculty/FacultyPortal.js";
import { AdminDashboard } from "./admin/AdminDashboard.js";
import { StatusBadge } from "./StatusBadge.js";
import { ShieldCheck } from "lucide-react";

interface RoleViewsProps {
  role: UserRole;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const RoleViews: React.FC<RoleViewsProps> = ({ role, activeTab, onTabChange }) => {
  if (role === UserRole.STUDENT) {
    return <StudentPortal initialTab={activeTab === "registration" ? "registration" : "timetable"} />;
  }

  if (role === UserRole.FACULTY) {
    return <FacultyPortal initialTab={activeTab === "availability" ? "availability" : "invigilation"} />;
  }

  if (role === UserRole.ADMIN) {
    return <AdminDashboard activeTab={activeTab} onNavigateTab={onTabChange} />;
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
