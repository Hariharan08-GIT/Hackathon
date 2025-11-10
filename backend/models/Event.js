// models/Event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dateTime: { type: Date, required: true },
  location: { type: String, required: true },
  reminder: { type: String, default: "1 hour before" }, // Optional Reminder field
  // New fields to support free/paid events
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Event", eventSchema);
