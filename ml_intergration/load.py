import joblib
import json
from datetime import datetime, timedelta


# ─────────────────────────────────────────────────────────────
# STEP 1 — Load everything once at app startup
# ─────────────────────────────────────────────────────────────

print("=" * 60)
print("  Loading models and reports...")
print("=" * 60)

# Load the 3 trained ML models
best_time_model   = joblib.load("models/best_time_model.joblib")
consistency_model = joblib.load("models/consistency_model.joblib")
next_checkin_model = joblib.load("models/next_checkin_model.joblib")

# Load the 3 JSON reports
summary_stats  = json.load(open("reports/summary_stats.json"))
user_profiles  = json.load(open("reports/user_profiles.json"))
habit_insights = json.load(open("reports/habit_insights.json"))

print("✅ All models and reports loaded!\n")


# ─────────────────────────────────────────────────────────────
# STEP 2 — Copy the helper functions from train_habit_model.py
#           (or import them — both ways shown below)
# ─────────────────────────────────────────────────────────────

# OPTION A: Import directly from the training script
from train_model import (
    predict_best_time,
    predict_at_risk,
    predict_next_checkin_gap,
)

# OPTION B: If you don't want to import, the functions are
#           also copy-pasted at the bottom of this file.


# ─────────────────────────────────────────────────────────────
# STEP 3 — Real-world usage examples
# ─────────────────────────────────────────────────────────────

# ── Helper: get today's info ──────────────────────────────────
now          = datetime.now()
day_of_week  = now.weekday()          # 0=Monday ... 6=Sunday
is_weekend   = 1 if day_of_week >= 5 else 0
current_hour = now.hour
month        = now.month

print("=" * 60)
print("  USE CASE 1 — Smart Reminder Notification")
print("  'When should I remind Aarav to do Morning Run today?'")
print("=" * 60)

best_time = predict_best_time(
    bundle       = best_time_model,
    userId       = "user_001",
    habitId      = "habit_001",
    dayOfWeekNum = day_of_week,
    isWeekend    = is_weekend,
    month        = month,
    avgWeeklyFreq= 5.0,
    streakCount  = 7,
)

print(f"  User     : Aarav")
print(f"  Habit    : Morning Run")
print(f"  Best time: {best_time}")
print(f"  → Schedule notification for today at {best_time}\n")


print("=" * 60)
print("  USE CASE 2 — At-Risk Detection")
print("  'Is Aarav at risk of skipping Meditation today?'")
print("=" * 60)

risk = predict_at_risk(
    bundle       = consistency_model,
    userId       = "user_001",
    habitId      = "habit_002",
    dayOfWeekNum = day_of_week,
    isWeekend    = is_weekend,
    hour         = current_hour,
    gapHours     = 50.0,        # last check-in was 50 hours ago
    streakCount  = 2,           # only 2-day streak
    avgWeeklyFreq= 5.0,
    month        = month,
)

print(f"  User       : Aarav")
print(f"  Habit      : Meditation")
print(f"  At risk?   : {'YES ⚠️' if risk['atRisk'] else 'NO ✅'}")
print(f"  Probability: {risk['probability'] * 100:.0f}%")
if risk["atRisk"]:
    print(f"  → Send nudge: 'Hey Aarav, don't break your streak! 💪'")
print()


print("=" * 60)
print("  USE CASE 3 — Predict Next Check-In Gap")
print("  'When will Aarav likely check in next?'")
print("=" * 60)

gap_hours = predict_next_checkin_gap(
    bundle       = next_checkin_model,
    userId       = "user_001",
    habitId      = "habit_001",
    dayOfWeekNum = day_of_week,
    isWeekend    = is_weekend,
    hour         = current_hour,
    gapHours     = 24.0,
    streakCount  = 7,
    avgWeeklyFreq= 5.0,
    month        = month,
)

next_checkin_time = now + timedelta(hours=gap_hours)
print(f"  User             : Aarav")
print(f"  Habit            : Morning Run")
print(f"  Gap predicted    : {gap_hours} hours")
print(f"  Next check-in at : {next_checkin_time.strftime('%Y-%m-%d %H:%M')}")
print(f"  → Schedule follow-up reminder for {next_checkin_time.strftime('%H:%M')}\n")


print("=" * 60)
print("  USE CASE 4 — User Dashboard Data")
print("  'Show Aarav his habit stats on the home screen'")
print("=" * 60)

# Find Aarav's profile from the JSON report
aarav = next(u for u in user_profiles if u["userId"] == "user_001")
print(f"  Name           : {aarav['userName']}")
print(f"  Total check-ins: {aarav['totalCheckins']}")
print()
for habit in aarav["habits"]:
    print(f"  Habit          : {habit['habitName']}")
    print(f"    Longest streak   : {habit['longestStreak']} days")
    print(f"    Best time        : {habit['bestHourLabel']}")
    print(f"    Best day         : {habit['bestDay']}")
    print(f"    Consistency score: {habit['consistencyScore'] * 100:.0f}%")
    print(f"    Weekday check-ins: {habit['weekdayCheckins']}")
    print(f"    Weekend check-ins: {habit['weekendCheckins']}")
    print()


print("=" * 60)
print("  USE CASE 5 — Global App Stats")
print("  'Show summary on admin dashboard'")
print("=" * 60)

print(f"  Total check-ins : {summary_stats['totalCheckins']}")
print(f"  Total users     : {summary_stats['totalUsers']}")
print(f"  Total habits    : {summary_stats['totalHabits']}")
print(f"  Most popular    : {summary_stats['mostPopularHabit']}")
print(f"  Most active day : {summary_stats['mostActiveDay']}")
print(f"  Most active hour: {summary_stats['mostActiveHour']}:00")
print(f"  Weekday check-ins: {summary_stats['weekdayVsWeekend']['weekday']}")
print(f"  Weekend check-ins: {summary_stats['weekdayVsWeekend']['weekend']}")
print()


print("=" * 60)
print("  USE CASE 6 — Habit Insights")
print("  'Which day has the most Morning Run completions?'")
print("=" * 60)

morning_run = next(h for h in habit_insights if h["habitName"] == "Morning Run")
best_day    = max(morning_run["completionByDay"], key=morning_run["completionByDay"].get)
print(f"  Habit          : {morning_run['habitName']}")
print(f"  Avg hour       : {morning_run['avgCompletionHour']:.1f} (around {int(morning_run['avgCompletionHour']):02d}:00)")
print(f"  Avg gap        : {morning_run['avgGapHours']:.1f} hours between check-ins")
print(f"  Best day       : {best_day} ({morning_run['completionByDay'][best_day]} completions)")
print(f"  Weekday rate   : {morning_run['weekdayPct'] * 100:.0f}%")
print()


print("=" * 60)
print("  USE CASE 7 — Batch prediction for all users")
print("  'Check all users and flag who is at risk right now'")
print("=" * 60)

at_risk_users = []

for user in user_profiles:
    for habit in user["habits"]:
        result = predict_at_risk(
            bundle        = consistency_model,
            userId        = user["userId"],
            habitId       = habit["habitId"],
            dayOfWeekNum  = day_of_week,
            isWeekend     = is_weekend,
            hour          = current_hour,
            gapHours      = 30.0,          # simulate 30h since last check-in
            streakCount   = habit["longestStreak"],
            avgWeeklyFreq = habit["weekdayCheckins"] / max(1, 4),
            month         = month,
        )
        if result["atRisk"]:
            at_risk_users.append({
                "user"       : user["userName"],
                "habit"      : habit["habitName"],
                "probability": result["probability"],
            })

if at_risk_users:
    print(f"  {len(at_risk_users)} user-habit combos at risk right now:\n")
    for item in sorted(at_risk_users, key=lambda x: -x["probability"]):
        print(f"  ⚠️  {item['user']:10s} | {item['habit']:20s} | risk {item['probability']*100:.0f}%")
else:
    print("  No users at risk right now.")

print()
print("=" * 60)
print("  Done! All use cases demonstrated.")
print("=" * 60)