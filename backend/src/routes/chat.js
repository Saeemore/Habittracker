const { Router } = require("express");

const { optionalAuth } = require("../middleware/optionalAuth");
const { resolveChatHabits } = require("../services/chatHabitsService");

const router = Router();

router.use(optionalAuth);

const SYSTEM_INSTRUCTION = [
  "You are Trackify AI, a personalized habit coach for one specific user.",
  "Use the user profile, habits, schedule hints, and progress data provided in every request.",
  "Always reference the user's actual habit names, times, streaks, and goals when giving advice.",
  "When habits are listed in context, tie every recommendation to specific habits — never give generic plans.",
  "Address the user by name when natural. Never say you lack data if profile or habits are present.",
  "Answer directly without repeating the user's question.",
  "Be warm, practical, and specific — avoid generic self-help advice.",
  "",
  "When the user wants to add, move, or fit a habit into their schedule:",
  "- Build a concrete daily plan with specific time blocks (e.g. 7:15–7:30 AM).",
  "- Account for their chronotype, preferred reminder time, existing habit times, and stated blockers.",
  "- Show how the new habit stacks onto an existing routine (habit stacking).",
  "- Flag conflicts with existing habits and suggest swaps or shorter versions.",
  "- Include a minimum viable version (2-minute fallback) for busy days.",
  "",
  "When helping maintain streaks:",
  "- Reference their actual streak counts and today's completion status.",
  "- Give if-then plans for their specific blockers (e.g. no time, forgetting, procrastination).",
  "- Celebrate progress; for at-risk streaks, give one urgent action they can do today.",
  "",
  "Format schedule answers with a short bullet timeline. Use markdown sparingly (bold for times).",
  "Keep most answers under 180 words unless building a full daily schedule."
].join("\n");

const SLEEP_LABELS = {
  early: "Early bird (up before 7am)",
  night: "Night owl (active after 10pm)",
  middle: "Flexible / in-between schedule",
};

const GOAL_LABELS = {
  health: "Health & Fitness",
  career: "Career Growth",
  mental: "Mental Wellness",
  learning: "Learning",
  relationships: "Relationships",
  financial: "Financial",
};

const CONSISTENCY_LABELS = {
  beginner: "Just starting out",
  somewhat: "Somewhat consistent",
  pretty: "Pretty consistent",
  disciplined: "Very disciplined",
};

function normalizeHabits(habits) {
  if (!Array.isArray(habits)) return [];

  return habits
    .filter((habit) => habit && typeof habit === "object")
    .slice(0, 20)
    .map((habit) => ({
      id: String(habit.id ?? "").slice(0, 30),
      name: String(habit.name ?? "Unnamed habit").slice(0, 80),
      category: String(habit.category ?? "General").slice(0, 40),
      streak: Number.isFinite(Number(habit.streak)) ? Number(habit.streak) : 0,
      completed: Boolean(habit.completed),
      targetTime: String(habit.targetTime ?? habit.time ?? "Any time").slice(0, 40),
      endGoal: String(habit.endGoal ?? habit.target ?? "Daily goal").slice(0, 120),
      why: String(habit.why ?? "").slice(0, 300),
      longestStreak: Number.isFinite(Number(habit.longestStreak)) ? Number(habit.longestStreak) : 0,
    }));
}

function normalizeProfile(profile) {
  if (!profile || typeof profile !== "object") return null;

  return {
    sleepType: String(profile.sleepType ?? "").slice(0, 20),
    goal: String(profile.goal ?? "").slice(0, 20),
    consistency: String(profile.consistency ?? "").slice(0, 20),
    blockers: Array.isArray(profile.blockers)
      ? profile.blockers.map((b) => String(b).slice(0, 60)).slice(0, 8)
      : [],
    reminderTime: String(profile.reminderTime ?? "").slice(0, 10),
    duration: String(profile.duration ?? "").slice(0, 20),
    lifestyleRating: Number.isFinite(Number(profile.lifestyleRating))
      ? Number(profile.lifestyleRating)
      : 0,
    focusNote: String(profile.focusNote ?? "").slice(0, 300),
  };
}

function label(map, key) {
  return map[key] || key || "Not set";
}

function buildProfileSummary(profile) {
  if (!profile) return "No onboarding profile saved yet.";

  const lines = [
    `Chronotype: ${label(SLEEP_LABELS, profile.sleepType)}`,
    `Primary goal: ${label(GOAL_LABELS, profile.goal)}`,
    `Consistency level: ${label(CONSISTENCY_LABELS, profile.consistency)}`,
    `Preferred reminder time: ${profile.reminderTime || "Not set"}`,
    `Habit-building horizon: ${profile.duration ? `${profile.duration} days` : "Not set"}`,
    `Lifestyle rating: ${profile.lifestyleRating || "Not rated"}/5`,
  ];

  if (profile.blockers.length) {
    lines.push(`Known blockers: ${profile.blockers.join(", ")}`);
  }
  if (profile.focusNote) {
    lines.push(`Personal focus note: ${profile.focusNote}`);
  }

  return lines.join("\n");
}

function buildHabitSummary(habits) {
  if (!habits.length) return "No habits tracked yet.";

  return habits
    .map((habit) => {
      const status = habit.completed ? "done today" : "not done today";
      const streakNote = habit.streak >= 3 && !habit.completed ? " — STREAK AT RISK" : "";
      const whyNote = habit.why ? ` | motivation: ${habit.why}` : "";
      return `- ${habit.name} (${habit.category}) @ ${habit.targetTime} | goal: ${habit.endGoal} | ${habit.streak}-day streak, best ${habit.longestStreak || habit.streak} (${status})${streakNote}${whyNote}`;
    })
    .join("\n");
}

function buildPrompt({ kind, message, username, habits, profile, todayProgress, localTime, dayOfWeek }) {
  const atRisk = habits.filter((h) => h.streak >= 3 && !h.completed);
  const atRiskNote = atRisk.length
    ? `Streaks at risk today: ${atRisk.map((h) => `${h.name} (${h.streak} days)`).join(", ")}`
    : "No high streaks at immediate risk today.";

  const progressLine = todayProgress?.total
    ? `${todayProgress.completed}/${todayProgress.total} habits done today (${todayProgress.completionRate}%)`
    : "No habits logged yet today.";

  return [
    `Request type: ${kind}`,
    `User: ${username || "User"}`,
    `Current moment: ${dayOfWeek || "Unknown day"}, ${localTime || "unknown time"}`,
    `Today's progress: ${progressLine}`,
    atRiskNote,
    "",
    "User profile:",
    buildProfileSummary(profile),
    "",
    "Current habits & schedule:",
    buildHabitSummary(habits),
    "",
    `User message: ${message || (kind === "motivate" ? "Motivate me based on my habits and progress." : "Analyze my habits and give personalized insights.")}`,
  ].join("\n");
}

function fallbackReply(kind, message, habits, profile, username) {
  const name = username || "there";
  const hasHabits = habits.length > 0;
  const bestStreak = hasHabits ? habits.reduce((max, h) => Math.max(max, h.streak), 0) : 0;
  const atRisk = habits.find((h) => h.streak >= 3 && !h.completed);
  const reminderTime = profile?.reminderTime || "your preferred reminder window";

  if (kind === "motivate") {
    if (atRisk) {
      return `${name}, your ${atRisk.streak}-day "${atRisk.name}" streak needs you today. Do the smallest version now — even 2 minutes counts. Stack it right after an existing routine at ${reminderTime} and log it immediately.`;
    }
    return `${name}, you're building proof you keep promises to yourself. Pick one habit, do a 2-minute version now, and protect your ${bestStreak || 1}-day momentum.`;
  }

  if (kind === "analyze") {
    const incomplete = habits.filter((h) => !h.completed);
    if (incomplete.length) {
      return `${name}, focus on "${incomplete[0].name}" first — schedule it at ${incomplete[0].targetTime || reminderTime}, shrink it to 2 minutes if needed, and stack it after something you already do daily.`;
    }
    return `${name}, great progress today! To keep streaks alive, prep tomorrow's time blocks tonight and set a fallback 2-minute version for busy days.`;
  }

  if (/schedule|fit|busy|time|when should/i.test(message || "")) {
    return `${name}, try this: block 15 minutes at ${reminderTime} for your new habit, stack it after an existing routine, and keep a 2-minute fallback for hectic days. Share your busy hours and I'll map exact slots.`;
  }

  return `${name}, start with one tiny action under 2 minutes, attach it to a cue already in your day (like ${reminderTime}), and track it right after. Once automatic, increase difficulty gradually.`;
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
        temperature: 0.75,
        maxOutputTokens: 500,
      },
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
  const clientHabits = req.body?.habits;
  const habits = normalizeHabits(await resolveChatHabits(req.user?.id, clientHabits));
  const profile = normalizeProfile(req.body?.profile);
  const username = String(req.body?.username ?? "User").slice(0, 60);
  const localTime = String(req.body?.localTime ?? "").slice(0, 20);
  const dayOfWeek = String(req.body?.dayOfWeek ?? "").slice(0, 20);
  const todayProgress =
    req.body?.todayProgress && typeof req.body.todayProgress === "object"
      ? {
          completed: Number(req.body.todayProgress.completed) || 0,
          total: Number(req.body.todayProgress.total) || 0,
          completionRate: Number(req.body.todayProgress.completionRate) || 0,
        }
      : { completed: 0, total: habits.length, completionRate: 0 };

  const prompt = buildPrompt({
    kind,
    message,
    username,
    habits,
    profile,
    todayProgress,
    localTime,
    dayOfWeek,
  });

  const aiReply = await generateAiReply(prompt);
  res.json({ reply: aiReply || fallbackReply(kind, message, habits, profile, username) });
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
