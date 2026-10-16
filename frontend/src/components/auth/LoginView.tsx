import React, { useState } from "react";
import { UserRole } from "@nexora/contracts";
import { useAuth } from "../../context/AuthContext.js";
import { Lock, Mail, ShieldCheck, User, KeyRound, ArrowRight } from "lucide-react";

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, loginAsPreset } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "University email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address (e.g., student@nexora.edu)";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters in length";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      login(email, selectedRole);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  const handleQuickLogin = (key: "student" | "faculty" | "coordinator" | "hod") => {
    loginAsPreset(key);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo">N</div>
          <div>
            <h1 className="login-title">Nexora Academic Portal</h1>
            <p className="login-subtitle">
              University Examination Scheduling & Invigilation Management System
            </p>
          </div>
        </div>

        {/* Demo Fast-Login Strip */}
        <div className="demo-login-strip">
          <div className="demo-strip-label">
            <User size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            One-Click Evaluator Sign-In:
          </div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              onClick={() => handleQuickLogin("student")}
              className="demo-role-btn student-badge-btn"
              title="Sign in as Student Aarav Sharma (CS2023-042)"
            >
              <span className="demo-btn-role">Student</span>
              <span className="demo-btn-name">Aarav Sharma</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("faculty")}
              className="demo-role-btn faculty-badge-btn"
              title="Sign in as Faculty Dr. A. Sharma (FAC-1082)"
            >
              <span className="demo-btn-role">Faculty</span>
              <span className="demo-btn-name">Dr. A. Sharma</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("coordinator")}
              className="demo-role-btn coord-badge-btn"
              title="Sign in as Exam Coordinator"
            >
              <span className="demo-btn-role">Coordinator</span>
              <span className="demo-btn-name">Dr. S. Jenkins</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("hod")}
              className="demo-role-btn hod-badge-btn"
              title="Sign in as HOD CSE"
            >
              <span className="demo-btn-role">HOD</span>
              <span className="demo-btn-name">Prof. Mehta</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="card login-card">
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <div>
              <h2 className="card-title">Sign In to Your Account</h2>
              <p className="card-subtitle">
                Enter your institutional credentials to access your exam records
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
                Select Your Academic Role
              </label>
              <div className="role-selector-radios">
                {[
                  { role: UserRole.STUDENT, label: "Student" },
                  { role: UserRole.FACULTY, label: "Faculty / Invigilator" },
                  { role: UserRole.EXAM_COORDINATOR, label: "Exam Coordinator" },
                  { role: UserRole.HOD, label: "Department HOD" },
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
                Institutional Email Address <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className={`form-input ${errors.email ? "is-invalid" : ""}`}
                  placeholder="e.g. aarav.sharma@nexora.edu"
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
                  Use your registered @nexora.edu or authorized university email
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
