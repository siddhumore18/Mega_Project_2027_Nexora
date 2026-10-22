import React from "react";
import { UserRole } from "@nexora/contracts";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { LoginView } from "./components/auth/LoginView.js";
import { AdminDashboard } from "./components/admin/AdminDashboard.js";
import { CoordinatorDashboard } from "./components/CoordinatorDashboard.js";
import { DepartmentCoordinatorDashboard } from "./components/department/DepartmentCoordinatorDashboard.js";
import { HODDashboard } from "./components/hod/HODDashboard.js";
import { FacultyDashboard } from "./components/faculty/FacultyDashboard.js";
import { StudentDashboard } from "./components/student/StudentDashboard.js";

const MainContent: React.FC = () => {
  const { currentUser, isAuthenticated, logout, switchRole } = useAuth();

  // If user is not authenticated, show the Login View
  if (!isAuthenticated || !currentUser) {
    return (
      <main className="main-content" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" }}>
        <LoginView onSuccess={() => {}} />
      </main>
    );
  }

  // 1. Dedicated Admin Dashboard (Unified .dash-shell Layout)
  if (currentUser.role === UserRole.ADMIN) {
    return (
      <AdminDashboard
        onSwitchToCoordinator={() => switchRole(UserRole.EXAM_COORDINATOR)}
        onLogout={logout}
      />
    );
  }

  // 2. Dedicated Exam Coordinator Dashboard (Unified .dash-shell Layout)
  if (currentUser.role === UserRole.EXAM_COORDINATOR) {
    return (
      <CoordinatorDashboard
        onSwitchToAdmin={() => switchRole(UserRole.ADMIN)}
        onLogout={logout}
      />
    );
  }

  // 3. Dedicated Departmental Coordinator Dashboard (Unified .dash-shell Layout)
  if (currentUser.role === UserRole.DEPARTMENTAL_COORDINATOR) {
    return (
      <DepartmentCoordinatorDashboard
        onSwitchToExamCoordinator={() => switchRole(UserRole.EXAM_COORDINATOR)}
        onLogout={logout}
      />
    );
  }

  // 4. Dedicated Head of Department (HOD) Dashboard (Unified .dash-shell Layout)
  if (currentUser.role === UserRole.HOD) {
    return (
      <HODDashboard
        onSwitchRole={switchRole}
        onLogout={logout}
      />
    );
  }

  // 5. Dedicated Faculty Dashboard (Unified .dash-shell Layout)
  if (currentUser.role === UserRole.FACULTY) {
    return (
      <FacultyDashboard
        onSwitchRole={switchRole}
        onLogout={logout}
      />
    );
  }

  // 6. Dedicated Student Dashboard (Unified .dash-shell Layout)
  return (
    <StudentDashboard
      onSwitchRole={switchRole}
      onLogout={logout}
    />
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
