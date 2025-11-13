import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Import useAuth to access user context
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "./ConfirmDialog";
import { toast } from "react-toastify";

const EventManager = () => {
  const { user } = useAuth(); // Get the current logged-in user
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const navigate = useNavigate();

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Error fetching events");
        toast.error("Error fetching events. Please try again later.");
      }
    };

    fetchEvents();
  }, [navigate]);

  const requestDelete = (id) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/events/${pendingDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) =>
        prev.filter((event) => event._id !== pendingDeleteId)
      );
      toast.success("Event successfully deleted.");
      window.dispatchEvent(new Event("events-updated"));
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => setPendingDeleteId(null);
  const pendingTitle = events.find((e) => e._id === pendingDeleteId)?.title;

  return (
    <div>
      {user && <h2>Welcome, {user}!</h2>} {/* Welcome message */}
      <h3>Your Events</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {events.length === 0 ? (
          <li>No events found.</li>
        ) : (
          events.map((event) => (
            <li key={event._id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>
                {/* Format date and time */}
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
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
              )}
              <button onClick={() => requestDelete(event._id)}>Delete</button>
              <button
                onClick={() =>
                  navigate("/create-event", { state: { eventToEdit: event } })
                }
              >
                Edit
              </button>
            </li>
          ))
        )}
      </ul>
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this event?"
        message={`Are you sure you want to delete "${
          pendingTitle || "this event"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default EventManager;
