import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

def train():
    # --- Load checkins.csv ---
    df = pd.read_csv("checkins.csv")
    print(f"Loaded {len(df)} rows from checkins.csv")
    print(f"Habits found: {df['habitName'].unique()}")

    # --- Feature Engineering ---
    df['day_of_week'] = pd.to_datetime(df['completedAt']).dt.dayofweek
    df['localHour']   = df['localHour'].fillna(0)
    df['is_weekend']  = (df['weekdayOrWeekend'] == 'Weekend').astype(int)

    # Encode habit name
    le = LabelEncoder()
    df['habit_encoded'] = le.fit_transform(df['habitName'])

    # Since all rows in CSV are completed checkins, add missed rows
    # by duplicating with completed=0 for days habits were skipped
    df['completed'] = 1

    # Create synthetic missed entries for better model training
    missed_rows = []
    for habit in df['habitName'].unique():
        habit_df = df[df['habitName'] == habit]
        # Add 20% synthetic missed entries
        n_missed = max(1, int(len(habit_df) * 0.2))
        for _ in range(n_missed):
            sample = habit_df.sample(1).iloc[0]
            missed_rows.append({
                'day_of_week':   np.random.randint(0, 7),
                'localHour':     sample['localHour'] + np.random.uniform(-2, 2),
                'is_weekend':    np.random.randint(0, 2),
                'habit_encoded': sample['habit_encoded'],
                'completed':     0
            })

    missed_df = pd.DataFrame(missed_rows)
    full_df   = pd.concat([
        df[['day_of_week', 'localHour', 'is_weekend', 'habit_encoded', 'completed']],
        missed_df
    ], ignore_index=True)

    print(f"Training on {len(full_df)} rows ({full_df['completed'].sum()} completed, {(full_df['completed']==0).sum()} missed)")

    features = ['day_of_week', 'localHour', 'is_weekend', 'habit_encoded']
    target   = 'completed'

    X = full_df[features]
    y = full_df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # --- Train model ---
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train, y_train)

    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"\nModel accuracy: {acc:.2%}")
    print(classification_report(y_test, model.predict(X_test)))

    # --- Save model + encoder ---
    os.makedirs("models", exist_ok=True)
    with open("models/habit_model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open("models/label_encoder.pkl", "wb") as f:
        pickle.dump(le, f)

    print("\n✅ Model saved to ml_intergration/models/")
    print(f"Habits the model knows: {list(le.classes_)}")

if __name__ == "__main__":
    train()