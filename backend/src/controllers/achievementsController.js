const { AppError } = require("../middleware/error");
const { AchievementModel } = require("../models/Achievement");
const { UserAchievementModel } = require("../models/UserAchievement");

async function listAchievements(_req, res) {
  const achievements = await AchievementModel.find({}).sort({ createdAt: -1 });
  res.json({ achievements });
}

async function myAchievements(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const userAchievements = await UserAchievementModel.find({ userId: req.user.id })
    .populate("achievementId")
    .sort({ earnedAt: -1 });
  res.json({ userAchievements });
}

module.exports = { listAchievements, myAchievements };
