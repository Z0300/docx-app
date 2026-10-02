import { isSessionValid, normalizeRole, useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => isSessionValid(s))
  const logout = useAuthStore((s) => s.logout)

  const hasAnyRole = (...roles: string[]) => {
    if (roles.length === 0) return true
    const held = new Set(user?.roles ?? [])
    return roles.some((r) => held.has(normalizeRole(r)))
  }

  return { user, isAuthenticated, logout, hasAnyRole }
}
