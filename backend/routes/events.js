// backend/routes/events.js
const express = require("express");
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware to extract userId from the token
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    return decoded.id;
  } catch {
    return null;
  }
};

// Get events - returns user's own events if authenticated, or all events if 'all=true' query param
router.get("/", async (req, res) => {
  const userId = getUserIdFromToken(req);
  const showAll = req.query.all === "true";

  try {
    let events;
    if (showAll) {
      // Return all events (for public view)
      events = await Event.find().sort({ dateTime: 1 });
    } else if (userId) {
      // If user is logged in, return only their events
      events = await Event.find({ userId }).sort({ dateTime: 1 });
    } else {
      // If not authenticated and not requesting all, return 401
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new event
router.post("/", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { title, description, dateTime, reminder, location, isPaid, price } =
    req.body;

  // Validate required fields for schema
  if (!title || !description || !location || !dateTime) {
    return res.status(400).json({
      message: "title, description, location, and dateTime are required",
    });
  }

  const dt = new Date(dateTime);
  if (Number.isNaN(dt.getTime())) {
    return res.status(400).json({ message: "Invalid dateTime" });
  }

  try {
    const newEvent = new Event({
      title,
      description,
      location,
      dateTime: dt,
      reminder: reminder || "1 hour before",
      isPaid: !!isPaid,
      price: isPaid ? Number(price) || 0 : 0,
      userId,
    });
    const saved = await newEvent.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an event
router.put("/:id", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // Coerce dateTime if present
  const update = { ...req.body };
  if (update.dateTime) {
    const dt = new Date(update.dateTime);
    if (Number.isNaN(dt.getTime())) {
      return res.status(400).json({ message: "Invalid dateTime" });
    }
    update.dateTime = dt;
  }

  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId },
      update,
      { new: true }
    );

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or not authorized" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an event
router.delete("/:id", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or not authorized" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
