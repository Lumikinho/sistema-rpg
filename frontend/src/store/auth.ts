import { create } from "zustand"
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getCurrentUser,
  type AuthUser,
} from "@/lib/auth"
import type { LoginValues, RegisterValues } from "@/lib/validators"

type AuthState = {
  user: AuthUser | null
  initialized: boolean
  pending: boolean
  error: string | null
  initialize: () => Promise<void>
  login: (values: LoginValues) => Promise<boolean>
  register: (values: RegisterValues) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  updateUser: (data: Partial<AuthUser>) => void
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  initialized: false,
  pending: false,
  error: null,

  updateUser(data) {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }))
  },

  async initialize() {
    const user = await getCurrentUser()
    set({ user, initialized: true })
  },

  async login(values) {
    set({ pending: true, error: null })
    try {
      const user = await apiSignIn(values.email, values.password)
      set({ user, pending: false })
      return true
    } catch (error) {
      set({
        pending: false,
        error: error instanceof Error ? error.message : "E-mail ou senha inválidos",
      })
      return false
    }
  },

  async register(values) {
    set({ pending: true, error: null })
    try {
      const user = await apiSignUp(values.name, values.email, values.password)
      set({ user, pending: false })
      return true
    } catch (error) {
      set({
        pending: false,
        error: error instanceof Error ? error.message : "Não foi possível criar a conta",
      })
      return false
    }
  },

  async logout() {
    await apiSignOut()
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
