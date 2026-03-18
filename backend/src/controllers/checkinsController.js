const mongoose = require("mongoose");

const { AppError } = require("../middleware/error");
const { HabitModel } = require("../models/Habit");
const { HabitCheckinModel } = require("../models/HabitCheckin");

function dateToDayNumber(date) {
  const [y, m, d] = date.split("-").map((n) => Number(n));
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

function computeStreaks(completedDatesDesc) {
  if (completedDatesDesc.length === 0) return { current: 0, longest: 0, lastDate: undefined };

  const dayNums = completedDatesDesc.map(dateToDayNumber);
  const daySet = new Set(dayNums);

  let longest = 0;
  for (const day of daySet) {
    if (daySet.has(day - 1)) continue;
    let run = 1;
    while (daySet.has(day + run)) run += 1;
    longest = Math.max(longest, run);
  }

  let current = 1;
  let prev = dayNums[0];
  for (let i = 1; i < dayNums.length; i += 1) {
    if (prev - dayNums[i] === 1) {
      current += 1;
      prev = dayNums[i];
    } else {
      break;
    }
  }

  return { current, longest, lastDate: completedDatesDesc[0] };
}

async function upsertCheckin(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { habitId } = req.params;
  if (!mongoose.isValidObjectId(habitId)) throw new AppError("Invalid habit id", 400, "INVALID_ID");

  const habit = await HabitModel.findOne({ _id: habitId, userId: req.user.id });
  if (!habit) throw new AppError("Habit not found", 404, "NOT_FOUND");

  const { date, completed, note } = req.body;

  const checkin = await HabitCheckinModel.findOneAndUpdate(
    { habitId, date },
    { $set: { completed, note } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  const completedDates = await HabitCheckinModel.find({ habitId, completed: true })
    .select("date -_id")
    .sort({ date: -1 })
    .limit(2000);

  const datesDesc = completedDates.map((d) => d.date);
  const { current, longest, lastDate } = computeStreaks(datesDesc);

  habit.currentStreak = current;
  habit.longestStreak = longest;
  habit.lastCheckinDate = lastDate;
  await habit.save();

  res.status(201).json({ checkin, habit });
}

async function listCheckins(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { habitId } = req.params;
  if (!mongoose.isValidObjectId(habitId)) throw new AppError("Invalid habit id", 400, "INVALID_ID");

  const habit = await HabitModel.findOne({ _id: habitId, userId: req.user.id }).select("_id");
  if (!habit) throw new AppError("Habit not found", 404, "NOT_FOUND");

  const { from, to } = req.query;
  const dateQuery = {};
  if (from) dateQuery.$gte = from;
  if (to) dateQuery.$lte = to;

  const query = { habitId };
  if (from || to) query.date = dateQuery;

  const checkins = await HabitCheckinModel.find(query).sort({ date: -1 });
  res.json({ checkins });
}

module.exports = { upsertCheckin, listCheckins };
