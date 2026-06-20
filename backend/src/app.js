const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const { env } = require("./config/env");
const { notFoundHandler, errorHandler } = require("./middleware/error");
const authRouter = require("./routes/auth");
const habitsRouter = require("./routes/habits");
const checkinsRouter = require("./routes/checkins");
const { habitRemindersRouter, remindersRouter } = require("./routes/reminders");
const notificationsRouter = require("./routes/notifications");
const achievementsRouter = require("./routes/achievements");
const mlRouter = require("./routes/ml");
const chatRouter = require("./routes/chat");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Trackify API Docs",
}));


app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});


app.use("/api/auth", authRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/habits/:habitId/checkins", checkinsRouter);
app.use("/api/habits/:habitId/reminders", habitRemindersRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/ml", mlRouter);
app.use("/api/chat", chatRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
