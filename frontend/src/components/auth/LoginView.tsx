import React, { useState } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import { Lock, Mail, ShieldCheck, ArrowRight, UserCheck, GraduationCap, Shield } from "lucide-react";

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, loginAsPreset } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.EXAM_COORDINATOR);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "University email or Roll Number is required" });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ok = login(email, selectedRole, password);
      setIsSubmitting(false);
      if (ok) {
        if (onSuccess) onSuccess();
      } else {
        setErrors({ email: "Account not found. Use @kit.edu email or Roll Number (e.g. CSE2025001)." });
      }
    }, 400);
  };

  const handleQuickLogin = (key: "coordinator" | "student" | "admin") => {
    loginAsPreset(key);
    if (onSuccess) onSuccess();
  };

  return (
    <div style={{ width: "100%", maxWidth: "440px", margin: "0 auto", padding: "20px 16px" }}>
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 16px rgba(37,99,235,0.25)",
            marginBottom: "12px",
          }}
        >
          N
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
          Nexora Academic Portal
        </h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>
          Kolhapur Institute of Technology&apos;s College of Engineering
        </p>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "28px 24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Quick Demo Switcher Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
            Instant Demo Sign-In
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("coordinator")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "10px 8px",
                borderRadius: "10px",
                border: "1px solid #bfdbfe",
                background: "#f0f7ff",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <UserCheck size={16} color="#2563eb" />
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e40af" }}>Coordinator</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Exam Cell</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("student")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "10px 8px",
                borderRadius: "10px",
                border: "1px solid #bbf7d0",
                background: "#f0fdf4",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <GraduationCap size={16} color="#16a34a" />
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#15803d" }}>Student</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Aarav (Sem 7)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "10px 8px",
                borderRadius: "10px",
                border: "1px solid #ddd6fe",
                background: "#f5f3ff",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Shield size={16} color="#7c3aed" />
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#6d28d9" }}>Admin</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>University</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "20px 0 18px", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          <span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 600 }}>OR ENTER CREDENTIALS</span>
          <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleManualLogin} noValidate>
          {/* Role Pill Selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Academic Role
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
              {[
                { role: UserRole.EXAM_COORDINATOR, label: "Coordinator" },
                { role: UserRole.STUDENT, label: "Student" },
                { role: UserRole.ADMIN, label: "Admin" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.role}
                  onClick={() => setSelectedRole(item.role)}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "none",
                    background: selectedRole === item.role ? "#ffffff" : "transparent",
                    color: selectedRole === item.role ? "#2563eb" : "#64748b",
                    fontWeight: selectedRole === item.role ? 700 : 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: selectedRole === item.role ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email / Roll Number */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Email or Roll Number <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="e.g. aarav.sharma@kit.edu or CSE2025001"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "8px",
                  border: errors.email ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                  background: "#ffffff",
                  color: "#0f172a",
                }}
              />
            </div>
            {errors.email ? (
              <div style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "4px" }}>{errors.email}</div>
            ) : (
              <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>
                For students: Use your @kit.edu email or Roll Number
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: "11.5px", cursor: "pointer", padding: 0 }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "8px",
                  border: errors.password ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                  background: "#ffffff",
                  color: "#0f172a",
                }}
              />
            </div>
            {errors.password ? (
              <div style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "4px" }}>{errors.password}</div>
            ) : (
              <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>
                Students: Your Roll Number is your password (e.g. CSE2025001)
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              transition: "background 0.15s ease",
            }}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Security Tag */}
        <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#64748b", fontSize: "11.5px" }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>SSO Secured • KITCoEK Autonomous Academic ERP</span>
        </div>
      </div>
    </div>
  );
};
