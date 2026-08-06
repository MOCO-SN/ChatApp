import React, { useState } from "react";
import "./Login.css";
import { signup, login } from "../../config/Firebase-temp";
const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("personal");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign Up") {
      const businessInfo = {
        companyName,
        industry,
      };
      signup(userName.toLowerCase().trim(), email, password, accountType, businessInfo);
    } else {
      login(email, password);
    }
  };
  return (
    <div className="login">
      <form className="login-form" onSubmit={onSubmitHandler}>
        <h2>{currState}</h2>
        {currState === "Sign Up" ? (
          <>
            <input
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
              type="text"
              placeholder="username"
              className="form-input"
              required
            />
            <div className="account-type-selector">
              <label className={`radio-label ${accountType === "personal" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="accountType"
                  value="personal"
                  checked={accountType === "personal"}
                  onChange={(e) => setAccountType(e.target.value)}
                />
                <span>Personal</span>
              </label>
              <label className={`radio-label ${accountType === "business" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="accountType"
                  value="business"
                  checked={accountType === "business"}
                  onChange={(e) => setAccountType(e.target.value)}
                />
                <span>Business</span>
              </label>
            </div>
            {accountType === "business" && (
              <>
                <input
                  onChange={(e) => setCompanyName(e.target.value)}
                  value={companyName}
                  type="text"
                  placeholder="Company Name"
                  className="form-input"
                  required={accountType === "business"}
                />
                <input
                  onChange={(e) => setIndustry(e.target.value)}
                  value={industry}
                  type="text"
                  placeholder="Industry (e.g., E-commerce, Healthcare)"
                  className="form-input"
                  required={accountType === "business"}
                />
              </>
            )}
          </>
        ) : null}
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email Address"
          className="form-input"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="password"
          className="form-input"
          required
        />
        <button type="submit">
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>
        <div className="login-term">
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className="login-forgot">
          <p className="login-toggle">
            Already have an Account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
