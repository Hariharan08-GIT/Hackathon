// frontend/src/components/EventForm.jsx
// If you still use this component anywhere, ensure it includes location and sends `dateTime` as ISO.
// It will also use the global ToastContainer from App.jsx instead of its own container.

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const EventForm = ({
  setEvents,
  events,
  editingEventId,
  setEditingEventId,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState("1 hour before");
  const [error, setError] = useState("");

  const handleSuccess = (message) => {
    toast.success(message, { autoClose: 3000 });
  };

  const handleError = (message) => {
    toast.error(message, { autoClose: 3000 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized");
      return;
    }

    const eventDateTime = new Date(`${date}T${time}`);
    if (isNaN(eventDateTime)) {
      handleError("Invalid date or time");
      return;
    }
    if (!location.trim()) {
      handleError("Location is required");
      return;
    }

    const payload = {
      title,
      description,
      location,
      dateTime: eventDateTime.toISOString(),
      reminder,
    };

    if (editingEventId) {
      try {
        const { data } = await axios.put(
          `http://localhost:5000/api/events/${editingEventId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents(events.map((ev) => (ev._id === editingEventId ? data : ev)));
        handleSuccess("Event successfully updated.");
        setError("");
      } catch (err) {
        handleError("Error updating event");
        console.error(err);
      }
    } else {
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/events",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents([...events, data]);
        handleSuccess("Event successfully created.");
        setError("");
      } catch (err) {
        handleError("Error creating event");
        console.error(err);
      }
    }

    setTitle("");
    setDescription("");
    setLocation("");
    setDate("");
    setTime("");
    setReminder("1 hour before");
    setEditingEventId(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editingEventId ? "Edit Event" : "Create Event"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Event Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />
      <div>
        <label>Reminder:</label>
        <select
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          required
        >
          <option value="1 hour before">1 hour before</option>
          <option value="1 day before">1 day before</option>
          <option value="1 week before">1 week before</option>
        </select>
      </div>
      <button type="submit">
        {editingEventId ? "Update Event" : "Create Event"}
      </button>
    </form>
  );
};

export default EventForm;
