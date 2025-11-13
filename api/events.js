const mongoose = require("mongoose");
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

    // Extract the path and ID from URL
    const urlParts = req.url.replace("/api/events", "").split("?");
    const path = urlParts[0] || "/";
    const query = new URLSearchParams(urlParts[1] || "");

    // Extract ID if present (e.g., /123)
    const idMatch = path.match(/^\/([^\/]+)$/);
    const id = idMatch ? idMatch[1] : null;

    const userId = getUserIdFromToken(req);

    // Route: GET / - Get events
    if (req.method === "GET" && path === "/") {
      const showAll = query.get("all") === "true";

      let events;
      if (showAll) {
        events = await Event.find().sort({ dateTime: 1 });
      } else if (userId) {
        events = await Event.find({ userId }).sort({ dateTime: 1 });
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return res.json(events);
    }

    // Route: POST / - Create a new event
    if (req.method === "POST" && path === "/") {
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const {
        title,
        description,
        dateTime,
        reminder,
        location,
        isPaid,
        price,
      } = body;

      if (!title || !description || !location || !dateTime) {
        return res.status(400).json({
          message: "title, description, location, and dateTime are required",
        });
      }

      const dt = new Date(dateTime);
      if (Number.isNaN(dt.getTime())) {
        return res.status(400).json({ message: "Invalid dateTime" });
      }

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
      return res.status(201).json(saved);
    }

    // Route: PUT /:id - Update an event
    if (req.method === "PUT" && id) {
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const update = { ...body };
      if (update.dateTime) {
        const dt = new Date(update.dateTime);
        if (Number.isNaN(dt.getTime())) {
          return res.status(400).json({ message: "Invalid dateTime" });
        }
        update.dateTime = dt;
      }

      const event = await Event.findOneAndUpdate({ _id: id, userId }, update, {
        new: true,
      });

      if (!event) {
        return res
          .status(404)
          .json({ message: "Event not found or not authorized" });
      }

      return res.json(event);
    }

    // Route: DELETE /:id - Delete an event
    if (req.method === "DELETE" && id) {
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const event = await Event.findOneAndDelete({ _id: id, userId });

      if (!event) {
        return res
          .status(404)
          .json({ message: "Event not found or not authorized" });
      }

      return res.status(204).send();
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
