const { Router } = require("express");

const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { listNotifications, dismissNotification } = require("../controllers/notificationsController");

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(listNotifications));
router.post("/:id/dismiss", asyncHandler(dismissNotification));

module.exports = router;
