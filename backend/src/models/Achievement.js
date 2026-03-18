const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    criteriaType: { type: String, required: true },
    criteriaValue: { type: Number, required: true }
  },
  { timestamps: true }
);

const AchievementModel = mongoose.model("Achievement", AchievementSchema);

module.exports = { AchievementModel };
