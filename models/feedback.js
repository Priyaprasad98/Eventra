const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Event", 
    required: true 
  },
  registeredStudentId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Registration", 
    required: true 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  comment: {
    type: String
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema); 
