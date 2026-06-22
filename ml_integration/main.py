from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pickle
import numpy as np
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Trackify ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini AI configured successfully")
else:
    print("⚠️  GEMINI_API_KEY not found")

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

class ChatRequest(BaseModel):
    message: str
    habits: list = []

class ChatResponse(BaseModel):
    reply: str

class MotivateRequest(BaseModel):
    habits: list = []   

SYSTEM_PROMPT = """You are Trackify AI, a friendly and knowledgeable personal habit coach.

Rules:
- NEVER start your response with "Here is a practical habit-coach take"
- NEVER say "No habit data was provided" — just give helpful advice naturally
- Give DIFFERENT and VARIED responses every time
- Be conversational, warm and encouraging
- Use emojis occasionally 🌟
- Keep responses to 2-4 sentences unless more detail is needed
- Answer ANY question the user asks, not just habit questions
- If asked about something unrelated to habits, answer it naturally like a friendly assistant

Your expertise:
- Habit formation and behavior change
- Motivation and consistency strategies
- Personalized advice based on user's actual habit data
- Science-backed tips for building lasting habits"""

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

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(503, "Model not loaded")
    try:
        habit_enc = label_encoder.transform([req.habit_name])[0]
    except ValueError:
        habit_enc = 0

    # Match exactly the features used in train_model.py
    is_weekend = 1 if req.day_of_week >= 5 else 0
    local_hour = 8.0  # default hour if not provided

    features = np.array([[
        req.day_of_week,
        local_hour,
        is_weekend,
        habit_enc
    ]])

    prob = float(model.predict_proba(features)[0][1])

    return PredictResponse(
        habit_name=req.habit_name,
        completion_probability=round(prob, 3),
        will_complete=prob >= 0.5,
        risk_level=(
            "high"   if prob < 0.4 else
            "medium" if prob < 0.7 else
            "low"
        )
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

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(503, "Gemini API key not configured")

    try:
        context = ""
        if req.habits:
            context = "\n\nUser's current habits:\n" + "\n".join([
                f"- {h.get('name', 'Unknown')} (streak: {h.get('streak', 0)} days, completed: {h.get('completed', False)})"
                for h in req.habits
            ])
        full_prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\nUser: {message}\n\nTrackify AI:"    

        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config=genai.types.GenerationConfig(
                temperature=0.9,
                top_p=0.95,
                max_output_tokens=300,
            ),
            # system_instruction=SYSTEM_PROMPT
        )
        response = model.generate_content(full_prompt)
        return ChatResponse(reply=response.text)
   
        # user_message = req.message + context
        # response = model.generate_content(user_message)
        # return ChatResponse(reply=response.text)

    except Exception as e:
        print(f"Gemini error: {e}")
        raise HTTPException(503, f"AI service unavailable: {str(e)}")


@app.post("/chat/motivate", response_model=ChatResponse)
async def motivate(req: MotivateRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(503, "Gemini API key not configured")

    try:
        completed = sum(1 for h in req.habits if h.get('completed', False))
        total = len(req.habits)

        message = (
            f"Give me a short motivational message. I completed {completed} out of {total} habits today."
            if total > 0
            else "Give me a short motivational message to start building good habits."
        )

        context = ""
        if req.habits:
            context = "\n\nUser's habits:\n" + "\n".join([
                f"- {h.get('name', 'Unknown')} (streak: {h.get('streak', 0)} days)"
                for h in req.habits
            ])

        full_prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\nUser: {message}\n\nTrackify AI:"        

        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config=genai.types.GenerationConfig(
                temperature=0.9,
                top_p=0.95,
                max_output_tokens=300,
            ),
            # system_instruction=SYSTEM_PROMPT
        )
        response = model.generate_content(full_prompt)
        return ChatResponse(reply=response.text)
   
        # response = model.generate_content(user_message)
        # return ChatResponse(reply=response.text)

    except Exception as e:
        print(f"Gemini error: {e}")
        raise HTTPException(503, f"AI service unavailable: {str(e)}")


@app.post("/chat/analyze", response_model=ChatResponse)
async def analyze(req: MotivateRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(503, "Gemini API key not configured")

    try:
        context = ""
        if req.habits:
            context = "\n\nUser's habits:\n" + "\n".join([
                f"- {h.get('name', 'Unknown')} (streak: {h.get('streak', 0)} days, completed: {h.get('completed', False)})"
                for h in req.habits
            ])
        full_prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\nUser: {message}\n\nTrackify AI:"

        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config=genai.types.GenerationConfig(
                temperature=0.9,
                top_p=0.95,
                max_output_tokens=400,
            ),
            # system_instruction=SYSTEM_PROMPT
        )
        response = model.generate_content(full_prompt)
        return ChatResponse(reply=response.text)
        # user_message = "Analyze my habit patterns and give me 2-3 specific actionable insights." + context
        # response = model.generate_content(user_message)
        # return ChatResponse(reply=response.text)

    except Exception as e:
        print(f"Gemini error: {e}")
        raise HTTPException(503, f"AI service unavailable: {str(e)}")