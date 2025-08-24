const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  studentName: {
    type: String,
    required: true
  },  
  studentEmail: {
   type: String,
   required: true
  }, 
  studentPhoneNo: {
   type: Number,
   required: true
  }, 
  studentDepartment: {
   type: String,
   required: true
  }, 
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
  isFeedbackSubmitted: {
    type: Boolean,
    default: false  
  }
});
registrationSchema.index({ eventId: 1, studentEmail: 1 }, { unique: true });//First, MongoDB groups by eventId. Inside each eventId, it orders the emails alphabetically.
module.exports = mongoose.model("Registration",registrationSchema );
