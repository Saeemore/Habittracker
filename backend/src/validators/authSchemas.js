const { z } = require("zod");

const RegisterBodySchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(32),
  password: z.string().min(6).max(200)
});

const LoginBodySchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().min(2).max(32).optional(),
    password: z.string().min(1).max(200)
  })
  .refine((value) => Boolean(value.email || value.username), {
    message: "Provide email or username",
    path: ["email"]
  });

module.exports = { RegisterBodySchema, LoginBodySchema };
