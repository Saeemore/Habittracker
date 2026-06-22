const { Router } = require("express");

const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { listNotifications, dismissNotification, dismissAll, getUnreadCount, createSyncNotification } = require("../controllers/notificationsController");

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(listNotifications));
router.get("/unread-count", asyncHandler(getUnreadCount));
router.post("/dismiss-all", asyncHandler(dismissAll));
router.post("/sync-complete", asyncHandler(createSyncNotification));
router.post("/:id/dismiss", asyncHandler(dismissNotification));

module.exports = router;

