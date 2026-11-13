import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@nexora/contracts";
import { KIT_STUDENTS_DATA } from "../data/kitStudentData.js";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  identifier: string; // Roll number or Employee ID
  designation?: string;
  avatarInitials: string;
}

export const PRESET_USERS: Record<string, UserProfile> = {
  student: {
    id: "usr-stu-001",
    name: "Aarav Sharma",
    email: "aarav.sharma@nexora.edu",
    role: UserRole.STUDENT,
    department: "Computer Science & Engineering",
    identifier: "CS2023-042",
    designation: "B.Tech CSE — Semester VII (Batch 2023-27)",
    avatarInitials: "AS",
  },
  faculty: {
    id: "usr-fac-101",
    name: "Dr. Arvind Sharma",
    email: "arvind.sharma@nexora.edu",
    role: UserRole.FACULTY,
    department: "Computer Science & Engineering",
    identifier: "FAC-1082",
    designation: "Associate Professor & Senior Invigilator",
    avatarInitials: "AS",
  },
  coordinator: {
    id: "usr-coord-001",
    name: "Dr. Sarah Jenkins",
    email: "coordinator@nexora.edu",
    role: UserRole.EXAM_COORDINATOR,
    department: "Central Examination Cell",
    identifier: "ADM-9021",
    designation: "Chief Controller of Examinations",
    avatarInitials: "SJ",
  },
  hod: {
    id: "usr-hod-002",
    name: "Prof. R. K. Mehta",
    email: "hod.cse@nexora.edu",
    role: UserRole.HOD,
    department: "Computer Science & Engineering",
    identifier: "HOD-4019",
    designation: "Head of Department, CSE",
    avatarInitials: "RM",
  },
  admin: {
    id: "usr-adm-001",
    name: "Sanika Patil",
    email: "admin@nexora.edu",
    role: UserRole.ADMIN,
    department: "Central University Administration",
    identifier: "SYS-ADMIN-01",
    designation: "Chief University Administrator",
    avatarInitials: "SP",
  },
  deptCoordinator: {
    id: "usr-dept-coord-01",
    name: "Prof. Rajesh Kulkarni",
    email: "coordinator.cse@nexora.edu",
    role: UserRole.DEPARTMENTAL_COORDINATOR,
    department: "Computer Science & Engineering",
    identifier: "FAC-1044",
    designation: "Associate Professor & Departmental Exam Coordinator",
    avatarInitials: "RK",
  },
};

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole, password?: string) => boolean;
  loginAsPreset: (key: "student" | "faculty" | "coordinator" | "hod" | "admin" | "deptCoordinator") => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Admin view per Sanika's workspace requirements, while persisting in localStorage
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("nexora_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Object.values(UserRole).includes(parsed.role)) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("nexora_auth_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("nexora_auth_user");
    }
  }, [currentUser]);

  const login = (email: string, role: UserRole = UserRole.STUDENT, password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // ── 1. Try matching any KIT student by email or roll number ──────────────
    // Password = roll number (case-insensitive) or the student's email itself
    const kitStudent = KIT_STUDENTS_DATA.find((s) => {
      const emailMatch = s.email.toLowerCase() === cleanEmail;
      const rollMatch  = s.rollNumber.toLowerCase() === cleanEmail; // allow login with roll as "email"
      return emailMatch || rollMatch;
    });

    if (kitStudent) {
      // Accept password = roll number (case-insensitive), or empty (demo mode)
      const rollLower = kitStudent.rollNumber.toLowerCase();
      const passOk =
        !cleanPassword ||
        cleanPassword.toLowerCase() === rollLower ||
        cleanPassword === kitStudent.email.toLowerCase();
      if (passOk) {
        const initials = kitStudent.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const semLabel =
          kitStudent.currentSemester === 1
            ? "I"
            : kitStudent.currentSemester === 3
            ? "III"
            : kitStudent.currentSemester === 5
            ? "V"
            : "VII";
        setCurrentUser({
          id: kitStudent.id,
          name: kitStudent.name,
          email: kitStudent.email,
          role: UserRole.STUDENT,
          department: kitStudent.departmentCode + " — B.Tech",
          identifier: kitStudent.rollNumber,
          designation: `B.Tech ${kitStudent.departmentCode} — Semester ${semLabel} (Div ${kitStudent.division})`,
          avatarInitials: initials,
        });
        return true;
      }
    }

    // ── 2. Demo role aliases ─────────────────────────────────────────────────
    if (cleanEmail === "coordinator@nexora.edu" || (role === UserRole.EXAM_COORDINATOR && cleanEmail.includes("coordinator"))) {
      setCurrentUser(PRESET_USERS.coordinator);
      return true;
    }
    if (cleanEmail === "student1@nexora.edu" || cleanEmail === "aarav.sharma@nexora.edu" || cleanEmail === "student@nexora.edu") {
      setCurrentUser(PRESET_USERS.student);
      return true;
    }
    if (cleanEmail === "admin@nexora.edu" || (role === UserRole.ADMIN && cleanEmail.includes("admin"))) {
      setCurrentUser(PRESET_USERS.admin);
      return true;
    }

    // ── 3. Any preset user exact email match ─────────────────────────────────
    const foundPreset = Object.values(PRESET_USERS).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (foundPreset) {
      setCurrentUser(foundPreset);
      return true;
    }

    // ── 4. Generic fallback (any @nexora.edu or @kit.edu address) ────────────
    const isKnownDomain = cleanEmail.endsWith("@nexora.edu") || cleanEmail.endsWith("@kit.edu");
    if (isKnownDomain) {
      setCurrentUser({
        id: `usr-${Date.now()}`,
        name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role,
        department: "Academic Sciences",
        identifier: role === UserRole.STUDENT ? "STU-9901" : "FAC-8801",
        avatarInitials: email.slice(0, 2).toUpperCase(),
      });
      return true;
    }

    return false; // reject unknown emails
  };

  const loginAsPreset = (key: "student" | "faculty" | "coordinator" | "hod" | "admin" | "deptCoordinator") => {
    if (PRESET_USERS[key]) {
      setCurrentUser(PRESET_USERS[key]);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    // Map to corresponding preset user for realistic role data
    if (role === UserRole.STUDENT) setCurrentUser(PRESET_USERS.student);
    else if (role === UserRole.FACULTY) setCurrentUser(PRESET_USERS.faculty);
    else if (role === UserRole.EXAM_COORDINATOR) setCurrentUser(PRESET_USERS.coordinator);
    else if (role === UserRole.DEPARTMENTAL_COORDINATOR) setCurrentUser(PRESET_USERS.deptCoordinator);
    else if (role === UserRole.HOD) setCurrentUser(PRESET_USERS.hod);
    else if (role === UserRole.ADMIN) setCurrentUser(PRESET_USERS.admin);
    else setCurrentUser({ ...currentUser, role });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginAsPreset,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
