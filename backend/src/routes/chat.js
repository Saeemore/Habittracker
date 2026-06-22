const { Router } = require("express");

const router = Router();

const SYSTEM_INSTRUCTION = [
  "You are Trackify AI, a friendly and knowledgeable personal habit coach.",
  "Answer the user's question directly without repeating or quoting it.",
  "Be conversational, warm, encouraging, and specific.",
  "Keep most answers under 120 words and use emojis only occasionally.",
  "Use habit data when it is available. If it is not available, simply answer the question without mentioning missing data.",
  "You may also answer questions unrelated to habits like a friendly general assistant."
].join("\n");

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
  if (!habits.length) return "No current habits are available for personalization.";

  const completed = habits.filter((habit) => habit.completed).length;
  const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  const names = habits.map((habit) => `${habit.name} (${habit.streak} day streak)`).join(", ");

  return `${completed}/${habits.length} habits completed today. Best streak: ${bestStreak}. Habits: ${names}.`;
}

function fallbackReply(kind, message, habits) {
  const hasHabits = habits.length > 0;
  const summary = hasHabits ? ` ${summarizeHabits(habits)}` : "";

  if (kind === "motivate") {
    return `You are building proof that you can keep promises to yourself. Pick the smallest next action, do it now, and let the streak take care of itself. ${summary}`;
  }

  if (kind === "analyze") {
    return `Habit snapshot: ${summary} Look for the habit with the lowest streak and make it easier: reduce the target, attach it to an existing routine, and track it immediately after doing it.`;
  }

  return `Start with one tiny, repeatable action. Make it take less than two minutes, attach it to a cue already in your day, and track it immediately after you finish. Once that feels automatic, increase the difficulty gradually.${summary}`;
}

async function generateAiReply(prompt) {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        maxOutputTokens: 300
      }
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
    `Request type: ${kind}`,
    `Habit context: ${summary}`,
    `User: ${message || (kind === "motivate" ? "Motivate me." : "Analyze my habits.")}`
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
