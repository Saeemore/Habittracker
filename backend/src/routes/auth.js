const { Router } = require("express");

const { asyncHandler } = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { RegisterBodySchema, LoginBodySchema } = require("../validators/authSchemas");
const { register, login, refresh, logout, me } = require("../controllers/authController");

const router = Router();

router.post("/register", validate({ body: RegisterBodySchema }), asyncHandler(register));
router.post("/login", validate({ body: LoginBodySchema }), asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));

module.exports = router;
