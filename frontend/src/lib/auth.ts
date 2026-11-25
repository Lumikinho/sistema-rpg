import { apiFetch } from "@/lib/api"

export type AuthRole = "MASTER" | "PLAYER"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar: string | null
  role: AuthRole
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetch<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  })
  return data.user
}

export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  await apiFetch("/users", {
    method: "POST",
    body: { name, email, password },
  })
  return signIn(email, password)
}

export async function signOut(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" })
  } catch {
    // O cookie já pode ter expirado; o estado local é limpo de qualquer forma.
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<{ user: AuthUser }>("/auth/me")
    return data.user
  } catch {
    return null
  }
}
