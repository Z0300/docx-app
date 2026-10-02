import { redirect } from '@tanstack/react-router'
import { isSessionValid, normalizeRole, useAuthStore } from '@/stores/authStore'

/**
 * Route guards for `beforeLoad`. They read the store directly (not via hooks) because they run
 * outside React, before any component renders — so protected content never flashes on screen.
 */

/** Blocks the route unless there's a valid session; remembers where the user was headed. */
export function requireSession(location: { href: string }) {
  const state = useAuthStore.getState()
  if (!isSessionValid(state)) {
    // A token that exists but has lapsed means "expired", not "never signed in" — say so on the login page.
    if (state.token) state.logout('expired')
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
}

/** Blocks the route unless the user holds at least one of the roles. Use after `requireSession`. */
export function requireRoles(...roles: string[]) {
  return () => {
    const held = new Set(useAuthStore.getState().user?.roles ?? [])
    if (!roles.some((r) => held.has(normalizeRole(r)))) throw redirect({ to: '/forbidden' })
  }
}

/** Only follow same-origin, in-app paths from a `?redirect=` value (blocks open-redirect links). */
export function safeRedirect(target: string | undefined): string {
  return target && /^\/(?![/\\])/.test(target) ? target : '/'
}
