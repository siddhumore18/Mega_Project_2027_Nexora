import React, { useState } from "react";
import { FacultyInvigilation } from "./FacultyInvigilation.js";
import { FacultyAvailability } from "./FacultyAvailability.js";
import { UserCheck, Clock } from "lucide-react";

interface FacultyPortalProps {
  initialTab?: "invigilation" | "availability";
}

export const FacultyPortal: React.FC<FacultyPortalProps> = ({
  initialTab = "invigilation",
}) => {
  const [activeTab, setActiveTab] = useState<"invigilation" | "availability">(initialTab);

  return (
    <div className="faculty-portal-container">
      {/* Sub-nav strip */}
      <div className="portal-subnav-strip">
        <button
          className={`portal-subnav-btn ${activeTab === "invigilation" ? "active" : ""}`}
          onClick={() => setActiveTab("invigilation")}
        >
          <UserCheck size={16} />
          <span>Invigilation Duties & Roster</span>
        </button>
        <button
          className={`portal-subnav-btn ${activeTab === "availability" ? "active" : ""}`}
          onClick={() => setActiveTab("availability")}
        >
          <Clock size={16} />
          <span>Availability & Blackout Preferences</span>
        </button>
      </div>

      {activeTab === "invigilation" && <FacultyInvigilation />}
      {activeTab === "availability" && <FacultyAvailability />}
    </div>
  );
};
