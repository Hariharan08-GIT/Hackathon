const mongoose = require("mongoose");
const Registration = require("../backend/models/Registration");
const Event = require("../backend/models/Event");
const jwt = require("jsonwebtoken");

// MongoDB Connection with caching
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const MONGO_URI = process.env.MONGODB_URI;

  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    });
  }

  cachedDb = mongoose.connection;
  return cachedDb;
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Helper to extract userId from token
const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

// Export handler for Vercel
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    // Parse request body if it's JSON
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Body is not JSON
      }
    }

    // Extract the path from URL
    const urlParts = req.url.replace("/api/registrations", "").split("?");
    const path = urlParts[0] || "/";

    // Extract eventId if present (e.g., /event/123)
    const eventMatch = path.match(/^\/event\/([^\/]+)$/);
    const eventId = eventMatch ? eventMatch[1] : null;

    const userId = getUserIdFromToken(req);

    // Route: POST / - Register for an event (public)
    if (req.method === "POST" && path === "/") {
      const { eventId, name, email, tickets } = body;

      if (!eventId || !name || !email) {
        return res
          .status(400)
          .json({ message: "eventId, name, and email are required" });
      }

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
      return res.status(201).json(saved);
    }

    // Route: GET /my-events - Get registrations for user's events
    if (req.method === "GET" && path === "/my-events") {
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // Find all events created by this user
      const userEvents = await Event.find({ userId });
      const eventIds = userEvents.map((e) => e._id);

      // Find all registrations for those events
      const registrations = await Registration.find({
        eventId: { $in: eventIds },
      }).populate("eventId", "title dateTime location isPaid price");

      return res.json(registrations);
    }

    // Route: GET /event/:eventId - Get registrations for specific event
    if (req.method === "GET" && eventId) {
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

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
      return res.json(registrations);
    }

    // No matching route
    return res.status(404).json({ message: "Route not found" });
  } catch (error) {
    console.error("API Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
