import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import pickle
import os

def train():
    # --- Load your checkins.csv ---
    df = pd.read_csv("checkins.csv")

    # Expected columns: user_id, habit_id, habit_name,
    # check_in_date, day_of_week, streak_count, completed
    # Adjust column names to match YOUR csv exactly

    # --- Feature Engineering ---
    df['day_of_week'] = pd.to_datetime(
        df['completedAt']
    ).dt.dayofweek
    df['localHour'] = df['localHour'].fillna(0)

    le = LabelEncoder()
    df['habit_encoded'] = le.fit_transform(df['habitName'])


    features = ['day_of_week', 'localHour', 'habit_encoded']

    if 'completed' not in df.columns:
        df['completed'] = 1 
    
    target   = 'completed'  # 1 = done, 0 = missed

    X = df[features]
    y = df[target]

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
    print(f"Model accuracy: {acc:.2%}")

    # --- Save model + encoder ---
    os.makedirs("model", exist_ok=True)
    with open("model/habit_model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open("model/label_encoder.pkl", "wb") as f:
        pickle.dump(le, f)

    print("Model saved to ml_integration/model/")

if __name__ == "__main__":
    train()