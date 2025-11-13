// frontend/src/components/CreateEvent.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./CreateEvent.css";

const toLocalInputValue = (dateLike) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const adjusted = new Date(d.getTime() - off * 60000);
  return adjusted.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventToEdit = location.state?.eventToEdit || null;
  const isEdit = useMemo(() => Boolean(eventToEdit?._id), [eventToEdit]);

  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    reminder: "1 hour before",
    dateTimeLocal: "",
    isPaid: false,
    price: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to create events");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (eventToEdit) {
      setForm({
        title: eventToEdit.title || "",
        location: eventToEdit.location || "",
        description: eventToEdit.description || "",
        reminder: eventToEdit.reminder || "1 hour before",
        dateTimeLocal: toLocalInputValue(eventToEdit.dateTime),
        isPaid: !!eventToEdit.isPaid,
        price: eventToEdit.price ? String(eventToEdit.price) : "",
      });
    }
  }, [eventToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleIsPaidChange = (val) => {
    setForm((prev) => ({ ...prev, isPaid: val, price: val ? prev.price : "" }));
  };

  const getApiError = (err, fallback = "Something went wrong") =>
    err?.response?.data?.message || err?.message || fallback;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.dateTimeLocal) {
      toast.error("Please choose a date & time");
      return;
    }
    if (!form.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (form.isPaid && (!form.price || Number(form.price) <= 0)) {
      toast.error("Please enter a valid price for paid events");
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to create events");
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      reminder: form.reminder,
      dateTime: new Date(form.dateTimeLocal).toISOString(), // backend requires `dateTime`
      isPaid: form.isPaid,
      price: form.isPaid ? Number(form.price) : 0,
    };

    try {
      if (isEdit) {
        await axios.put(`/api/events/${eventToEdit._id}`, payload, { headers });
        toast.success("✅ Event successfully updated!", {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
        });
      } else {
        await axios.post("/api/events", payload, {
          headers,
        });
        toast.success("✅ Event successfully created!", {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
        });
      }
      window.dispatchEvent(new Event("events-updated"));
      // Add delay to show notification before redirect
      setTimeout(() => navigate("/events"), 1600);
    } catch (err) {
      toast.error(
        getApiError(
          err,
          isEdit ? "Failed to update event" : "Failed to create event"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="create-event-container">
        <div className="create-event-card">
          <div className="create-event-header">
            <h2>{isEdit ? "Edit Event" : "Create Event"}</h2>
            <p>
              {isEdit
                ? "Update your event details below"
                : "Fill in the details to create a new event"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="title">Event Title</label>
              <input
                id="title"
                name="title"
                placeholder="Enter event title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateTimeLocal">Date & Time</label>
              <input
                id="dateTimeLocal"
                type="datetime-local"
                name="dateTimeLocal"
                value={form.dateTimeLocal}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                placeholder="Enter event location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter event description (optional)"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label
                  style={{ display: "flex", gap: 6, alignItems: "center" }}
                >
                  <input
                    type="radio"
                    name="isPaid"
                    checked={!form.isPaid}
                    onChange={() => handleIsPaidChange(false)}
                  />
                  <span>Free</span>
                </label>
                <label
                  style={{ display: "flex", gap: 6, alignItems: "center" }}
                >
                  <input
                    type="radio"
                    name="isPaid"
                    checked={form.isPaid}
                    onChange={() => handleIsPaidChange(true)}
                  />
                  <span>Paid</span>
                </label>
                {form.isPaid && (
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price (e.g., 9.99)"
                    value={form.price}
                    onChange={handleChange}
                    style={{ width: 140, padding: "6px 8px" }}
                  />
                )}
              </div>
            </div>

            <div className="reminder-group">
              <label htmlFor="reminder">Reminder:</label>
              <select
                id="reminder"
                name="reminder"
                value={form.reminder}
                onChange={handleChange}
              >
                <option value="1 hour before">1 hour before</option>
                <option value="1 day before">1 day before</option>
                <option value="1 week before">1 week before</option>
              </select>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting
                ? isEdit
                  ? "Saving"
                  : "Creating"
                : isEdit
                ? "Save Changes"
                : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
