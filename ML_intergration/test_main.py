from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert "model_loaded" in response.json()

def test_predict_valid_input():
    response = client.post("/predict", json={
        "habit_name": "Morning Meditation",
        "day_of_week": 1,
        "streak_count": 7
    })
    assert response.status_code in [200, 503]  # 503 if model not trained yet
    if response.status_code == 200:
        data = response.json()
        assert "completion_probability" in data
        assert "risk_level" in data
        assert data["risk_level"] in ["low", "medium", "high"]

def test_predict_missing_field():
    response = client.post("/predict", json={
        "habit_name": "Reading"
        # missing day_of_week and streak_count
    })
    assert response.status_code == 422  # FastAPI validation error

def test_predict_bulk():
    response = client.post("/predict/bulk", json={
        "habits": [
            {"habit_name": "Reading", "day_of_week": 1, "streak_count": 5},
            {"habit_name": "Exercise", "day_of_week": 2, "streak_count": 2}
        ]
    })
    assert response.status_code in [200, 503]