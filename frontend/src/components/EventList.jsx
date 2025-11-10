// frontend/src/components/EventList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const EventList = ({ events, handleEdit, handleDelete }) => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>User Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event._id}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>
              {/* Format the date and time */}
              {new Date(event.dateTime).toLocaleString("en-US", {
                weekday: "long", // Day of the week (e.g., Monday)
                year: "numeric", // Full year (e.g., 2025)
                month: "long", // Full month name (e.g., November)
                day: "numeric", // Day of the month (e.g., 10)
                hour: "2-digit", // Two-digit hour (01-12)
                minute: "2-digit", // Two-digit minute (00-59)
                hour12: true, // 12-hour format
              })}
            </p>
            {event.location && (
              <p>
                <strong>Location:</strong> {event.location}{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    event.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: 8,
                    display: "inline-block",
                    padding: "6px 10px",
                    background: "linear-gradient(to right, #1976d2, #42a5f5)",
                    color: "white",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  View on Map
                </a>
              </p>
            )}{" "}
            {/* Show the location */}
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {event.isPaid ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/events/${event._id}/register`, {
                        state: { event },
                      })
                    }
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      background: "#ff7043",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    aria-label={`Register for paid event ${event.title}`}
                  >
                    Paid{event.price ? ` ($${event.price})` : ""}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/events/${event._id}/register`, {
                        state: { event },
                      })
                    }
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      background: "#43a047",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    aria-label={`Register for free event ${event.title}`}
                  >
                    Free
                  </button>
                )}
              </div>
            </div>
            <button onClick={() => handleEdit(event)}>Edit</button>
            <button onClick={() => handleDelete(event._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
