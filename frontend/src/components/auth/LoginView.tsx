import React, { useState } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import { Lock, Mail, ShieldCheck, KeyRound, ArrowRight, Sparkles } from "lucide-react";

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
        setErrors({ email: "No account found. Use your @kit.edu email or Roll Number (e.g. CSE2025001)." });
      }
    }, 400);
  };

  const handleQuickLogin = (key: "coordinator" | "student" | "admin") => {
    loginAsPreset(key);
    if (onSuccess) onSuccess();
  };

  const handleFillCredentials = (demoEmail: string, role: UserRole) => {
    setEmail(demoEmail);
    setPassword("nexora2026");
    setSelectedRole(role);
    setErrors({});
  };

  return (
    <div className="login-wrapper">
      <div className="login-container" style={{ maxWidth: "560px" }}>
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
            N
          </div>
          <div>
            <h1 className="login-title" style={{ color: "#ffffff", margin: 0, fontSize: "22px", fontWeight: 800 }}>
              Nexora Academic Portal
            </h1>
            <p className="login-subtitle" style={{ color: "#94a3b8", margin: "3px 0 0", fontSize: "12.5px" }}>
              Autonomous Examination Scheduling, Seating & Invigilation Management
            </p>
          </div>
        </div>

        {/* 3 Dedicated Demo Login Cards */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "16px",
            marginBottom: "18px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <Sparkles size={14} color="#2563eb" />
              <span>One-Click Demo Sign-In (3 User Roles)</span>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Instant Evaluator Access</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {/* 1. Exam Coordinator */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "12px 10px",
                borderRadius: "8px",
                border: "1.5px solid #bfdbfe",
                background: "#f0f7ff",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase" }}>
                    Exam Cell
                  </span>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9.5px", fontWeight: 700 }}>
                    SJ
                  </div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Dr. Sarah Jenkins</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", lineHeight: "1.2" }}>
                  Exam Coordinator
                </div>
              </div>
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("coordinator")}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                  title="Log in directly as Exam Coordinator"
                >
                  <span>Sign In</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials("coordinator@nexora.edu", UserRole.EXAM_COORDINATOR)}
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: "10px", cursor: "pointer", padding: "2px" }}
                >
                  Fill Form
                </button>
              </div>
            </div>

            {/* 2. Student */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "12px 10px",
                borderRadius: "8px",
                border: "1.5px solid #bbf7d0",
                background: "#f0fdf4",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#15803d", textTransform: "uppercase" }}>
                    Student
                  </span>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9.5px", fontWeight: 700 }}>
                    AS
                  </div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Aarav Sharma</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", lineHeight: "1.2" }}>
                  B.Tech CSE (Sem VII)
                </div>
              </div>
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("student")}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                  title="Log in directly as Student Aarav Sharma"
                >
                  <span>Sign In</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials("aarav.sharma@nexora.edu", UserRole.STUDENT)}
                  style={{ background: "none", border: "none", color: "#16a34a", fontSize: "10px", cursor: "pointer", padding: "2px" }}
                >
                  Fill Form
                </button>
              </div>
            </div>

            {/* 3. System Administrator */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "12px 10px",
                borderRadius: "8px",
                border: "1.5px solid #ddd6fe",
                background: "#f5f3ff",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase" }}>
                    Administrator
                  </span>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9.5px", fontWeight: 700 }}>
                    SP
                  </div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Sanika Patil</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", lineHeight: "1.2" }}>
                  University Admin
                </div>
              </div>
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "#7c3aed",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                  title="Log in directly as System Administrator"
                >
                  <span>Sign In</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials("admin@nexora.edu", UserRole.ADMIN)}
                  style={{ background: "none", border: "none", color: "#7c3aed", fontSize: "10px", cursor: "pointer", padding: "2px" }}
                >
                  Fill Form
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="card login-card">
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <div>
              <h2 className="card-title">Institutional Account Login</h2>
              <p className="card-subtitle">
                Enter your university credentials or select one of the demo users above
              </p>
            </div>
            <div className="security-tag">
              <ShieldCheck size={14} />
              <span>SSO Verified</span>
            </div>
          </div>

          <form onSubmit={handleManualLogin} noValidate>
            {/* Role Target Selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="role-select">
                Target Academic Role
              </label>
              <div className="role-selector-radios" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { role: UserRole.EXAM_COORDINATOR, label: "Coordinator" },
                  { role: UserRole.STUDENT, label: "Student" },
                  { role: UserRole.ADMIN, label: "Administrator" },
                ].map((item) => (
                  <label
                    key={item.role}
                    className={`role-radio-item ${selectedRole === item.role ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={item.role}
                      checked={selectedRole === item.role}
                      onChange={() => setSelectedRole(item.role)}
                      className="sr-only"
                    />
                    <span className="role-radio-dot" />
                    <span className="role-radio-text">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email / Roll Number <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="text"
                  className={`form-input ${errors.email ? "is-invalid" : ""}`}
                  placeholder="e.g. aarav.sharma@kit.edu or CSE2025001"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email ? (
                <div id="email-error" className="form-error">
                  {errors.email}
                </div>
              ) : (
                <div className="form-hint">
                  Use your @kit.edu email or Roll Number (password = Roll Number)
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" htmlFor="login-password">
                  Password <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="link-subtle"
                  style={{ fontSize: "12px", border: "none", background: "none", cursor: "pointer" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${errors.password ? "is-invalid" : ""}`}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
              </div>
              {errors.password && (
                <div id="password-error" className="form-error">
                  {errors.password}
                </div>
              )}
              {!errors.password && (
                <div className="form-hint">
                  For students: your Roll Number is your password (e.g. CSE2025001)
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: "100%", padding: "11px", marginTop: "8px", fontSize: "14px" }}
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="login-security-footer">
            <KeyRound size={13} style={{ color: "var(--text-muted)" }} />
            <span>
              Authorized academic access only. All actions are logged and subject to audit policies.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
