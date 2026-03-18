const mongoose = require("mongoose");

const UserAchievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
      index: true
    },
    earnedAt: { type: Date, required: true, default: () => new Date() }
  },
  { timestamps: true }
);

UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const UserAchievementModel = mongoose.model("UserAchievement", UserAchievementSchema);

module.exports = { UserAchievementModel };
