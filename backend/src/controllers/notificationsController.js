const mongoose = require("mongoose");

const { AppError } = require("../middleware/error");
const { NotificationEventModel } = require("../models/NotificationEvent");
const { notifySyncComplete } = require("../services/notificationService");

async function listNotifications(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const notifications = await NotificationEventModel.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ notifications });
}

async function dismissNotification(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid notification id", 400, "INVALID_ID");

  const notification = await NotificationEventModel.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { $set: { status: "dismissed" } },
    { new: true }
  );

  if (!notification) throw new AppError("Notification not found", 404, "NOT_FOUND");
  res.json({ notification });
}

async function dismissAll(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  await NotificationEventModel.updateMany(
    { userId: req.user.id, status: { $ne: "dismissed" } },
    { $set: { status: "dismissed" } }
  );
  res.json({ ok: true });
}

async function getUnreadCount(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const count = await NotificationEventModel.countDocuments({
    userId: req.user.id,
    status: { $ne: "dismissed" }
  });
  res.json({ count });
}

async function createSyncNotification(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const { uploadCount = 0, downloadCount = 0 } = req.body;
  await notifySyncComplete(req.user.id, uploadCount, downloadCount);
  res.json({ ok: true });
}

module.exports = { listNotifications, dismissNotification, dismissAll, getUnreadCount, createSyncNotification };
