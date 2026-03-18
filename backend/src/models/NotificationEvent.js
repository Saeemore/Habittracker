const mongoose = require("mongoose");

const NotificationEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit" },
    reminderId: { type: mongoose.Schema.Types.ObjectId, ref: "HabitReminder" },
    type: { type: String, required: true, enum: ["reminder", "achievement", "system"] },
    title: { type: String },
    body: { type: String },
    scheduledFor: { type: Date },
    sentAt: { type: Date },
    status: { type: String, required: true, enum: ["scheduled", "sent", "failed", "dismissed"] },
    providerMessageId: { type: String }
  },
  { timestamps: true }
);

NotificationEventSchema.index({ userId: 1, createdAt: -1 });
NotificationEventSchema.index({ status: 1, scheduledFor: 1 });

const NotificationEventModel = mongoose.model("NotificationEvent", NotificationEventSchema);

module.exports = { NotificationEventModel };
