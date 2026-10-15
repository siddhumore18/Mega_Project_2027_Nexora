import { UserRole } from "@nexora/contracts";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string;
}

const TOKEN_KEY = "nexora_auth_token";
const USER_KEY = "nexora_auth_user";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserProfile | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setSession(token: string, user: UserProfile): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password = "nexora2026"): Promise<UserProfile> {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message || "Login failed");
  }

  setSession(body.data.token, body.data.user);
  return body.data.user;
}

export async function logout(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearSession();
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (res.ok && body.success) {
      return body.data;
    }
  } catch {
    //
  }
  return null;
}
