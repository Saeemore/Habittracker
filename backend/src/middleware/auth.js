const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const { AppError } = require("./error");

function requireAuth(req, _res, next) {
  const header = req.header("authorization");
  if (!header) return next(new AppError("Missing Authorization header", 401, "UNAUTHORIZED"));

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Invalid Authorization header", 401, "UNAUTHORIZED"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (!payload.userId) return next(new AppError("Invalid token payload", 401, "UNAUTHORIZED"));
    req.user = { id: payload.userId };
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}

module.exports = { requireAuth };
