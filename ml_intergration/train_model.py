"""
Habit Check-In Data — Training & Analysis Pipeline
====================================================
Input  : checkins__2__csv.xlsx   (or any .xlsx / .csv with the same schema)
Outputs:
  models/
    best_time_model.joblib        — per-user per-habit best hour predictor
    consistency_model.joblib      — habit consistency / risk classifier
    next_checkin_model.joblib     — next check-in gap regressor
  reports/
    summary_stats.json            — global stats used by the app
    user_profiles.json            — per-user habit profiles
    habit_insights.json           — per-habit aggregated insights

Run:
    python train_habit_model.py --file checkins__2__csv.xlsx

The saved .joblib files + JSON reports can be loaded directly in your app.
"""

import os
import json
import argparse
import warnings
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import timedelta

import joblib

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
MODEL_DIR  = Path("models")
REPORT_DIR = Path("reports")
MODEL_DIR.mkdir(exist_ok=True)
REPORT_DIR.mkdir(exist_ok=True)

DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# ─────────────────────────────────────────────
# 1. DATA LOADING & CLEANING
# ─────────────────────────────────────────────
def load_data(file_path: str) -> pd.DataFrame:
    """Load Excel or CSV, parse dates, sort by user+habit+time."""
    path = Path(file_path)
    if path.suffix in (".xlsx", ".xlsm", ".xls"):
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path)

    df["completedAt"] = pd.to_datetime(df["completedAt"])
    df["localHour"]   = df["localHour"].astype(float)
    df["dayOfWeek"]   = pd.Categorical(df["dayOfWeek"], categories=DAY_ORDER, ordered=True)
    df = df.sort_values(["userId", "habitId", "completedAt"]).reset_index(drop=True)
    print(f"✅ Loaded {len(df):,} rows | {df['userId'].nunique()} users | {df['habitId'].nunique()} habits")
    return df


# ─────────────────────────────────────────────
# 2. FEATURE ENGINEERING
# ─────────────────────────────────────────────
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add time-based, streak, and gap features per user-habit."""
    df = df.copy()

    # Basic time parts
    df["hour"]      = df["completedAt"].dt.hour
    df["minute"]    = df["completedAt"].dt.minute
    df["dayOfWeekNum"] = df["completedAt"].dt.dayofweek   # 0=Mon
    df["weekNum"]   = df["completedAt"].dt.isocalendar().week.astype(int)
    df["month"]     = df["completedAt"].dt.month
    df["isWeekend"] = (df["weekdayOrWeekend"] == "Weekend").astype(int)

    # ── Gap between consecutive check-ins (hours) per user-habit
    grp = df.groupby(["userId", "habitId"])
    df["prevCompletedAt"] = grp["completedAt"].shift(1)
    df["gapHours"] = (
        df["completedAt"] - df["prevCompletedAt"]
    ).dt.total_seconds() / 3600
    df["gapHours"] = df["gapHours"].fillna(0)

    # ── Rolling streak (consecutive days with at least 1 check-in)
    df["date"] = df["completedAt"].dt.date

    def calc_streak(sub):
        sub = sub.sort_values("completedAt").copy()
        sub["dateStr"]  = sub["completedAt"].dt.date
        sub["prevDate"] = sub["dateStr"].shift(1)
        sub["sameDay"]  = (sub["dateStr"] == sub["prevDate"]).astype(int)
        sub["newStreak"]= (~sub["sameDay"].astype(bool)).astype(int)

        streak, streaks = 0, []
        for _, row in sub.iterrows():
            if row["newStreak"]:
                streak = 1
            else:
                streak += 1
            streaks.append(streak)
        sub["streakCount"] = streaks
        return sub

    parts = []
    for (uid, hid), sub in df.groupby(["userId", "habitId"]):
        parts.append(calc_streak(sub))
    df = pd.concat(parts).sort_values(["userId", "habitId", "completedAt"]).reset_index(drop=True)

    # ── Consistency label: completed within 1 hr of personal avg hour → "on_time"
    avg_hour = df.groupby(["userId", "habitId"])["hour"].transform("mean")
    df["onTimeDelta"] = abs(df["hour"] - avg_hour)
    df["onTime"]      = (df["onTimeDelta"] <= 1).astype(int)

    # ── Habit frequency per user (checks per week)
    df["weekLabel"] = df["completedAt"].dt.to_period("W")
    weekly_freq = (
        df.groupby(["userId", "habitId", "weekLabel"])
          .size()
          .reset_index(name="weeklyCount")
    )
    avg_weekly_freq = weekly_freq.groupby(["userId", "habitId"])["weeklyCount"].mean().reset_index(name="avgWeeklyFreq")
    df = df.merge(avg_weekly_freq, on=["userId", "habitId"], how="left")

    print("✅ Feature engineering done — shape:", df.shape)
    return df


# ─────────────────────────────────────────────
# 3. MODEL A — Best-Time Predictor
#    Given user + habit + dayOfWeek → predicted best hour bucket
# ─────────────────────────────────────────────
def train_best_time_model(df: pd.DataFrame):
    """
    Predicts the best hour bucket (rounded to 30 min) for a check-in.
    App usage: 'Hey Aarav, best time for Morning Run today is 06:30'.
    """
    df = df.copy()
    df["hourBucket"] = (df["hour"] // 0.5 * 0.5).astype(int)  # 30-min buckets

    feature_cols = ["dayOfWeekNum", "isWeekend", "month", "avgWeeklyFreq", "streakCount"]

    # Encode categorical identities
    le_user  = LabelEncoder().fit(df["userId"])
    le_habit = LabelEncoder().fit(df["habitId"])
    df["userEnc"]  = le_user.transform(df["userId"])
    df["habitEnc"] = le_habit.transform(df["habitId"])

    X = df[feature_cols + ["userEnc", "habitEnc"]].fillna(0)
    y = df["hourBucket"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    acc = model.score(X_test, y_test)
    cv  = cross_val_score(model, X, y, cv=5, scoring="accuracy").mean()
    print(f"\n📌 Best-Time Model  |  Test Acc: {acc:.3f}  |  CV Acc: {cv:.3f}")

    bundle = {
        "model":    model,
        "le_user":  le_user,
        "le_habit": le_habit,
        "features": feature_cols + ["userEnc", "habitEnc"],
    }
    joblib.dump(bundle, MODEL_DIR / "best_time_model.joblib")
    print(f"   Saved → {MODEL_DIR}/best_time_model.joblib")
    return bundle


# ─────────────────────────────────────────────
# 4. MODEL B — Consistency / At-Risk Classifier
#    Predicts whether a user is "at risk" of breaking a habit streak
# ─────────────────────────────────────────────
def train_consistency_model(df: pd.DataFrame):
    """
    Binary classifier: will the user miss their habit today?
    Label: if gap > 48 h → 'at_risk' (1), else 'on_track' (0).
    App usage: send a gentle nudge notification.
    """
    df = df.copy()
    df["atRisk"] = (df["gapHours"] > 48).astype(int)

    le_user  = LabelEncoder().fit(df["userId"])
    le_habit = LabelEncoder().fit(df["habitId"])
    df["userEnc"]  = le_user.transform(df["userId"])
    df["habitEnc"] = le_habit.transform(df["habitId"])

    feature_cols = [
        "dayOfWeekNum", "isWeekend", "hour", "gapHours",
        "streakCount", "avgWeeklyFreq", "month", "userEnc", "habitEnc"
    ]

    X = df[feature_cols].fillna(0)
    y = df["atRisk"]

    if y.sum() < 5:
        print("\n⚠️  Too few 'at_risk' samples — skipping consistency model.")
        return None

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    model = GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
    model.fit(X_train, y_train)

    acc = model.score(X_test, y_test)
    cv  = cross_val_score(model, X, y, cv=5, scoring="f1_macro").mean()
    print(f"\n📌 Consistency Model  |  Test Acc: {acc:.3f}  |  CV F1: {cv:.3f}")
    print(classification_report(y_test, model.predict(X_test), target_names=["on_track", "at_risk"]))

    bundle = {
        "model":    model,
        "le_user":  le_user,
        "le_habit": le_habit,
        "features": feature_cols,
    }
    joblib.dump(bundle, MODEL_DIR / "consistency_model.joblib")
    print(f"   Saved → {MODEL_DIR}/consistency_model.joblib")
    return bundle


# ─────────────────────────────────────────────
# 5. MODEL C — Next Check-In Gap Regressor
#    Predicts how many hours until the next check-in
# ─────────────────────────────────────────────
def train_next_checkin_model(df: pd.DataFrame):
    """
    Regresses the gap (hours) to the user's next expected check-in.
    App usage: schedule smart reminder = now + predicted_gap.
    """
    df = df.copy()
    df["nextGap"] = df.groupby(["userId", "habitId"])["gapHours"].shift(-1)
    df = df.dropna(subset=["nextGap"])
    df = df[df["nextGap"] < 24 * 14]  # ignore gaps > 2 weeks (data noise)

    le_user  = LabelEncoder().fit(df["userId"])
    le_habit = LabelEncoder().fit(df["habitId"])
    df["userEnc"]  = le_user.transform(df["userId"])
    df["habitEnc"] = le_habit.transform(df["habitId"])

    feature_cols = [
        "dayOfWeekNum", "isWeekend", "hour", "gapHours",
        "streakCount", "avgWeeklyFreq", "month", "userEnc", "habitEnc"
    ]

    X = df[feature_cols].fillna(0)
    y = df["nextGap"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=150, max_depth=8, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    r2    = r2_score(y_test, preds)
    print(f"\n📌 Next Check-In Model  |  MAE: {mae:.2f} h  |  R²: {r2:.3f}")

    bundle = {
        "model":    model,
        "le_user":  le_user,
        "le_habit": le_habit,
        "features": feature_cols,
    }
    joblib.dump(bundle, MODEL_DIR / "next_checkin_model.joblib")
    print(f"   Saved → {MODEL_DIR}/next_checkin_model.joblib")
    return bundle


# ─────────────────────────────────────────────
# 6. ANALYTICS REPORTS (JSON)
# ─────────────────────────────────────────────
def build_summary_stats(df: pd.DataFrame) -> dict:
    """Global stats returned by your app's /stats endpoint."""
    stats = {
        "totalCheckins": int(len(df)),
        "totalUsers":    int(df["userId"].nunique()),
        "totalHabits":   int(df["habitId"].nunique()),
        "dateRange": {
            "from": str(df["completedAt"].min().date()),
            "to":   str(df["completedAt"].max().date()),
        },
        "mostPopularHabit":  df["habitName"].value_counts().idxmax(),
        "mostActiveDay":     df["dayOfWeek"].value_counts().idxmax(),
        "mostActiveHour":    int(df["hour"].mode()[0]),
        "weekdayVsWeekend": {
            "weekday": int((df["weekdayOrWeekend"] == "Weekday").sum()),
            "weekend": int((df["weekdayOrWeekend"] == "Weekend").sum()),
        },
        "avgCheckinsPerUserPerDay": round(
            len(df) / df["userId"].nunique() /
            max(1, (df["completedAt"].max() - df["completedAt"].min()).days), 3
        ),
    }
    return stats


def build_user_profiles(df: pd.DataFrame) -> list:
    """Per-user habit profiles for the app's user dashboard."""
    profiles = []
    for uid, udf in df.groupby("userId"):
        user_name = udf["userName"].iloc[0]
        habits = []
        for hid, hdf in udf.groupby("habitId"):
            # Streak
            hdf = hdf.sort_values("completedAt")
            dates     = sorted(hdf["completedAt"].dt.date.unique())
            max_streak, cur_streak, best = 1, 1, 1
            for i in range(1, len(dates)):
                if (dates[i] - dates[i-1]).days == 1:
                    cur_streak += 1
                    best = max(best, cur_streak)
                else:
                    cur_streak = 1

            # Best hour (mode)
            best_hour = int(hdf["hour"].mode()[0])
            best_day  = str(hdf["dayOfWeek"].value_counts().idxmax())

            # Consistency score: % of check-ins within 1h of personal avg
            avg_h    = hdf["hour"].mean()
            on_time  = (abs(hdf["hour"] - avg_h) <= 1).mean()

            # Day-of-week heatmap
            dow_counts = hdf["dayOfWeek"].value_counts().to_dict()
            dow_heatmap = {d: int(dow_counts.get(d, 0)) for d in DAY_ORDER}

            habits.append({
                "habitId":          hid,
                "habitName":        hdf["habitName"].iloc[0],
                "totalCheckins":    int(len(hdf)),
                "longestStreak":    best,
                "bestHour":         best_hour,
                "bestHourLabel":    f"{best_hour:02d}:00",
                "bestDay":          best_day,
                "consistencyScore": round(float(on_time), 3),
                "dayOfWeekHeatmap": dow_heatmap,
                "weekdayCheckins":  int((hdf["weekdayOrWeekend"] == "Weekday").sum()),
                "weekendCheckins":  int((hdf["weekdayOrWeekend"] == "Weekend").sum()),
            })

        profiles.append({
            "userId":   uid,
            "userName": user_name,
            "habits":   habits,
            "totalCheckins": int(len(udf)),
        })
    return profiles


def build_habit_insights(df: pd.DataFrame) -> list:
    """Per-habit aggregated insights for the app's habit analytics screen."""
    insights = []
    for hid, hdf in df.groupby("habitId"):
        avg_hour    = hdf["hour"].mean()
        avg_gap     = hdf.groupby("userId")["gapHours"].mean().mean()
        completion_by_day = hdf["dayOfWeek"].value_counts().reindex(DAY_ORDER, fill_value=0).to_dict()

        insights.append({
            "habitId":           hid,
            "habitName":         hdf["habitName"].iloc[0],
            "totalCheckins":     int(len(hdf)),
            "uniqueUsers":       int(hdf["userId"].nunique()),
            "avgCompletionHour": round(float(avg_hour), 2),
            "avgGapHours":       round(float(avg_gap), 2),
            "completionByDay":   {k: int(v) for k, v in completion_by_day.items()},
            "weekdayPct":        round(float((hdf["weekdayOrWeekend"] == "Weekday").mean()), 3),
        })
    return insights


def save_reports(df: pd.DataFrame):
    summary = build_summary_stats(df)
    users   = build_user_profiles(df)
    habits  = build_habit_insights(df)

    (REPORT_DIR / "summary_stats.json").write_text(json.dumps(summary, indent=2))
    (REPORT_DIR / "user_profiles.json").write_text(json.dumps(users, indent=2))
    (REPORT_DIR / "habit_insights.json").write_text(json.dumps(habits, indent=2))

    print(f"\n📊 Reports saved → {REPORT_DIR}/")
    print(f"   summary_stats.json  |  user_profiles.json  |  habit_insights.json")
    return summary, users, habits


# ─────────────────────────────────────────────
# 7. INFERENCE HELPERS (copy these into your app)
# ─────────────────────────────────────────────
def predict_best_time(bundle, userId: str, habitId: str,
                      dayOfWeekNum: int, isWeekend: int,
                      month: int, avgWeeklyFreq: float, streakCount: int) -> str:
    """Returns predicted best check-in time as 'HH:MM'."""
    model    = bundle["model"]
    le_user  = bundle["le_user"]
    le_habit = bundle["le_habit"]

    if userId not in le_user.classes_ or habitId not in le_habit.classes_:
        return "Unknown user/habit"

    userEnc  = le_user.transform([userId])[0]
    habitEnc = le_habit.transform([habitId])[0]

    X = pd.DataFrame([{
        "dayOfWeekNum":  dayOfWeekNum,
        "isWeekend":     isWeekend,
        "month":         month,
        "avgWeeklyFreq": avgWeeklyFreq,
        "streakCount":   streakCount,
        "userEnc":       userEnc,
        "habitEnc":      habitEnc,
    }])
    hour_bucket = model.predict(X)[0]
    h = int(hour_bucket)
    m = 30 if (hour_bucket - h) >= 0.5 else 0
    return f"{h:02d}:{m:02d}"


def predict_at_risk(bundle, userId: str, habitId: str,
                    dayOfWeekNum: int, isWeekend: int, hour: int,
                    gapHours: float, streakCount: int,
                    avgWeeklyFreq: float, month: int) -> dict:
    """Returns {'atRisk': bool, 'probability': float}."""
    model    = bundle["model"]
    le_user  = bundle["le_user"]
    le_habit = bundle["le_habit"]

    if userId not in le_user.classes_ or habitId not in le_habit.classes_:
        return {"atRisk": False, "probability": 0.0}

    userEnc  = le_user.transform([userId])[0]
    habitEnc = le_habit.transform([habitId])[0]

    X = pd.DataFrame([{
        "dayOfWeekNum":  dayOfWeekNum,
        "isWeekend":     isWeekend,
        "hour":          hour,
        "gapHours":      gapHours,
        "streakCount":   streakCount,
        "avgWeeklyFreq": avgWeeklyFreq,
        "month":         month,
        "userEnc":       userEnc,
        "habitEnc":      habitEnc,
    }])
    prob    = model.predict_proba(X)[0][1]
    at_risk = bool(prob >= 0.5)
    return {"atRisk": at_risk, "probability": round(float(prob), 3)}


def predict_next_checkin_gap(bundle, userId: str, habitId: str,
                              dayOfWeekNum: int, isWeekend: int, hour: int,
                              gapHours: float, streakCount: int,
                              avgWeeklyFreq: float, month: int) -> float:
    """Returns predicted hours until next check-in."""
    model    = bundle["model"]
    le_user  = bundle["le_user"]
    le_habit = bundle["le_habit"]

    if userId not in le_user.classes_ or habitId not in le_habit.classes_:
        return -1.0

    userEnc  = le_user.transform([userId])[0]
    habitEnc = le_habit.transform([habitId])[0]

    X = pd.DataFrame([{
        "dayOfWeekNum":  dayOfWeekNum,
        "isWeekend":     isWeekend,
        "hour":          hour,
        "gapHours":      gapHours,
        "streakCount":   streakCount,
        "avgWeeklyFreq": avgWeeklyFreq,
        "month":         month,
        "userEnc":       userEnc,
        "habitEnc":      habitEnc,
    }])
    return round(float(model.predict(X)[0]), 2)


# ─────────────────────────────────────────────
# 8. MAIN
# ─────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Train habit check-in models")
    parser.add_argument("--file", default="checkinscsv.xlsx", help="Path to the data file")
    args = parser.parse_args()

    print("=" * 60)
    print("  Habit Check-In Training Pipeline")
    print("=" * 60)

    df  = load_data(args.file)
    df  = engineer_features(df)

    bt_bundle   = train_best_time_model(df)
    cs_bundle   = train_consistency_model(df)
    nc_bundle   = train_next_checkin_model(df)
    summary, users, habits = save_reports(df)

    # ── Quick smoke test ──────────────────────────────────────
    print("\n" + "=" * 60)
    print("  Quick Inference Smoke Test")
    print("=" * 60)

    best_time = predict_best_time(
        bt_bundle,
        userId="user_001", habitId="habit_001",
        dayOfWeekNum=0,    # Monday
        isWeekend=0, month=3, avgWeeklyFreq=5.0, streakCount=7
    )
    print(f"  Best time for Aarav / Morning Run on Monday → {best_time}")

    if cs_bundle:
        risk = predict_at_risk(
            cs_bundle,
            userId="user_001", habitId="habit_001",
            dayOfWeekNum=0, isWeekend=0, hour=9,
            gapHours=50.0, streakCount=2,
            avgWeeklyFreq=5.0, month=3
        )
        print(f"  At-risk check → {risk}")

    gap = predict_next_checkin_gap(
        nc_bundle,
        userId="user_001", habitId="habit_001",
        dayOfWeekNum=0, isWeekend=0, hour=6,
        gapHours=24.0, streakCount=7,
        avgWeeklyFreq=5.0, month=3
    )
    print(f"  Predicted next check-in gap → {gap} hours")

    print("\n✅ All done!\n")
    print("  Load in your app with:")
    print("    import joblib")
    print("    bt  = joblib.load('models/best_time_model.joblib')")
    print("    cs  = joblib.load('models/consistency_model.joblib')")
    print("    nc  = joblib.load('models/next_checkin_model.joblib')")
    print("    import json")
    print("    summary = json.load(open('reports/summary_stats.json'))")
    print("    users   = json.load(open('reports/user_profiles.json'))")
    print("    habits  = json.load(open('reports/habit_insights.json'))")


if __name__ == "__main__":
    main()
