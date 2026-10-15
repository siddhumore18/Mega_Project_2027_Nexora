import React, { useState, useEffect } from "react";
import { UserRole } from "@nexora/contracts";
import { Header } from "./components/Header.js";
import { CoordinatorDashboard } from "./components/CoordinatorDashboard.js";
import { RoleViews } from "./components/RoleViews.js";

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.EXAM_COORDINATOR);
  const [apiStatus, setApiStatus] = useState<"connected" | "connecting" | "offline">("connecting");

  useEffect(() => {
    // Check health endpoint against backend
    fetch("/health")
      .then((res) => {
        if (res.ok) setApiStatus("connected");
        else setApiStatus("offline");
      })
      .catch(() => {
        // If not running dev proxy, we mark as offline
        setApiStatus("offline");
      });
  }, []);

  return (
    <div className="app-container">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
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
