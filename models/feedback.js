const feedbackSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5 },
  comments: String,
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);
