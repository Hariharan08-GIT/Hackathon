import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";
import "./PaymentApps.css";

const APPS = [
  { name: "PayPal", color: "#00457C", url: "https://www.paypal.com/" },
  { name: "Stripe", color: "#635bff", url: "https://stripe.com/" },
  { name: "Google Pay", color: "#1a73e8", url: "https://pay.google.com/" },
  {
    name: "Apple Pay",
    color: "#000000",
    url: "https://www.apple.com/apple-pay/",
  },
  { name: "PhonePe", color: "#5f259f", url: "https://www.phonepe.com/" },
  { name: "Paytm", color: "#203562", url: "https://paytm.com/" },
  { name: "Razorpay", color: "#0c2048", url: "https://razorpay.com/" },
];

export default function PaymentApps() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const event = state?.event;
  const tickets = state?.tickets ?? 0;

  return (
    <>
      <Navbar />
      <div className="payment-apps-page">
        <div className="payment-apps-container">
          <Link
            to={`/events/${event?._id || ""}/register`}
            className="back-link"
          >
            ← Back to Register
          </Link>
          <div className="payment-header">
            <h2>Select a Payment App</h2>
            {event ? (
              <p className="payment-subtitle">
                Paying for <strong>{event.title}</strong>{" "}
                {tickets > 0 && `| Tickets: ${tickets}`}{" "}
                {event.price && `| Price: $${event.price}`}
              </p>
            ) : (
              <p className="payment-subtitle">
                Event details missing. Continue anyway.
              </p>
            )}
          </div>
          <div className="apps-grid">
            {APPS.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="app-card"
                style={{ "--app-color": app.color }}
              >
                <div className="app-icon" style={{ background: app.color }}>
                  {app.name[0]}
                </div>
                <div className="app-info">
                  <h3>{app.name}</h3>
                  <p>Open {app.name} to complete payment</p>
                </div>
              </a>
            ))}
          </div>
          <div className="payment-footer">
            <button
              onClick={() => navigate("/Availableevents")}
              className="finish-btn"
            >
              Done / Return to Events
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
