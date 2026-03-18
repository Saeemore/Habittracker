const { z } = require("zod");

const CreateReminderBodySchema = z.object({
  timeOfDay: z.string().min(1).max(10),
  timezone: z.string().max(64).optional(),
  daysOfWeekMask: z.number().int().min(1),
  enabled: z.boolean().optional(),
  channel: z.enum(["in_app", "email", "push"]).default("in_app")
});

const UpdateReminderBodySchema = CreateReminderBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Provide at least one field to update" }
);

module.exports = { CreateReminderBodySchema, UpdateReminderBodySchema };
