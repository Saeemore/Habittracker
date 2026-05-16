import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import mlRouter from '../routes/ml';

// Mock the mlService so we don't call real FastAPI
vi.mock('../services/mlService', () => ({
  checkMLHealth: vi.fn().mockResolvedValue(true),
  predictHabitCompletion: vi.fn().mockResolvedValue({
    habit_name: 'Morning Meditation',
    completion_probability: 0.82,
    will_complete: true,
    risk_level: 'low',
  }),
  predictBulk: vi.fn().mockResolvedValue([
    { habit_name: 'Reading', completion_probability: 0.75, will_complete: true, risk_level: 'low' },
  ]),
}));

const app = express();
app.use(express.json());
app.use('/api/ml', mlRouter);

describe('GET /api/ml/health', () => {
  it('returns ml_available: true when service is up', async () => {
    const res = await request(app).get('/api/ml/health');
    expect(res.status).toBe(200);
    expect(res.body.ml_available).toBe(true);
  });
});

describe('POST /api/ml/predict', () => {
  it('returns prediction for a single habit', async () => {
    const res = await request(app)
      .post('/api/ml/predict')
      .send({ habit_name: 'Morning Meditation', streak_count: 7 });

    expect(res.status).toBe(200);
    expect(res.body.habit_name).toBe('Morning Meditation');
    expect(res.body.completion_probability).toBe(0.82);
    expect(res.body.risk_level).toBe('low');
  });

  it('returns 503 when ML service is down', async () => {
    const { predictHabitCompletion } = await import('../services/mlService');
    vi.mocked(predictHabitCompletion).mockRejectedValueOnce(new Error('ML service down'));

    const res = await request(app)
      .post('/api/ml/predict')
      .send({ habit_name: 'Reading', streak_count: 3 });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('ML service down');
  });
});

describe('POST /api/ml/predict/bulk', () => {
  it('returns array of predictions for multiple habits', async () => {
    const res = await request(app)
      .post('/api/ml/predict/bulk')
      .send({
        habits: [
          { habit_name: 'Reading', streak_count: 5 },
          { habit_name: 'Exercise', streak_count: 2 },
        ],
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].habit_name).toBe('Reading');
  });
});