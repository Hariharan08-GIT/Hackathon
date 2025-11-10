// src/context/NotificationContext.jsx
import React, { useCallback, useState } from "react";
import { NotificationContext } from "./NotificationContextValue";

export const NotificationProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const push = useCallback(
    (type, message, options = {}) => {
      const id = options.id || `${Date.now()}-${Math.random()}`;
      const duration = options.duration ?? 3500;
      setItems((prev) => [...prev, { id, type, message }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = {
    success: (m, o) => push("success", m, o),
    error: (m, o) => push("error", m, o),
    info: (m, o) => push("info", m, o),
    dismiss,
  };

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <ToastContainer items={items} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

const ToastContainer = ({ items, onDismiss }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
      }}
    >
      {items.map((item) => (
        <Toast key={item.id} {...item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </div>
  );
};

const Toast = ({ type, message, onDismiss }) => {
  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    info: "#2563eb",
  };
  return (
    <div
      role="alert"
      style={{
        background: colors[type] || "#374151",
        color: "#fff",
        minWidth: 260,
        maxWidth: 420,
        padding: "10px 12px",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ lineHeight: 1.35 }}>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
};
