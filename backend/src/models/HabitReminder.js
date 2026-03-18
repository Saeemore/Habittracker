const mongoose = require("mongoose");

const HabitReminderSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    timeOfDay: { type: String, required: true },
    timezone: { type: String },
    daysOfWeekMask: { type: Number, required: true },
    enabled: { type: Boolean, required: true, default: true },
    channel: { type: String, required: true, enum: ["in_app", "email", "push"] }
  },
  { timestamps: true }
);

const HabitReminderModel = mongoose.model("HabitReminder", HabitReminderSchema);

module.exports = { HabitReminderModel };
