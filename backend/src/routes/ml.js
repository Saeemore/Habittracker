const { Router } = require("express");
const {
  predictHabitCompletion,
  predictBulk,
  checkMLHealth,
} = require("../services/mlService");

const router = Router();

router.get("/health", async (_req, res) => {
  const ok = await checkMLHealth();
  res.json({ ml_available: ok });
});

router.post("/predict", async (req, res) => {
  try {
    const { habit_name, streak_count } = req.body;
    const day_of_week = new Date().getDay();
    const result = await predictHabitCompletion({
      habit_name,
      day_of_week,
      streak_count: streak_count ?? 0,
    });
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.post("/predict/bulk", async (req, res) => {
  try {
    const { habits } = req.body;
    const day_of_week = new Date().getDay();
    const enriched = habits.map((h) => ({ ...h, day_of_week }));
    const results = await predictBulk(enriched);
    res.json(results);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

module.exports = router;