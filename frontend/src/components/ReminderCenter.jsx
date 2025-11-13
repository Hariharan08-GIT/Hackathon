import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import ReminderNotification from "./ReminderNotification";

const getReminderMs = (label) => {
  switch (label) {
    case "1 hour before":
      return 3600000;
    case "1 day before":
      return 86400000;
    case "1 week before":
      return 604800000;
    default:
      return 0;
  }
};

const ReminderCenter = () => {
  const { user } = useAuth();
  const [due, setDue] = useState([]);
  const timersRef = useRef({}); // eventId -> timeoutId

  const clearTimers = React.useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
  }, []);

  const scheduleForEvents = React.useCallback(
    (events) => {
      clearTimers();
      const now = Date.now();
      const seen = JSON.parse(localStorage.getItem("remindersShown") || "{}");
      const toShow = [];

      for (const ev of events) {
        const eventTime = new Date(ev.dateTime).getTime();
        if (!Number.isFinite(eventTime)) continue;

        const remindAt = eventTime - getReminderMs(ev.reminder);
        if (!Number.isFinite(remindAt)) continue;

        if (seen[ev._id]) continue;

        if (remindAt <= now) {
          // Already due: show immediately and mark as seen
          toShow.push(ev);
          seen[ev._id] = true;
        } else {
          // Schedule for the future
          timersRef.current[ev._id] = setTimeout(() => {
            setDue((prev) => [...prev, ev]);
            const seenNow = JSON.parse(
              localStorage.getItem("remindersShown") || "{}"
            );
            seenNow[ev._id] = true;
            localStorage.setItem("remindersShown", JSON.stringify(seenNow));
          }, remindAt - now);
        }
      }

      if (toShow.length) {
        setDue((prev) => [...prev, ...toShow]);
        localStorage.setItem("remindersShown", JSON.stringify(seen));
      }
    },
    [clearTimers]
  );

  const fetchAndSchedule = React.useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      scheduleForEvents(res.data || []);
    } catch (e) {
      console.error("ReminderCenter: failed to fetch events", e);
    }
  }, [scheduleForEvents]);

  useEffect(() => {
    if (!user) return;

    fetchAndSchedule();

    // Poll periodically to pick up changes
    const pollId = setInterval(fetchAndSchedule, 60000);

    // Listen for active changes (create/edit/delete)
    const handler = () => fetchAndSchedule();
    window.addEventListener("events-updated", handler);

    return () => {
      clearInterval(pollId);
      window.removeEventListener("events-updated", handler);
      clearTimers();
    };
  }, [user, fetchAndSchedule, clearTimers]);

  return (
    <>
      {due.map((ev) => (
        <ReminderNotification
          key={ev._id}
          title={ev.title}
          onClose={() => setDue((list) => list.filter((x) => x._id !== ev._id))}
        />
      ))}
    </>
  );
};

export default ReminderCenter;
