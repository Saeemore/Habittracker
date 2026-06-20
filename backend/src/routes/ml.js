const { Router } = require("express");
const {
  predictHabitCompletion,
  predictBulk,
  checkMLHealth,
} = require("../services/mlService");

const router = Router();

/**
 * @swagger
 * /api/ml/health:
 *   get:
 *     summary: Check ML service health
 *     tags: [ML]
 *     responses:
 *       200:
 *         description: ML service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ml_available:
 *                   type: boolean
 *                   example: true
 */

router.get("/health", async (_req, res) => {
  const ok = await checkMLHealth();
  res.json({ ml_available: ok });
});

/**
 * @swagger
 * /api/ml/predict:
 *   post:
 *     summary: Predict habit completion probability
 *     tags: [ML]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - habit_name
 *             properties:
 *               habit_name:
 *                 type: string
 *                 example: Morning Run
 *               streak_count:
 *                 type: integer
 *                 example: 7
 *     responses:
 *       200:
 *         description: Prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 habit_name:
 *                   type: string
 *                 completion_probability:
 *                   type: number
 *                   example: 0.848
 *                 will_complete:
 *                   type: boolean
 *                 risk_level:
 *                   type: string
 *                   enum: [low, medium, high]
 *       503:
 *         description: ML service unavailable
 */

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