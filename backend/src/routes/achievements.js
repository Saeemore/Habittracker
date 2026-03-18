const { Router } = require("express");

const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { listAchievements, myAchievements } = require("../controllers/achievementsController");

const router = Router();

router.get("/", asyncHandler(listAchievements));
router.get("/me", requireAuth, asyncHandler(myAchievements));

module.exports = router;
