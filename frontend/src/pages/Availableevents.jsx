import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import "./Availableevents.css";

export default function Availableevents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasShownErrorRef = useRef(false);

  // Get user info
  const userStr = localStorage.getItem("user");
  const user = userStr
    ? (() => {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      })()
    : null;
  const isParticipant = user?.role === "participant";

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      const token = localStorage.getItem("token");

      try {
        // Fetch all events with ?all=true query parameter
        const response = await axios.get("/api/events?all=true", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (isMounted) {
          setEvents(response.data);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        if (isMounted && !hasShownErrorRef.current) {
          toast.error("Error fetching events. Please try again later.");
          hasShownErrorRef.current = true;
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const getTimeLeft = (dateTime) => {
    const eventDate = new Date(dateTime);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Event passed";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days left`;
  };

  const handleJoinEvent = (eventId, event) => {
    // Require logged-in participant to register
    const token = localStorage.getItem("token");

    if (!token) {
      toast.info(
        "Please create or log in with a participant account to register",
        {
          position: "top-center",
          autoClose: 2000,
        }
      );
      // Redirect to signup with participant preselected
      setTimeout(() => navigate("/Signup?role=participant"), 2000);
      return;
    }

    if (!isParticipant) {
      toast.error(
        "You must be logged in with a participant account to register.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      return;
    }

    navigate(`/events/${eventId}/register`, { state: { event } });
  };

  const handleCreateEvent = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.info("Please log in to create events", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    navigate("/create-event");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="available-events-page">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p>Loading events...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="available-events-page">
        <nav className="events-nav">
          <h2>Available Events</h2>
          {isParticipant && (
            <p style={{ color: "#666", fontSize: "1rem", margin: "0.5rem 0" }}>
              🎫 Browse and register for events
            </p>
          )}
          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </nav>

        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              No events available at the moment.
            </p>
            <button
              onClick={handleCreateEvent}
              style={{
                display: "inline-block",
                marginTop: "1rem",
                padding: "0.8rem 1.5rem",
                background: "linear-gradient(to right, #1976d2, #42a5f5)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="events-card">
                <h3>{event.title}</h3>

                {event.description && (
                  <p
                    style={{
                      marginTop: "0.5rem",
                      marginBottom: "1rem",
                      fontSize: "0.95rem",
                      color: "#666",
                      lineHeight: "1.5",
                    }}
                  >
                    {event.description}
                  </p>
                )}

                <p>
                  <strong>📍 Location:</strong> {event.location}
                  {event.location && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        event.location
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginLeft: 8,
                        color: "#1976d2",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      View Map
                    </a>
                  )}
                </p>

                <p>
                  <strong>📅 Date:</strong>{" "}
                  {new Date(event.dateTime).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                <p>
                  <strong>⏰ Time:</strong>{" "}
                  {new Date(event.dateTime).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>

                <p className="time-left">
                  <strong>⏳ Time Left:</strong> {getTimeLeft(event.dateTime)}
                </p>

                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  {event.isPaid ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        background: "#ff7043",
                        color: "white",
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      💳 Paid{event.price ? ` - $${event.price}` : ""}
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        background: "#43a047",
                        color: "white",
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      ✨ Free Event
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleJoinEvent(event._id, event)}
                  className="join-btn"
                >
                  Register Now →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
}
