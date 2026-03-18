const mongoose = require("mongoose");

const { AppError } = require("../middleware/error");
const { HabitModel } = require("../models/Habit");
const { HabitCheckinModel } = require("../models/HabitCheckin");
const { HabitReminderModel } = require("../models/HabitReminder");

async function listHabits(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const habits = await HabitModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ habits });
}

async function createHabit(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const habit = await HabitModel.create({ ...req.body, userId: req.user.id });
  res.status(201).json({ habit });
}

async function updateHabit(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { habitId } = req.params;
  if (!mongoose.isValidObjectId(habitId)) throw new AppError("Invalid habit id", 400, "INVALID_ID");

  const habit = await HabitModel.findOneAndUpdate(
    { _id: habitId, userId: req.user.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!habit) throw new AppError("Habit not found", 404, "NOT_FOUND");
  res.json({ habit });
}

async function deleteHabit(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { habitId } = req.params;
  if (!mongoose.isValidObjectId(habitId)) throw new AppError("Invalid habit id", 400, "INVALID_ID");

  const habit = await HabitModel.findOneAndDelete({ _id: habitId, userId: req.user.id });
  if (!habit) throw new AppError("Habit not found", 404, "NOT_FOUND");

  await Promise.all([HabitCheckinModel.deleteMany({ habitId }), HabitReminderModel.deleteMany({ habitId })]);
  res.json({ ok: true });
}

module.exports = { listHabits, createHabit, updateHabit, deleteHabit };
