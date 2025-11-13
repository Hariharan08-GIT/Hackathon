import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import "./Registrations.css";

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchRegistrations = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view registrations");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("/api/registrations/my-events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setRegistrations(response.data);
        }
      } catch (err) {
        console.error("Error fetching registrations:", err);
        if (isMounted) {
          toast.error("Error fetching registrations. Please try again later.");
        }

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRegistrations();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const groupByEvent = () => {
    const grouped = {};
    registrations.forEach((reg) => {
      const eventId = reg.eventId?._id;
      if (!grouped[eventId]) {
        grouped[eventId] = {
          event: reg.eventId,
          registrations: [],
        };
      }
      grouped[eventId].registrations.push(reg);
    });
    return Object.values(grouped);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="registrations-page">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p>Loading registrations...</p>
          </div>
        </div>
      </>
    );
  }

  const groupedRegistrations = groupByEvent();

  return (
    <>
      <Navbar />
      <div className="registrations-page">
        <div className="registrations-container">
          <nav className="registrations-nav">
            <h2>Event Registrations</h2>
            <Link to="/events" className="back-link">
              ← Back to My Events
            </Link>
          </nav>

          {registrations.length === 0 ? (
            <div className="empty-state">
              <p>No registrations yet.</p>
              <p className="empty-subtitle">
                Registrations for your events will appear here.
              </p>
            </div>
          ) : (
            <div className="events-list">
              {groupedRegistrations.map((group) => (
                <div key={group.event._id} className="event-group">
                  <div className="event-header">
                    <h3>{group.event.title}</h3>
                    <div className="event-meta">
                      <span>
                        📅{" "}
                        {new Date(group.event.dateTime).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span>📍 {group.event.location}</span>
                      {group.event.isPaid && (
                        <span className="paid-badge">
                          💳 ${group.event.price}
                        </span>
                      )}
                      <span className="count-badge">
                        {group.registrations.length}{" "}
                        {group.registrations.length === 1
                          ? "Registration"
                          : "Registrations"}
                      </span>
                    </div>
                  </div>

                  <div className="registrations-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Tickets</th>
                          <th>Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.registrations.map((reg) => (
                          <tr key={reg._id}>
                            <td>{reg.name}</td>
                            <td>{reg.email}</td>
                            <td>{reg.tickets}</td>
                            <td>
                              {new Date(reg.registeredAt).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
