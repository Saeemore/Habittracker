const mongoose = require("mongoose");

const HabitCheckinSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    date: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false },
    note: { type: String }
  },
  { timestamps: true }
);

HabitCheckinSchema.index({ habitId: 1, date: 1 }, { unique: true });

const HabitCheckinModel = mongoose.model("HabitCheckin", HabitCheckinSchema);

module.exports = { HabitCheckinModel };
