const { Router } = require("express");

const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { CheckinBodySchema, CheckinListQuerySchema } = require("../validators/checkinSchemas");
const { upsertCheckin, listCheckins } = require("../controllers/checkinsController");

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post("/", validate({ body: CheckinBodySchema }), asyncHandler(upsertCheckin));
router.get("/", validate({ query: CheckinListQuerySchema }), asyncHandler(listCheckins));

module.exports = router;
