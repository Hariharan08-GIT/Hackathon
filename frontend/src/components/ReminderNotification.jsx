// frontend/src/components/ReminderNotification.jsx

import React from "react";

const ReminderNotification = ({ title, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "180px",
        right: "20px",
        backgroundColor: "yellow",
        padding: "15px",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
        zIndex: 1000,
        borderRadius: "5px",
      }}
    >
      <p>{title} is starting soon!</p>
      <button onClick={onClose}>Dismiss</button>
    </div>
  );
};

export default ReminderNotification;
