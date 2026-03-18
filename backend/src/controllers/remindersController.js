const mongoose = require("mongoose");

const { AppError } = require("../middleware/error");
const { HabitModel } = require("../models/Habit");
const { HabitReminderModel } = require("../models/HabitReminder");

async function listHabitReminders(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { habitId } = req.params;
  if (!mongoose.isValidObjectId(habitId)) throw new AppError("Invalid habit id", 400, "INVALID_ID");

  const habit = await HabitModel.findOne({ _id: habitId, userId: req.user.id }).select("_id");
  if (!habit) throw new AppError("Habit not found", 404, "NOT_FOUND");

  const reminders = await HabitReminderModel.find({ habitId }).sort({ createdAt: -1 });
  res.json({ reminders });
}

async function createHabitReminder(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { habitId } = req.params;
  if (!mongoose.isValidObjectId(habitId)) throw new AppError("Invalid habit id", 400, "INVALID_ID");

  const habit = await HabitModel.findOne({ _id: habitId, userId: req.user.id }).select("_id");
  if (!habit) throw new AppError("Habit not found", 404, "NOT_FOUND");

  const reminder = await HabitReminderModel.create({ ...req.body, habitId });
  res.status(201).json({ reminder });
}

async function ensureReminderOwnedByUser(reminderId, userId) {
  if (!mongoose.isValidObjectId(reminderId)) throw new AppError("Invalid reminder id", 400, "INVALID_ID");

  const reminder = await HabitReminderModel.findById(reminderId);
  if (!reminder) throw new AppError("Reminder not found", 404, "NOT_FOUND");

  const habit = await HabitModel.findOne({ _id: reminder.habitId, userId }).select("_id");
  if (!habit) throw new AppError("Reminder not found", 404, "NOT_FOUND");

  return reminder;
}

async function updateReminder(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { reminderId } = req.params;

  const reminder = await ensureReminderOwnedByUser(reminderId, req.user.id);
  Object.assign(reminder, req.body);
  await reminder.save();

  res.json({ reminder });
}

async function deleteReminder(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { reminderId } = req.params;

  const reminder = await ensureReminderOwnedByUser(reminderId, req.user.id);
  await reminder.deleteOne();

  res.json({ ok: true });
}

module.exports = { listHabitReminders, createHabitReminder, updateReminder, deleteReminder };
