const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routes/auth");
const eventsRouter = require("./routes/events");
const registrationsRouter = require("./routes/registrations");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/local-events";

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter); // Add auth routes
app.use("/api/events", eventsRouter); // Add events routes
app.use("/api/registrations", registrationsRouter); // Add registrations routes

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });
