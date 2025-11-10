import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import "./Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("participant"); // Default to participant
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // The backend expects 'username' not 'email', and now also 'role' and 'name'
      await register(email, password, role, name);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Preselect role from query param if provided
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (roleParam === "participant" || roleParam === "host") {
      setRole(roleParam);
    }
  }, [location.search]);

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h2>Create Account</h2>
        <p>Join BookMyEvents to make a difference</p>
        <form onSubmit={handleSubmit}>
          <div className="role-selection">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="host"
                checked={role === "host"}
                onChange={(e) => setRole(e.target.value)}
              />
              <span className="role-label">
                <strong>🎯 Event Host</strong>
                <small>Create and manage events</small>
              </span>
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="participant"
                checked={role === "participant"}
                onChange={(e) => setRole(e.target.value)}
              />
              <span className="role-label">
                <strong>🎫 Participant</strong>
                <small>Browse and register for events</small>
              </span>
            </label>
          </div>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
