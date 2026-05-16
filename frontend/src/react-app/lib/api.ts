export type ApiErrorShape = {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  status?: number;

  constructor(message: string, opts?: { code?: string; details?: unknown; status?: number }) {
    super(message);
    this.name = "ApiError";
    this.code = opts?.code;
    this.details = opts?.details;
    this.status = opts?.status;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string | null) {
  if (!token) localStorage.removeItem("accessToken");
  else localStorage.setItem("accessToken", token);
}

function normalizePath(path: string) {
  if (!path) return "/api";
  if (path.startsWith("/")) return `/api${path}`;
  return `/api/${path}`;
}

const API_TIMEOUT_MS = 8000;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  if (init.signal?.aborted) {
    controller.abort();
  } else {
    init.signal?.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

async function parseApiError(res: Response) {
  let parsed: ApiErrorShape | undefined;
  try {
    parsed = (await res.json()) as ApiErrorShape;
  } catch {
    // ignore
  }

  const message = parsed?.error?.message || `Request failed (${res.status})`;
  return new ApiError(message, { code: parsed?.error?.code, details: parsed?.error?.details, status: res.status });
}

async function refreshAccessToken(): Promise<string> {
  const res = await fetchWithTimeout(normalizePath("/auth/refresh"), {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) throw await parseApiError(res);

  const data = (await res.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

async function sendApiRequest(path: string, init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

  return fetchWithTimeout(normalizePath(path), {
    ...init,
    headers,
    credentials: "include"
  });
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await sendApiRequest(path, init, getAccessToken());

  if (res.status === 401 && path !== "/auth/refresh" && path !== "/auth/login" && path !== "/auth/register") {
    try {
      const refreshedToken = await refreshAccessToken();
      res = await sendApiRequest(path, init, refreshedToken);
    } catch {
      setAccessToken(null);
    }
  }

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  throw await parseApiError(res);
}

export async function predictHabit(habitName: string, streakCount: number) {
  const res = await fetch('/api/ml/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habit_name: habitName, streak_count: streakCount }),
  });
  return res.json();
}

export async function predictAllHabits(
  habits: { habit_name: string; streak_count: number }[]
) {
  const res = await fetch('/api/ml/predict/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habits }),
  });
  return res.json();
}
