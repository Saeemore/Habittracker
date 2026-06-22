import { apiFetch, setAccessToken } from "./api";
import { clearSession } from "./storage";

export type AuthUser = { id: string; email: string; username: string };

let refreshInFlight: Promise<{ accessToken: string }> | null = null;

export async function login(params: {
  email?: string;
  username?: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> {
  return apiFetch("/auth/login", { method: "POST", body: JSON.stringify(params) });
}

export async function register(params: {
  email: string;
  username: string;
  password: string;
}): Promise<{ accessToken: string; user: AuthUser }> {
  return apiFetch("/auth/register", { method: "POST", body: JSON.stringify(params) });
}

export async function me(): Promise<{ user: AuthUser }> {
  return apiFetch("/auth/me", { method: "GET" });
}

export async function refresh(): Promise<{ accessToken: string }> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = apiFetch<{ accessToken: string }>("/auth/refresh", { method: "POST" }).finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export async function logout(): Promise<{ ok: true }> {
  const result = await apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });
  setAccessToken(null);
  clearSession();
  return result;
}

export async function forgotPassword(email: string): Promise<{ ok: boolean; message: string }> {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(
  email: string,
  code: string,
  password: string
): Promise<{ ok: boolean; message: string }> {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, password })
  });
}

export async function updateProfile(params: {
  username: string;
  email: string;
}): Promise<{ user: AuthUser }> {
  return apiFetch("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(params)
  });
}


