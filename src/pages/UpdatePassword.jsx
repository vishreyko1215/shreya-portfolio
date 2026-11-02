import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleUpdatePassword(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error(
          "Your reset session is missing or has expired. Please request a new reset link."
        );
      }

      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Unable to update your password.");
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
        onSubmit={handleUpdatePassword}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "36px",
          background: "#fff",
          border: "1px solid #e5e1d9",
          borderRadius: "16px",
          boxSizing: "border-box",
        }}
      >
        <p style={{ fontSize: "12px", letterSpacing: "2px" }}>
          SHREYA'S PORTFOLIO
        </p>

        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
          Create a new password
        </h1>

        <p style={{ color: "#666", marginBottom: "28px" }}>
          Choose a new password for your admin account.
        </p>

        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          style={inputStyle}
          placeholder="At least 8 characters"
        />

        <label htmlFor="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
          style={inputStyle}
          placeholder="Enter it again"
        />

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
            color: "#fff",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Updating..." : "Update password"}
        </button>

        {error && (
          <p role="alert" style={{ color: "#b42318", marginTop: "16px" }}>
            {error}
          </p>
        )}

        
{success && (
  <div style={{ marginTop: "16px" }}>
    <p role="status" style={{ color: "#167344" }}>
      Password updated successfully!
    </p>

    <Link
      to="/admin"
      style={{
        display: "inline-block",
        marginTop: "8px",
        color: "#252525",
        textDecoration: "underline",
        fontWeight: "500",
      }}
    >
      ← Back to Admin Login
    </Link>
  </div>
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
