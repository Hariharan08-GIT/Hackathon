import React, { useState } from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show navbar on the home page, events page, and Availableevents
  if (!["/", "/events", "/Availableevents"].includes(location.pathname))
    return null;

  // Parse user object if it's a JSON string
  const userObj =
    typeof user === "string"
      ? (() => {
          try {
            return JSON.parse(user);
          } catch {
            return { username: user, role: "host" };
          }
        })()
      : user;

  const displayName = userObj?.name || userObj?.username || user;
  const userRole = userObj?.role || "host";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <span className="user-welcome">Welcome, {displayName}!</span>
            {userRole === "host" ? (
              // Hide the My Events / Registrations buttons when already on the Events page
              location.pathname !== "/events" ? (
                <>
                  <Link to="/events">
                    <button className="btn-nav">My Events</button>
                  </Link>
                  <Link to="/registrations">
                    <button className="btn-nav">Registrations</button>
                  </Link>
                </>
              ) : null
            ) : (
              <Link to="/Availableevents">
                <button className="btn-nav">Browse Events</button>
              </Link>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="btn-outline">Sign In</button>
            </Link>
            <Link to="/Signup">
              <button className="btn-primary">Sign Up</button>
            </Link>
          </>
        )}
      </div>

      <div
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;
