import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginPage } from '@/features/auth/LoginPage'
import { safeRedirect } from '@/lib/auth/guards'
import { isSessionValid, useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/login')({
  // `?redirect=` carries the page the user was trying to reach before being sent here.
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined).optional() }),
  beforeLoad: ({ search }) => {
    if (isSessionValid(useAuthStore.getState())) throw redirect({ href: safeRedirect(search.redirect) })
  },
  component: LoginPage,
})
