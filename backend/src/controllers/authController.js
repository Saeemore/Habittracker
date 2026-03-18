const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const { UserModel } = require("../models/User");
const { AppError } = require("../middleware/error");

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function signAccessToken(userId) {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL });
}

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/"
  });
}

function capRefreshHashes(user) {
  const MAX = 10;
  if (user.refreshTokenHashes.length > MAX) {
    user.refreshTokenHashes = user.refreshTokenHashes.slice(user.refreshTokenHashes.length - MAX);
  }
}

async function register(req, res) {
  const { email, username, password } = req.body;

  const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new AppError("Email or username already in use", 409, "CONFLICT");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, username, passwordHash });

  const accessToken = signAccessToken(String(user._id));
  const refreshToken = signRefreshToken(String(user._id));
  user.refreshTokenHashes.push(sha256(refreshToken));
  capRefreshHashes(user);
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.status(201).json({
    accessToken,
    user: { id: String(user._id), email: user.email, username: user.username }
  });
}

async function login(req, res) {
  const { email, username, password } = req.body;

  const user = await UserModel.findOne(email ? { email } : { username });
  if (!user) throw new AppError("Invalid credentials", 401, "UNAUTHORIZED");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Invalid credentials", 401, "UNAUTHORIZED");

  const accessToken = signAccessToken(String(user._id));
  const refreshToken = signRefreshToken(String(user._id));
  user.refreshTokenHashes.push(sha256(refreshToken));
  capRefreshHashes(user);
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.json({
    accessToken,
    user: { id: String(user._id), email: user.email, username: user.username }
  });
}

async function refresh(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new AppError("Missing refresh token", 401, "UNAUTHORIZED");

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401, "UNAUTHORIZED");
  }

  if (!payload.userId) throw new AppError("Invalid refresh token payload", 401, "UNAUTHORIZED");

  const user = await UserModel.findById(payload.userId);
  if (!user) throw new AppError("User not found", 401, "UNAUTHORIZED");

  const oldHash = sha256(refreshToken);
  if (!user.refreshTokenHashes.includes(oldHash)) {
    user.refreshTokenHashes = [];
    await user.save();
    throw new AppError("Refresh token not recognized", 401, "UNAUTHORIZED");
  }

  const newAccessToken = signAccessToken(String(user._id));
  const newRefreshToken = signRefreshToken(String(user._id));

  user.refreshTokenHashes = user.refreshTokenHashes.filter((h) => h !== oldHash);
  user.refreshTokenHashes.push(sha256(newRefreshToken));
  capRefreshHashes(user);
  await user.save();

  setRefreshCookie(res, newRefreshToken);
  res.json({ accessToken: newAccessToken });
}

async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      if (payload.userId) {
        const user = await UserModel.findById(payload.userId);
        if (user) {
          const hash = sha256(refreshToken);
          user.refreshTokenHashes = user.refreshTokenHashes.filter((h) => h !== hash);
          await user.save();
        }
      }
    } catch {
      // ignore
    }
  }

  res.clearCookie("refreshToken", { path: "/" });
  res.json({ ok: true });
}

async function me(req, res) {
  if (!req.user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  const user = await UserModel.findById(req.user.id).select("_id email username createdAt updatedAt");
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  res.json({ user: { id: String(user._id), email: user.email, username: user.username } });
}

module.exports = { register, login, refresh, logout, me };
