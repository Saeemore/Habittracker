const { Router } = require("express");

const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { CreateReminderBodySchema, UpdateReminderBodySchema } = require("../validators/reminderSchemas");
const {
  listHabitReminders,
  createHabitReminder,
  updateReminder,
  deleteReminder
} = require("../controllers/remindersController");

const habitRemindersRouter = Router({ mergeParams: true });
habitRemindersRouter.use(requireAuth);
habitRemindersRouter.get("/", asyncHandler(listHabitReminders));
habitRemindersRouter.post("/", validate({ body: CreateReminderBodySchema }), asyncHandler(createHabitReminder));

const remindersRouter = Router();
remindersRouter.use(requireAuth);
remindersRouter.patch("/:reminderId", validate({ body: UpdateReminderBodySchema }), asyncHandler(updateReminder));
remindersRouter.delete("/:reminderId", asyncHandler(deleteReminder));

module.exports = { habitRemindersRouter, remindersRouter };
