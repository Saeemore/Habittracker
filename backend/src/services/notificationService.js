const { NotificationEventModel } = require("../models/NotificationEvent");

/**
 * Core function to create an in-app notification.
 * @param {string} userId     – Mongo ObjectId of the user
 * @param {"reminder"|"achievement"|"system"} type
 * @param {string} title
 * @param {string} body
 * @param {object} [extras]   – optional habitId, reminderId
 */
async function createNotification(userId, type, title, body, extras = {}) {
  try {
    await NotificationEventModel.create({
      userId,
      type,
      title,
      body,
      status: "sent",
      sentAt: new Date(),
      ...extras
    });
  } catch (err) {
    // Never let notification creation crash the main request
    console.error("[notificationService] failed to create notification:", err.message);
  }
}

/* ── Convenience helpers ───────────────────────────────────────────────── */

async function notifyProfileUpdated(userId) {
  return createNotification(
    userId,
    "system",
    "Profile Updated ✏️",
    "Your profile information has been updated successfully."
  );
}

async function notifyPasswordChanged(userId) {
  return createNotification(
    userId,
    "system",
    "Password Changed 🔑",
    "Your password was changed successfully. If this wasn't you, please contact support."
  );
}

async function notifySyncComplete(userId, uploadCount, downloadCount) {
  return createNotification(
    userId,
    "system",
    "Data Synced 🔄",
    `Sync completed! Uploaded ${uploadCount} habit(s), downloaded ${downloadCount} habit(s).`
  );
}

async function notifyHabitCompleted(userId, habitId, habitName) {
  return createNotification(
    userId,
    "achievement",
    "Habit Completed 🎯",
    `Great job! You completed "${habitName}" today. Keep it up!`,
    { habitId }
  );
}

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
const STREAK_EMOJIS = { 3: "🔥", 7: "⚡", 14: "💪", 21: "🏆", 30: "👑", 50: "🌟", 75: "💎", 100: "🎉", 150: "🚀", 200: "✨", 365: "🏅" };

async function notifyStreakMilestone(userId, habitId, habitName, streak) {
  if (!STREAK_MILESTONES.includes(streak)) return;
  const emoji = STREAK_EMOJIS[streak] || "🔥";
  return createNotification(
    userId,
    "achievement",
    `${emoji} ${streak}-Day Streak!`,
    `Incredible! You've maintained "${habitName}" for ${streak} days straight!`,
    { habitId }
  );
}

async function notifyWelcome(userId, username) {
  return createNotification(
    userId,
    "system",
    "Welcome to Trackify! 🎉",
    `Hey ${username}! Start by adding your first habit. We're excited to help you build better routines.`
  );
}

module.exports = {
  createNotification,
  notifyProfileUpdated,
  notifyPasswordChanged,
  notifySyncComplete,
  notifyHabitCompleted,
  notifyStreakMilestone,
  notifyWelcome,
  STREAK_MILESTONES
};
