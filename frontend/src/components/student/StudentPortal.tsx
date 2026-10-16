import React, { useState } from "react";
import { StudentTimetable } from "./StudentTimetable.js";
import { StudentRegistration } from "./StudentRegistration.js";
import { Calendar, ClipboardList } from "lucide-react";

interface StudentPortalProps {
  initialTab?: "timetable" | "registration";
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  initialTab = "timetable",
}) => {
  const [activeTab, setActiveTab] = useState<"timetable" | "registration">(initialTab);

  return (
    <div className="student-portal-container">
      {/* Tab Switcher if accessed directly */}
      <div className="portal-subnav-strip">
        <button
          className={`portal-subnav-btn ${activeTab === "timetable" ? "active" : ""}`}
          onClick={() => setActiveTab("timetable")}
        >
          <Calendar size={16} />
          <span>My Timetable & Seating</span>
        </button>
        <button
          className={`portal-subnav-btn ${activeTab === "registration" ? "active" : ""}`}
          onClick={() => setActiveTab("registration")}
        >
          <ClipboardList size={16} />
          <span>Registration & Eligibility</span>
        </button>
      </div>

      {activeTab === "timetable" && (
        <StudentTimetable onNavigateToRegistration={() => setActiveTab("registration")} />
      )}
      {activeTab === "registration" && <StudentRegistration />}
    </div>
  );
};
