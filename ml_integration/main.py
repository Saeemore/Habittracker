from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pickle
import numpy as np
import os

app = FastAPI(title="Trackify ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model, label_encoder = None, None

@app.on_event("startup")
def load_model():
    global model, label_encoder
    model_path = "models/habit_model.pkl"
    enc_path   = "models/label_encoder.pkl"
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        with open(enc_path, "rb") as f:
            label_encoder = pickle.load(f)
        print("✅ ML model loaded successfully")
    else:
        print("⚠️  Model not found. Run train_model.py first.")

class PredictRequest(BaseModel):
    habit_name: str
    day_of_week: int
    streak_count: int

class PredictResponse(BaseModel):
    habit_name: str
    completion_probability: float
    will_complete: bool
    risk_level: str

class BulkPredictRequest(BaseModel):
    habits: List[PredictRequest]

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(503, "Model not loaded")
    try:
        habit_enc = label_encoder.transform([req.habit_name])[0]
    except ValueError:
        habit_enc = 0
    features = np.array([[req.day_of_week, req.streak_count, habit_enc]])
    prob = float(model.predict_proba(features)[0][1])
    return PredictResponse(
        habit_name=req.habit_name,
        completion_probability=round(prob, 3),
        will_complete=prob >= 0.5,
        risk_level="high" if prob < 0.4 else "medium" if prob < 0.7 else "low"
    )

@app.post("/predict/bulk")
def predict_bulk(req: BulkPredictRequest):
    return [predict(h) for h in req.habits]

@app.get("/model/info")
def model_info():
    if model is None:
        raise HTTPException(503, "Model not loaded")
    return {
        "type": type(model).__name__,
        "features": ["day_of_week", "streak_count", "habit_encoded"],
        "classes": list(label_encoder.classes_) if label_encoder else []
    }