import React from "react";
import "./Eventcard.css";
import herosection from "../assets/herosection.jpg";
import { Link } from "react-router-dom";

const EventCard = () => {
  return (
    <section className="food">
      <div className="hero-content">
        <h1>
          Book Events.
          <span className="bold-green">Create Memories.</span>
        </h1>
        <p>
          Plan, organize, and manage your events effortlessly. Whether it’s a
          wedding, conference, concert, or community gathering — our platform
          connects you with the best venues, services, and tools to make every
          event seamless and memorable. Join thousands of organizers simplifying
          their event management journey today.
        </p>

        <div className="hero-buttons">
          <Link to="Signup">
            <button className="btn-primary">Get Started</button>
          </Link>
          <Link to="Availableevents">
            <button className="btn-outline">View Available Events</button>
          </Link>
        </div>
      </div>

      <div className="hero-image">
        <img src={herosection} alt="hero" />
      </div>
    </section>
  );
};

export default EventCard;
