import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Availableevents from "./pages/Availableevents";
import CreateEvent from "./components/CreateEvent";
import EventManager from "./components/EventManager";
import EventsPage from "./components/EventsPage";
import EventRegister from "./pages/EventRegister";
import Registrations from "./pages/Registrations";
import NotFound from "./components/NotFound";
import PaymentApps from "./pages/PaymentApps";
import ReminderCenter from "./components/ReminderCenter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ReminderCenter />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Availableevents" element={<Availableevents />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event-manager" element={<EventManager />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id/register" element={<EventRegister />} />
          <Route path="/events/:id/pay" element={<PaymentApps />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </NotificationProvider>
    </AuthProvider>
  );
}
