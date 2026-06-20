const { Router } = require("express");

const router = Router();

function normalizeHabits(habits) {
  if (!Array.isArray(habits)) return [];

  return habits
    .filter((habit) => habit && typeof habit === "object")
    .slice(0, 20)
    .map((habit) => ({
      name: String(habit.name ?? "Unnamed habit").slice(0, 80),
      category: String(habit.category ?? "General").slice(0, 40),
      streak: Number.isFinite(Number(habit.streak)) ? Number(habit.streak) : 0,
      completed: Boolean(habit.completed)
    }));
}

function summarizeHabits(habits) {
  if (!habits.length) return "No habit data was provided.";

  const completed = habits.filter((habit) => habit.completed).length;
  const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  const names = habits.map((habit) => `${habit.name} (${habit.streak} day streak)`).join(", ");

  return `${completed}/${habits.length} habits completed today. Best streak: ${bestStreak}. Habits: ${names}.`;
}

function fallbackReply(kind, message, habits) {
  const summary = summarizeHabits(habits);

  if (kind === "motivate") {
    return `You are building proof that you can keep promises to yourself. Pick the smallest next action, do it now, and let the streak take care of itself. ${summary}`;
  }

  if (kind === "analyze") {
    return `Habit snapshot: ${summary} Look for the habit with the lowest streak and make it easier: reduce the target, attach it to an existing routine, and track it immediately after doing it.`;
  }

  return `Here is a practical habit-coach take: ${message ? `"${message}" starts with one tiny repeatable action.` : "start tiny and repeat consistently."} Make the next step obvious, less than two minutes, and tied to a cue you already have. ${summary}`;
}

async function generateAiReply(prompt) {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[backend] chat generation failed:", error);
    return null;
  }
}

async function reply(req, res, kind) {
  const message = typeof req.body?.message === "string" ? req.body.message.trim().slice(0, 1000) : "";
  const habits = normalizeHabits(req.body?.habits);
  const summary = summarizeHabits(habits);
  const prompt = [
    "You are Trackify AI, a concise and encouraging habit coach.",
    "Give specific, actionable advice. Keep the response under 120 words.",
    `User message: ${message || "No direct message."}`,
    `Habit summary: ${summary}`,
    `Request type: ${kind}.`
  ].join("\n");

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with Trackify AI habit coach
 *     tags: [AI Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: How do I build better habits?
 *               habits:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: Start small and be consistent!
 *       503:
 *         description: AI service unavailable
 */  

  const aiReply = await generateAiReply(prompt);
  res.json({ reply: aiReply || fallbackReply(kind, message, habits) });
}

router.post("/", (req, res, next) => {
  reply(req, res, "chat").catch(next);
});

router.post("/motivate", (req, res, next) => {
  reply(req, res, "motivate").catch(next);
});

router.post("/analyze", (req, res, next) => {
  reply(req, res, "analyze").catch(next);
});

module.exports = router;
