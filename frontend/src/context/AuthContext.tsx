import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@nexora/contracts";

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
};

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  loginAsPreset: (key: "student" | "faculty" | "coordinator" | "hod") => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to student view for evaluating User 1 responsibility, while persisting in localStorage
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem("nexora_auth_user");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return PRESET_USERS.student;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("nexora_auth_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("nexora_auth_user");
    }
  }, [currentUser]);

  const login = (email: string, role: UserRole = UserRole.STUDENT): boolean => {
    // Check if email matches any preset
    const foundPreset = Object.values(PRESET_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (foundPreset) {
      setCurrentUser(foundPreset);
      return true;
    }

    // Generic fallback user based on role
    const genericUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role,
      department: "Academic Sciences",
      identifier: role === UserRole.STUDENT ? "STU-9901" : "FAC-8801",
      avatarInitials: email.slice(0, 2).toUpperCase(),
    };
    setCurrentUser(genericUser);
    return true;
  };

  const loginAsPreset = (key: "student" | "faculty" | "coordinator" | "hod") => {
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
    else if (role === UserRole.HOD) setCurrentUser(PRESET_USERS.hod);
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
