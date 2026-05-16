import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  predictHabitCompletion,
  predictBulk,
  checkMLHealth,
} from '../services/mlService';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('mlService — predictHabitCompletion', () => {
  it('returns prediction response on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        habit_name: 'Morning Meditation',
        completion_probability: 0.82,
        will_complete: true,
        risk_level: 'low',
      }),
    });

    const result = await predictHabitCompletion({
      habit_name: 'Morning Meditation',
      day_of_week: 1,
      streak_count: 7,
    });

    expect(result.habit_name).toBe('Morning Meditation');
    expect(result.completion_probability).toBe(0.82);
    expect(result.will_complete).toBe(true);
    expect(result.risk_level).toBe('low');
  });

  it('throws error when ML service is down', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(
      predictHabitCompletion({
        habit_name: 'Reading',
        day_of_week: 2,
        streak_count: 3,
      })
    ).rejects.toThrow('ML service error: 503');
  });
});

describe('mlService — predictBulk', () => {
  it('returns array of predictions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { habit_name: 'Reading', completion_probability: 0.75, will_complete: true, risk_level: 'low' },
        { habit_name: 'Exercise', completion_probability: 0.35, will_complete: false, risk_level: 'high' },
      ]),
    });

    const result = await predictBulk([
      { habit_name: 'Reading', day_of_week: 1, streak_count: 5 },
      { habit_name: 'Exercise', day_of_week: 1, streak_count: 1 },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].habit_name).toBe('Reading');
    expect(result[1].risk_level).toBe('high');
  });
});

describe('mlService — checkMLHealth', () => {
  it('returns true when model is loaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', model_loaded: true }),
    });

    const result = await checkMLHealth();
    expect(result).toBe(true);
  });

  it('returns false when FastAPI is offline', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await checkMLHealth();
    expect(result).toBe(false);
  });
});