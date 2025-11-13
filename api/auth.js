const mongoose = require("mongoose");
const User = require("../backend/models/User");
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

    // Extract the path from the URL
    const path = req.url.replace("/api/auth", "");

    // Route: POST /register
    if (req.method === "POST" && path === "/register") {
      const { username, password, role, name } = body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = new User({
        username,
        name: name || username,
        password,
        role: role || "participant",
      });
      await newUser.save();
      return res.status(201).json({ message: "User registered" });
    }

    // Route: POST /login
    if (req.method === "POST" && path === "/login") {
      const { username, password } = body;

      const user = await User.findOne({ username });
      if (!user || !(await user.isValidPassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
      return res.json({
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
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
