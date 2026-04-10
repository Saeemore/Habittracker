import { apiFetch, setAccessToken } from "@/react-app/lib/api";

export type AuthUser = { id: string; email: string; username: string };

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
  return apiFetch("/auth/refresh", { method: "POST" });
}

export async function logout(): Promise<{ ok: true }> {
  const result = await apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });
  setAccessToken(null);
  localStorage.removeItem("username");
  localStorage.removeItem("isLoggedIn");
  return result;
}

