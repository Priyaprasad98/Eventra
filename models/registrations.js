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
  }
});
registrationSchema.index({ eventId: 1, studentEmail: 1 }, { unique: true });
module.exports = mongoose.model("Registration",registrationSchema );
