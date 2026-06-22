/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: madar
 *               email:
 *                 type: string
 *                 example: madar@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 *
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: madar
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */

const { Router } = require("express");

const { asyncHandler } = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const {
  RegisterBodySchema,
  LoginBodySchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema
} = require("../validators/authSchemas");
const {
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  updateProfile
} = require("../controllers/authController");

const router = Router();

router.post("/register", validate({ body: RegisterBodySchema }), asyncHandler(register));
router.post("/login", validate({ body: LoginBodySchema }), asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));
router.post("/forgot-password", validate({ body: ForgotPasswordSchema }), asyncHandler(forgotPassword));
router.post("/reset-password", validate({ body: ResetPasswordSchema }), asyncHandler(resetPassword));
router.put("/profile", requireAuth, validate({ body: UpdateProfileSchema }), asyncHandler(updateProfile));

module.exports = router;
