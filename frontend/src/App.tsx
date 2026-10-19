import React, { useState, useEffect } from "react";
import { UserRole } from "@nexora/contracts";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { Navbar } from "./components/navigation/Navbar.js";
import { LoginView } from "./components/auth/LoginView.js";
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

<<<<<<< HEAD
export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.EXAM_COORDINATOR);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser());
=======
const MainContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("timetable");
>>>>>>> 3a9aaab4dc5978465605bc6591b73fc14d95c5e8
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

<<<<<<< HEAD
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
=======
  // Update default tab when role changes
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === UserRole.STUDENT) {
      setActiveTab("timetable");
    } else if (currentUser.role === UserRole.FACULTY) {
      setActiveTab("invigilation");
    } else if (currentUser.role === UserRole.EXAM_COORDINATOR) {
      setActiveTab("coordinator");
    } else if (currentUser.role === UserRole.HOD) {
      setActiveTab("hod");
    }
  }, [currentUser?.role]);

  // If user is not authenticated, show the Login View
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="app-container">
        <Navbar
          activeTab=""
          onTabChange={() => {}}
          apiStatus={apiStatus}
          onShowLogin={() => {}}
        />
        <main className="main-content">
          <LoginView onSuccess={() => {}} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
>>>>>>> 3a9aaab4dc5978465605bc6591b73fc14d95c5e8
        apiStatus={apiStatus}
        onShowLogin={() => {}}
      />
      <main className="main-content">
        {currentUser.role === UserRole.EXAM_COORDINATOR && <CoordinatorDashboard />}
        {currentUser.role !== UserRole.EXAM_COORDINATOR && (
          <RoleViews role={currentUser.role} activeTab={activeTab} />
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
