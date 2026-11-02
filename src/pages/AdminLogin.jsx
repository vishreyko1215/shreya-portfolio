
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

     setSuccess("Login successful! Redirecting...");
navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/update-password`,
        });

      if (resetError) throw resetError;

      setSuccess(
        "If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder."
      );
    } catch (err) {
      setError(err.message || "Unable to send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f7f5f0",
        color: "#252525",
        fontFamily: "inherit",
      }}
    >
      <form
        onSubmit={forgotPassword ? handleForgotPassword : handleLogin}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "36px",
          background: "#ffffff",
          border: "1px solid #e5e1d9",
          borderRadius: "16px",
          boxSizing: "border-box",
        }}
      >
        <p style={{ fontSize: "12px", letterSpacing: "2px" }}>
          SHREYA'S PORTFOLIO
        </p>

        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
          {forgotPassword ? "Reset password" : "Admin login"}
        </h1>

        <p style={{ color: "#666", marginBottom: "28px" }}>
          {forgotPassword
            ? "Enter your admin email to receive a password reset link."
            : "Sign in to manage your projects."}
        </p>

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={inputStyle}
          placeholder="Your admin email"
        />

        {!forgotPassword && (
          <>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={inputStyle}
              placeholder="Your password"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#252525",
            color: "#ffffff",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Please wait..."
            : forgotPassword
              ? "Send reset link"
              : "Sign in"}
        </button>

        <button
          type="button"
          onClick={() => {
            setForgotPassword(!forgotPassword);
            setError("");
            setSuccess("");
          }}
          style={{
            display: "block",
            width: "100%",
            marginTop: "18px",
            padding: "4px",
            border: "none",
            background: "transparent",
            color: "#555",
            textDecoration: "underline",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          {forgotPassword ? "Back to admin login" : "Forgot password?"}
        </button>

        {error && (
          <p role="alert" style={{ color: "#b42318", marginTop: "16px" }}>
            {error}
          </p>
        )}

        {success && (
          <p role="status" style={{ color: "#167344", marginTop: "16px" }}>
            {success}
          </p>
        )}
      </form>
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #d5d0c8",
  borderRadius: "8px",
  background: "#fff",
  color: "#252525",
  font: "inherit",
};
