// frontend/src/components/EventsPage.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./navbar";
import ConfirmDialog from "./ConfirmDialog";
import "react-toastify/dist/ReactToastify.css";
import "./EventsPage.css";

const EventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const hasShownErrorRef = useRef(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    eventId: null,
    eventTitle: "",
  });

  // Parse user to get name
  const userObj =
    typeof user === "string"
      ? (() => {
          try {
            return JSON.parse(user);
          } catch {
            return { username: user };
          }
        })()
      : user;
  const displayName = userObj?.name || userObj?.username || user;

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    if (!token) {
      if (!hasShownErrorRef.current) {
        toast.error("Please log in to view events");
        hasShownErrorRef.current = true;
      }
      navigate("/login");
      return;
    }

    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setEvents(response.data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError("Error fetching events");
          console.error("Error fetching events:", err);
          if (!hasShownErrorRef.current) {
            toast.error("Error fetching events. Please try again later.");
            hasShownErrorRef.current = true;
          }

          // If unauthorized, redirect to login
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }
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
  }, [user, navigate]);

  const handleEdit = (event) => {
    navigate("/create-event", { state: { eventToEdit: event } });
  };

  const handleDelete = (id, title = "") => {
    setConfirmDialog({
      open: true,
      eventId: id,
      eventTitle: title,
    });
  };

  const confirmDelete = async () => {
    const { eventId } = confirmDialog;
    setConfirmDialog({ open: false, eventId: null, eventTitle: "" });

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      toast.success("Event deleted successfully!");
      window.dispatchEvent(new Event("events-updated"));
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Failed to delete event. Please try again.");
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({ open: false, eventId: null, eventTitle: "" });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="events-page-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your events...</p>
          </div>
          <ToastContainer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="events-page-container">
        {events.length > 0 && (
          <div className="events-nav-buttons">
            <Link to="/" className="back-btn">
              ← Back to Home
            </Link>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link to="/create-event" className="add-event-btn">
                + Create New Event
              </Link>
            </div>
          </div>
        )}

        <div className="events-page-header">
          <h2>My Events</h2>
          <p className="events-page-subtitle">
            {displayName && `Welcome back, ${displayName}!`} Manage all your
            events in one place
          </p>
        </div>

        <div className="events-page-content">
          {error && <div className="error-message">{error}</div>}

          <div className="events-list-wrapper">
            <h2>Your Upcoming Events</h2>
            {events.length === 0 ? (
              <div className="no-events">
                <div className="no-events-icon">📅</div>
                <p style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                  No events yet!
                </p>
                <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
                  Get started by creating your first event
                </p>
                <Link to="/create-event" className="create-event-link">
                  ➕ Create Your First Event
                </Link>
              </div>
            ) : (
              <ul>
                {events.map((event) => (
                  <li key={event._id} className="event-item">
                    <h3>{event.title}</h3>
                    {event.description && <p>{event.description}</p>}
                    <p className="event-date">
                      {new Date(event.dateTime).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    {event.location && (
                      <p className="event-location">
                        <strong>Location:</strong> {event.location}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            event.location
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-map-btn"
                          style={{ marginLeft: 12 }}
                        >
                          View on Map
                        </a>
                      </p>
                    )}
                    {event.reminder && (
                      <p>
                        <strong>Reminder:</strong> {event.reminder}
                      </p>
                    )}
                    <div className="event-actions">
                      <button
                        onClick={() => handleEdit(event)}
                        className="edit-btn"
                      >
                        ✏️ Edit
                      </button>
                      {/* Free/Paid button — goes to event registration page */}
                      {event.isPaid ? (
                        <Link
                          to={`/events/${event._id}/register`}
                          state={{ event }}
                          className="paid-btn"
                          style={{
                            marginLeft: 8,
                            padding: "6px 8px",
                            textDecoration: "none",
                          }}
                        >
                          Paid{event.price ? ` ($${event.price})` : ""}
                        </Link>
                      ) : (
                        <Link
                          to={`/events/${event._id}/register`}
                          state={{ event }}
                          className="free-btn"
                          style={{
                            marginLeft: 8,
                            padding: "6px 8px",
                            textDecoration: "none",
                          }}
                        >
                          Free
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(event._id, event.title)}
                        className="delete-btn"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete Event"
        message={
          confirmDialog.eventTitle
            ? `Are you sure you want to delete "${confirmDialog.eventTitle}"? This action cannot be undone.`
            : "Are you sure you want to delete this event? This action cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default EventsPage;
