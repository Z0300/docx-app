import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

/**
 * With no refresh token, the access token's `exp` is a hard stop. Sign the user out at that moment
 * (rather than on their next failed request) so they see a clear message instead of a surprise error.
 */
export function useSessionExpiry() {
  const expiresAt = useAuthStore((s) => s.expiresAt)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!expiresAt) return
    const remaining = expiresAt - Date.now()
    if (remaining <= 0) {
      logout('expired')
      return
    }
    // setTimeout caps at ~24.8 days; clamp so long-lived tokens don't fire immediately.
    const id = window.setTimeout(() => logout('expired'), Math.min(remaining, 2_000_000_000))
    return () => window.clearTimeout(id)
  }, [expiresAt, logout])
}
