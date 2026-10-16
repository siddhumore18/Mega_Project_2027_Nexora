import React, { useState, useEffect } from "react";
import { UserRole } from "@nexora/contracts";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { Navbar } from "./components/navigation/Navbar.js";
import { LoginView } from "./components/auth/LoginView.js";
import { CoordinatorDashboard } from "./components/CoordinatorDashboard.js";
import { RoleViews } from "./components/RoleViews.js";
import { fetchHealth } from "./services/api.js";

const MainContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("timetable");
  const [apiStatus, setApiStatus] = useState<"connected" | "connecting" | "offline">("connecting");

  useEffect(() => {
    fetchHealth()
      .then(() => setApiStatus("connected"))
      .catch(() => setApiStatus("offline"));
  }, []);

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
