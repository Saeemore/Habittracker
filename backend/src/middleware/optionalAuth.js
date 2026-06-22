const jwt = require("jsonwebtoken");

const { env } = require("../config/env");

function optionalAuth(req, _res, next) {
  const header = req.header("authorization");
  if (!header) return next();

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.userId) req.user = { id: payload.userId };
  } catch {
    // Ignore invalid tokens — chat still works with client-sent context.
  }

  return next();
}

module.exports = { optionalAuth };
