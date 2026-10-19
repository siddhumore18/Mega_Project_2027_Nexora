import React, { useState, useEffect } from "react";
import { UserRole } from "@nexora/contracts";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { Navbar } from "./components/navigation/Navbar.js";
import { LoginView } from "./components/auth/LoginView.js";
import { AdminDashboard } from "./components/admin/AdminDashboard.js";
import { CoordinatorDashboard } from "./components/CoordinatorDashboard.js";
import { RoleViews } from "./components/RoleViews.js";
import { fetchHealth } from "./services/api.js";

const MainContent: React.FC = () => {
  const { currentUser, isAuthenticated, logout, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [apiStatus, setApiStatus] = useState<"connected" | "connecting" | "offline">("connecting");

  useEffect(() => {
    fetchHealth()
      .then(() => setApiStatus("connected"))
      .catch(() => setApiStatus("offline"));
  }, []);

  // If user is not authenticated, show the Login View
  if (!isAuthenticated || !currentUser) {
    return (
      <main className="main-content" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
        <LoginView onSuccess={() => {}} />
      </main>
    );
  }

  // 1. Dedicated Admin Dashboard (New Reference Layout: Dark-Green Sidebar + Topbar)
  if (currentUser.role === UserRole.ADMIN) {
    return (
      <AdminDashboard
        onSwitchToCoordinator={() => switchRole(UserRole.EXAM_COORDINATOR)}
        onLogout={logout}
      />
    );
  }

  // 2. Dedicated Exam Coordinator Dashboard (Matching Visual Design Reference)
  if (currentUser.role === UserRole.EXAM_COORDINATOR) {
    return (
      <CoordinatorDashboard
        onSwitchToAdmin={() => switchRole(UserRole.ADMIN)}
        onLogout={logout}
      />
    );
  }

  // Fallback for preserved teammate views (Student, Faculty, HOD)
  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiStatus={apiStatus}
        onShowLogin={() => {}}
      />
      <main className="main-content">
        <RoleViews role={currentUser.role} activeTab={activeTab} onTabChange={setActiveTab} />
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
