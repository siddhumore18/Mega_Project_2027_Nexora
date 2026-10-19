import React, { useState } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import {
  Calendar,
  ClipboardList,
  FileText,
  UserCheck,
  Clock,
  LayoutGrid,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  Layers,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  apiStatus: "connected" | "connecting" | "offline";
  onShowLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  apiStatus,
  onShowLogin,
}) => {
  const { currentUser, logout, switchRole, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Define tabs per role
  const getRoleTabs = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case UserRole.STUDENT:
        return [
          { id: "timetable", label: "My Timetable & Seating", icon: Calendar },
          { id: "registration", label: "Registration & Eligibility", icon: ClipboardList },
          { id: "hallticket", label: "Admit Card / Hall Ticket", icon: FileText },
        ];
      case UserRole.FACULTY:
        return [
          { id: "invigilation", label: "Invigilation Duties", icon: UserCheck },
          { id: "availability", label: "Availability & Preferences", icon: Clock },
          { id: "seating", label: "Hall Seating Roster", icon: LayoutGrid },
        ];
      case UserRole.EXAM_COORDINATOR:
        return [
          { id: "coordinator", label: "Exam Command Center", icon: Layers },
        ];
      case UserRole.HOD:
        return [
          { id: "hod", label: "Department Overview", icon: Shield },
        ];
      default:
        return [];
    }
  };

  const tabs = getRoleTabs();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Left: Brand */}
        <div className="brand-section">
          <div className="brand-logo" aria-hidden="true">
            N
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="brand-title">Nexora</span>
              <span className="brand-badge">Academic 2026-27</span>
            </div>
            {currentUser && (
              <div className="brand-role-caption">
                {currentUser.role === UserRole.STUDENT && "Student Examination Portal"}
                {currentUser.role === UserRole.FACULTY && "Faculty Invigilation Portal"}
                {currentUser.role === UserRole.EXAM_COORDINATOR && "Examination Cell Console"}
                {currentUser.role === UserRole.HOD && "HOD Academic Administration"}
              </div>
            )}
          </div>
        </div>

        {/* Center: Dynamic Role-Specific Navigation Tabs (Desktop) */}
        {isAuthenticated && tabs.length > 0 && (
          <nav className="desktop-role-nav" aria-label="Portal Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`nav-tab-btn ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Controls & User Profile */}
        <div className="nav-controls">
          {/* Quick Persona Switcher for Evaluation */}
          <div className="persona-switcher-wrapper">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="persona-switcher-btn"
              title="Switch role persona for evaluation"
              aria-expanded={roleDropdownOpen}
            >
              <span className="persona-switcher-dot" />
              <span className="persona-switcher-label">
                Role: <strong>{currentUser ? currentUser.role : "Guest"}</strong>
              </span>
              <ChevronDown size={14} />
            </button>

            {roleDropdownOpen && (
              <div className="persona-dropdown-menu">
                <div className="dropdown-section-title">Switch Active Persona</div>
                <button
                  className={`dropdown-item ${currentUser?.role === UserRole.STUDENT ? "active" : ""}`}
                  onClick={() => {
                    switchRole(UserRole.STUDENT);
                    onTabChange("timetable");
                    setRoleDropdownOpen(false);
                  }}
                >
                  <div className="dropdown-item-title">Student View</div>
                  <div className="dropdown-item-desc">Aarav Sharma (CS2023-042)</div>
                </button>
                <button
                  className={`dropdown-item ${currentUser?.role === UserRole.FACULTY ? "active" : ""}`}
                  onClick={() => {
                    switchRole(UserRole.FACULTY);
                    onTabChange("invigilation");
                    setRoleDropdownOpen(false);
                  }}
                >
                  <div className="dropdown-item-title">Faculty View</div>
                  <div className="dropdown-item-desc">Dr. A. Sharma (FAC-1082)</div>
                </button>
                <button
                  className={`dropdown-item ${currentUser?.role === UserRole.EXAM_COORDINATOR ? "active" : ""}`}
                  onClick={() => {
                    switchRole(UserRole.EXAM_COORDINATOR);
                    onTabChange("coordinator");
                    setRoleDropdownOpen(false);
                  }}
                >
                  <div className="dropdown-item-title">Coordinator View</div>
                  <div className="dropdown-item-desc">Central Exam Scheduling</div>
                </button>
                <button
                  className={`dropdown-item ${currentUser?.role === UserRole.HOD ? "active" : ""}`}
                  onClick={() => {
                    switchRole(UserRole.HOD);
                    onTabChange("hod");
                    setRoleDropdownOpen(false);
                  }}
                >
                  <div className="dropdown-item-title">HOD View</div>
                  <div className="dropdown-item-desc">CSE Department Overview</div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill or Login Button */}
          {isAuthenticated && currentUser ? (
            <div className="user-profile-widget">
              <div className="user-avatar-badge" title={currentUser.name}>
                {currentUser.avatarInitials}
              </div>
              <div className="user-details-box">
                <span className="user-name-text">{currentUser.name}</span>
                <span className="user-id-text">{currentUser.identifier}</span>
              </div>
              <button
                onClick={logout}
                className="btn-icon-subtle"
                title="Sign Out"
                aria-label="Sign out of portal"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onShowLogin} className="btn btn-primary btn-sm">
              Sign In
            </button>
          )}

          {/* System API Health Badge */}
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
            <span className="health-text">API {apiStatus}</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {currentUser && (
            <div className="mobile-user-card">
              <div className="user-avatar-badge">{currentUser.avatarInitials}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{currentUser.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {currentUser.identifier} • {currentUser.role}
                </div>
              </div>
            </div>
          )}
          <div className="mobile-nav-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`mobile-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-default)" }}>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="btn btn-secondary"
              style={{ width: "100%" }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
