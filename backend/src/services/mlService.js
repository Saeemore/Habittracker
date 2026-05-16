const ML_BASE = process.env.ML_SERVICE_URL || "http://localhost:8000";

async function predictHabitCompletion(data) {
  const res = await fetch(`${ML_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`ML service error: ${res.status}`);
  return res.json();
}

async function predictBulk(habits) {
  const res = await fetch(`${ML_BASE}/predict/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habits }),
  });
  if (!res.ok) throw new Error(`ML service error: ${res.status}`);
  return res.json();
}

async function checkMLHealth() {
  try {
    const r = await fetch(`${ML_BASE}/health`);
    const d = await r.json();
    return d.model_loaded === true;
  } catch {
    return false;
  }
}

module.exports = { predictHabitCompletion, predictBulk, checkMLHealth };