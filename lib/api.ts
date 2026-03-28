const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8009"

export const TOKEN_KEY = "auth_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail?.detail ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  projects: {
    list: () => request<unknown[]>("/projects"),
    create: (data: { name: string; description?: string; date?: string }) =>
      request<unknown>("/projects", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => request<unknown>(`/projects/${id}`),
    update: (id: string, data: object) =>
      request<unknown>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  },

  apiKeys: {
    list: () => request<unknown[]>("/api-keys"),
    create: (name: string) =>
      request<unknown>("/api-keys", { method: "POST", body: JSON.stringify({ name }) }),
    revoke: (id: string) => request<void>(`/api-keys/${id}`, { method: "DELETE" }),
  },
}
