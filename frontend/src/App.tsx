import React, { useState, useEffect } from "react";
import { UserRole } from "@nexora/contracts";
import { Header } from "./components/Header.js";
import { CoordinatorDashboard } from "./components/CoordinatorDashboard.js";
import { RoleViews } from "./components/RoleViews.js";
import { fetchHealth } from "./services/api.js";
import {
  UserProfile,
  getStoredUser,
  login,
  logout as logoutService,
} from "./services/auth.js";

const ROLE_EMAILS: Record<UserRole, string> = {
  [UserRole.EXAM_COORDINATOR]: "coordinator@nexora.edu",
  [UserRole.STUDENT]: "student@nexora.edu",
  [UserRole.FACULTY]: "faculty@nexora.edu",
  [UserRole.HOD]: "hod.cse@nexora.edu",
  [UserRole.ADMIN]: "admin@nexora.edu",
};

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.EXAM_COORDINATOR);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser());
  const [apiStatus, setApiStatus] = useState<"connected" | "connecting" | "offline">("connecting");

  useEffect(() => {
    fetchHealth()
      .then(() => {
        setApiStatus("connected");
        // Auto-login default coordinator session if none exists
        if (!getStoredUser()) {
          login("coordinator@nexora.edu")
            .then((user) => setCurrentUser(user))
            .catch(() => {});
        }
      })
      .catch(() => setApiStatus("offline"));
  }, []);

  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    const email = ROLE_EMAILS[newRole];
    if (email) {
      try {
        const user = await login(email);
        setCurrentUser(user);
      } catch {
        // Mock fallback if API is not running dev server
        setCurrentUser({
          id: `demo-${newRole.toLowerCase()}`,
          email,
          name:
            newRole === UserRole.EXAM_COORDINATOR
              ? "Dr. Elena Vance (Exam Controller)"
              : newRole === UserRole.STUDENT
              ? "Aarav Sharma"
              : newRole === UserRole.FACULTY
              ? "Dr. A. Sharma"
              : "Prof. Vikram Sen (HOD)",
          role: newRole,
        });
      }
    }
  };

  const handleLogout = async () => {
    await logoutService();
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        apiStatus={apiStatus}
      />
      <main className="main-content">
        {currentRole === UserRole.EXAM_COORDINATOR && <CoordinatorDashboard />}
        {currentRole !== UserRole.EXAM_COORDINATOR && <RoleViews role={currentRole} />}
      </main>
    </div>
  );
};

export default App;
