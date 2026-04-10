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

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(normalizePath(path), {
    ...init,
    headers,
    credentials: "include"
  });

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  let parsed: ApiErrorShape | undefined;
  try {
    parsed = (await res.json()) as ApiErrorShape;
  } catch {
    // ignore
  }

  const message = parsed?.error?.message || `Request failed (${res.status})`;
  throw new ApiError(message, { code: parsed?.error?.code, details: parsed?.error?.details, status: res.status });
}

