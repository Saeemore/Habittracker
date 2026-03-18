const { Router } = require("express");

const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { CreateHabitBodySchema, UpdateHabitBodySchema } = require("../validators/habitSchemas");
const { listHabits, createHabit, updateHabit, deleteHabit } = require("../controllers/habitsController");

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listHabits));
router.post("/", validate({ body: CreateHabitBodySchema }), asyncHandler(createHabit));
router.patch("/:habitId", validate({ body: UpdateHabitBodySchema }), asyncHandler(updateHabit));
router.delete("/:habitId", asyncHandler(deleteHabit));

module.exports = router;
