const { z } = require("zod");

class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function notFoundHandler(_req, _res, next) {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code, details: err.details ?? null }
    });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: { message: "Validation error", code: "VALIDATION_ERROR", details: err.flatten() }
    });
  }

  if (err && typeof err === "object") {
    if (err.name === "CastError") {
      return res.status(400).json({
        error: { message: "Invalid identifier", code: "INVALID_ID", details: { path: err.path } }
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        error: { message: "Duplicate key", code: "CONFLICT", details: err.keyValue ?? null }
      });
    }
  }

  // eslint-disable-next-line no-console
  console.error("[backend] unhandled error:", err);
  return res.status(500).json({
    error: { message: "Internal server error", code: "INTERNAL_ERROR" }
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
