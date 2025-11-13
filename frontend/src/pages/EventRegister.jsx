import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../components/navbar";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./EventRegister.css";

export default function EventRegister() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!event);
  const [form, setForm] = useState({ name: "", email: "", tickets: 0 });
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (event) return;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/events?all=true", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!isMounted) return;
        const found = res.data.find((e) => e._id === id);
        if (found) setEvent(found);
      } catch (err) {
        console.error("Failed to fetch event for registration", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [id, event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Save registration to backend
      await axios.post("/api/registrations", {
        eventId: id,
        name: form.name,
        email: form.email,
        tickets: Number(form.tickets) || 1,
      });

      toast.success("Successfully registered for the event!");

      // 🟢 Show another detailed notification (example)
      toast.info(
        `Thank you ${form.name}! You've registered ${
          form.tickets || 1
        } ticket(s) for "${event.title}".`,
        { autoClose: 3000 } // closes automatically after 3 seconds
      );

      // Mark as registered to show Pay Now button for paid events
      setIsRegistered(true);

      // For free events, redirect to Available Events after a delay
      if (!event.isPaid) {
        setTimeout(() => navigate("/Availableevents"), 2500);
      }
    } catch (err) {
      console.error("Registration failed", err);
      toast.error("Registration failed. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="event-register-page">
        <div className="register-container">
          <Link to="/Availableevents" className="back-to-events">
            ← Back to Events
          </Link>
          <div className="register-card">
            {loading ? (
              <p>Loading event...</p>
            ) : !event ? (
              <p>Event not found.</p>
            ) : (
              <>
                <div className="register-header">
                  <h2>Register: {event.title}</h2>
                  {event.isPaid && event.price && (
                    <p className="register-price">Price: ${event.price}</p>
                  )}
                  <p className="register-description">{event.description}</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                  <div className="form-row">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={isRegistered}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={isRegistered}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="tickets">Tickets</label>
                    <input
                      id="tickets"
                      name="tickets"
                      type="number"
                      min="0"
                      value={form.tickets}
                      onChange={handleChange}
                      disabled={isRegistered}
                    />
                  </div>
                  <div className="register-actions">
                    {!isRegistered ? (
                      <button type="submit" className="register-btn">
                        Register
                      </button>
                    ) : event.isPaid && event.price ? (
                      <button
                        type="button"
                        className="pay-btn"
                        onClick={() =>
                          navigate(`/events/${id}/pay`, {
                            state: {
                              event,
                              tickets: Number(form.tickets),
                            },
                          })
                        }
                      >
                        Pay Now ${event.price}
                      </button>
                    ) : null}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
