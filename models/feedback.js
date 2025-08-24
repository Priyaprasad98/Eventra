const feedbackSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  RegisteredStudent: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
  rating: { type: Number, min: 1, max: 5 },
  comments: String,
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Feedback", feedbackSchema);
