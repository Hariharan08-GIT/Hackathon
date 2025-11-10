const express = require("express");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware to extract userId from the token
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
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

// Register for an event (public - no auth required)
router.post("/", async (req, res) => {
  const { eventId, name, email, tickets } = req.body;

  if (!eventId || !name || !email) {
    return res
      .status(400)
      .json({ message: "eventId, name, and email are required" });
  }

  try {
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const newRegistration = new Registration({
      eventId,
      name,
      email,
      tickets: tickets || 1,
    });

    const saved = await newRegistration.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all registrations for events created by the logged-in user (hosts only)
router.get("/my-events", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Find all events created by this user
    const userEvents = await Event.find({ userId });
    const eventIds = userEvents.map((e) => e._id);

    // Find all registrations for those events
    const registrations = await Registration.find({
      eventId: { $in: eventIds },
    }).populate("eventId", "title dateTime location isPaid price");

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get registrations for a specific event (event owner only)
router.get("/event/:eventId", async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { eventId } = req.params;

  try {
    // Verify the user owns this event
    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or not authorized" });
    }

    const registrations = await Registration.find({ eventId }).sort({
      registeredAt: -1,
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
