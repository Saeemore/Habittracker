const mongoose = require("mongoose");

const HabitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    why: { type: String },
    endGoal: { type: String },
    category: { type: String },
    targetTime: { type: String },
    difficulty: { type: Number },
    active: { type: Boolean, required: true, default: true },
    currentStreak: { type: Number, required: true, default: 0 },
    longestStreak: { type: Number, required: true, default: 0 },
    lastCheckinDate: { type: String }
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1, name: 1 }, { unique: true });

const HabitModel = mongoose.model("Habit", HabitSchema);

module.exports = { HabitModel };
