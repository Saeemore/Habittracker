const { z } = require("zod");

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const CheckinBodySchema = z.object({
  date: DateSchema,
  completed: z.boolean(),
  note: z.string().max(5000).optional()
});

const CheckinListQuerySchema = z.object({
  from: DateSchema.optional(),
  to: DateSchema.optional()
});

module.exports = { CheckinBodySchema, CheckinListQuerySchema };
