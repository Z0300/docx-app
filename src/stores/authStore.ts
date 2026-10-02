import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTokenExpiry } from '@/lib/auth/jwt'

export interface AuthUser {
  id: number
  userName: string
  /** Normalised: upper-case, no "ROLE_" prefix. e.g. "ADMIN", "APPROVER". */
  roles: string[]
}

export type LogoutReason = 'expired' | 'unauthorized' | null

interface AuthState {
  token: string | null
  user: AuthUser | null
  expiresAt: number | null
  logoutReason: LogoutReason

  setSession: (token: string, user: AuthUser) => void
  logout: (reason?: LogoutReason) => void
  clearLogoutReason: () => void
}

export const normalizeRole = (role: string) => role.replace(/^ROLE_/i, '').toUpperCase()

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expiresAt: null,
      logoutReason: null,

      setSession: (token, user) =>
        set({
          token,
          user: { ...user, roles: user.roles.map(normalizeRole) },
          expiresAt: getTokenExpiry(token),
          logoutReason: null,
        }),

      logout: (reason = null) => set({ token: null, user: null, expiresAt: null, logoutReason: reason }),

      clearLogoutReason: () => set({ logoutReason: null }),
    }),
    {
      name: 'app-auth',
      // Only the session survives a reload; transient flags do not.
      partialize: (s) => ({ token: s.token, user: s.user, expiresAt: s.expiresAt }),
    },
  ),
)

export function isSessionValid(state: Pick<AuthState, 'token' | 'expiresAt'>): boolean {
  if (!state.token) return false
  return state.expiresAt === null || state.expiresAt > Date.now()
}
