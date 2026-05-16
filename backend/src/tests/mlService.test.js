import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

vi.mock('../services/mlService.js', async () => {
  const actual = await vi.importActual('../services/mlService.js');
  return actual;
});

describe('checkMLHealth', () => {
  it('returns true when model is loaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', model_loaded: true }),
    });
    const { checkMLHealth } = await import('../services/mlService.js');
    const result = await checkMLHealth();
    expect(result).toBe(true);
  });

  it('returns false when FastAPI is offline', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
    const { checkMLHealth } = await import('../services/mlService.js');
    const result = await checkMLHealth();
    expect(result).toBe(false);
  });
});