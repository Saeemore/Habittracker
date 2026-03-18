const mongoose = require("mongoose");

const { AppError } = require("../middleware/error");
const { NotificationEventModel } = require("../models/NotificationEvent");

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

module.exports = { listNotifications, dismissNotification };
