import React from "react";
import { UserRole } from "@nexora/contracts";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  apiStatus: "connected" | "connecting" | "offline";
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  apiStatus,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-section">
          <div className="brand-logo">N</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="brand-title">Nexora</span>
              <span className="brand-badge">Academic 2026-27</span>
            </div>
          </div>
        </div>

        <div className="nav-controls">
          <div className="role-tabs" aria-label="Role Switcher">
            {(
              [
                UserRole.EXAM_COORDINATOR,
                UserRole.STUDENT,
                UserRole.FACULTY,
                UserRole.HOD,
              ] as UserRole[]
            ).map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`role-tab ${currentRole === role ? "active" : ""}`}
              >
                {role === UserRole.EXAM_COORDINATOR
                  ? "Coordinator"
                  : role.charAt(0) + role.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div
            className="health-pill"
            style={{
              backgroundColor:
                apiStatus === "connected"
                  ? "var(--status-success-bg)"
                  : apiStatus === "connecting"
                  ? "var(--status-warning-bg)"
                  : "var(--status-danger-bg)",
              color:
                apiStatus === "connected"
                  ? "var(--status-success-text)"
                  : apiStatus === "connecting"
                  ? "var(--status-warning-text)"
                  : "var(--status-danger-text)",
              borderColor:
                apiStatus === "connected"
                  ? "var(--status-success-border)"
                  : apiStatus === "connecting"
                  ? "var(--status-warning-border)"
                  : "var(--status-danger-border)",
            }}
          >
            <span className="health-dot" />
            <span>API {apiStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
