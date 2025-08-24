
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Workshop", 
      "Seminar", 
      "Hackathon", 
      "Cultural", 
      "Sports", 
      "Fest", 
      "Tech", 
      "Finance", 
      "Fashion", 
      "Mass Media"
    ]
  },
  startDate: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  organizer: {
    type: String,
    required: true,
    trim: true
  },
  organizerContactNumber: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    default: 0
  },
  registrationDeadline: {
    type: Date
  },
  fee: {
    type: Number,
    default: 0
  },
  img: {
    type: String // file path if using multer
  },
  docs: {
    type: [String] // array of file paths for PDF/docs
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", eventSchema);
