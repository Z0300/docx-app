import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { requireSession } from '@/lib/auth/guards'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => requireSession(location),
  component: AppShell,
})
