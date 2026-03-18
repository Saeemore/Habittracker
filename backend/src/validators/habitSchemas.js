const { z } = require("zod");

const CreateHabitBodySchema = z.object({
  name: z.string().min(1).max(200),
  why: z.string().max(2000).optional(),
  endGoal: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  targetTime: z.string().max(10).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  active: z.boolean().optional()
});

const UpdateHabitBodySchema = CreateHabitBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Provide at least one field to update" }
);

module.exports = { CreateHabitBodySchema, UpdateHabitBodySchema };
