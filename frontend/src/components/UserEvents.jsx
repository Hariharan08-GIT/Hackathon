// src/components/UserEvents.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import EventList from "./EventList";
import ConfirmDialog from "./ConfirmDialog";
import { useNotify } from "../hooks/useNotify";

const UserEvents = ({ events, setEvents }) => {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const { success, error: notifyError } = useNotify();

  const getApiError = (err, fallback = "Something went wrong") =>
    err?.response?.data?.message || err?.message || fallback;

  const handleEdit = (event) => {
    setEditingEvent(event);
  };

  const requestDelete = (id) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:5000/api/events/${pendingDeleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents((prev) =>
        prev.filter((event) => event._id !== pendingDeleteId)
      );
      success("Event deleted");
      window.dispatchEvent(new Event("events-updated")); // keep reminders in sync
    } catch (err) {
      notifyError(getApiError(err, "Failed to delete event"));
      // optional: console.error('Error deleting event:', err.response || err);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => setPendingDeleteId(null);

  // Save edits and show success/failure messages
  const saveEdit = async (partialUpdate) => {
    if (!editingEvent?._id) return;
    const token = localStorage.getItem("token");
    const payload = { ...editingEvent, ...partialUpdate };

    try {
      const res = await axios.put(
        `http://localhost:5000/api/events/${editingEvent._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prev) =>
        prev.map((e) => (e._id === editingEvent._id ? res.data : e))
      );
      success("Event updated ✅");
      window.dispatchEvent(new Event("events-updated"));
      setEditingEvent(null);
    } catch (err) {
      notifyError(getApiError(err, "Failed to update event"));
    }
  };

  const pendingTitle = events.find((e) => e._id === pendingDeleteId)?.title;

  return (
    <div>
      <h2>Your Events</h2>
      <EventList
        events={events}
        handleEdit={handleEdit}
        handleDelete={requestDelete}
      />

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

      <EditEventDialog
        open={!!editingEvent}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={saveEdit}
      />
    </div>
  );
};

export default UserEvents;

// Simple inline edit dialog without external UI libs
const EditEventDialog = ({ open, event, onClose, onSave }) => {
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
      });
    }
  }, [event]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 9998,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 8,
          width: "min(520px, 92vw)",
          boxShadow: "0 10px 30px rgba(0,0,0,.2)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Edit Event</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Title</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </label>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#eee",
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
