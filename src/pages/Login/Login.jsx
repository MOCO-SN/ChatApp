import React, { useState } from "react";
import "./Login.css";
import { signup, login, resetPass } from "../../config/Firebase-temp";
import assets from "../../assets/assets";
import { toast } from "react-toastify";

const Login = () => {
  const [currState, setCurrState] = useState("Sign In"); // "Sign In", "Sign Up", or "Forgot Password"
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState("personal");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: "Weak", color: "#ef4444" };
    if (score === 2) return { score: 2, text: "Fair", color: "#f59e0b" };
    if (score === 3) return { score: 3, text: "Good", color: "#3b82f6" };
    return { score: 4, text: "Strong", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (currState === "Forgot Password") {
      if (!email.trim()) {
        toast.error("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        await resetPass(email.trim());
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currState === "Sign Up") {
      if (!userName.trim()) {
        toast.error("Please enter a username.");
        return;
      }
      if (userName.trim().length < 3) {
        toast.error("Username must be at least 3 characters.");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      if (!agreeTerms) {
        toast.error("Please agree to the Terms of Use and Privacy Policy.");
        return;
      }

      setLoading(true);
      const businessInfo = {
        companyName: companyName.trim(),
        industry: industry.trim(),
      };
      try {
        await signup(
          userName.toLowerCase().trim(),
          email.trim(),
          password,
          accountType,
          businessInfo
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      if (!email.trim() || !password) {
        toast.error("Please fill in all fields.");
        return;
      }
      setLoading(true);
      try {
        await login(email.trim(), password);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    try {
      await resetPass(email.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container login">
      {/* Background Decorative Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="auth-wrapper">
        {/* Left Side: Brand Showcase & Features */}
        <div className="auth-showcase">
          <div className="brand-header">
            <div className="brand-logo-wrap">
              <img src={assets.logo_icon || assets.logo} alt="Logo" className="brand-logo-img" />
            </div>
            <div>
              <h1 className="brand-title">MOCOSN CHAT</h1>
              <span className="brand-tagline">Secure • Real-Time • Intelligent</span>
            </div>
          </div>

          <div className="showcase-content">
            <h2 className="showcase-heading">
              Next-generation messaging designed for teams and individuals.
            </h2>
            <p className="showcase-desc">
              Experience end-to-end encrypted chats, lightning-fast sync, and tailored business
              collaboration tools with zero compromise on privacy.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <h4 className="feature-title">End-to-End Encryption</h4>
                  <p className="feature-text">Your private messages are strictly between you and your recipient.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div>
                  <h4 className="feature-title">Instant Real-Time Sync</h4>
                  <p className="feature-text">Live typing indicators, presence tracking, and immediate media dispatch.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <div>
                  <h4 className="feature-title">Personal & Business Spaces</h4>
                  <p className="feature-text">Dedicated profiles for personal conversations and verified company channels.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <div className="security-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              <span>Military-grade cryptographic encryption</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="auth-card">
          {currState !== "Forgot Password" ? (
            <>
              {/* Tab Switcher */}
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={currState === "Sign In"}
                  className={`tab-btn ${currState === "Sign In" ? "active" : ""}`}
                  onClick={() => setCurrState("Sign In")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={currState === "Sign Up"}
                  className={`tab-btn ${currState === "Sign Up" ? "active" : ""}`}
                  onClick={() => setCurrState("Sign Up")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                  <span>Create Account</span>
                </button>
              </div>

              {/* Form Header */}
              <div className="auth-header">
                <h2 className="auth-title">
                  {currState === "Sign In" ? "Welcome back" : "Get started today"}
                </h2>
                <p className="auth-subtitle">
                  {currState === "Sign In"
                    ? "Enter your credentials to access your secure messages."
                    : "Create an account in just a few seconds."}
                </p>
              </div>

              {/* Main Form */}
              <form className="auth-form" onSubmit={onSubmitHandler} noValidate>
                {currState === "Sign Up" && (
                  <>
                    {/* Account Type Selector */}
                    <div className="form-group">
                      <label className="input-label">Account Category</label>
                      <div className="account-type-grid">
                        <div
                          className={`account-card ${accountType === "personal" ? "active" : ""}`}
                          onClick={() => setAccountType("personal")}
                        >
                          <div className="account-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <div className="account-card-info">
                            <span className="account-card-name">Personal</span>
                            <span className="account-card-sub">For friends & family</span>
                          </div>
                          <div className="radio-dot"></div>
                        </div>

                        <div
                          className={`account-card ${accountType === "business" ? "active" : ""}`}
                          onClick={() => setAccountType("business")}
                        >
                          <div className="account-card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                              <path d="M9 22v-4h6v4"/>
                              <path d="M8 6h.01"/>
                              <path d="M16 6h.01"/>
                              <path d="M12 6h.01"/>
                              <path d="M12 10h.01"/>
                              <path d="M12 14h.01"/>
                              <path d="M16 10h.01"/>
                              <path d="M16 14h.01"/>
                              <path d="M8 10h.01"/>
                              <path d="M8 14h.01"/>
                            </svg>
                          </div>
                          <div className="account-card-info">
                            <span className="account-card-name">Business</span>
                            <span className="account-card-sub">For teams & orgs</span>
                          </div>
                          <div className="radio-dot"></div>
                        </div>
                      </div>
                    </div>

                    {/* Username Input */}
                    <div className="form-group">
                      <label className="input-label" htmlFor="username-input">
                        Username
                      </label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </span>
                        <input
                          id="username-input"
                          type="text"
                          autoComplete="username"
                          placeholder="e.g. alex_rivera"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="text-input"
                          required
                        />
                      </div>
                    </div>

                    {/* Business Fields */}
                    {accountType === "business" && (
                      <div className="business-fields-animate">
                        <div className="form-group">
                          <label className="input-label" htmlFor="company-input">Company Name</label>
                          <div className="input-wrapper">
                            <span className="input-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2"/>
                                <path d="M3 9h18"/>
                                <path d="M9 21V9"/>
                              </svg>
                            </span>
                            <input
                              id="company-input"
                              type="text"
                              placeholder="Acme Technologies Inc."
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="text-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="input-label" htmlFor="industry-input">Industry</label>
                          <div className="input-wrapper">
                            <span className="input-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                              </svg>
                            </span>
                            <input
                              id="industry-input"
                              type="text"
                              placeholder="e.g. Software, E-commerce, Healthcare"
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              className="text-input"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Email Address */}
                <div className="form-group">
                  <label className="input-label" htmlFor="email-input">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </span>
                    <input
                      id="email-input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-input"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <div className="label-row">
                    <label className="input-label" htmlFor="password-input">Password</label>
                    {currState === "Sign In" && (
                      <button
                        type="button"
                        className="forgot-link"
                        onClick={() => setCurrState("Forgot Password")}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      autoComplete={currState === "Sign Up" ? "new-password" : "current-password"}
                      placeholder={currState === "Sign Up" ? "At least 6 characters" : "••••••••"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-input with-toggle"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                          <line x1="2" y1="2" x2="22" y2="22"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter (Sign Up Only) */}
                  {currState === "Sign Up" && password.length > 0 && (
                    <div className="strength-meter">
                      <div className="strength-bar-bg">
                        <div
                          className="strength-bar-fill"
                          style={{
                            width: `${(passwordStrength.score / 4) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                      <span className="strength-label" style={{ color: passwordStrength.color }}>
                        {passwordStrength.text} password
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password (Sign Up Only) */}
                {currState === "Sign Up" && (
                  <div className="form-group">
                    <label className="input-label" htmlFor="confirm-password-input">Confirm Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </span>
                      <input
                        id="confirm-password-input"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="text-input with-toggle"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                            <line x1="2" y1="2" x2="22" y2="22"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="match-status">
                        {password === confirmPassword ? (
                          <span className="match-success">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Passwords match
                          </span>
                        ) : (
                          <span className="match-error">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Terms of Service Checkbox (Sign Up Only) */}
                {currState === "Sign Up" && (
                  <div className="terms-checkbox-wrap">
                    <label className="custom-checkbox-label">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required
                      />
                      <span className="checkmark"></span>
                      <span className="terms-text">
                        I agree to the{" "}
                        <button
                          type="button"
                          className="terms-link-btn"
                          onClick={() => setShowTermsModal(true)}
                        >
                          Terms of Use & Privacy Policy
                        </button>
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Action Button */}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="btn-loader">
                      <span className="spinner"></span>
                      <span>{currState === "Sign Up" ? "Creating Account..." : "Signing In..."}</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>{currState === "Sign Up" ? "Create Free Account" : "Sign In to Account"}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Bottom Switcher Footer */}
              <div className="auth-switch-footer">
                {currState === "Sign In" ? (
                  <p>
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      className="switch-state-btn"
                      onClick={() => setCurrState("Sign Up")}
                    >
                      Sign up for free
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="switch-state-btn"
                      onClick={() => setCurrState("Sign In")}
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Forgot Password Subview */
            <div className="forgot-password-view">
              <button
                type="button"
                className="back-btn"
                onClick={() => setCurrState("Sign In")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                <span>Back to Sign In</span>
              </button>

              <div className="forgot-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              <h2 className="auth-title">Reset Your Password</h2>
              <p className="auth-subtitle">
                Enter your registered email address and we&apos;ll send you instructions to reset your password.
              </p>

              <form onSubmit={handleResetPassword} className="auth-form" noValidate>
                <div className="form-group">
                  <label className="input-label" htmlFor="reset-email-input">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </span>
                    <input
                      id="reset-email-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="btn-loader">
                      <span className="spinner"></span>
                      <span>Sending Email...</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>Send Recovery Link</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Privacy Modal */}
      {showTermsModal && (
        <div className="modal-backdrop" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Terms of Use & Privacy Policy</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <h4>1. Data & Privacy Protection</h4>
              <p>
                MOCOSN CHAT utilizes client-side end-to-end encryption for peer-to-peer and group communications. Your private cryptographic keys remain on your local client and are never accessible to our servers.
              </p>
              <h4>2. Acceptable Use</h4>
              <p>
                Users agree not to utilize the service for unauthorized spam, malicious distribution of software, or harassment. Accounts found violating security guidelines will be subject to deactivation.
              </p>
              <h4>3. Business Accounts</h4>
              <p>
                Business account holders are responsible for maintaining accurate organization details and managing team permissions.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-accept-btn"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
              >
                Accept and Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
