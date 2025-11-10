import React, { useEffect, useRef } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const dialogStyle = {
  background: "#fff",
  borderRadius: 8,
  width: "min(90vw, 420px)",
  maxWidth: 420,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  padding: "20px",
};

const headerStyle = { margin: 0, fontSize: "1.1rem", fontWeight: 600 };
const bodyStyle = { marginTop: 10, color: "#444" };
const footerStyle = {
  marginTop: 20,
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
};

const buttonDanger = {
  background: "#d32f2f",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};
const buttonSecondary = {
  background: "#eee",
  color: "#333",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onCancel?.();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };

  return (
    <div
      style={overlayStyle}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={dialogStyle}
      >
        <h3 id="confirm-dialog-title" style={headerStyle}>
          {title}
        </h3>
        <div style={bodyStyle}>{message}</div>
        <div style={footerStyle}>
          <button type="button" style={buttonSecondary} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            ref={confirmRef}
            style={buttonDanger}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
