const { HabitModel } = require("../models/Habit");
const { HabitCheckinModel } = require("../models/HabitCheckin");

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeClientHabit(habit) {
  if (!habit || typeof habit !== "object") return null;

  return {
    id: String(habit.id ?? habit._id ?? "").slice(0, 30),
    name: String(habit.name ?? "Unnamed habit").slice(0, 80),
    category: String(habit.category ?? "General").slice(0, 40),
    streak: Number.isFinite(Number(habit.streak ?? habit.currentStreak))
      ? Number(habit.streak ?? habit.currentStreak)
      : 0,
    completed: Boolean(habit.completed),
    targetTime: String(habit.targetTime ?? habit.time ?? "Any time").slice(0, 40),
    endGoal: String(habit.endGoal ?? habit.target ?? "Daily goal").slice(0, 120),
    why: String(habit.why ?? "").slice(0, 300),
    longestStreak: Number.isFinite(Number(habit.longestStreak)) ? Number(habit.longestStreak) : 0,
    source: "client",
  };
}

function mapDbHabit(habit, completedToday) {
  return {
    id: String(habit._id),
    name: habit.name,
    category: habit.category || "General",
    streak: habit.currentStreak || 0,
    completed: completedToday,
    targetTime: habit.targetTime || "Any time",
    endGoal: habit.endGoal || "Daily goal",
    why: habit.why || "",
    longestStreak: habit.longestStreak || 0,
    source: "database",
  };
}

function mergeHabitLists(dbHabits, clientHabits) {
  const mergedByName = new Map();

  for (const habit of dbHabits) {
    mergedByName.set(habit.name.trim().toLowerCase(), habit);
  }

  for (const raw of clientHabits) {
    const client = normalizeClientHabit(raw);
    if (!client) continue;

    const nameKey = client.name.trim().toLowerCase();
    const existing = mergedByName.get(nameKey);

    if (!existing) {
      mergedByName.set(nameKey, client);
      continue;
    }

    mergedByName.set(nameKey, {
      ...existing,
      completed: client.completed || existing.completed,
      targetTime: existing.targetTime !== "Any time" ? existing.targetTime : client.targetTime,
      endGoal: existing.endGoal !== "Daily goal" ? existing.endGoal : client.endGoal,
      why: existing.why || client.why,
      streak: Math.max(existing.streak, client.streak),
      source: "merged",
    });
  }

  return Array.from(mergedByName.values()).slice(0, 20);
}

async function loadUserHabitsForChat(userId) {
  const habits = await HabitModel.find({ userId, active: { $ne: false } })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  if (!habits.length) return [];

  const today = todayDateString();
  const habitIds = habits.map((h) => h._id);
  const checkins = await HabitCheckinModel.find({
    habitId: { $in: habitIds },
    date: today,
    completed: true,
  })
    .select("habitId")
    .lean();

  const completedIds = new Set(checkins.map((c) => String(c.habitId)));

  return habits.map((habit) =>
    mapDbHabit(habit, completedIds.has(String(habit._id)) || habit.lastCheckinDate === today)
  );
}

async function resolveChatHabits(userId, clientHabits) {
  const normalizedClient = Array.isArray(clientHabits)
    ? clientHabits.map(normalizeClientHabit).filter(Boolean)
    : [];

  if (!userId) return normalizedClient.slice(0, 20);

  const dbHabits = await loadUserHabitsForChat(userId);
  if (!dbHabits.length) return normalizedClient.slice(0, 20);

  return mergeHabitLists(dbHabits, clientHabits);
}

module.exports = {
  resolveChatHabits,
  normalizeClientHabit,
};
